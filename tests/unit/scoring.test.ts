import { describe, expect, it } from "vitest";
import { classify, errorRate } from "@/lib/scoring";

describe("classify (SRS 3.2.5)", () => {
  it.each([
    [100, "excellent"],
    [85, "excellent"],
    [84.9, "good"],
    [84, "good"],
    [70, "good"],
    [69.9, "average"],
    [69, "average"],
    [0, "average"],
  ])("%s → %s", (score, expected) => {
    expect(classify(score)).toBe(expected);
  });
});

describe("errorRate (SRS 3.2.6)", () => {
  it("is errors ÷ attempts as a percentage, one decimal", () => {
    expect(errorRate(1, 3)).toBe(33.3);
    expect(errorRate(2, 2)).toBe(100);
  });
  it("is 0 when there are no attempts", () => {
    expect(errorRate(0, 0)).toBe(0);
  });
});
