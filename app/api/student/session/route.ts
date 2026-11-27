import { cookies } from "next/headers";
import { STUDENT_COOKIE } from "@/server/db/demo-user";
import { isUuid } from "@/server/db/queries/curriculum";
import { getStudent } from "@/server/db/queries/roster";
import { errorResponse, fail, json } from "@/server/http";

// "Who are you?" — remembers which student is practising on this device. NOT authentication
// (FYP-1 has no login, ADR-002): just a plain cookie that every student endpoint reads through
// getCurrentStudent() in server/db/demo-user.ts.

const YEAR = 60 * 60 * 24 * 365;

/**
 * POST /api/student/session { studentId } (JSON, or an HTML form field) → { student } and sets the
 * cookie. From a plain HTML form it redirects (303) to /student. 404 if missing or archived.
 */
export async function POST(request: Request) {
  const isForm = (request.headers.get("content-type") ?? "").includes("form");
  let studentId = "";
  try {
    studentId = isForm
      ? String((await request.formData()).get("studentId") ?? "")
      : String(((await request.json()) as { studentId?: unknown })?.studentId ?? "");
  } catch {
    studentId = "";
  }
  if (!isUuid(studentId)) return fail(404, "Student not found.");
  try {
    const student = await getStudent(studentId);
    if (!student || student.archivedAt) return fail(404, "Student not found.");
    (await cookies()).set(STUDENT_COOKIE, student.id, { path: "/", sameSite: "lax", maxAge: YEAR, httpOnly: true });
    if (isForm) return Response.redirect(new URL("/student", request.url), 303);
    return json({ student });
  } catch (err) {
    return errorResponse(err);
  }
}

/** DELETE /api/student/session → 204, forgets the picked student. */
export async function DELETE() {
  (await cookies()).delete(STUDENT_COOKIE);
  return new Response(null, { status: 204 });
}
