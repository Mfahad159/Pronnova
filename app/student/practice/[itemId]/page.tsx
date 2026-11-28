import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { Panel, PanelHeader, PanelTitle, levelBadge } from "@/components/brand/ui";
import { WordPicture } from "@/components/brand/word-pictures";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { ListenButton } from "@/features/practice/listen-button";
import { PracticeRecorder } from "@/features/practice/practice-recorder";
import { PracticeSteps } from "@/features/practice/practice-steps";
import { itemAccess, openItemsInOrder, PASS_SCORE } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { getCurrentStudentOrPick } from "@/server/db/demo-user";
import { getItem } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";

// UC-04 Attempt + UC-05 Record + UC-06 Feedback, in the landing demo layout (ADR-007).
export default function PracticePage(props: PageProps<"/student/practice/[itemId]">) {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <PracticeContent params={props.params} />
    </Suspense>
  );
}

async function PracticeContent({ params }: { params: PageProps<"/student/practice/[itemId]">["params"] }) {
  const { itemId } = await params;
  const student = await getCurrentStudentOrPick();
  const [item, learning] = await Promise.all([getItem(itemId), getStudentLearning(student)]);
  const access = itemAccess(learning.view, itemId);
  // Hidden = teacher material not assigned to this student: same as "doesn't exist".
  if (!item || access === "hidden") notFound();

  // Back: assigned teacher work lives on Home ("Your lessons"); chapter items go back to their chapter.
  const back = item.chapterId
    ? { href: `/student/chapters/${item.chapterId}`, label: `Back to ${item.chapterTitle}` }
    : { href: "/student", label: "Back to home" };

  if (access === "locked") {
    return (
      <>
        <TopBar title="Practice" subtitle={`${item.chapterTitle} · ${levelLabel[item.level]}`} back={back} />
        <PageBody>
          <div role="status">
            <PikoSays
              tone="cream"
              message={
                <>
                  This level is locked
                  <span className="mt-1 block text-base font-medium text-muted-foreground">
                    Finish the earlier level in {item.chapterTitle} with {PASS_SCORE}% or more on every word to open{" "}
                    {levelLabel[item.level]}.
                  </span>
                </>
              }
            >
              <KiddyButton href={back.href}>{back.label}</KiddyButton>
            </PikoSays>
          </div>
        </PageBody>
      </>
    );
  }

  // "Next word" = the next item the student can open, in course order.
  // Stays inside the same group (this chapter, or the assigned work): never jumps between them.
  const group = learning.view.filter((c) => openItemsInOrder([c]).some((i) => i.id === item.id));
  const open = openItemsInOrder(group);
  const idx = open.findIndex((i) => i.id === item.id);
  const next = idx >= 0 ? open[idx + 1] : undefined;
  const isWord = item.itemType === "word";

  return (
    <>
      <TopBar
        title="Practice"
        back={back}
        subtitle={
          <>
            <Link href={back.href} className="hover:underline">
              {item.chapterTitle}
            </Link>{" "}
            · {item.lessonTitle}
          </>
        }
      />
      <PageBody>
        <Panel>
          <PanelHeader className="sm:px-8">
            <div className="flex items-center gap-3">
              <PanelTitle>Say it out loud</PanelTitle>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", levelBadge[item.level])}>
                {levelLabel[item.level]}
              </span>
            </div>
            <PracticeSteps />
          </PanelHeader>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-10">
            {/* Flashcard (landing demo left column). */}
            <div className="flex flex-col items-center rounded-2xl border border-primary/15 bg-tint-peach/70 p-6 text-center sm:p-8">
              <span className="rounded-lg bg-card px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                {item.itemType}
              </span>
              <WordPicture text={item.text} size="lg" className="mt-4" />
              <p
                className={cn(
                  "mt-5 font-heading font-bold tracking-tight text-balance text-foreground",
                  isWord ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
                )}
              >
                {item.text}
              </p>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">Listen first, then say it just like that.</p>
              <ListenButton text={item.text} label={isWord ? `Listen to “${item.text}”` : "Listen"} className="mt-5" />
            </div>

            {/* Recorder + result (landing demo right column). */}
            <PracticeRecorder itemId={item.id} itemText={item.text} nextHref={next ? `/student/practice/${next.id}` : null} doneHref={back.href} />
          </div>
        </Panel>
      </PageBody>
    </>
  );
}
