import { describe, expect, it } from "vitest";
import { POST as createMaterial } from "@/app/api/materials/route";
import { POST as importWord } from "@/app/api/materials/import/route";
import { POST as split } from "@/app/api/materials/split/route";
import { POST as assign } from "@/app/api/assignments/route";
import { makeDocx } from "../fixtures/docx";

// API routes that answer before touching the database (validation). DB-backed rules: tests/db.

const post = (url: string, body: unknown) =>
  new Request(`http://test${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");

describe("POST /api/materials", () => {
  it("26-word item → 422 with a field-level error (hard block)", async () => {
    const res = await createMaterial(post("/api/materials", { title: "Long", level: "advanced", items: [words(12), words(26)] }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.fieldErrors.itemErrors["1"]).toMatch(/26 words \(max 25\)/);
  });
  it("missing title/level/items → 422 with each field named", async () => {
    const res = await createMaterial(post("/api/materials", { title: " ", level: "easy", items: [] }));
    expect(res.status).toBe(422);
    const { fieldErrors } = await res.json();
    expect(Object.keys(fieldErrors).sort()).toEqual(["items", "level", "title"]);
  });
  it("assign with a past date → 422 before anything is saved", async () => {
    const res = await createMaterial(
      post("/api/materials", { title: "Cats", level: "basic", items: ["cat"], assign: { dueDate: "2000-01-01", classIds: ["x"] } }),
    );
    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors.assign.dueDate).toMatch(/past/);
  });
});

describe("POST /api/assignments validation", () => {
  it("rejects duplicate targets and past dates", async () => {
    const id = "00000000-0000-4000-8000-0000000000aa";
    const dup = await assign(post("/api/assignments", { materialId: id, dueDate: "2999-01-01", classIds: [id, id] }));
    expect(dup.status).toBe(422);
    expect((await dup.json()).fieldErrors.targets).toMatch(/only be picked once/);
    const past = await assign(post("/api/assignments", { materialId: id, dueDate: "2000-01-01", classIds: [id] }));
    expect((await past.json()).fieldErrors.dueDate).toMatch(/past/);
    const none = await assign(post("/api/assignments", { materialId: id, dueDate: "2999-01-01" }));
    expect((await none.json()).fieldErrors.targets).toMatch(/at least one/);
  });
});

describe("POST /api/materials/split", () => {
  it("returns a preview and saves nothing", async () => {
    const res = await split(post("/api/materials/split", { text: "1. cat\n2. I see a dog.", mode: "sentence", level: "basic" }));
    expect(res.status).toBe(200);
    const { items } = await res.json();
    expect(items.map((i: { text: string }) => i.text)).toEqual(["cat", "I see a dog."]);
    expect(items[1].warnings[0]).toMatch(/long for Basic/);
  });
});

describe("POST /api/materials/import", () => {
  const upload = (name: string, bytes: Uint8Array) => {
    const fd = new FormData();
    fd.append("file", new File([new Uint8Array(bytes)], name));
    return importWord(new Request("http://test/api/materials/import", { method: "POST", body: fd }));
  };
  it("happy path", async () => {
    const res = await upload("words.docx", await makeDocx(["cat", "dog"]));
    expect(res.status).toBe(200);
    expect((await res.json()).items.map((i: { text: string }) => i.text)).toEqual(["cat", "dog"]);
  });
  it(".pdf → 415 with the agreed message", async () => {
    const res = await upload("sheet.pdf", new TextEncoder().encode("%PDF-1.7"));
    expect(res.status).toBe(415);
    expect((await res.json()).error).toBe("Only Word .docx files are supported.");
  });
  it("empty document → 400", async () => {
    const res = await upload("empty.docx", await makeDocx([""]));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("No text found in this document.");
  });
});
