import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { getCurrentStudent } from "@/server/db/demo-user";
import { getItem } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";
import { PracticeRecorder } from "@/features/practice/practice-recorder";
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
            <Lock className="size-8 text-muted-foreground" />
            <p className="font-heading text-xl font-semibold">This level is locked</p>
            <p className="max-w-md text-muted-foreground">
              Finish the earlier level in {item.chapterTitle} with 70% or more on every exercise to open {levelLabel[item.level]}.
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
        <div className="flex flex-col items-center gap-8 rounded-3xl border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{item.itemType}</p>
          <p className="max-w-2xl font-heading text-3xl font-semibold text-balance md:text-4xl">{item.text}</p>
          <PracticeRecorder itemId={item.id} nextHref={next ? `/student/practice/${next.id}` : null} />
        </div>
      </PageBody>
    </>
  );
}
