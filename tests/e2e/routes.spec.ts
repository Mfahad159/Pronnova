import { expect, test } from "./fixtures";

// Smoke test: every main route loads its heading and not our error screen (needs the seeded DB).
// Note: don't assert on role="alert" — Next.js always renders an empty route announcer with that role.
const routes: [path: string, heading: RegExp][] = [
  ["/", /helping little voices grow/i],
  ["/onboarding", /how will you use pronnova/i],
  ["/student", /^hi, ahmad/i],
  ["/student/chapters", /^chapters$/i],
  ["/student/progress", /your progress/i],
  ["/teacher", /hello/i],
  ["/teacher/materials", /^materials$/i],
  ["/teacher/materials/new", /^new material$/i],
  ["/teacher/chapters", /organize chapters/i],
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
  await page.getByRole("link", { name: /\bvan\b/i }).click();
  await expect(page.getByText("van", { exact: true })).toBeVisible();
});

test("landing Get started → onboarding (with setup steps) → choose student or teacher", async ({ page }) => {
  await page.goto("/");
  // Hero "Get started" opens the role chooser (2026-11-28 UI corrections).
  await page.getByRole("main").getByRole("link", { name: /^get started/i }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  const steps = page.getByRole("navigation", { name: "Setup progress" });
  await expect(steps).toBeVisible();
  await expect(steps.locator('[aria-current="step"]')).toContainText("Choose your role");
  await page.getByRole("link", { name: /i'm a student/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /^hi, ahmad/i })).toBeVisible();
  await page.goto("/onboarding");
  await page.getByRole("link", { name: /i'm a teacher/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /hello, umar/i })).toBeVisible();
});

test("switching portal always goes through role selection", async ({ page, isMobile }) => {
  await page.goto("/student");
  if (isMobile) await page.getByRole("button", { name: "Toggle Sidebar" }).click(); // menu is a drawer on phones
  await page.getByRole("button", { name: /pronnova, student portal/i }).click();
  await expect(page.getByRole("menuitem", { name: /teacher/i })).toHaveCount(0);
  await page.getByRole("menuitem", { name: /switch role/i }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
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
  await page.goto("/", { waitUntil: "commit" }); // look while it loads
  const loader = page.locator(".pn-loader");
  await expect(loader).toHaveCount(1);
  await expect(loader).toHaveCount(0, { timeout: 8_000 }); // gone once the page has loaded
  await expect(page.getByRole("link", { name: "Explore Student Experience" })).toBeVisible();

  await page.reload({ waitUntil: "commit" });
  await expect(page.locator(".pn-loader")).toHaveCount(1);
  await expect(page.locator(".pn-loader")).toHaveCount(0, { timeout: 8_000 });
});

test("removed pages redirect instead of dead-ending", async ({ page }) => {
  for (const [from, to, heading] of [
    ["/student/who", /\/student$/, /^hi, ahmad/i],
    ["/teacher/classes", /\/teacher$/, /hello, umar/i],
    ["/teacher/students", /\/teacher$/, /hello, umar/i],
  ] as const) {
    await page.goto(from);
    await expect(page).toHaveURL(to);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }
});
