import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

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
  for (const colorScheme of ['light', 'dark']) {
    const page = await browser.newPage({ colorScheme })
    for (const story of ['default', 'light-mode', 'dark-mode']) {
      const dark = story === 'dark-mode'
      await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=components-chatbubble--${story}&viewMode=story`)
      await page.locator('.chat-bubble__message').waitFor()
      await page.waitForFunction(dark => document.documentElement.classList.contains(dark ? 'dark' : 'light'), dark)
      const colors = await page.locator('.chat-bubble').evaluate((bubble, dark) => {
        const expected = document.createElement('span')
        expected.style.backgroundColor = `var(--color-purple-${dark ? '900' : '100'})`
        bubble.append(expected)
        const expectedBackground = getComputedStyle(expected).backgroundColor
        expected.remove()
        return {
          sender: getComputedStyle(bubble.querySelector('.chat-bubble__sender')).color,
          timestamp: getComputedStyle(bubble.querySelector('.chat-bubble__timestamp')).color,
          message: getComputedStyle(bubble.querySelector('.chat-bubble__message')).color,
          background: getComputedStyle(bubble.querySelector('.chat-bubble__message')).backgroundColor,
          expectedBackground,
        }
      }, dark)
      const expectedText = dark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
      for (const field of ['sender', 'timestamp', 'message']) {
        assert.equal(colors[field], expectedText, `${story}, OS ${colorScheme}: ${field}`)
      }
      assert.equal(colors.background, colors.expectedBackground)
      console.log(`PASS: ${story} with OS ${colorScheme}: ${expectedText} text and correct purple background`)
    }
    await page.close()
  }

  // Exercise the actual manager toolbar, rather than only fixed-theme stories.
  const manager = await browser.newPage()
  await manager.goto(`http://127.0.0.1:${server.address().port}/?path=/story/components-chatbubble--default`)
  const canvas = manager.frameLocator('#storybook-preview-iframe')
  await canvas.locator('.chat-bubble__message').waitFor()
  const previewFrame = manager.frames().find(frame => frame.url().includes('/iframe.html'))
  await previewFrame.waitForFunction(() => document.documentElement.classList.contains('light'))
  const themeToggle = manager.getByRole('button', { name: 'Theme', exact: true })
  for (const theme of ['dark', 'light']) {
    await themeToggle.click()
    await previewFrame.waitForFunction(theme => document.documentElement.classList.contains(theme), theme)
    const colors = await canvas.locator('.chat-bubble').evaluate(bubble => ({
      sender: getComputedStyle(bubble.querySelector('.chat-bubble__sender')).color,
      timestamp: getComputedStyle(bubble.querySelector('.chat-bubble__timestamp')).color,
      message: getComputedStyle(bubble.querySelector('.chat-bubble__message')).color,
      canvas: getComputedStyle(document.body).backgroundColor,
    }))
    const expectedText = theme === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)'
    for (const field of ['sender', 'timestamp', 'message']) assert.equal(colors[field], expectedText)
    assert.equal(colors.canvas, theme === 'dark' ? 'rgb(2, 6, 23)' : 'rgb(255, 255, 255)')
    console.log(`PASS: toolbar switches Default story and canvas to ${theme}`)
  }
  await manager.close()
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
