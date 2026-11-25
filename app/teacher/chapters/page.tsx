import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Chapters" };

// UC-11 (FYP-2): reorder lessons inside chapters.
export default function TeacherChaptersPage() {
  return (
    <>
      <TopBar title="Organise chapters" subtitle="Put lessons into chapters and choose their order." />
      <PageBody>
        <ComingSoon title="Organising chapters is coming">
          You&apos;ll be able to move lessons between chapters and change their order. For now, add new material from Materials.
        </ComingSoon>
      </PageBody>
    </>
  );
}
