import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  reporter: [["html", { open: "never" }]],
  use: {
    browserName: "chromium",
    viewport: { width: 800, height: 600 },
    colorScheme: "light",
  },
  forbidOnly: !!process.env.CI,

  // CI must compare against committed baselines, not create new ones.
  updateSnapshots: process.env.CI ? "none" : undefined,

  webServer: {
    command:
      "npm run preview -- --outDir storybook-static --host localhost --port 6006 --strictPort",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
