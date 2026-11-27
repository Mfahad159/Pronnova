import { cleanStudent, validateStudent, type StudentInput } from "@/lib/roster";
import { isUuid } from "@/server/db/queries/curriculum";
import { createStudent, listStudents } from "@/server/db/queries/roster";
import { errorResponse, fail, json, readJson } from "@/server/http";

const ROLL_TAKEN = "That roll number is already used in this class.";
const NO_CLASS = "That class doesn't exist.";

/**
 * GET /api/students?classId=…&includeArchived=true → { students: [{ id, fullName, rollNo, classId,
 * className, archivedAt, createdAt }] }. Archived students are left out unless asked for.
 * (The "Who are you?" picker calls it with a classId.)
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const classId = params.get("classId") ?? undefined;
  if (classId !== undefined && !isUuid(classId)) return fail(404, "Class not found.");
  try {
    return json({ students: await listStudents({ classId, includeArchived: params.get("includeArchived") === "true" }) });
  } catch (err) {
    return errorResponse(err);
  }
}

/** POST /api/students { fullName, rollNo, classId } → 201 { student } · 422 { error, fieldErrors } · 409 roll taken. */
export async function POST(request: Request) {
  const s = cleanStudent(await readJson<Partial<StudentInput>>(request));
  const fieldErrors = validateStudent(s);
  if (s.classId && !isUuid(s.classId)) fieldErrors.classId = NO_CLASS;
  if (Object.keys(fieldErrors).length) return fail(422, "Please fix the highlighted fields.", { fieldErrors });
  try {
    return json({ student: await createStudent(s) }, 201);
  } catch (err) {
    return errorResponse(err, { unique: ROLL_TAKEN, foreignKey: NO_CLASS });
  }
}
