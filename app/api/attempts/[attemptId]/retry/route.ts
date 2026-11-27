import { findCurrentStudent } from "@/server/db/demo-user";
import { getItem, isUuid } from "@/server/db/queries/curriculum";
import { getAttempt } from "@/server/db/queries/attempt-store";
import { retryAttempt } from "@/server/services/attempts";

/** POST /api/attempts/[attemptId]/retry — re-score a failed attempt from its saved audio (SRS 3.3.7). */
export async function POST(_request: Request, ctx: RouteContext<"/api/attempts/[attemptId]/retry">) {
  const { attemptId } = await ctx.params;
  if (!isUuid(attemptId)) return Response.json({ error: "Unknown attempt." }, { status: 404 });

  const student = await findCurrentStudent(); // archived students get nothing
  if (!student) return Response.json({ error: "Pick your name again." }, { status: 404 });
  const attempt = await getAttempt(attemptId);
  if (!attempt || attempt.studentId !== student.id) return Response.json({ error: "Unknown attempt." }, { status: 404 });
  const item = await getItem(attempt.itemId);
  if (!item) return Response.json({ error: "This exercise no longer exists." }, { status: 410 });

  const result = await retryAttempt(student.id, attemptId, item.text);
  if (!result) return Response.json({ error: "Unknown attempt." }, { status: 404 });
  return Response.json(result, { status: result.status === "scored" ? 200 : 202 });
}
