import { getCurrentStudent } from "@/server/db/demo-user";
import { getItem } from "@/server/db/queries/curriculum";
import { getItemAccess } from "@/server/db/queries/learning";
import { classify } from "@/lib/scoring";
import { getSpeechEngine, SpeechEngineError } from "@/server/speech";

const MAX_AUDIO_BYTES = 4 * 1024 * 1024; // Vercel Hobby request body limit is 4.5 MB

/**
 * POST /api/attempts — form data: `audio` (file), `itemId`.
 * Scaffold version: scores and returns. Phase 3 adds: save audio to Supabase Storage and an
 * `attempts` row with status "pending" BEFORE scoring, so a failed score is never lost (SRS 3.3.7).
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const audio = form.get("audio");
  const itemId = form.get("itemId");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "Recording is missing or empty. Please record again." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "Recording is too long. Keep it under 15 seconds." }, { status: 413 });
  }
  const item = typeof itemId === "string" ? await getItem(itemId) : null;
  if (!item) {
    return Response.json({ error: "Unknown exercise." }, { status: 404 });
  }
  // Same rule as the practice page (ADR-004): no attempts on locked or unassigned items.
  const student = await getCurrentStudent();
  const access = await getItemAccess(student.id, item.id);
  if (access === "hidden") return Response.json({ error: "Unknown exercise." }, { status: 404 });
  if (access === "locked") {
    return Response.json({ error: "This level is locked. Finish the earlier level first." }, { status: 403 });
  }

  const engine = getSpeechEngine();
  try {
    const result = await engine.score({ audio, referenceText: item.text });
    return Response.json({
      itemId: item.id,
      engine: engine.name,
      ...result,
      classification: classify(result.score),
    });
  } catch (err) {
    if (err instanceof SpeechEngineError) {
      return Response.json({ error: err.message, retryable: err.retryable }, { status: 503 });
    }
    console.error("attempt scoring failed", err);
    return Response.json({ error: "Scoring failed. Your attempt can be retried.", retryable: true }, { status: 500 });
  }
}
