import "server-only";
import { azureEngine } from "./azure";
import { pythonEngine } from "./python";
import type { SpeechEngine } from "./types";

/**
 * The scorer: the Pronnova Speech Engine (engine/, ADR-010). SPEECH_ENGINE=azure switches to the
 * Azure adapter (stub, ADR-001 parallel track). There is no mock in the app any more: if the engine
 * is down, attempts are kept as "failed" and Retry re-scores the same audio. The old mock lives in
 * tests/doubles/mock-engine.ts as a test double.
 */
export function getSpeechEngine(): SpeechEngine {
  return process.env.SPEECH_ENGINE === "azure" ? azureEngine : pythonEngine;
}

export * from "./types";
