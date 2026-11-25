import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1400, height: 1300 } } }],
  webServer: {
    command: "python3 -m http.server 4174 --bind 127.0.0.1 --directory ../.build",
    url: "http://127.0.0.1:4174/elea/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
