import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { getCurrentStudent } from "@/server/db/demo-user";
import { getItem } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";
import { PracticeRecorder } from "@/features/practice/practice-recorder";
import { LockDoodle, SpeakDoodle } from "@/components/icons/doodle";
import { itemAccess, openItemsInOrder } from "@/lib/progress";

// UC-04 Attempt + UC-05 Record (Phase 3). Full feedback (UC-06) arrives in Phase 4.
export default function PracticePage(props: PageProps<"/student/practice/[itemId]">) {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <PracticeContent params={props.params} />
    </Suspense>
  );
}

async function PracticeContent({ params }: { params: PageProps<"/student/practice/[itemId]">["params"] }) {
  const { itemId } = await params;
  const student = await getCurrentStudent();
  const [item, learning] = await Promise.all([getItem(itemId), getStudentLearning(student.id)]);
  const access = itemAccess(learning.view, itemId);
  // Hidden = teacher material not assigned to this student: same as "doesn't exist".
  if (!item || access === "hidden") notFound();

  if (access === "locked") {
    return (
      <>
        <TopBar title="Practice" subtitle={`${item.chapterTitle} · ${levelLabel[item.level]}`} />
        <PageBody>
          <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card px-6 py-12 text-center" role="status">
            <LockDoodle className="size-10 text-muted-foreground" />
            <p className="font-heading text-xl font-semibold">This one is still locked 🔒</p>
            <p className="max-w-md text-muted-foreground">
              Get 70% or more on every exercise in the level before it, and {levelLabel[item.level]} in {item.chapterTitle} opens up.
            </p>
            <Button asChild size="lg">
              <Link href={`/student/chapters/${item.chapterId}`}>Back to {item.chapterTitle}</Link>
            </Button>
          </div>
        </PageBody>
      </>
    );
  }

  // "Next exercise" = the next item the student can open, in course order.
  const open = openItemsInOrder(learning.view);
  const idx = open.findIndex((i) => i.id === item.id);
  const next = idx >= 0 ? open[idx + 1] : undefined;

  return (
    <>
      <TopBar
        title="Practice"
        subtitle={
          <>
            <Link href={`/student/chapters/${item.chapterId}`} className="hover:underline">
              {item.chapterTitle}
            </Link>{" "}
            · {levelLabel[item.level]} · {item.lessonTitle}
          </>
        }
      />
      <PageBody>
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_240px]">
          <div className="flex flex-col items-center gap-8 rounded-3xl border bg-card px-5 py-10 text-center md:px-10 md:py-14">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <SpeakDoodle className="size-5" /> Read this {item.itemType}
            </p>
            <p className="max-w-2xl font-heading text-4xl font-bold text-balance break-words md:text-5xl">{item.text}</p>
            <PracticeRecorder itemId={item.id} nextHref={next ? `/student/practice/${next.id}` : null} />
          </div>
          {/* Friendly guide with one reading tip (desktop only, so phones stay focused on the task). */}
          <aside className="hidden flex-col items-center gap-3 lg:flex" aria-label="Tip">
            <div className="relative rounded-2xl border bg-card p-4 text-sm">
              <p className="font-semibold">Tip</p>
              <p className="mt-1 text-muted-foreground">Read slowly and clearly, like you&apos;re reading to a friend. You can listen to yourself before you check.</p>
              <span aria-hidden className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-r border-b bg-card" />
            </div>
            <Image src="/avatar/avatar_speaking.png" alt="" width={1192} height={1307} sizes="200px" className="w-48 rounded-3xl border bg-tint-peach" />
          </aside>
        </div>
      </PageBody>
    </>
  );
}
