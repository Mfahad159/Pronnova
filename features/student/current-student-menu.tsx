import { DbError, DbNotConfiguredError } from "@/server/db/client";
import { findCurrentStudent } from "@/server/db/demo-user";
import { getStudent } from "@/server/db/queries/roster";
import { StudentMenu } from "./student-menu";

/** The picked student, or null when nobody is picked OR the database can't be reached. */
async function loadMenuStudent() {
  try {
    const current = await findCurrentStudent();
    return current ? await getStudent(current.id) : null;
  } catch (err) {
    // Only database failures are swallowed. Anything else (incl. Next's "request-time data" signal
    // during prerendering) must propagate, or the menu would be baked in as empty.
    if (!(err instanceof DbError || err instanceof DbNotConfiguredError)) throw err;
    console.error("profile menu unavailable", err.message);
    return null;
  }
}

/**
 * Server part of the profile menu. It lives in the LAYOUT (above the page's error.tsx), so it must
 * never throw: if the database is down it renders nothing and the page's own friendly error screen
 * explains (found in Phase 5 QA).
 */
export async function CurrentStudentMenu() {
  const student = await loadMenuStudent();
  return student ? <StudentMenu name={student.fullName} className={student.className} /> : null;
}
