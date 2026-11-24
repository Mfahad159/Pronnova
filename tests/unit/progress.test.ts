import { describe, expect, it } from "vitest";
import { chapterView, continueItem, itemAccess, learningView, type PChapter } from "@/lib/progress";

const ch: PChapter = {
  id: "c1",
  title: "Tricky Sounds",
  orderNo: 1,
  lessons: [
    { id: "lb", level: "basic", orderNo: 1, title: "B", visibility: "public", items: [{ id: "b1", text: "van", itemType: "word" }, { id: "b2", text: "wet", itemType: "word" }] },
    { id: "lm", level: "medium", orderNo: 1, title: "M", visibility: "public", items: [{ id: "m1", text: "a fresh fruit", itemType: "phrase" }] },
    { id: "la", level: "advanced", orderNo: 1, title: "A", visibility: "public", items: [{ id: "a1", text: "Three thin thieves.", itemType: "sentence" }] },
    { id: "hw", level: "advanced", orderNo: 2, title: "HW", visibility: "assigned", items: [{ id: "h1", text: "thick", itemType: "word" }] },
    { id: "other", level: "basic", orderNo: 2, title: "Not mine", visibility: "assigned", items: [{ id: "x1", text: "secret", itemType: "word" }] },
  ],
};
const none = new Map<string, number>();

describe("level unlock rule (ADR-004)", () => {
  it("only Basic is open at the start", () => {
    const v = chapterView(ch, { best: none, assigned: new Map() });
    expect(v.levels.map((l) => l.unlocked)).toEqual([true, false, false]);
    expect(v.currentLevel).toBe("basic");
  });
  it("Medium opens when every Basic item has a best score ≥ 70; 69 is not enough", () => {
    const almost = chapterView(ch, { best: new Map([["b1", 90], ["b2", 69]]), assigned: new Map() });
    expect(almost.levels[1].unlocked).toBe(false);
    const done = chapterView(ch, { best: new Map([["b1", 90], ["b2", 70]]), assigned: new Map() });
    expect(done.levels.map((l) => l.unlocked)).toEqual([true, true, false]);
    expect(done.currentLevel).toBe("medium");
  });
  it("an empty level counts as done", () => {
    const noMedium = { ...ch, lessons: ch.lessons.filter((l) => l.level !== "medium") };
    const v = chapterView(noMedium, { best: new Map([["b1", 80], ["b2", 80]]), assigned: new Map() });
    expect(v.levels[2].unlocked).toBe(true);
  });
});

describe("visibility and access", () => {
  const assigned = new Map([["hw", { lessonId: "hw", deadline: null }]]);
  const view = learningView({ chapters: [ch], best: none, assigned });
  it("assigned homework is open even in a locked level", () => {
    expect(itemAccess(view, "h1")).toBe("open");
    expect(itemAccess(view, "a1")).toBe("locked");
  });
  it("teacher material not assigned to this student is hidden", () => {
    expect(itemAccess(view, "x1")).toBe("hidden");
    expect(view[0].levels[0].homework).toHaveLength(0);
  });
});

describe("continueItem (UC-03 alt 1A)", () => {
  const view = (best: Map<string, number>) => learningView({ chapters: [ch], best, assigned: new Map() });
  it("returns the last item when it isn't mastered", () => {
    expect(continueItem(view(new Map([["b2", 50]])), "b2")?.id).toBe("b2");
  });
  it("moves to the next un-mastered open item after a mastered one", () => {
    expect(continueItem(view(new Map([["b1", 95]])), "b1")?.id).toBe("b2");
  });
  it("starts at the first item with no history, and returns null when everything open is mastered", () => {
    expect(continueItem(view(none), null)?.id).toBe("b1");
    const all = new Map([["b1", 90], ["b2", 90], ["m1", 90], ["a1", 90]]);
    expect(continueItem(view(all), "a1")).toBeNull();
  });
});
