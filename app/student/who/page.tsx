import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { StudentPicker } from "@/features/student/student-picker";
import { listClasses } from "@/server/db/queries/roster";

export const metadata = { title: "Who are you?" };

// "Who are you?" — replaces login until auth arrives in FYP-2 (ADR-002). Pick class → name → Continue.
export default function WhoPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <Who />
    </Suspense>
  );
}

async function Who() {
  const classes = await listClasses();
  return (
    <>
      <TopBar title="Who are you?" subtitle="Pick your class, then your name." />
      <PageBody>
        <StudentPicker classes={classes.map((c) => ({ id: c.id, name: c.name, studentCount: c.studentCount }))} />
      </PageBody>
    </>
  );
}
