import { cleanStudent, validateStudent, type StudentInput } from "@/lib/roster";
import { isUuid } from "@/server/db/queries/curriculum";
import { getStudent, updateStudent } from "@/server/db/queries/roster";
import { errorResponse, fail, json, readJson } from "@/server/http";

const NOT_FOUND = "Student not found.";

/**
 * GET /api/students/[studentId] → { student }. 404 if missing OR archived, so the student app can
 * send them back to the picker. Teachers pass ?includeArchived=true to see archived ones.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/students/[studentId]">) {
  const { studentId } = await ctx.params;
  if (!isUuid(studentId)) return fail(404, NOT_FOUND);
  const includeArchived = new URL(request.url).searchParams.get("includeArchived") === "true";
  try {
    const student = await getStudent(studentId);
    if (!student || (student.archivedAt && !includeArchived)) return fail(404, NOT_FOUND);
    return json({ student });
  } catch (err) {
    return errorResponse(err);
  }
}

/** PATCH /api/students/[studentId] { fullName?, rollNo?, classId? } → { student } · 404 · 422 · 409 roll taken. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/students/[studentId]">) {
  const { studentId } = await ctx.params;
  if (!isUuid(studentId)) return fail(404, NOT_FOUND);
  const body = await readJson<Partial<StudentInput>>(request);
  if (!body) return fail(422, "Send the fields to change as JSON.");
  const all = cleanStudent(body);
  // Only the fields that were sent are changed (and checked).
  const patch: Partial<StudentInput> = {};
  for (const k of ["fullName", "rollNo", "classId"] as const) if (body[k] !== undefined) patch[k] = all[k];
  if (Object.keys(patch).length === 0) return fail(422, "Nothing to change.");
  const fieldErrors = validateStudent(patch, true);
  if (patch.classId && !isUuid(patch.classId)) fieldErrors.classId = "That class doesn't exist.";
  if (Object.keys(fieldErrors).length) return fail(422, "Please fix the highlighted fields.", { fieldErrors });
  try {
    const student = await updateStudent(studentId, patch);
    return student ? json({ student }) : fail(404, NOT_FOUND);
  } catch (err) {
    return errorResponse(err, { unique: "That roll number is already used in this class.", foreignKey: "That class doesn't exist." });
  }
}
