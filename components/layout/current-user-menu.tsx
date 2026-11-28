import { NavUser } from "@/components/layout/nav-user";
import { DbError, DbNotConfiguredError } from "@/server/db/client";
import { findCurrentStudent, getCurrentTeacher } from "@/server/db/demo-user";
import { getStudent } from "@/server/db/queries/roster";
import type { Role } from "@/types";

/** Name + subtitle for the footer card, or null when the database can't be reached. */
async function loadUser(role: Role): Promise<{ name: string | null; subtitle: string } | null> {
  try {
    if (role === "teacher") {
      const teacher = await getCurrentTeacher();
      return { name: teacher.name, subtitle: "Teacher · Demo" };
    }
    const current = await findCurrentStudent();
    const student = current ? await getStudent(current.id) : null;
    return student ? { name: student.fullName, subtitle: student.className } : { name: null, subtitle: "Pick your class and name" };
  } catch (err) {
    // Only database failures are swallowed. Anything else (incl. Next's "request-time data" signal
    // during prerendering) must propagate, or the menu would be baked in as empty.
    if (!(err instanceof DbError || err instanceof DbNotConfiguredError)) throw err;
    console.error("profile menu unavailable", err.message);
    return null;
  }
}

/**
 * Server part of the sidebar footer card. It lives in the LAYOUT (above the page's error.tsx), so it
 * must never throw: if the database is down it shows a plain card (Switch role still works) and the
 * page's own error screen explains (Phase 5 QA).
 */
export async function CurrentUserMenu({ role }: { role: Role }) {
  const user = await loadUser(role);
  return <NavUser role={role} name={user?.name ?? null} subtitle={user?.subtitle ?? `${role === "student" ? "Student" : "Teacher"} · Demo`} />;
}

/** Shown while the user loads (Suspense fallback): same card, no name yet. */
export function UserMenuFallback({ role }: { role: Role }) {
  return <NavUser role={role} name={null} subtitle={`${role === "student" ? "Student" : "Teacher"} · Demo`} />;
}
