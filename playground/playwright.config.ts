import { defineConfig, devices } from "@playwright/test";

const existingSite = process.env.ELEA_TEST_URL;
const visualTests = "**/visual.spec.ts";
const criticalFlows = [
  "**/stepper.spec.ts", "**/date-field.spec.ts", "**/multi-select.spec.ts",
  "**/dialog-motion.spec.ts", "**/theme-proof.spec.ts", "**/layout-guides.spec.ts", "**/site-search.spec.ts",
];
const desktop = { width: 1400, height: 1300 };

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: existingSite ?? "http://127.0.0.1:4174",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", testIgnore: visualTests, use: { ...devices["Desktop Chrome"], viewport: desktop } },
    { name: "firefox", testMatch: criticalFlows, use: { ...devices["Desktop Firefox"], viewport: desktop } },
    { name: "webkit", testMatch: criticalFlows, use: { ...devices["Desktop Safari"], viewport: desktop } },
    {
      name: "visual",
      testMatch: visualTests,
      snapshotPathTemplate: "{testDir}/baselines/{arg}{ext}",
      use: { ...devices["Desktop Chrome"], viewport: desktop, deviceScaleFactor: 1, reducedMotion: "reduce", locale: "en-US" },
      expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css", threshold: 0.12, maxDiffPixels: 12 } },
    },
  ],
  updateSnapshots: "none",
  webServer: existingSite ? [] : {
    command: "python3 -m http.server 4174 --bind 127.0.0.1 --directory ../.build",
    url: "http://127.0.0.1:4174/elea/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
