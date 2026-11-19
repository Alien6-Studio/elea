import { defineConfig, devices } from "@playwright/test";

// The built site is served by vite preview under its GitHub Pages base; CI builds the packages first
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4174",
    trace: "retain-on-failure",
  },
  // Tall enough for the sample document to sit in view: pointer gestures do not scroll
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1400, height: 1300 } } }],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4174/elea/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
