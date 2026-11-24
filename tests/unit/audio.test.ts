import { describe, expect, it } from "vitest";
import { audioExtension, baseMime, recordingProblem, wordUnit } from "@/lib/audio";

describe("recording rules", () => {
  const ok = { bytes: 20_000, durationMs: 2_000, mime: "audio/webm;codecs=opus" };
  it("accepts a normal recording", () => expect(recordingProblem(ok)).toBeNull());
  it("rejects too short, too long, too big and unknown formats", () => {
    expect(recordingProblem({ ...ok, durationMs: 300 })).toMatch(/too short/);
    expect(recordingProblem({ ...ok, bytes: 500 })).toMatch(/too short/);
    expect(recordingProblem({ ...ok, durationMs: 17_000 })).toMatch(/too long/);
    expect(recordingProblem({ ...ok, bytes: 2_000_000 })).toMatch(/too large/);
    expect(recordingProblem({ ...ok, mime: "video/mp4" })).toMatch(/format/);
  });
  it("maps types to file extensions (Safari records mp4)", () => {
    expect(baseMime("audio/webm;codecs=opus")).toBe("audio/webm");
    expect(audioExtension("audio/mp4")).toBe("m4a");
  });
});

describe("wordUnit (error stats key)", () => {
  it.each([
    ["Brother's,", "brother's"],
    ["Weather.", "weather"],
    ["THREE", "three"],
  ])("%s → %s", (w, u) => expect(wordUnit(w)).toBe(u));
});
