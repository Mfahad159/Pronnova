import { Suspense } from "react";
import Link from "next/link";
import { Microphone } from "@phosphor-icons/react/ssr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SectionHeading } from "@/components/brand/section-heading";
import { Eyebrow, tabsListClass, tabsTriggerClass } from "@/components/brand/ui";
import { WordPicture } from "@/components/brand/word-pictures";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { ComingSoon } from "@/components/layout/coming-soon";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { ChapterCard } from "@/features/curriculum/chapter-card";
import { HomeworkList } from "@/features/curriculum/homework-list";
import { continueItem } from "@/lib/progress";
import { getCurrentStudentOrPick } from "@/server/db/demo-user";
import { listStudentAttempts } from "@/server/db/queries/attempts";
import { listChapters } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";

export const metadata = { title: "Home" };

export default function StudentHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <StudentHome />
    </Suspense>
  );
}

async function StudentHome() {
  const student = await getCurrentStudentOrPick();
  const [chapters, attempts, learning] = await Promise.all([
    listChapters(),
    listStudentAttempts(student.id, 10),
    getStudentLearning(student),
  ]);
  // UC-03 alt 1A: resume where the student stopped (rule in lib/progress.ts).
  const next = continueItem(learning.view, learning.lastItemId);
  const practiceHref = next ? `/student/practice/${next.id}` : "/student/chapters";
  const progressById = new Map(learning.view.map((c) => [c.id, c]));

  return (
    <>
      <TopBar
        title={`Welcome back, ${student.name} 👋`}
        subtitle={
          <>
            Let&apos;s practise some English words today!{" "}
            <Link href="/student/who" className="font-semibold text-primary hover:underline">
              Not {student.name}?
            </Link>
          </>
        }
      />
      <PageBody>
        {/* Next up: Piko + word card + one big kiddy button (landing hero / learning buddy). */}
        <PikoSays
          message={
            next ? (
              <>
                Let&apos;s say <span className="text-foreground">“{next.text}”</span> together!
              </>
            ) : (
              "You finished everything! Want to practise again?"
            )
          }
        >
          {next ? (
            <span className="inline-flex items-center gap-2.5 rounded-xl border-2 border-foreground/10 bg-card py-1.5 pr-3.5 pl-1.5">
              <WordPicture text={next.text} size="sm" />
              <span className="text-left">
                <span className="block font-heading font-bold">{next.text}</span>
                <span className="block text-xs text-muted-foreground">{next.lessonTitle}</span>
              </span>
            </span>
          ) : null}
          <KiddyButton href={practiceHref}>
            <Microphone weight="fill" />
            {!next ? "All done — review chapters" : learning.lastItemId ? "Continue practice" : "Start practice"}
          </KiddyButton>
        </PikoSays>

        <Tabs defaultValue="learn">
          <TabsList className={tabsListClass}>
            <TabsTrigger value="learn" className={tabsTriggerClass}>
              Learn
            </TabsTrigger>
            <TabsTrigger value="history" className={tabsTriggerClass}>
              History
            </TabsTrigger>
            <TabsTrigger value="saved" className={tabsTriggerClass}>
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-10 pt-6">
            <section className="space-y-4" aria-labelledby="homework-heading">
              <SectionHeading id="homework-heading" title="Homework" />
              <HomeworkList homework={learning.homework} />
            </section>
            <section className="space-y-4">
              <SectionHeading title="Chapters" href="/student/chapters" />
              {chapters.length === 0 ? (
                <PikoSays size="sm" tone="card" message="No chapters yet. Ask your teacher!" />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {chapters.slice(0, 4).map((c) => (
                    <ChapterCard key={c.id} chapter={c} progress={progressById.get(c.id)} />
                  ))}
                </div>
              )}
            </section>
            <section className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <SectionHeading title="Recent attempts" />
                <Eyebrow tone="mint">Your last 5</Eyebrow>
              </div>
              <AttemptsTable attempts={attempts.slice(0, 5)} />
            </section>
          </TabsContent>

          <TabsContent value="history" className="pt-6">
            <AttemptsTable attempts={attempts} />
          </TabsContent>

          <TabsContent value="saved" className="pt-6">
            <ComingSoon what="Saved words" milestone="FYP-2" />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
