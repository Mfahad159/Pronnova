import { expect, test } from "@playwright/test";

// Smoke test: every main route loads its heading and not our error screen (needs the seeded DB).
// Note: don't assert on role="alert" — Next.js always renders an empty route announcer with that role.
const routes: [path: string, heading: RegExp][] = [
  ["/", /helping little voices grow/i],
  ["/onboarding", /how will you use pronnova/i],
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
  await page.getByRole("link", { name: /this is my thumb/i }).click();
  await expect(page.getByText("This is my thumb.")).toBeVisible();
});

test("landing Choose Role → onboarding → choose student or teacher", async ({ page }) => {
  await page.goto("/");
  // The landing page links to the role chooser through "Choose Role" (redesign 3b4bd89).
  await page.getByRole("link", { name: "Choose Role" }).first().click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("link", { name: /i'm a student/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /welcome back/i })).toBeVisible();
  await page.goto("/onboarding");
  await page.getByRole("link", { name: /i'm a teacher/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /hello/i })).toBeVisible();
});

test("unknown chapter shows the not-found page", async ({ page }) => {
  await page.goto("/student/chapters/does-not-exist");
  await expect(page.getByRole("heading", { name: /couldn.t find that page/i })).toBeVisible();
});

test("recordings API hides unknown or audio-less attempts", async ({ request }) => {
  expect((await request.get("/api/recordings/not-a-uuid")).status()).toBe(404);
  expect((await request.get("/api/recordings/00000000-0000-4000-8000-0000000000ff")).status()).toBe(404);
});

test("page loader: shows on every full load (incl. refresh) and fades out after load", async ({ page }) => {
  await page.goto("/");
  const loader = page.locator(".pn-loader");
  await expect(loader).toHaveCount(1);
  await expect(loader).toHaveCount(0, { timeout: 8_000 }); // gone once the page has loaded
  await expect(page.getByRole("link", { name: "Explore Student Experience" })).toBeVisible();

  await page.reload();
  await expect(page.locator(".pn-loader")).toHaveCount(1);
  await expect(page.locator(".pn-loader")).toHaveCount(0, { timeout: 8_000 });
});
