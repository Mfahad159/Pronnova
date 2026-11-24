import { expect, test, type Page } from "@playwright/test";

// UC-05 Record + UC-04 Attempt with the fake microphone (see playwright.config.ts).
// These save attempts to the database → run with E2E_MUTATE=1.

async function openKitchen(page: Page) {
  await page.goto("/student/chapters/10000000-0000-4000-8000-000000000001");
  await page.getByRole("link", { name: /kitchen/i }).click();
  await expect(page.getByText("kitchen", { exact: true })).toBeVisible();
}

test.describe("recording", () => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");

  test("record → listen back → send → score, then try again", async ({ page }) => {
    await openKitchen(page);
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

  test("a too-short recording is rejected in the browser", async ({ page }) => {
    await openKitchen(page);
    await page.getByRole("button", { name: "Start recording" }).click();
    await page.getByRole("button", { name: "Stop recording" }).click();
    // Filter: Next.js also renders a route announcer with role="alert".
    await expect(page.getByRole("alert").filter({ hasText: /too short/i })).toBeVisible();
  });
});
