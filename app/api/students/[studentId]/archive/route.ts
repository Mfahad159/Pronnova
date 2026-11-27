import { isUuid } from "@/server/db/queries/curriculum";
import { setStudentArchived } from "@/server/db/queries/roster";
import { errorResponse, fail, json } from "@/server/http";

/** POST /api/students/[studentId]/archive → { student } (archivedAt set) · 404. Students are never hard-deleted. */
export async function POST(_request: Request, ctx: RouteContext<"/api/students/[studentId]/archive">) {
  const { studentId } = await ctx.params;
  if (!isUuid(studentId)) return fail(404, "Student not found.");
  try {
    const student = await setStudentArchived(studentId, true);
    return student ? json({ student }) : fail(404, "Student not found.");
  } catch (err) {
    return errorResponse(err);
  }
}
