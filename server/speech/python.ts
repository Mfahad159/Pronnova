import "server-only";
import { GOOD_MIN } from "@/lib/scoring";
import { SpeechEngineError, type AudioQualityReason, type ScoreRequest, type ScoreResult, type SpeechEngine } from "./types";
import type { PhonemeStatus, WordStatus } from "@/types";

/** Where the Pronnova engine (engine/) listens. Only this server talks to it, never the browser. */
export function engineUrl(): string | null {
  // `||`, not `??`: an empty ENGINE_URL= / SPEECH_ENGINE_URL= line in .env.local means "not set".
  return process.env.ENGINE_URL || process.env.SPEECH_ENGINE_URL || "http://localhost:8001";
}

/** SRS 3.3.3: feedback within 10 s. */
export function engineTimeoutMs(): number {
  const n = Number(process.env.ENGINE_TIMEOUT_MS);
  return Number.isFinite(n) && n > 0 ? n : 10_000;
}

interface EnginePhoneme {
  expected: string | null;
  heard: string | null;
  status: "ok" | "near" | "sub" | "del" | "ins";
}
interface EngineWord {
  text: string;
  score: number;
  phonemes: EnginePhoneme[];
}
interface EngineScore {
  overall: number | null;
  class: string | null;
  words: EngineWord[];
  tricky_sounds: { phoneme: string; count: number }[];
  audio_quality: { ok: boolean; reason?: AudioQualityReason };
  heard_phonemes?: string;
  engine_version: string;
  timings?: Record<string, number>;
}

/** Credit per status, stored as gop_score (0–100) so old reports keep working. */
const CREDIT: Record<PhonemeStatus, number> = { ok: 100, near: 50, sub: 0, del: 0 };

/** green if every sound is ok, amber if the worst is "near", red otherwise (sub / del / ins). */
export function wordStatus(phonemes: EnginePhoneme[]): WordStatus {
  if (phonemes.some((p) => p.status === "sub" || p.status === "del" || p.status === "ins")) return "bad";
  if (phonemes.some((p) => p.status === "near")) return "near";
  return "ok";
}

/** Engine JSON → the app's ScoreResult (pure: unit-tested). */
export function mapEngineScore(d: EngineScore): ScoreResult {
  if (!d.audio_quality?.ok) {
    return {
      audioQuality: { ok: false, reason: d.audio_quality?.reason ?? "no_speech" },
      recognizedText: "",
      score: 0,
      words: [],
      phonemes: [],
      trickySounds: [],
      modelVersion: d.engine_version,
      raw: d,
    };
  }
  const words = d.words.map((w) => {
    const status = wordStatus(w.phonemes);
    return { word: w.text, score: w.score, status, isError: status === "bad" || w.score < GOOD_MIN };
  });
  const phonemes = d.words.flatMap((w, wi) =>
    w.phonemes
      .filter((p): p is EnginePhoneme & { expected: string; status: PhonemeStatus } => p.expected !== null && p.status !== "ins")
      .map((p, pi) => ({
        word: w.text,
        phoneme: p.expected,
        expected: p.expected,
        detected: p.heard ?? "",
        gopScore: CREDIT[p.status],
        isError: p.status !== "ok",
        status: p.status,
        wordPosition: wi,
        position: pi,
      })),
  );
  return {
    audioQuality: { ok: true },
    recognizedText: d.heard_phonemes ?? "",
    score: d.overall ?? 0,
    words,
    phonemes,
    trickySounds: d.tricky_sounds ?? [],
    modelVersion: d.engine_version,
    raw: { words: d.words, tricky_sounds: d.tricky_sounds, timings: d.timings, heard_phonemes: d.heard_phonemes },
  };
}

/** The Pronnova Speech Engine (engine/, ADR-010): wav2vec2 phonemes vs espeak, aligned and scored. */
export const pythonEngine: SpeechEngine = {
  name: "python",
  async score({ audio, referenceText }: ScoreRequest): Promise<ScoreResult> {
    const base = engineUrl();
    if (!base) throw new SpeechEngineError("ENGINE_URL is not set.", false);

    const body = new FormData();
    body.append("audio", audio, `attempt.${audio.type.includes("mp4") ? "m4a" : audio.type.includes("wav") ? "wav" : "webm"}`);
    body.append("reference_text", referenceText);

    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(new URL("/score", base), { method: "POST", body, signal: AbortSignal.timeout(engineTimeoutMs()) });
    } catch (err) {
      console.warn(`[engine] /score unreachable or too slow after ${Date.now() - started} ms`, (err as Error).name);
      throw new SpeechEngineError("Speech engine unreachable or too slow.", true);
    }
    if (!res.ok) {
      console.warn(`[engine] /score returned ${res.status} after ${Date.now() - started} ms`);
      throw new SpeechEngineError(`Speech engine returned ${res.status}.`, res.status >= 500);
    }
    const d = (await res.json()) as EngineScore;
    const t = d.timings ?? {};
    console.info(
      `[engine] /score ${Date.now() - started} ms round trip (engine ${Math.round(t.total_ms ?? 0)} ms: asr ${Math.round(t.asr_ms ?? 0)}, decode ${Math.round(t.decode_ms ?? 0)}) → ${d.audio_quality?.ok ? `${d.overall} ${d.class}` : `rejected: ${d.audio_quality?.reason}`}`,
    );
    return mapEngineScore(d);
  },
};
