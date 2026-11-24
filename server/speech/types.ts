// The one contract every scorer returns (docs/architecture.md → Speech Engine contract).
// Pages and API routes depend on this, never on a specific engine.
import "server-only";
import type { PhonemeResult, WordResult } from "@/types";

export interface ScoreRequest {
  audio: Blob;
  referenceText: string;
  referencePhonemes?: string;
}

export interface ScoreResult {
  recognizedText: string;
  /** 0–100. The app derives Excellent/Good/Average from this (lib/scoring.ts). */
  score: number;
  words: WordResult[];
  phonemes: PhonemeResult[];
  modelVersion: string;
  raw?: unknown;
}

export interface SpeechEngine {
  name: "mock" | "azure" | "python";
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
