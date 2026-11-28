import { describe, expect, it } from "vitest";
import { mapEngineScore, wordStatus } from "@/server/speech/python";
import { ttsKey } from "@/server/speech/tts";

const base = { tricky_sounds: [], engine_version: "pronnova-engine-0.1.0" };

describe("Pronnova engine → app result (ADR-010)", () => {
  it("unclear audio → no score, the reason is kept", () => {
    const r = mapEngineScore({ ...base, overall: null, class: null, words: [], audio_quality: { ok: false, reason: "too_quiet" } });
    expect(r.audioQuality).toEqual({ ok: false, reason: "too_quiet" });
    expect(r.words).toEqual([]);
  });

  it("word colour: all ok → green, near or extra sound only → amber, any sub/del → red", () => {
    expect(wordStatus([{ expected: "k", heard: "k", status: "ok" }])).toBe("ok");
    expect(wordStatus([{ expected: "θ", heard: "t", status: "near" }, { expected: "ɪ", heard: "ɪ", status: "ok" }])).toBe("near");
    expect(wordStatus([{ expected: "æ", heard: "ʌ", status: "sub" }])).toBe("bad");
    expect(wordStatus([{ expected: null, heard: "ə", status: "ins" }, { expected: "s", heard: "s", status: "ok" }])).toBe("near");
    expect(wordStatus([{ expected: "k", heard: null, status: "del" }])).toBe("bad");
  });

  it("maps words and phonemes with statuses and positions; insertions are not stored as phonemes", () => {
    const r = mapEngineScore({
      ...base,
      overall: 87.5,
      class: "Excellent",
      audio_quality: { ok: true },
      heard_phonemes: "t ɪ ŋ k",
      tricky_sounds: [{ phoneme: "θ", count: 1 }],
      words: [
        {
          text: "think",
          score: 87.5,
          phonemes: [
            { expected: "θ", heard: "t", status: "near" },
            { expected: null, heard: "ə", status: "ins" },
            { expected: "ɪ", heard: "ɪ", status: "ok" },
            { expected: "ŋ", heard: "ŋ", status: "ok" },
            { expected: "k", heard: null, status: "del" },
          ],
        },
      ],
    });
    expect(r.audioQuality.ok).toBe(true);
    expect(r.score).toBe(87.5);
    expect(r.words).toEqual([{ word: "think", score: 87.5, status: "bad", isError: true }]);
    expect(r.phonemes.map((p) => [p.expected, p.detected, p.status, p.gopScore, p.isError, p.position])).toEqual([
      ["θ", "t", "near", 50, true, 0],
      ["ɪ", "ɪ", "ok", 100, false, 1],
      ["ŋ", "ŋ", "ok", 100, false, 2],
      ["k", "", "del", 0, true, 3],
    ]);
    expect(r.trickySounds).toEqual([{ phoneme: "θ", count: 1 }]);
  });

  it("a near-only word with a good score is amber but not an error", () => {
    const r = mapEngineScore({
      ...base,
      overall: 87.5,
      class: "Excellent",
      audio_quality: { ok: true },
      words: [{ text: "think", score: 87.5, phonemes: [{ expected: "θ", heard: "t", status: "near" }, { expected: "ɪ", heard: "ɪ", status: "ok" }] }],
    });
    expect(r.words[0]).toMatchObject({ status: "near", isError: false });
  });
});

describe("TTS cache key", () => {
  it("same text/voice/speed → same key; any change → a different key", () => {
    const a = ttsKey("cat", "normal", "af_heart");
    expect(ttsKey("  cat ", "normal", "af_heart")).toBe(a);
    expect(ttsKey("cat", "slow", "af_heart")).not.toBe(a);
    expect(ttsKey("cat", "normal", "bf_emma")).not.toBe(a);
    expect(a).toMatch(/^af_heart\/[0-9a-f]{32}\.mp3$/);
  });
});
