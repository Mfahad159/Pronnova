import { expect, test } from "@playwright/test";

test("landing sections are reachable and the FAQ opens", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const id of ["practise", "journey", "feedback", "guides", "faq"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }
  if (!isMobile) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/#faq$/);
  }
  const q = page.getByText("Who can hear my recordings?");
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.locator("#faq").getByText(/only you and your teacher/i)).toBeVisible();
  // One main call to action, repeated: every "Get started" goes to onboarding.
  const hrefs = await page.getByRole("link", { name: /^get started/i }).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThanOrEqual(3);
  expect(new Set(hrefs)).toEqual(new Set(["/onboarding"]));
});
