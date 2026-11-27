import { describe, expect, it } from "vitest";
import {
  MATERIAL_LIMITS,
  cleanMaterial,
  detectItemType,
  itemProblem,
  itemWarnings,
  todayInPakistan,
  validateMaterial,
  type MaterialInput,
} from "@/lib/materials";

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`).join(" ");
const base: MaterialInput = { title: "Animal words", level: "basic", instructions: "", items: ["cat", "dog", "cow"] };

describe("detectItemType", () => {
  it.each([
    ["window", "word"],
    ["a sharp pencil", "phrase"],
    ["We visited the village.", "sentence"],
    ["my brother walks to school with me", "sentence"],
    ["I woke up. Then I ate breakfast.", "paragraph"],
  ])("%j → %s", (text, type) => expect(detectItemType(text)).toBe(type));
});

describe("25-word hard limit (15 s recording, UC-05)", () => {
  it("allows exactly 25 words", () => {
    expect(itemProblem(words(25))).toBeNull();
  });
  it("blocks 26 words with a clear message", () => {
    expect(itemProblem(words(26))).toMatch(/26 words \(max 25\)/);
    const { errors } = validateMaterial({ ...base, level: "advanced", items: [words(12), words(26)] });
    expect(errors.itemErrors?.[1]).toMatch(/max 25/);
    expect(errors.items).toBe("Fix the highlighted items.");
  });
});

describe("level fit is a warning only", () => {
  it("warns but never blocks", () => {
    const { errors, warnings } = validateMaterial({ ...base, level: "advanced", items: ["cat", "dog", "cow"] });
    expect(errors).toEqual({});
    expect(warnings.filter((w) => w.item !== undefined)).toHaveLength(3);
    expect(warnings[0].message).toMatch(/short for Advanced \(11–20 words\)/);
  });
  it.each([
    ["basic", "cat", 0],
    ["basic", "the big cat sat", 1],
    ["medium", "the big cat sat", 0],
    ["medium", words(11), 1],
    ["advanced", words(11), 0],
    ["advanced", words(21), 1],
  ] as const)("%s / %j → %i warning(s)", (level, text, n) => expect(itemWarnings(text, level)).toHaveLength(n));
  it("warns (not blocks) when there are fewer than 3 items", () => {
    const { errors, warnings } = validateMaterial({ ...base, items: ["cat", "dog"] });
    expect(errors).toEqual({});
    expect(warnings.some((w) => w.item === undefined && /3 or more/.test(w.message))).toBe(true);
  });
});

describe("validateMaterial hard rules", () => {
  it("requires title, level and 1–20 items", () => {
    const { errors } = validateMaterial({ title: "", level: "easy", instructions: "", items: [] });
    expect(errors.title).toBe("Enter a title.");
    expect(errors.level).toBe("Choose a level.");
    expect(errors.items).toMatch(/at least one/);
    const tooMany = validateMaterial({ ...base, items: Array.from({ length: MATERIAL_LIMITS.itemsMax + 1 }, () => "cat") });
    expect(tooMany.errors.items).toMatch(/at most 20/);
  });
  it("rejects empty items", () => {
    const { errors } = validateMaterial(cleanMaterial({ ...base, items: ["cat", "   ", "dog"] }));
    expect(errors.itemErrors?.[1]).toBe("An item can't be empty.");
  });
  it("cleanMaterial trims and collapses spaces", () => {
    expect(cleanMaterial({ title: "  Big   cats ", level: " basic ", items: ["  red   ball "] })).toEqual({
      title: "Big cats",
      level: "basic",
      instructions: "",
      items: ["red ball"],
    });
  });
});

describe("todayInPakistan", () => {
  it("uses Pakistan time (UTC+5)", () => {
    expect(todayInPakistan(new Date("2026-11-23T19:30:00Z"))).toBe("2026-11-24");
  });
});
