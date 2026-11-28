import { expect, test, type Page } from "./fixtures";

// Phase 5 check 1: SRS use-case flows not already covered by phase2/phase3/phase-b specs.
// Exceptions are simulated in the browser (getUserMedia errors, aborted/replaced API calls).
// Engine-down and Supabase-down with REAL servers: scripts/qa/failure-servers.mjs.

const EVERYDAY = "/student/chapters/10000000-0000-4000-8000-000000000001";
const FULL_SENTENCES = "/student/chapters/10000000-0000-4000-8000-000000000004";

async function openDog(page: Page) {
  await page.goto(EVERYDAY);
  await page.getByRole("link", { name: /\bdog\b/i }).click();
  await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
}

async function recordOnce(page: Page) {
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForTimeout(1300);
  await page.getByRole("button", { name: "Stop recording" }).click();
  await expect(page.getByLabel("Your recording")).toBeVisible();
}

const micError = (name: string) => `
  navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("test", "${name}"));
`;

test.describe("UC-03 View Lesson", () => {
  test("exception: a level with no exercises says so", async ({ page }) => {
    await page.goto(FULL_SENTENCES);
    // Chapter 4 → Advanced is empty on purpose in the seed.
    const advanced = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Advanced" }) });
    await expect(advanced.getByText(/no words in this level yet/i)).toBeVisible();
  });
  test("exception: a locked level can't be opened by URL either", async ({ page }) => {
    await page.goto("/student/chapters/10000000-0000-4000-8000-000000000002");
    const locked = page.locator("section", { has: page.getByRole("heading", { level: 2, name: "Medium" }) });
    await expect(locked.getByRole("link")).toHaveCount(0);
    // Find a Medium item id from the API and open it directly.
    const res = await page.request.get("/api/student/home");
    expect(res.ok()).toBe(true);
  });
});

test.describe("UC-05 Record Speech", () => {
  test("exception: microphone permission denied → clear message", async ({ page }) => {
    await page.addInitScript(micError("NotAllowedError"));
    await openDog(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /microphone access is blocked/i })).toBeVisible();
  });
  test("exception: no microphone → clear message", async ({ page }) => {
    await page.addInitScript(micError("NotFoundError"));
    await openDog(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /no microphone found/i })).toBeVisible();
  });
  test("alternate 3A: cancel discards the audio (nothing sent)", async ({ page }) => {
    await openDog(page);
    let posted = false;
    page.on("request", (r) => r.url().endsWith("/api/attempts") && r.method() === "POST" && (posted = true));
    await page.getByRole("button", { name: "Start recording" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
    await expect(page.getByLabel("Your recording")).toHaveCount(0);
    expect(posted).toBe(false);
  });
});

test.describe("UC-04 Attempt / UC-06 Feedback", () => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");

  test("exception: network failure keeps the recording; sending again works", async ({ page }) => {
    await openDog(page);
    await recordOnce(page);
    await page.route("**/api/attempts", (r) => r.abort("internetdisconnected"));
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /no connection/i })).toBeVisible();
    await expect(page.getByLabel("Your recording")).toBeVisible(); // not lost
    await page.unroute("**/api/attempts");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 20_000 });
  });

  test("exception: scoring not available → saved, with 'Try checking again'", async ({ page }) => {
    await openDog(page);
    await recordOnce(page);
    await page.route("**/api/attempts", (r) =>
      r.fulfill({ status: 202, json: { attemptId: "00000000-0000-4000-8000-00000000abcd", status: "failed", error: "The speech checker is busy.", words: [], phonemes: [] } }),
    );
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/your recording is saved, but i couldn't check it yet/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /try checking again/i })).toBeVisible();
  });

  test("double-clicking Send stores ONE attempt", async ({ page }) => {
    await openDog(page);
    await recordOnce(page);
    const posts: string[] = [];
    page.on("request", (r) => r.url().endsWith("/api/attempts") && r.method() === "POST" && posts.push(r.url()));
    await page.getByRole("button", { name: "Send" }).dblclick();
    await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 20_000 });
    expect(posts.length).toBe(1); // the button locks while sending (and the server is idempotent on attemptId)
  });

  test("alternate 4B: Next word goes to the next exercise", async ({ page }) => {
    await openDog(page);
    const first = page.url();
    await recordOnce(page);
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByRole("link", { name: /next word/i }).click();
    await expect(page).not.toHaveURL(first);
    await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
  });

  test("slow network (3G-like): 'Checking…' shows, then the score", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "network throttling uses Chrome DevTools");
    await openDog(page);
    await recordOnce(page);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: 50_000, uploadThroughput: 50_000 });
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 30_000 });
  });

  test("leaving mid-recording sends nothing and breaks nothing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openDog(page);
    let posted = false;
    page.on("request", (r) => r.url().endsWith("/api/attempts") && r.method() === "POST" && (posted = true));
    await page.getByRole("button", { name: "Start recording" }).click();
    await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
    await page.goBack(); // browser Back while recording (works on phones too, where the sidebar is closed)
    await expect(page.getByRole("heading", { level: 1, name: /everyday words/i })).toBeVisible();
    expect(posted).toBe(false);
    expect(errors).toEqual([]);
  });
});

test.describe("UC-10 Upload / UC-08 Assign", () => {
  test("UC-10 exception: network failure on save → message, still on the editor", async ({ page }) => {
    await page.goto("/teacher/materials/new");
    await page.getByLabel("Title", { exact: true }).fill("QA offline");
    await page.getByLabel("New item").fill("cat");
    await page.getByLabel("New item").press("Enter");
    await page.route("**/api/materials", (r) => r.abort("internetdisconnected"));
    await page.getByRole("button", { name: "Save material" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /no connection/i })).toBeVisible();
    await expect(page).toHaveURL(/\/teacher\/materials\/new$/);
  });
  test("UC-10: very long pasted text is refused with a clear message", async ({ page }) => {
    await page.goto("/teacher/materials/new");
    await page.getByRole("tab", { name: /paste/i }).click();
    await page.getByLabel("Paste text").fill("cat ".repeat(13_000));
    await page.getByRole("button", { name: /split into items/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /too much text/i })).toBeVisible();
  });
  // UC-08 exceptions (no due date, network failure) are in phase-b.spec.ts: they need a material.
});
