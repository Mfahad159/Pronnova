import { attemptRepository } from "@/server/database/repositories/attemptRepository";
import type { AssessmentResult } from "@/types/voice";

const MOCK_WORD_BANKS: Record<
  string,
  { word: string; status: "correct" | "review" | "missed"; phonemeHint?: string }[]
> = {
  default: [
    { word: "The", status: "correct" },
    { word: "cat", status: "correct" },
    { word: "sat", status: "review", phonemeHint: "Try /æ/ as in 'hat'" },
    { word: "on", status: "correct" },
    { word: "the", status: "correct" },
    { word: "mat", status: "correct" },
  ],
};

export class AssessmentService {
  /**
   * Evaluates student audio. In FYP-1, deterministic scoring is provided
   * while maintaining the exact contract expected by the Python Speech Engine.
   */
  async evaluateAttempt(
    exerciseId: string,
    durationMs: number,
    audioBlob?: Blob
  ): Promise<AssessmentResult> {
    // In future phases with Python Speech Engine, audioBlob is streamed to engine
    void audioBlob;
    // Simulate speech engine alignment latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    const wordBank = MOCK_WORD_BANKS[exerciseId] ?? MOCK_WORD_BANKS.default;
    const words = wordBank.map((w) => ({
      ...w,
      score:
        w.status === "correct"
          ? 90 + Math.floor(Math.random() * 10)
          : w.status === "review"
            ? 60 + Math.floor(Math.random() * 20)
            : 30 + Math.floor(Math.random() * 20),
    }));

    const overallScore = Math.round(
      words.reduce((sum, w) => sum + w.score, 0) / words.length
    );

    const result: AssessmentResult = {
      attemptId: `attempt-${Date.now()}`,
      overallScore,
      words,
      durationMs,
    };

    // Log attempt via repository
    await attemptRepository.saveAttempt({
      exerciseId,
      overallScore,
      durationMs,
      result,
    });

    return result;
  }

  async retryEvaluation(attemptId: string): Promise<{ status: string; attemptId: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      status: "queued",
      attemptId,
    };
  }
}

export const assessmentService = new AssessmentService();
