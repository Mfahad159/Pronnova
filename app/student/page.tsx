import { Suspense } from "react";
import Link from "next/link";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { ChapterCard } from "@/features/curriculum/chapter-card";
import { getCurrentStudent } from "@/server/db/demo-user";
import { listStudentAttempts } from "@/server/db/queries/attempts";
import { listChapters } from "@/server/db/queries/curriculum";

export const metadata = { title: "Home" };

export default function StudentHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <StudentHome />
    </Suspense>
  );
}

async function StudentHome() {
  const student = await getCurrentStudent();
  const [chapters, attempts] = await Promise.all([listChapters(), listStudentAttempts(student.id, 10)]);
  // Phase 2 replaces this with the full "Continue" rule (UC-03 alt 1A).
  const practiceHref = attempts[0] ? `/student/practice/${attempts[0].itemId}` : "/student/chapters";

  return (
    <>
      <TopBar
        title={`Welcome back, ${student.name} 👋`}
        subtitle="Pick up where you stopped, or try a new chapter."
        action={
          <Button asChild size="lg">
            <Link href={practiceHref}>
              <Mic /> {attempts[0] ? "Continue practice" : "Start practice"}
            </Link>
          </Button>
        }
      />
      <PageBody>
        <Tabs defaultValue="learn">
          <TabsList>
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-8 pt-4">
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-lg font-semibold">Chapters</h2>
                <Link href="/student/chapters" className="text-sm font-medium text-primary hover:underline">
                  See all
                </Link>
              </div>
              {chapters.length === 0 ? (
                <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No chapters yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {chapters.slice(0, 4).map((c) => (
                    <ChapterCard key={c.id} chapter={c} />
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">Recent attempts</h2>
              <AttemptsTable attempts={attempts.slice(0, 5)} />
            </section>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            <AttemptsTable attempts={attempts} />
          </TabsContent>

          <TabsContent value="saved" className="pt-4">
            <ComingSoon what="Saved words" milestone="FYP-2" />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
