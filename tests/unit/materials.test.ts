import { describe, expect, it } from "vitest";
import { deadlineToIso, detectItemType, parseItemLines, todayInPakistan, validateMaterial, type MaterialInput } from "@/lib/materials";

describe("detectItemType", () => {
  it.each([
    ["window", "word"],
    ["a sharp pencil", "phrase"],
    ["thank you very much", "phrase"],
    ["We visited the village.", "sentence"],
    ["my brother walks to school with me", "sentence"],
    ["I woke up. Then I ate breakfast.", "paragraph"],
    ["one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen", "paragraph"],
  ])("%j → %s", (text, type) => expect(detectItemType(text)).toBe(type));
});

describe("parseItemLines", () => {
  it("trims, collapses spaces, drops blanks and case-insensitive duplicates", () => {
    const items = parseItemLines("  van \n\nVan\nwet   weather\r\n");
    expect(items.map((i) => i.text)).toEqual(["van", "wet weather"]);
  });
});

const base: MaterialInput = {
  title: "TH homework",
  instructions: "",
  chapterId: "10000000-0000-4000-8000-000000000002",
  level: "basic",
  classId: "",
  deadline: "",
  items: [{ text: "three", itemType: "word" }],
};
const today = "2026-11-24";

describe("validateMaterial (UC-10)", () => {
  it("accepts a valid material saved without a class (alt flow 3A)", () => {
    expect(validateMaterial(base, today)).toEqual({});
  });
  it("requires title, chapter, level and at least one item", () => {
    const e = validateMaterial({ ...base, title: " ", chapterId: "", level: "x", items: [] }, today);
    expect(Object.keys(e).sort()).toEqual(["chapterId", "items", "level", "title"]);
  });
  it("needs a due date when a class is chosen, and not in the past", () => {
    expect(validateMaterial({ ...base, classId: "c" }, today).deadline).toMatch(/due date/);
    expect(validateMaterial({ ...base, classId: "c", deadline: "2026-11-23" }, today).deadline).toMatch(/past/);
    expect(validateMaterial({ ...base, classId: "c", deadline: "2026-11-24" }, today)).toEqual({});
  });
  it("flags a too-long sentence and a multi-word 'word'", () => {
    const long = Array.from({ length: 16 }, (_, i) => `w${i}`).join(" ");
    const e = validateMaterial(
      { ...base, items: [{ text: long, itemType: "sentence" }, { text: "two words", itemType: "word" }] },
      today,
    );
    expect(Object.keys(e.itemErrors ?? {})).toEqual(["0", "1"]);
  });
});

describe("dates", () => {
  it("uses Pakistan time for today", () => {
    expect(todayInPakistan(new Date("2026-11-24T20:00:00Z"))).toBe("2026-11-25");
  });
  it("deadline is the end of that day in Pakistan", () => {
    expect(new Date(deadlineToIso("2026-11-30")).toISOString()).toBe("2026-11-30T18:59:59.000Z");
  });
});
