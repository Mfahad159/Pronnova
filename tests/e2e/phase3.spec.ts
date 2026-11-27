import { expect, test, type Page } from "@playwright/test";

// UC-05 Record + UC-04 Attempt with the fake microphone (see playwright.config.ts).
// These save attempts to the database → run with E2E_MUTATE=1.

async function openDog(page: Page) {
  await page.goto("/student/chapters/10000000-0000-4000-8000-000000000001");
  await page.getByRole("link", { name: /\bdog\b/i }).click();
  await expect(page.getByText("dog", { exact: true })).toBeVisible();
}

test.describe("recording", () => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");

  test("record → listen back → send → score, then try again", async ({ page }) => {
    await openDog(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: "Stop recording" }).click();

    await expect(page.getByLabel("Your recording")).toBeVisible();
    await page.getByRole("button", { name: "Send" }).click();
    // Score pill text is split across elements; the live region announces it in one string.
    await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 15_000 });
    await expect(page.getByText(/^· (Excellent|Good|Average)$/)).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click(); // UC-05 alt 3A
    await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
  });

  test("UC-06: a saved recording plays back for the student and their teacher", async ({ page }) => {
    await openDog(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: "Stop recording" }).click();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 15_000 });

    await page.goto("/student");
    const recent = page.locator("section", { has: page.getByRole("heading", { name: "Recent attempts" }) });
    const play = recent.getByRole("button", { name: "Play recording: dog" }).first();
    await expect(play).toBeEnabled();
    const signed = page.waitForResponse((r) => r.url().includes("/api/recordings/"));
    await play.click();
    const res = await signed;
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { url: string; expiresIn: number };
    expect(body.url).toMatch(/\/storage\/v1\/object\/sign\/recordings\//);

    const attemptId = new URL(res.url()).pathname.split("/").pop()!;
    expect((await page.request.get(`/api/recordings/${attemptId}?as=teacher`)).status()).toBe(200);
  });

  test("a too-short recording is rejected in the browser", async ({ page }) => {
    await openDog(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await page.getByRole("button", { name: "Stop recording" }).click();
    // Filter: Next.js also renders a route announcer with role="alert".
    await expect(page.getByRole("alert").filter({ hasText: /too short/i })).toBeVisible();
  });
});
