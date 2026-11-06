import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../storybook-static')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!file.startsWith(root + sep)) throw new Error('Invalid path')
    response.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream')
    response.end(await readFile(file))
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
let browser
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=components-modal--default&viewMode=story`)
  const trigger = page.getByRole('button', { name: 'Open modal', exact: true })
  const dialog = page.getByRole('dialog', { name: 'Edit profile', exact: true })
  const heading = page.getByRole('heading', { name: 'Edit profile' })
  const input = page.getByRole('textbox', { name: 'Display name' })
  const save = page.getByRole('button', { name: 'Save', exact: true })
  const close = page.getByRole('button', { name: 'Close', exact: true })
  async function focused(locator) {
    assert.equal(await locator.evaluate(el => el === document.activeElement), true)
  }
  async function open() {
    await trigger.focus()
    await page.keyboard.press('Enter')
    await dialog.waitFor({ state: 'visible' })
    await focused(heading)
  }
  await open()
  assert.equal(await dialog.getAttribute('aria-modal'), 'true')
  assert.equal(await dialog.evaluate(el => document.getElementById(el.getAttribute('aria-describedby')).textContent), 'Update your display name.')
  await page.keyboard.press('Tab')
  await focused(input)
  await page.keyboard.press('Tab')
  await focused(save)
  await page.keyboard.press('Tab')
  await focused(close)
  await page.keyboard.press('Tab')
  await focused(input)
  await page.keyboard.press('Shift+Tab')
  await focused(close)
  // Programmatic attempts to focus the inert background must fail too.
  await trigger.evaluate(el => el.focus())
  await focused(close)
  const outline = await close.evaluate(el => ({ style: getComputedStyle(el).outlineStyle, width: getComputedStyle(el).outlineWidth }))
  assert.notEqual(outline.style, 'none')
  assert.equal(outline.width, '3px')
  const size = await close.boundingBox()
  assert.ok(size.width >= 24 && size.height >= 24)

  // axe-core is already installed through Storybook's accessibility addon.
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
  const results = await page.evaluate(async () => window.axe.run(document.querySelector('dialog'), {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
  }))
  assert.deepEqual(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [])
  console.log(`axe: no detected violations; ${results.incomplete.length} checks need review.`)

  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await focused(trigger)
  await open()
  await close.focus()
  await page.keyboard.press('Space')
  await dialog.waitFor({ state: 'hidden' })
  await focused(trigger)
  await open()
  await input.fill('Ada')
  await save.focus()
  await page.keyboard.press('Enter')
  await dialog.waitFor({ state: 'hidden' })
  await focused(trigger)
  await open()
  await page.setViewportSize({ width: 320, height: 256 })
  const box = await dialog.boundingBox()
  assert.ok(box.x >= 0 && box.x + box.width <= 320)
  assert.ok(box.y >= 0 && box.y + box.height <= 256)
  console.log('PASS: Chromium keyboard opening, initial focus, both Tab boundaries, inert background, Escape, Close, Save, focus restoration, focus outline, close target size, and small viewport geometry.')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
