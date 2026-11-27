import { defineConfig, devices } from "@playwright/test";

// Browser tests. First run once: npx playwright install chromium
// Chrome's fake microphone plays a test tone, so recording works without a real mic or a permission prompt.
const fakeMic = {
  permissions: ["microphone"],
  launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] },
};

// Most tests act as a device where the seeded student Ayesha was already picked on "Who are you?"
// (cookie + localStorage, see features/student/identity.ts). Picker tests start empty instead:
// test.use({ storageState: { cookies: [], origins: [] } }).
const AYESHA = "00000000-0000-4000-8000-000000000002";
export const pickedAyesha = {
  cookies: [{ name: "pronnova_student", value: AYESHA, domain: "localhost", path: "/", expires: -1, httpOnly: true, secure: false, sameSite: "Lax" as const }],
  origins: [{ origin: "http://localhost:3000", localStorage: [{ name: "pronnova.studentId", value: AYESHA }] }],
};

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000", storageState: pickedAyesha },
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
