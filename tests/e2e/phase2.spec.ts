import { expect, test } from "@playwright/test";

const TRICKY = "/student/chapters/10000000-0000-4000-8000-000000000002";

test("UC-03: levels lock in order and assigned homework stays open", async ({ page }) => {
  await page.goto(TRICKY);
  await expect(page.getByRole("heading", { level: 2, name: "Basic" })).toBeVisible();
  await expect(page.getByText(/this level is locked/i).first()).toBeVisible();
  // Public item in a locked level is not a link; seeded TH homework is (Class 1 content, ADR-006).
  await expect(page.getByRole("link", { name: /a fat fish/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /this is my thumb/i })).toBeVisible();
});

test("UC-03 alt 1B: homework list and Continue on student home", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Homework" })).toBeVisible();
  await expect(page.getByRole("link", { name: /TH sounds/i })).toBeVisible();
  await page.getByRole("link", { name: /continue practice|start practice/i }).click();
  await expect(page).toHaveURL(/\/student\/practice\//);
  await expect(page.getByText(/this level is locked/i)).toHaveCount(0);
});

test("UC-10: empty submit shows field errors and saves nothing", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await page.getByRole("button", { name: /save/i }).click();
  await expect(page.getByText("Enter a title.")).toBeVisible();
  await expect(page.getByText("Choose a chapter.")).toBeVisible();
  await expect(page.getByText(/add at least one word/i)).toBeVisible();
  await expect(page).toHaveURL(/\/teacher\/materials\/new$/);
});

// Writes to the database: run only when asked (E2E_MUTATE=1 npm run test:e2e).
test("UC-10: saved material appears for the student", async ({ page }) => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");
  const title = `E2E ${Date.now()}`;
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title").fill(title);
  // Animate UI select: open it, then pick the option.
  await page.getByLabel("Chapter").click();
  await page.getByRole("option", { name: "2. Tricky Sounds" }).click();
  await page.getByLabel("Due date").fill("2099-12-31");
  await page.getByLabel(/practice items/i).fill("vowel\nvalley");
  await page.getByRole("button", { name: /save and assign/i }).click();
  await expect(page).toHaveURL(/\/teacher\/materials$/);
  await expect(page.getByText(title)).toBeVisible();
  await page.goto("/student");
  await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
});
