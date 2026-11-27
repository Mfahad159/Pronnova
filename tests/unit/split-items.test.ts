import { describe, expect, it } from "vitest";
import { splitTextToItems } from "@/lib/split-items";

const texts = (raw: string, mode?: "sentence" | "line") => splitTextToItems(raw, mode).map((i) => i.text);

describe("splitTextToItems — sentence mode (default)", () => {
  it("splits on . ! ? and keeps abbreviations intact", () => {
    expect(texts("Mr. Khan has a cat. Dr. Ali is here! Is it Mrs. Shah? We need pens, e.g. red ones, i.e. new ones, etc. and Ms. Noor came.")).toEqual([
      "Mr. Khan has a cat.",
      "Dr. Ali is here!",
      "Is it Mrs. Shah?",
      "We need pens, e.g. red ones, i.e. new ones, etc. and Ms. Noor came.",
    ]);
  });
  it("strips bullets and numbering", () => {
    expect(texts("1. cat\n2) dog\na) red ball\nb. big hat\n• sun\n- moon\n* star\n(3) tree\n1. a) fish")).toEqual([
      "cat",
      "dog",
      "red ball",
      "big hat",
      "sun",
      "moon",
      "star",
      "tree",
      "fish",
    ]);
  });
  it("drops blank lines and normalises whitespace", () => {
    expect(texts("\n\n   cat   \r\n\r\n\t\n  red  \t ball  \n\n")).toEqual(["cat", "red ball"]);
  });
  it("a line break always ends an item (word lists stay one per item)", () => {
    expect(texts("cat\ndog\nI see a cow. It is big.")).toEqual(["cat", "dog", "I see a cow.", "It is big."]);
  });
  it("flags a 30-word sentence as too long, with its word count", () => {
    const long = `${Array.from({ length: 29 }, () => "word").join(" ")} end.`;
    const [item] = splitTextToItems(long);
    expect(item.words).toBe(30);
    expect(item.tooLong).toBe(true);
    expect(item.warnings[0]).toMatch(/30 words \(max 25\)/);
  });
  it("passes Urdu and other non-ASCII text through unchanged", () => {
    const urdu = "یہ ایک بلی ہے۔ وہ کتا ہے";
    expect(texts(urdu)).toEqual([urdu]);
    expect(texts("Café naïve résumé. Ünïcödé")).toEqual(["Café naïve résumé.", "Ünïcödé"]);
  });
  it("adds level-fit warnings when a level is given", () => {
    const [item] = splitTextToItems("The big red ball is under the table.", "sentence", "basic");
    expect(item.words).toBe(8);
    expect(item.tooLong).toBe(false);
    expect(item.warnings[0]).toMatch(/Long for Basic: 1–3 words suggested/);
  });
  it("returns nothing for empty input", () => {
    expect(splitTextToItems("   \n \n")).toEqual([]);
  });
});

describe("splitTextToItems — line mode", () => {
  it("keeps each line whole, even with several sentences", () => {
    expect(texts("I see a cow. It is big.\n- red ball", "line")).toEqual(["I see a cow. It is big.", "red ball"]);
  });
});
