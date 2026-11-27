import { findCurrentStudent, getCurrentTeacher } from "@/server/db/demo-user";
import { isUuid } from "@/server/db/queries/curriculum";
import { getAttempt, signRecordingUrl } from "@/server/db/queries/attempt-store";
import { teacherHasStudent } from "@/server/db/queries/attempts";

const EXPIRES_IN = 300; // seconds

/**
 * GET /api/recordings/[attemptId]?as=student|teacher — short-lived signed link to play a saved
 * recording (UC-06 listen back, History and teacher tables). The bucket stays private; only the
 * student who made it, or a teacher of their class, gets a link. No login in FYP-1 (ADR-002), so
 * "who is asking" is the demo student or demo teacher.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/recordings/[attemptId]">) {
  const { attemptId } = await ctx.params;
  const notFound = Response.json({ error: "Recording not found." }, { status: 404 });
  if (!isUuid(attemptId)) return notFound;

  const as = new URL(request.url).searchParams.get("as") === "teacher" ? "teacher" : "student";
  const attempt = await getAttempt(attemptId);
  if (!attempt) return notFound;

  const allowed =
    as === "teacher"
      ? await teacherHasStudent((await getCurrentTeacher()).id, attempt.studentId)
      : attempt.studentId === (await findCurrentStudent())?.id; // archived → null → 404
  if (!allowed) return notFound; // don't reveal that someone else's attempt exists
  if (!attempt.audioPath) return Response.json({ error: "No recording was saved for this attempt." }, { status: 404 });

  try {
    const url = await signRecordingUrl(attempt.audioPath, EXPIRES_IN);
    return Response.json({ url, expiresIn: EXPIRES_IN }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Couldn't load the recording. Try again." }, { status: 503 });
  }
}
