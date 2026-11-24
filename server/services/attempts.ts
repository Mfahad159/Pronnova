import "server-only";
import { audioExtension, baseMime, wordUnit } from "@/lib/audio";
import { classify } from "@/lib/scoring";
import {
  completeAttempt,
  downloadRecording,
  getAttempt,
  getAttemptResult,
  insertPendingAttempt,
  markAttemptFailed,
  uploadRecording,
  type AttemptResult,
} from "@/server/db/queries/attempt-store";
import { getSpeechEngine, SpeechEngineError } from "@/server/speech";

/** Bump when our own scoring maths (not the engine) changes, so old and new scores aren't mixed up. */
export const SCORING_VERSION = "v1";

export type SubmitOutcome =
  | { kind: "result"; result: AttemptResult } // scored, or saved-but-failed (status tells which)
  | { kind: "conflict" }; // attempt id belongs to someone else

/**
 * UC-04 pipeline. Order matters (SRS 3.3.7 — never lose an attempt):
 *  1. upload audio  2. insert attempt as "pending"  3. score  4. save results atomically
 * If scoring fails after step 2, the attempt + audio stay and are marked "failed" for Retry.
 * The client sends its own attempt id, so a double submit returns the first result (idempotent).
 */
export async function submitAttempt(a: {
  attemptId: string;
  studentId: string;
  itemId: string;
  referenceText: string;
  audio: Blob;
  mime: string;
  durationMs: number;
}): Promise<SubmitOutcome> {
  const existing = await getAttempt(a.attemptId);
  if (existing) {
    if (existing.studentId !== a.studentId || existing.itemId !== a.itemId) return { kind: "conflict" };
    return { kind: "result", result: (await getAttemptResult(a.attemptId))! };
  }

  const path = `${a.studentId}/${a.attemptId}.${audioExtension(a.mime)}`;
  await uploadRecording(path, a.audio, baseMime(a.mime)); // throws → nothing saved, client may resend
  await insertPendingAttempt({ id: a.attemptId, studentId: a.studentId, itemId: a.itemId, audioPath: path, durationMs: a.durationMs });

  await scoreAndSave(a.attemptId, a.audio, a.referenceText);
  return { kind: "result", result: (await getAttemptResult(a.attemptId))! };
}

/** Re-score a failed (or stuck pending) attempt from its stored audio. */
export async function retryAttempt(studentId: string, attemptId: string, referenceText: string) {
  const attempt = await getAttempt(attemptId);
  if (!attempt || attempt.studentId !== studentId) return null;
  const stuck = attempt.status === "pending" && Date.now() - new Date(attempt.createdAt).getTime() > 60_000;
  if (attempt.status === "failed" || stuck) {
    if (!attempt.audioPath) {
      await markAttemptFailed(attemptId, "The recording is missing. Please record again.");
    } else {
      try {
        const audio = await downloadRecording(attempt.audioPath);
        await scoreAndSave(attemptId, audio, referenceText);
      } catch (err) {
        await markAttemptFailed(attemptId, friendly(err));
      }
    }
  }
  return getAttemptResult(attemptId);
}

async function scoreAndSave(attemptId: string, audio: Blob, referenceText: string) {
  const engine = getSpeechEngine();
  try {
    const r = await engine.score({ audio, referenceText });
    const score = Math.max(0, Math.min(100, Math.round(r.score * 100) / 100));
    await completeAttempt({
      attemptId,
      recognizedText: r.recognizedText,
      score,
      classification: classify(score),
      modelVersion: `${engine.name}:${r.modelVersion}`,
      scoringVersion: SCORING_VERSION,
      raw: r.raw ?? null,
      words: r.words.map((w, i) => ({ position: i, word: w.word, unit: wordUnit(w.word), score: w.score, is_error: w.isError })),
      phonemes: r.phonemes.map((p) => ({
        word: p.word,
        phoneme: p.phoneme,
        expected: p.expected,
        detected: p.detected,
        gop_score: p.gopScore,
        is_error: p.isError,
      })),
    });
  } catch (err) {
    console.error("scoring failed", attemptId, err);
    await markAttemptFailed(attemptId, friendly(err));
  }
}

function friendly(err: unknown): string {
  if (err instanceof SpeechEngineError) return err.retryable ? "The speech checker didn't answer in time." : "The speech checker isn't available right now.";
  return "Something went wrong while checking your speech.";
}
