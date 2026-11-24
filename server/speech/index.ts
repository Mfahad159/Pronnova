import "server-only";
import { azureEngine } from "./azure";
import { mockEngine } from "./mock";
import { pythonEngine } from "./python";
import type { SpeechEngine } from "./types";

/** Picks the scorer from SPEECH_ENGINE (mock | azure | python). Defaults to mock. */
export function getSpeechEngine(): SpeechEngine {
  switch (process.env.SPEECH_ENGINE) {
    case "azure":
      return azureEngine;
    case "python":
      return pythonEngine;
    default:
      return mockEngine;
  }
}

export * from "./types";
