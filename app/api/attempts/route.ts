import { RECORDING, recordingProblem } from "@/lib/audio";
import { findCurrentStudent } from "@/server/db/demo-user";
import { getItem, isUuid } from "@/server/db/queries/curriculum";
import { getItemAccess } from "@/server/db/queries/learning";
import { submitAttempt } from "@/server/services/attempts";

/**
 * POST /api/attempts — UC-04/05. Multipart form:
 *   attemptId (uuid made by the browser — makes double submits safe), itemId, durationMs, audio (file).
 * Responses: 200 scored · 202 saved but scoring failed (retry later) · 4xx bad input · 503 not saved.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const attemptId = String(form.get("attemptId") ?? "");
  const itemId = String(form.get("itemId") ?? "");
  const durationMs = Number(form.get("durationMs"));
  const audio = form.get("audio");

  if (!isUuid(attemptId)) return Response.json({ error: "Missing attempt id." }, { status: 400 });
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "Recording is missing or empty. Please record again." }, { status: 400 });
  }
  if (audio.size > RECORDING.maxBytes) {
    return Response.json({ error: "The recording is too large. Keep it under 15 seconds." }, { status: 413 });
  }
  const problem = recordingProblem({ bytes: audio.size, durationMs: Number.isFinite(durationMs) ? durationMs : 0, mime: audio.type });
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const item = isUuid(itemId) ? await getItem(itemId) : null;
  if (!item) return Response.json({ error: "Unknown exercise." }, { status: 404 });

  // Same rule as the practice page (ADR-004): no attempts on locked or unassigned items.
  // Archived (or no longer existing) students can't attempt anything: send them back to the picker.
  const student = await findCurrentStudent();
  if (!student) return Response.json({ error: "Pick your name again." }, { status: 404 });
  const access = await getItemAccess(student, item.id);
  if (access === "hidden") return Response.json({ error: "Unknown exercise." }, { status: 404 });
  if (access === "locked") {
    return Response.json({ error: "This level is locked. Finish the earlier level first." }, { status: 403 });
  }

  try {
    const outcome = await submitAttempt({
      attemptId,
      studentId: student.id,
      itemId: item.id,
      referenceText: item.text,
      audio,
      mime: audio.type,
      durationMs,
    });
    if (outcome.kind === "conflict") return Response.json({ error: "Attempt id already used." }, { status: 409 });
    const r = outcome.result;
    return Response.json(r, { status: r.status === "scored" ? 200 : 202 });
  } catch (err) {
    // Upload or the first insert failed: nothing was stored, so the browser keeps the audio and can resend.
    console.error("attempt not saved", err);
    return Response.json({ error: "We couldn't save your recording. Check your connection and try again.", saved: false }, { status: 503 });
  }
}
