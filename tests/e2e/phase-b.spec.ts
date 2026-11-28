import { expect, test, type Page } from "./fixtures";
import { makeDocx } from "../fixtures/docx";

// The full FYP-1 flow with ONE teacher (Umar) and ONE student (Ahmad), in a real browser (fake mic):
// UC-10 upload (Write, Paste, Word) → UC-08 assign to Ahmad → UC-03/04/05/06 Ahmad practises and gets a
// score → UC-12 the teacher sees it; then the material locks and Duplicate & edit works.
// Writes data, so it only runs with E2E_MUTATE=1, on the desktop project, one test after another.
// Names are unique per run ("PB <time> …"); reseed afterwards (npm run db:seed) to start empty again.

test.describe.configure({ mode: "serial" });
test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "data-writing walkthrough runs once, on desktop"));

const RUN = `PB ${Date.now()}`;
const nextWeek = () => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);

async function recordAndSend(page: Page) {
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Stop recording" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 20_000 });
}

test("UC-10: create materials by Write, Paste and Word; 26 words blocks Save, 8 words in Basic only warns by Write, Paste and Word; 26 words blocks Save, 8 words in Basic only warns", async ({ page }) => {
  // Write (+ the limits): a 26-word item disables Save; an 8-word Basic item is only a warning.
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title", { exact: true }).fill(`${RUN} write`);
  const add = async (text: string) => {
    await page.getByLabel("New item").fill(text);
    await page.getByLabel("New item").press("Enter");
  };
  await add("cat");
  await add("dog");
  await add(Array.from({ length: 26 }, (_, i) => `w${i}`).join(" "));
  await expect(page.getByText(/26 words \(max 25\)/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save material" })).toBeDisabled();
  await page.getByRole("button", { name: "Remove item 3" }).click();
  await add("the big red ball is under the table");
  await expect(page.getByText("Long for Basic: 1–3 words suggested")).toBeVisible();
  await expect(page.getByText(/3 items · 1 warning/)).toBeVisible();
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page).toHaveURL(/\/teacher\/materials$/);
  await expect(page.getByRole("link", { name: `${RUN} write` })).toBeVisible({ timeout: 20_000 }); // save + list on the dev server

  // Paste, sentence mode (default).
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title", { exact: true }).fill(`${RUN} paste`);
  await page.getByRole("tab", { name: /paste/i }).click();
  await page.getByLabel("Paste text").fill("1. I see a red van. Mr. Khan has a dog!\n2. The sun is hot.");
  await page.getByRole("button", { name: /split into items/i }).click();
  await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("Mr. Khan has a dog!");
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page.getByRole("link", { name: `${RUN} paste` })).toBeVisible({ timeout: 20_000 }); // save + list on the dev server

  // Upload Word (.docx): a rejection first, then a real file.
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title", { exact: true }).fill(`${RUN} word`);
  await page.getByRole("tab", { name: /upload word/i }).click();
  await page.getByLabel("Word file to import").setInputFiles({ name: "old.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7") });
  await expect(page.getByRole("alert").filter({ hasText: "Only Word .docx files are supported." })).toBeVisible();
  const docx = Buffer.from(await makeDocx(["• cat", "• dog", "• fish"]));
  await page.getByLabel("Word file to import").setInputFiles({ name: "animals.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: docx });
  await expect(page.getByLabel("Item 3", { exact: true })).toHaveValue("fish");
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page.getByRole("link", { name: `${RUN} word` })).toBeVisible({ timeout: 20_000 }); // save + list on the dev server
});

test("UC-08: assign to Ahmad (due date required; a network failure keeps the dialog open)", async ({ page }) => {
  await page.goto("/teacher/materials");
  await page.getByLabel("Search materials by title").fill(`${RUN} word`);
  const card = page.getByRole("listitem").filter({ hasText: `${RUN} word` });
  await expect(card.getByText("not assigned yet")).toBeVisible();
  await card.getByRole("button", { name: /^Assign/ }).click();
  const dlg = page.getByRole("dialog");
  await expect(dlg.getByText(/For: Ahmad/)).toBeVisible();
  await expect(dlg.getByRole("button", { name: "Assign" })).toBeDisabled(); // no due date yet
  await dlg.getByLabel("Due date").fill(nextWeek());
  await page.route("**/api/assignments", (r) => r.abort("internetdisconnected"));
  await dlg.getByRole("button", { name: "Assign" }).click();
  await expect(dlg.getByRole("alert").filter({ hasText: /no connection/i })).toBeVisible();
  await page.unroute("**/api/assignments");
  await dlg.getByRole("button", { name: "Cancel" }).click();
  await card.getByRole("button", { name: /^Assign/ }).click();
  await dlg.getByLabel("Due date").fill(nextWeek());
  await dlg.getByRole("button", { name: "Assign" }).click();
  await expect(page.getByText(new RegExp(`Assigned “${RUN} word” to Ahmad`))).toBeVisible();
  await expect(card.getByText("assigned 1 time")).toBeVisible();
});

test("UC-03 → UC-06: Ahmad sees it on Home, practises, gets a score; the teacher sees the attempt", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Your lessons" })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(`${RUN} word`) }).click();
  await expect(page).toHaveURL(/\/student\/practice\//);
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible(); // no dead end
  await recordAndSend(page);
  await expect(page.getByText(/^· (Excellent|Good|Average)$/)).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("button", { name: "Stop recording" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.goto("/teacher");
  await expect(page.getByText(/Ahmad's progress/)).toBeVisible();
  await expect(page.getByRole("table").getByText("Ahmad").first()).toBeVisible();
  await expect(page.getByRole("table").getByText(`${RUN} word`).first()).toBeVisible();
});

test("after an attempt the material is locked and Duplicate & edit works", async ({ page }) => {
  await page.goto("/teacher/materials");
  await page.getByRole("link", { name: `${RUN} word` }).click();
  await expect(page.getByText("Students have attempted this material, so items are locked.")).toBeVisible();
  await expect(page.getByLabel("Item 1", { exact: true })).toHaveAttribute("readonly", "");
  await expect(page.getByRole("tab", { name: /paste/i })).toHaveCount(0);
  await page.getByRole("button", { name: /duplicate & edit/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: `${RUN} word (copy)` })).toBeVisible();
  await expect(page.getByText("Students have attempted this material")).toHaveCount(0);
  await expect(page.getByLabel("Item 1", { exact: true })).not.toHaveAttribute("readonly", "");
});
