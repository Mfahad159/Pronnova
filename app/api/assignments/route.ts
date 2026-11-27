import { cleanAssignment, validateAssignment, type AssignmentInput } from "@/lib/assignments";
import { hasErrors, todayInPakistan } from "@/lib/materials";
import { isUuid } from "@/server/db/queries/curriculum";
import { createAssignment } from "@/server/db/queries/assignments";
import { errorResponse, fail, json, readJson } from "@/server/http";

/**
 * POST /api/assignments { materialId, dueDate: "yyyy-mm-dd", classIds?: string[], studentIds?: string[] }
 * → 201 { id } · 422 { error, fieldErrors } (no targets, past date, duplicates, archived/unknown
 * student, unknown class) · 404 material. Assignment + targets are saved in one transaction.
 * UC-08 assign only: no reassign/unassign in FYP-1. The same material can be assigned many times.
 */
export async function POST(request: Request) {
  const a = cleanAssignment(await readJson<Partial<AssignmentInput>>(request));
  const fieldErrors = validateAssignment(a, todayInPakistan());
  if (a.materialId && !isUuid(a.materialId)) return fail(404, "Material not found.");
  if ([...a.classIds, ...a.studentIds].some((id) => !isUuid(id))) fieldErrors.targets = "A chosen class or student doesn't exist.";
  if (hasErrors(fieldErrors)) return fail(422, "Please fix the highlighted fields.", { fieldErrors });
  try {
    return json({ id: await createAssignment(a) }, 201);
  } catch (err) {
    return errorResponse(err, { unique: "Each class or student can only be picked once." });
  }
}
