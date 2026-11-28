import { RECORDING, recordingProblem } from "@/lib/audio";
import { classify } from "@/lib/scoring";
import { getSpeechEngine, SpeechEngineError } from "@/server/speech";
import { QUALITY_MESSAGE } from "@/server/services/attempts";

/** The landing page demo word. Fixed on the server: the public demo can't score arbitrary text. */
const DEMO_WORD = "Apple";

/**
 * POST /api/demo/score — landing page demo (multipart: audio). Scores the recording with the real
 * Pronnova engine against "Apple" and returns the result. NOTHING is stored: no attempt row, no audio
 * upload, no error stats (the browser keeps its own last tries in localStorage).
 *   200 { status: "scored", score, classification, words, phonemes, trickySounds }
 *   200 { status: "rejected", error }   unclear audio (too quiet / short / silent): record again
 *   503 { status: "failed", error }     engine down or too slow: send the same recording again
 *   4xx { error }                       missing / too big / too short recording
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }
  const audio = form.get("audio");
  const durationMs = Number(form.get("durationMs"));
  if (!(audio instanceof Blob) || audio.size === 0) return Response.json({ error: "Recording is missing. Please record again." }, { status: 400 });
  if (audio.size > RECORDING.maxBytes) return Response.json({ error: "The recording is too large. Keep it under 15 seconds." }, { status: 413 });
  const problem = recordingProblem({ bytes: audio.size, durationMs: Number.isFinite(durationMs) ? durationMs : 0, mime: audio.type });
  if (problem) return Response.json({ error: problem }, { status: 400 });

  try {
    const r = await getSpeechEngine().score({ audio, referenceText: DEMO_WORD });
    if (!r.audioQuality.ok) return Response.json({ status: "rejected", error: QUALITY_MESSAGE[r.audioQuality.reason] });
    const score = Math.round(Math.max(0, Math.min(100, r.score)));
    return Response.json({
      status: "scored",
      word: DEMO_WORD,
      score,
      classification: classify(score),
      words: r.words,
      phonemes: r.phonemes,
      trickySounds: r.trickySounds,
    });
  } catch (err) {
    const message =
      err instanceof SpeechEngineError && err.retryable
        ? "The speech checker didn't answer in time. Try checking again."
        : "The speech checker isn't available right now. Try again in a moment.";
    return Response.json({ status: "failed", error: message }, { status: 503 });
  }
}
