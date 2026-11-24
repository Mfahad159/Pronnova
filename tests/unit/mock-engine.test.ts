import { describe, expect, it } from "vitest";
import { mockEngine } from "@/server/speech/mock";

describe("mock speech engine", () => {
  it("returns one word result per reference word, same input → same scores", async () => {
    const req = { audio: new Blob(["x"]), referenceText: "Three thin thieves." };
    const a = await mockEngine.score(req);
    const b = await mockEngine.score(req);
    expect(a.words.map((w) => w.word)).toEqual(["Three", "thin", "thieves"]);
    expect(a.words).toEqual(b.words);
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
  });
});
