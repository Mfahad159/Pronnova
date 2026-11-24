import { defineConfig, devices } from "@playwright/test";

// Browser tests. First run once: npx playwright install chromium
// Chrome's fake microphone plays a test tone, so recording works without a real mic or a permission prompt.
const fakeMic = {
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] },
};

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...fakeMic } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...fakeMic } },
    // Firefox's own fake microphone (Edge = Chromium, covered above). Opt-in with E2E_FIREFOX=1 because
    // some Windows setups block the downloaded Firefox. Safari/iOS is checked by hand in Phase 5.
    ...(process.env.E2E_FIREFOX ? [{
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: { firefoxUserPrefs: { "media.navigator.streams.fake": true, "media.navigator.permission.disabled": true } },
      },
    }] : []),
  ],
});
