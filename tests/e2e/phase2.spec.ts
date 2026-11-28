import { expect, test } from "./fixtures";

const TRICKY = "/student/chapters/10000000-0000-4000-8000-000000000002";

test("UC-03: levels lock in order", async ({ page }) => {
  await page.goto(TRICKY);
  await expect(page.getByRole("heading", { level: 2, name: "Basic" })).toBeVisible();
  await expect(page.getByText(/this level is locked/i).first()).toBeVisible();
  // Open Basic words are links; items in a locked level are not.
  await expect(page.getByRole("link", { name: /\bvan\b/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /a fat fish/i })).toHaveCount(0);
});

test("dashboard: Your lessons and Continue", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Your lessons" })).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Start recording" })).toBeVisible();
});

test("UC-10 editor: Save waits for items, and the title is required", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await expect(page.getByRole("button", { name: "Save material" })).toBeDisabled();
  await page.getByLabel("New item").fill("cat");
  await page.getByLabel("New item").press("Enter");
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page.getByText("Enter a title.")).toBeVisible();
  await expect(page).toHaveURL(/\/teacher\/materials\/new$/);
});

test("UC-10 editor: Paste splits into an editable, reorderable list (nothing saved)", async ({ page }) => {
  await page.goto("/teacher/materials/new");
  await page.getByRole("tab", { name: /paste/i }).click();
  await page.getByLabel("Paste text").fill("1. Mr. Khan has a cat. I see a dog!\n• red ball");
  await page.getByRole("button", { name: /split into items/i }).click();
  await expect(page.getByLabel("Item 1", { exact: true })).toHaveValue("Mr. Khan has a cat.");
  await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("I see a dog!");
  await expect(page.getByLabel("Item 3", { exact: true })).toHaveValue("red ball");
  if (test.info().project.name === "desktop") {
    // Up/down buttons are the keyboard alternative to dragging (hidden on phones, where touch-drag is used).
    await page.getByRole("button", { name: "Move item 3 up" }).click();
    await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("red ball");
  }
  await page.getByRole("button", { name: "Remove item 3" }).click();
  // Basic suggests 1–3 words: desktop keeps "red ball" (1 warning), phones keep "I see a dog!" (2).
  await expect(page.getByText(test.info().project.name === "desktop" ? /^2 items · 1 warning$/ : /^2 items · 2 warnings$/)).toBeVisible();
});
