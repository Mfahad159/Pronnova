import { expect, test } from "@playwright/test";

// Smoke test: every main route loads its heading and not our error screen (needs the seeded DB).
// Note: don't assert on role="alert" — Next.js always renders an empty route announcer with that role.
const routes: [path: string, heading: RegExp][] = [
  ["/", /say it out loud/i],
  ["/student", /welcome back/i],
  ["/student/chapters", /^chapters$/i],
  ["/student/progress", /your progress/i],
  ["/teacher", /hello/i],
  ["/teacher/materials/new", /upload practice material/i],
  ["/teacher/chapters", /organize chapters/i],
  ["/teacher/students", /^students$/i],
];

for (const [path, heading] of routes) {
  test(`loads ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText(/couldn.t load this page|database isn.t connected/i)).toHaveCount(0);
  });
}

test("chapter → item → practice flow uses real data", async ({ page }) => {
  await page.goto("/student/chapters");
  await page.getByRole("link", { name: /tricky sounds/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tricky Sounds" })).toBeVisible();
  await page.getByRole("link", { name: /three thin thieves/i }).click();
  await expect(page.getByText("Three thin thieves thought about the weather.")).toBeVisible();
});

test("unknown chapter shows the not-found page", async ({ page }) => {
  await page.goto("/student/chapters/does-not-exist");
  await expect(page.getByRole("heading", { name: /couldn.t find that page/i })).toBeVisible();
});
