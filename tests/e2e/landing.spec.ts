import { expect, test } from "./fixtures";

test("landing sections are reachable, interactive tabs work, and the FAQ opens", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const id of ["top", "demo", "how-it-works", "buddy", "journey", "assessment", "teachers", "classroom", "learners", "faq"]) {
    await expect(page.locator(`#${id}`)).toBeAttached();
  }

  if (!isMobile) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/#faq$/);
  }

  // Interactive Teacher Preview toggle
  await page.getByRole("tab", { name: "Student Progress" }).click();
  await expect(page.getByText("Ayesha Khan")).toBeVisible();

  // Interactive FAQ exclusive accordion
  const q = page.getByText("Does Pronnova support different English accents?");
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.locator("#faq").getByText(/Both British and American English/i)).toBeVisible();

  // Final CTA routes to Student and Teacher experiences without login
  await expect(page.getByRole("link", { name: "Explore Student Experience" })).toHaveAttribute("href", "/student");
  await expect(page.getByRole("link", { name: "Explore Teacher Experience" })).toHaveAttribute("href", "/teacher");
});
