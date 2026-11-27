import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { RosterManager } from "@/features/roster/roster-manager";
import { listClasses, listStudents } from "@/server/db/queries/roster";

export const metadata = { title: "Classes & Students" };

// Roster: minimal support for the "Who are you?" picker and assignments (no login, ADR-002) — not a use case.
export default function ClassesPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <Classes />
    </Suspense>
  );
}

async function Classes() {
  const [classes, students] = await Promise.all([listClasses(), listStudents({ includeArchived: true })]);
  return (
    <>
      <TopBar title="Classes & Students" subtitle="Add classes and students. Archive a student instead of deleting them." />
      <PageBody>
        <RosterManager
          classes={classes.map((c) => ({ id: c.id, name: c.name, studentCount: c.studentCount }))}
          students={students.map((s) => ({ id: s.id, fullName: s.fullName, rollNo: s.rollNo, classId: s.classId, archivedAt: s.archivedAt }))}
        />
      </PageBody>
    </>
  );
}
