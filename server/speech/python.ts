import "server-only";
import { SpeechEngineError, type ScoreRequest, type ScoreResult, type SpeechEngine } from "./types";

/** Our own Python engine (engine/) — research track. Expects POST {SPEECH_ENGINE_URL}/score. */
export const pythonEngine: SpeechEngine = {
  name: "python",
  async score({ audio, referenceText, referencePhonemes }: ScoreRequest): Promise<ScoreResult> {
    const base = process.env.SPEECH_ENGINE_URL;
    if (!base) throw new SpeechEngineError("SPEECH_ENGINE_URL is not set.", false);

    const body = new FormData();
    body.append("audio", audio, "attempt.webm");
    body.append("reference_text", referenceText);
    if (referencePhonemes) body.append("reference_phonemes", referencePhonemes);

    let res: Response;
    try {
      // SRS 3.3.3: feedback within 10 s. Leave headroom for upload and saving.
      res = await fetch(new URL("/score", base), { method: "POST", body, signal: AbortSignal.timeout(8000) });
    } catch {
      throw new SpeechEngineError("Speech engine unreachable or too slow.", true);
    }
    if (!res.ok) throw new SpeechEngineError(`Speech engine returned ${res.status}.`, res.status >= 500);

    const d = await res.json();
    return {
      recognizedText: d.recognized_text,
      score: d.score,
      words: (d.words ?? []).map((w: { word: string; score: number; is_error: boolean }) => ({
        word: w.word,
        score: w.score,
        isError: w.is_error,
      })),
      phonemes: (d.phonemes ?? []).map(
        (p: { word: string; phoneme: string; expected: string; detected: string; gop_score: number; is_error: boolean }) => ({
          word: p.word,
          phoneme: p.phoneme,
          expected: p.expected,
          detected: p.detected,
          gopScore: p.gop_score,
          isError: p.is_error,
        }),
      ),
      modelVersion: d.model_version,
      raw: d.raw,
    };
  },
};
