import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'

type StoryEntry = {
  id: string
  title: string
  name: string
  type: 'story' | 'docs'
}

const index = JSON.parse(
  readFileSync('storybook-static/index.json', 'utf8'),
) as {
  entries: Record<string, StoryEntry>
}

const stories = Object.values(index.entries).filter(
  entry => entry.type === 'story',
)

for (const story of stories) {
  test(`${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(
      `http://localhost:6006/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`,
    )

    await expect(page.locator('#storybook-root')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      fullPage: true,
      animations: 'disabled',
    })
  })
}