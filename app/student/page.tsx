import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Microphone } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SectionHeading } from "@/components/brand/section-heading";
import { WordPicture } from "@/components/brand/word-pictures";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { ChapterCard } from "@/features/curriculum/chapter-card";
import { HomeworkList } from "@/features/curriculum/homework-list";
import { continueItem } from "@/lib/progress";
import { getCurrentStudentOrPick } from "@/server/db/demo-user";
import { listStudentAttempts } from "@/server/db/queries/attempts";
import { listChapters } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";
import { getStudent } from "@/server/db/queries/roster";

export const metadata = { title: "Home" };

// Student dashboard: greeting, Continue (UC-03 alt 1A), Your lessons (assigned materials). Minimal
// on purpose — progress charts/analytics are UC-07 (out of FYP-1 scope).
export default function StudentHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <StudentHome />
    </Suspense>
  );
}

async function StudentHome() {
  const student = await getCurrentStudentOrPick();
  const [profile, chapters, attempts, learning] = await Promise.all([
    getStudent(student.id),
    listChapters(),
    listStudentAttempts(student.id, 10),
    getStudentLearning(student),
  ]);
  const next = continueItem(learning.view, learning.lastItemId);
  const progressById = new Map(learning.view.map((c) => [c.id, c]));

  return (
    <>
      <TopBar title={`Hi, ${student.name} 👋`} subtitle={profile?.className ? `${profile.className} · Let's practise some English today!` : "Let's practise some English today!"} />
      <PageBody>
        {/* Continue: the last material + item, one tap to resume. */}
        <section aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="sr-only">
            Continue
          </h2>
          {next ? (
            <PikoSays
              message={
                <>
                  {learning.lastItemId ? "Welcome back! " : ""}Let&apos;s say <span className="text-foreground">“{next.text}”</span>!
                </>
              }
            >
              <span className="inline-flex items-center gap-2.5 rounded-xl border-2 border-foreground/10 bg-card py-1.5 pr-3.5 pl-1.5">
                <WordPicture text={next.text} size="sm" />
                <span className="text-left">
                  <span className="block font-heading font-bold">{next.text}</span>
                  <span className="block text-xs text-muted-foreground">{next.lessonTitle}</span>
                </span>
              </span>
              <KiddyButton href={`/student/practice/${next.id}`}>
                <Microphone weight="fill" />
                {learning.lastItemId ? "Continue practice" : "Start practice"}
                <ArrowRight className="size-5" aria-hidden />
              </KiddyButton>
            </PikoSays>
          ) : (
            <PikoSays tone="mint" message="You finished everything! Pick a chapter to practise again.">
              <KiddyButton href="/student/chapters">Review chapters</KiddyButton>
            </PikoSays>
          )}
        </section>

        <section className="space-y-4" aria-labelledby="lessons-heading">
          <SectionHeading id="lessons-heading" title="Your lessons" />
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

        <section className="space-y-4" aria-labelledby="recent-heading">
          <SectionHeading id="recent-heading" title="Recent attempts" />
          <AttemptsTable attempts={attempts} />
        </section>
      </PageBody>
    </>
  );
}
