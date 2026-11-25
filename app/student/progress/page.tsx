import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Progress" };

// UC-07 (FYP-2): scores over time, repeated errors, Gemini suggestions.
export default function ProgressPage() {
  return (
    <>
      <TopBar title="Your progress" subtitle="Scores over time and the words you keep missing." />
      <PageBody>
        <ComingSoon what="Progress and suggestions" milestone="FYP-2" />
      </PageBody>
    </>
  );
}
