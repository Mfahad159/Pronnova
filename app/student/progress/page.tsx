import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "Progress" };

// UC-07 (FYP-2): scores over time, repeated errors, Gemini suggestions.
export default function ProgressPage() {
  return (
    <>
      <TopBar title="Your progress" subtitle="See how you're improving." />
      <PageBody>
        <ComingSoon title="Your progress page is coming">
          You&apos;ll see your scores over time, the words and sounds you keep missing, and tips made just for you.
        </ComingSoon>
      </PageBody>
    </>
  );
}
