import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { getCurrentStudent } from "@/server/db/demo-user";
import { getItem } from "@/server/db/queries/curriculum";
import { getItemAccess } from "@/server/db/queries/learning";

// UC-04/05/06. Recording + scoring UI arrives in Phase 3 (specs/fyp1-implementation-plan.md).
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
  const [item, access] = await Promise.all([getItem(itemId), getItemAccess(student.id, itemId)]);
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
          <Button size="lg" className="size-20 rounded-full [&_svg]:size-8" disabled aria-label="Record (coming in Phase 3)">
            <Mic />
          </Button>
          <p className="text-sm text-muted-foreground">Read it out loud, clearly and at a normal speed. Recording is coming in Phase 3.</p>
        </div>
      </PageBody>
    </>
  );
}
