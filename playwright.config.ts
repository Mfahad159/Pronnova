import { defineConfig, devices } from "@playwright/test";

// Browser tests. First run once: npx playwright install chromium
// Chrome's fake microphone plays a test tone, so recording works without a real mic or a permission prompt.
const fakeMic = {
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] },
};

// E2E_BASE_URL=http://localhost:3100 runs against an already started production build (`next start`):
// faster and steadier than the dev server, which compiles pages on demand (Phase 5 finding).
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  // The dev server compiles each page on first use, so tests can time out there. Against the dev
  // server: 60 s per test and one retry (Playwright reports it as "flaky", nothing is hidden).
  // Against a production build (E2E_BASE_URL): no retries — that run is the one that counts.
  timeout: 60_000,
  retries: process.env.E2E_BASE_URL ? 0 : 1,
  use: { baseURL: BASE_URL },
  webServer: process.env.E2E_BASE_URL ? undefined : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...fakeMic } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...fakeMic } },
    // Microsoft Edge (installed on Windows 11), opt-in with E2E_EDGE=1 (Phase 5 browser check).
    ...(process.env.E2E_EDGE ? [{ name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge", ...fakeMic } }] : []),
    // Firefox's own fake microphone. Opt-in with E2E_FIREFOX=1 because
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
