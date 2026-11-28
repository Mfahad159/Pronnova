import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { BookOpen, Microphone } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SectionHeading } from "@/components/brand/section-heading";
import { OutlineLink } from "@/components/brand/ui";
import { WordPicture } from "@/components/brand/word-pictures";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { HomeworkList } from "@/features/curriculum/homework-list";
import { continueItem } from "@/lib/progress";
import { getCurrentStudentOrPick } from "@/server/db/demo-user";
import { listStudentAttempts } from "@/server/db/queries/attempts";
import { MATERIALS_GROUP, getStudentLearning } from "@/server/db/queries/learning";
import { getStudent } from "@/server/db/queries/roster";

export const metadata = { title: "Home" };

// Student dashboard: only the work the teacher assigned (UC-08 → UC-03). Nothing assigned → a friendly
// "Happy weekend" empty state. Continue (UC-03 alt 1A) resumes the assigned work; chapters are free
// practice in the sidebar. Recent attempts appear once there are some.
export default function StudentHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <StudentHome />
    </Suspense>
  );
}

async function StudentHome() {
  const student = await getCurrentStudentOrPick();
  const [profile, attempts, learning] = await Promise.all([
    getStudent(student.id),
    listStudentAttempts(student.id, 10),
    getStudentLearning(student),
  ]);
  const hasWork = learning.homework.length > 0;
  // Continue only within the work the teacher assigned (chapters are free practice, in the sidebar).
  const next = hasWork ? continueItem(learning.view.filter((c) => c.id === MATERIALS_GROUP.id), learning.lastItemId) : null;

  return (
    <>
      <TopBar title={`Hi, ${student.name} 👋`} subtitle={profile?.className ? `${profile.className} · Let's practise some English today!` : "Let's practise some English today!"} />
      <PageBody>
        {!hasWork ? (
          // Nothing assigned yet: a friendly empty state (chapters stay open for extra practice).
          <section aria-labelledby="empty-heading">
            <h2 id="empty-heading" className="sr-only">
              No work assigned
            </h2>
            <PikoSays tone="mint" message="No work assigned yet! Happy weekend! 🎉">
              <p className="w-full text-sm text-muted-foreground">Your teacher&apos;s lessons will show up here. Want to practise anyway?</p>
              <OutlineLink href="/student/chapters">
                <BookOpen weight="duotone" /> Open chapters
              </OutlineLink>
            </PikoSays>
          </section>
        ) : (
          <>
            {/* Continue: the next item of the assigned work, one tap to resume. */}
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
                <PikoSays tone="mint" message="All your work is done! Super star! 🌟 Happy weekend!">
                  <OutlineLink href="/student/chapters">
                    <BookOpen weight="duotone" /> Practise more in chapters
                  </OutlineLink>
                </PikoSays>
              )}
            </section>

            <section className="space-y-4" aria-labelledby="lessons-heading">
              <SectionHeading id="lessons-heading" title="Your lessons" />
              <HomeworkList homework={learning.homework} />
            </section>
          </>
        )}

        {attempts.length > 0 ? (
          <section className="space-y-4" aria-labelledby="recent-heading">
            <SectionHeading id="recent-heading" title="Recent attempts" />
            <AttemptsTable attempts={attempts} />
          </section>
        ) : null}
      </PageBody>
    </>
  );
}
