import { expect, test } from "@playwright/test";

// Smoke test: every main route loads without an error page (needs the seeded DB).
const routes = ["/", "/student", "/student/chapters", "/student/progress", "/teacher", "/teacher/materials/new", "/teacher/chapters", "/teacher/students"];

for (const path of routes) {
  test(`loads ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}

test("unknown chapter shows the not-found page", async ({ page }) => {
  await page.goto("/student/chapters/does-not-exist");
  await expect(page.getByRole("heading", { name: /couldn.t find that page/i })).toBeVisible();
});
