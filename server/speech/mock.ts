import "server-only";
import type { ScoreRequest, ScoreResult, SpeechEngine } from "./types";

/** Fake scores so the UI works with no keys. Same text → same scores. */
export const mockEngine: SpeechEngine = {
  name: "mock",
  async score({ referenceText }: ScoreRequest): Promise<ScoreResult> {
    await new Promise((r) => setTimeout(r, 400));
    const words = referenceText
      .split(/\s+/)
      .filter(Boolean)
      .map((raw) => {
        const word = raw.replace(/[^\p{L}'-]/gu, "");
        let h = 7;
        for (const ch of word.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 997;
        const score = 55 + (h % 45);
        return { word, score, isError: score < 70 };
      });
    const score = words.length ? Math.round(words.reduce((s, w) => s + w.score, 0) / words.length) : 0;
    return {
      recognizedText: referenceText.toLowerCase(),
      score,
      words,
      phonemes: [],
      modelVersion: "mock-1",
    };
  },
};
