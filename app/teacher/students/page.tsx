import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Students" };

// UC-12 (FYP-2): per-student attempts, scores and evaluation.
export default function TeacherStudentsPage() {
  return (
    <>
      <TopBar title="Students" subtitle="Each student's attempts, scores and progress." />
      <PageBody>
        <ComingSoon what="Student progress" milestone="FYP-2" />
      </PageBody>
    </>
  );
}
