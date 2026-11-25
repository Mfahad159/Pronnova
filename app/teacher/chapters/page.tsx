import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Chapters" };

// UC-11 (FYP-2): reorder lessons inside chapters.
export default function TeacherChaptersPage() {
  return (
    <>
      <TopBar title="Organize chapters" subtitle="Arrange lessons into chapters and set their order." />
      <PageBody>
        <ComingSoon what="Chapter organizer" milestone="FYP-2" />
      </PageBody>
    </>
  );
}
