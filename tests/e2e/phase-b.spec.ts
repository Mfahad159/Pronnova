import { expect, test, type Browser, type Page } from "@playwright/test";
import { makeDocx } from "../fixtures/docx";

// Phase B exit checks 1–7, walked through in a real browser (fake microphone). Writes data, so it
// only runs with E2E_MUTATE=1, on the desktop project, one test after another.
// Names are unique per run ("PB <time> …"); reseed the demo DB afterwards (npm run db:seed).

test.describe.configure({ mode: "serial" });
test.skip(!process.env.E2E_MUTATE, "set E2E_MUTATE=1 to run tests that write data");
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "data-writing walkthrough runs once, on desktop"));

const RUN = `PB ${Date.now()}`;
const CLASS = `${RUN} class`;
const TAG = RUN.slice(-5);
// Unique per run, so lookups by name never hit a student from an earlier run.
const [S1, S2, S3, LATE] = ["Sana", "Raza", "Gone", "Late"].map((n) => `${n} ${TAG}`);
const ALI_GREEN = "00000000-0000-4000-8000-000000000020"; // seeded: Ali, Class 1 – Green
const nextWeek = () => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
const ids: Record<string, string> = {};

async function addStudent(page: Page, name: string, roll: string) {
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Roll no.").fill(roll);
  await page.getByRole("button", { name: "Add student" }).click();
  await expect(page.getByRole("list", { name: `Students in ${CLASS}` }).getByText(name)).toBeVisible();
}

/** A fresh device (nobody picked yet). */
const freshDevice = (browser: Browser) => browser.newContext({ storageState: { cookies: [], origins: [] }, permissions: ["microphone"] });

/** A device where this student is already picked (same as the picker would leave it). */
async function deviceFor(browser: Browser, studentId: string) {
  const ctx = await browser.newContext({ permissions: ["microphone"] });
  const page = await ctx.newPage();
  expect((await page.request.post("/api/student/session", { data: { studentId } })).ok()).toBe(true);
  return { ctx, page };
}

async function studentIdByName(page: Page, name: string) {
  const res = await page.request.get("/api/students?includeArchived=true");
  const { students } = (await res.json()) as { students: { id: string; fullName: string }[] };
  return students.find((s) => s.fullName === name)!.id;
}

async function recordAndSend(page: Page) {
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Stop recording" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status").filter({ hasText: /your score is \d+ percent/i })).toBeAttached({ timeout: 20_000 });
}

test("1. create a class and 3 students; an archived student leaves the pickers", async ({ page, browser }) => {
  await page.goto("/teacher/classes");
  await page.getByLabel("New class").fill(CLASS);
  await page.getByRole("button", { name: "Add class" }).click();
  await expect(page.getByRole("button", { name: new RegExp(CLASS), pressed: true })).toBeVisible();
  await addStudent(page, S1, "1");
  await addStudent(page, S2, "2");
  await addStudent(page, S3, "3");

  await page.getByRole("button", { name: `Archive ${S3}` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Archive" }).click();
  await expect(page.getByRole("list", { name: `Students in ${CLASS}` }).getByText(S3)).toHaveCount(0);
  await page.getByLabel(/show archived/i).check();
  await expect(page.getByRole("button", { name: `Unarchive ${S3}` })).toBeVisible();

  // Student picker (fresh device) no longer lists them…
  const ctx = await freshDevice(browser);
  const kid = await ctx.newPage();
  await kid.goto("/student/who");
  await kid.getByRole("button", { name: new RegExp(CLASS) }).click();
  await expect(kid.getByRole("radio", { name: new RegExp(S1) })).toBeVisible();
  await expect(kid.getByRole("radio", { name: new RegExp(S3) })).toHaveCount(0);
  await ctx.close();

  // …and neither does the Assign dialog.
  await page.goto("/teacher/materials");
  await page.getByRole("button", { name: /^Assign Animal words/ }).click();
  await page.getByLabel("Search students").fill(S3);
  await expect(page.getByRole("dialog").getByText("No students match.")).toBeVisible();
});

test("2 + 3. create materials by Write, Paste and Word; 26 words blocks Save, 8 words in Basic only warns", async ({ page }) => {
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
  await expect(page.getByRole("link", { name: `${RUN} write` })).toBeVisible();

  // Paste, sentence mode (default).
  await page.goto("/teacher/materials/new");
  await page.getByLabel("Title", { exact: true }).fill(`${RUN} paste`);
  await page.getByRole("tab", { name: /paste/i }).click();
  await page.getByLabel("Paste text").fill("1. I see a red van. Mr. Khan has a dog!\n2. The sun is hot.");
  await page.getByRole("button", { name: /split into items/i }).click();
  await expect(page.getByLabel("Item 2", { exact: true })).toHaveValue("Mr. Khan has a dog!");
  await page.getByRole("button", { name: "Save material" }).click();
  await expect(page.getByRole("link", { name: `${RUN} paste` })).toBeVisible();

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
  await expect(page.getByRole("link", { name: `${RUN} word` })).toBeVisible();
});

test("4. assign to a class + 1 student from another class; a student added later sees it too", async ({ page, browser }) => {
  await page.goto("/teacher/materials");
  await page.getByLabel("Search materials by title").fill(`${RUN} word`);
  const card = page.getByRole("listitem").filter({ hasText: `${RUN} word` });
  await expect(card.getByText("not assigned yet")).toBeVisible();
  await card.getByRole("button", { name: /^Assign/ }).click();
  const dlg = page.getByRole("dialog");
  await expect(dlg.getByRole("button", { name: "Assign" })).toBeDisabled();
  await dlg.getByRole("checkbox", { name: new RegExp(CLASS) }).check();
  await dlg.getByLabel("Search students").fill("Ali");
  await dlg.getByRole("group", { name: "Class 1 – Green" }).getByLabel(/Ali/).check();
  await dlg.getByLabel("Due date").fill(nextWeek());
  await expect(dlg.getByText(new RegExp(`${CLASS} \\(2 students\\) \\+ 1 individual student`))).toBeVisible();
  await dlg.getByRole("button", { name: "Assign" }).click();
  await expect(card.getByText("assigned 1 time")).toBeVisible();

  ids.S1 = await studentIdByName(page, S1);
  for (const id of [ids.S1, ALI_GREEN]) {
    const { ctx, page: kid } = await deviceFor(browser, id);
    await kid.goto("/student");
    await expect(kid.getByRole("link", { name: new RegExp(`${RUN} word`) })).toBeVisible();
    await ctx.close();
  }

  await page.goto("/teacher/classes");
  await page.getByRole("button", { name: new RegExp(`^${CLASS}`) }).click();
  await addStudent(page, LATE, "9");
  const { ctx, page: kid } = await deviceFor(browser, await studentIdByName(page, LATE));
  await kid.goto("/student");
  await expect(kid.getByRole("link", { name: new RegExp(`${RUN} word`) })).toBeVisible();
  await ctx.close();
});

test("5. first visit shows the picker; reload goes to the dashboard; Switch works", async ({ browser }) => {
  const ctx = await freshDevice(browser);
  const page = await ctx.newPage();
  await page.goto("/student");
  await expect(page).toHaveURL(/\/student\/who$/);
  await page.getByRole("button", { name: /Class 1 – Green/ }).click();
  await page.getByRole("radio", { name: /Ali/ }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /^hi, ali/i })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("pronnova.studentId"))).toBe(ALI_GREEN);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /^hi, ali/i })).toBeVisible();

  await page.getByRole("button", { name: /open profile menu/i }).click();
  await page.getByRole("menuitem", { name: /switch student/i }).click();
  await expect(page).toHaveURL(/\/student\/who$/);
  await expect(page.getByText(/step 1 · pick your class/i)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("pronnova.studentId"))).toBeNull();
  await ctx.close();
});

test("6 + 7. dashboard → record → feedback → retry; then the material is locked and Duplicate & edit works", async ({ page, browser }) => {
  const { ctx, page: kid } = await deviceFor(browser, ids.S1 ?? (await studentIdByName(page, S1)));
  await kid.goto("/student");
  await kid.getByRole("link", { name: new RegExp(`${RUN} word`) }).click();
  await expect(kid).toHaveURL(/\/student\/practice\//);
  await recordAndSend(kid);
  await expect(kid.getByText(/^· (Excellent|Good|Average)$/)).toBeVisible();
  await kid.getByRole("button", { name: "Try again" }).click();
  await expect(kid.getByRole("button", { name: "Stop recording" })).toBeVisible();
  await kid.getByRole("button", { name: "Cancel" }).click();
  await ctx.close();

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
