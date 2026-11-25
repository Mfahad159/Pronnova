import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Students" };

// UC-12 (FYP-2): per-student attempts, scores and evaluation.
export default function TeacherStudentsPage() {
  return (
    <>
      <TopBar title="Students" subtitle="See how each student is doing." />
      <PageBody>
        <ComingSoon title="Student progress is coming">
          You&apos;ll see each student&apos;s attempts, scores and the words they find hard. The latest attempts are already on your dashboard.
        </ComingSoon>
      </PageBody>
    </>
  );
}
