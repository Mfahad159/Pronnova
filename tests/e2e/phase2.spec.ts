import { expect, test } from "@playwright/test";

const TRICKY = "/student/chapters/10000000-0000-4000-8000-000000000002";

test("UC-03: levels lock in order", async ({ page }) => {
  await page.goto(TRICKY);
  await expect(page.getByRole("heading", { level: 2, name: "Basic" })).toBeVisible();
  await expect(page.getByText(/this level is locked/i).first()).toBeVisible();
  // Open Basic words are links; items in a locked level are not.
  await expect(page.getByRole("link", { name: /\bvan\b/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /a fat fish/i })).toHaveCount(0);
});

test("UC-03 alt 1B: homework list and Continue on student home", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Homework" })).toBeVisible();
  // Seed (0004): "Animal words" via Ayesha's class, "Little phrases" assigned to her individually.
  await expect(page.getByRole("link", { name: /Animal words/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Little phrases/i })).toBeVisible();
  await page.getByRole("link", { name: /continue practice|start practice/i }).click();
  await expect(page).toHaveURL(/\/student\/practice\//);
  await expect(page.getByText(/this level is locked/i)).toHaveCount(0);
});

test("UC-03: an assigned library material opens for practice", async ({ page }) => {
  await page.goto("/student");
  await page.getByRole("link", { name: /Animal words/i }).click();
  await expect(page).toHaveURL(/\/student\/practice\//);
  await expect(page.getByText("cat", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
});

test("UC-10: empty submit shows field errors and saves nothing", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await page.getByRole("button", { name: /save/i }).click();
  await expect(page.getByText("Enter a title.")).toBeVisible();
  await expect(page.getByText(/add at least one word/i)).toBeVisible();
  await expect(page).toHaveURL(/\/teacher\/materials\/new$/);
});

test("UC-10: pasted text is split into an editable preview (nothing saved)", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Paste text").fill("1. Mr. Khan has a cat. I see a dog!\n• red ball");
  await page.getByRole("button", { name: /split into items/i }).click();
  await expect(page.getByLabel("Item 1", { exact: true })).toHaveValue("Mr. Khan has a cat.");
  await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("I see a dog!");
  await expect(page.getByLabel("Item 3", { exact: true })).toHaveValue("red ball");
  await page.getByRole("button", { name: "Remove item 3" }).click();
  await expect(page.getByLabel("Item 3", { exact: true })).toHaveCount(0);
});

// Writes to the database: run only when asked (E2E_MUTATE=1 npm run test:e2e).
test("UC-10 + UC-08: saved and assigned material appears for the student", async ({ page }) => {
  test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");
  const title = `E2E ${Date.now()}`;
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title", { exact: true }).fill(title);
  // Animate UI select: open it, then pick the option.
  await page.getByLabel("Level").click();
  await page.getByRole("option", { name: "Medium" }).click();
  await page.getByLabel("Paste text").fill("1. I see a red van.\n2. The vet has a big dog.");
  await page.getByRole("button", { name: /split into items/i }).click();
  await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("The vet has a big dog.");
  await page.getByLabel("Class 1 – Blue").check();
  await page.getByLabel("Due date").fill("2099-12-31");
  await page.getByRole("button", { name: /save and assign/i }).click();
  await expect(page).toHaveURL(/\/teacher\/materials$/);
  await expect(page.getByText(title)).toBeVisible();
  await page.goto("/student");
  await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
});

test("Who are you?: pick class, then name; the student home follows", async ({ page }) => {
  await page.goto("/student/who");
  await page.getByRole("link", { name: /Class 1 – Green/ }).click();
  await page.getByRole("button", { name: /^A Ali/ }).click();
  await expect(page).toHaveURL(/\/student$/);
  await expect(page.getByRole("heading", { level: 1, name: /welcome back, ali/i })).toBeVisible();
  // Green has "Little phrases" as a class; "Animal words" is only for Blue.
  await expect(page.getByRole("link", { name: /Little phrases/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Animal words/i })).toHaveCount(0);
});
