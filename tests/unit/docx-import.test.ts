import { describe, expect, it } from "vitest";
import { DOCX_EMPTY, DOCX_MAX_BYTES, DOCX_ONLY, ImportError, importDocx } from "@/server/services/docx-import";
import { makeDocx, makeZip } from "../fixtures/docx";

const file = (name: string, bytes: Uint8Array, size = bytes.length) => ({ name, size, bytes });

async function rejects(p: Promise<unknown>, message: string, status: number) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(ImportError);
  expect((err as ImportError).message).toBe(message);
  expect((err as ImportError).status).toBe(status);
}

describe("Word (.docx) import → preview", () => {
  it("happy path: extracts text and runs the shared splitter", async () => {
    const bytes = await makeDocx(["1. The cat is on the mat. Mr. Khan has a dog.", "", "• red ball", "- I see the sun!"]);
    const items = await importDocx(file("homework.docx", bytes));
    expect(items.map((i) => i.text)).toEqual(["The cat is on the mat.", "Mr. Khan has a dog.", "red ball", "I see the sun!"]);
    expect(items[0].words).toBe(6);
  });
  it("line mode + level warnings come through", async () => {
    const bytes = await makeDocx(["I see a cow. It is big."]);
    const [item] = await importDocx(file("a.DOCX", bytes), "line", "basic");
    expect(item.text).toBe("I see a cow. It is big.");
    expect(item.warnings[0]).toMatch(/long for Basic/);
  });
  it("rejects .doc, .pdf and other names", async () => {
    const bytes = await makeDocx(["cat"]);
    await rejects(importDocx(file("old.doc", bytes)), DOCX_ONLY, 415);
    await rejects(importDocx(file("sheet.pdf", new TextEncoder().encode("%PDF-1.7"))), DOCX_ONLY, 415);
    await rejects(importDocx(file("notes.txt", new TextEncoder().encode("cat"))), DOCX_ONLY, 415);
  });
  it("rejects a renamed non-Word file and a zip that isn't a Word document", async () => {
    await rejects(importDocx(file("fake.docx", new TextEncoder().encode("%PDF-1.7 not word"))), DOCX_ONLY, 415);
    await rejects(importDocx(file("archive.docx", await makeZip())), DOCX_ONLY, 415);
  });
  it("rejects an empty document", async () => {
    await rejects(importDocx(file("empty.docx", await makeDocx(["", "   "]))), DOCX_EMPTY, 400);
  });
  it("rejects files over 5 MB", async () => {
    await rejects(importDocx(file("big.docx", await makeDocx(["cat"]), DOCX_MAX_BYTES + 1)), "The file is too big (max 5 MB).", 413);
  });
});
