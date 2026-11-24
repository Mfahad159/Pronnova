import "server-only";
import { SpeechEngineError, type SpeechEngine } from "./types";

/**
 * Azure Pronunciation Assessment adapter — app track (docs/decisions/001-stack.md).
 * TODO Phase 4: call Azure with AZURE_SPEECH_KEY / AZURE_SPEECH_REGION and map its
 * word + phoneme accuracy to ScoreResult. Free tier (F0) allows 1 request at a time.
 */
export const azureEngine: SpeechEngine = {
  name: "azure",
  async score() {
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
      throw new SpeechEngineError("Azure Speech is not configured (AZURE_SPEECH_KEY, AZURE_SPEECH_REGION).", false);
    }
    throw new SpeechEngineError("Azure adapter not implemented yet (Phase 4).", false);
  },
};
