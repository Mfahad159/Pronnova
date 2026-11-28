// The one contract every scorer returns (docs/architecture.md → Speech Engine contract, ADR-010).
// Pages and API routes depend on this, never on a specific engine.
import "server-only";
import type { PhonemeResult, WordResult } from "@/types";

export interface ScoreRequest {
  audio: Blob;
  referenceText: string;
  referencePhonemes?: string;
}

export type AudioQualityReason = "too_quiet" | "too_short" | "no_speech";

export interface ScoreResult {
  /** false = the audio was unclear: no score, the student records again (ADR-010). */
  audioQuality: { ok: true } | { ok: false; reason: AudioQualityReason };
  recognizedText: string;
  /** 0–100. The app derives Excellent/Good/Average from this (lib/scoring.ts). */
  score: number;
  words: WordResult[];
  phonemes: PhonemeResult[];
  trickySounds: { phoneme: string; count: number }[];
  modelVersion: string;
  raw?: unknown;
}

export interface SpeechEngine {
  name: "mock" | "azure" | "python"; // "mock" = test double only
  score(req: ScoreRequest): Promise<ScoreResult>;
}

export class SpeechEngineError extends Error {
  constructor(
    message: string,
    /** true when retrying later may work (network, rate limit). */
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "SpeechEngineError";
  }
}
