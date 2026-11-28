import { expect, test } from "./fixtures";

// Phase 5 check 6: keyboard-only use (recording too), visible focus, and the result announced to
// screen readers. Labels/contrast/reduced motion: scripts/qa/ui-audit.mjs + scripts/qa/contrast.mjs.

test.skip(({ isMobile }) => isMobile, "keyboard checks run on desktop");

async function tabTo(page: import("@playwright/test").Page, name: RegExp, max = 60) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement | null;
      if (!el) return "";
      return el.getAttribute("aria-label") || el.labels?.[0]?.innerText || el.innerText || "";
    });
    if (name.test(label)) return;
  }
  throw new Error(`could not reach ${name} with Tab`);
}

test("keyboard only: record → listen → send → result, with a visible focus ring", async ({ page }) => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");
  await page.goto("/student/chapters/10000000-0000-4000-8000-000000000001");
  await tabTo(page, /\bdog\b/i);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();

  await tabTo(page, /^start recording$/i);
  // Visible focus: the focused control draws a ring (box-shadow) when reached by keyboard.
  const ring = await page.evaluate(() => getComputedStyle(document.activeElement!).boxShadow);
  expect(ring).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
  await page.waitForTimeout(1300);
  await tabTo(page, /^stop recording$/i, 10);
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Your recording")).toBeVisible();

  await tabTo(page, /^send$/i, 15);
  await page.keyboard.press("Enter");
  // Screen readers: the score is announced through a polite live region.
  const live = page.locator('[role="status"][aria-live="polite"]').filter({ hasText: /your score is \d+ percent/i });
  await expect(live).toBeAttached({ timeout: 20_000 });
  await tabTo(page, /^try again$/i, 15);
});

test("keyboard only: the teacher can open a material and reach every editor control", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await tabTo(page, /^title$/i);
  await page.keyboard.type("Keyboard test");
  await tabTo(page, /^new item$/i);
  await page.keyboard.type("cat");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Item 1", { exact: true })).toHaveValue("cat");
  await tabTo(page, /^save material$/i);
  await expect(page.getByRole("button", { name: "Save material" })).toBeFocused();
});

test("keyboard only: the student picker works without a mouse", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await ctx.newPage();
  await page.goto("/student/who");
  await tabTo(page, /class 1 – green/i);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: /Ali/ })).toBeVisible(); // names load after the class is chosen
  await tabTo(page, /\bali\b/i);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("radio", { name: /Ali/ })).toHaveAttribute("aria-checked", "true");
  await tabTo(page, /continue/i);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: /^hi, ali/i })).toBeVisible();
  await ctx.close();
});
