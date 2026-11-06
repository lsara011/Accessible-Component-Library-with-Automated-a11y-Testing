import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`ChatBubble: ${theme} mode`, async ({ page }) => {
    await page.goto(
      `http://localhost:6006/iframe.html?id=components-chatbubble--${theme}-mode&viewMode=story`,
    );

    const bubble = page.locator(".chat-bubble");

    await expect(bubble).toBeVisible();
    await expect(page.locator("html")).toHaveClass(
      new RegExp(`\\b${theme}\\b`),
    );
    await page.evaluate(() => document.fonts.ready);

    await expect(bubble).toHaveScreenshot(`chatbubble-${theme}.png`, {
      animations: "disabled",
    });
  });
}
