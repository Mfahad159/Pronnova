import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { ChapterCard } from "@/features/curriculum/chapter-card";
import { listChapters } from "@/server/db/queries/curriculum";
import { getStudentLearning } from "@/server/db/queries/learning";
import { getCurrentStudent } from "@/server/db/demo-user";

export const metadata = { title: "Chapters" };

// UC-03 step 1: chapters in order.
export default function ChaptersPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <Chapters />
    </Suspense>
  );
}

async function Chapters() {
  const student = await getCurrentStudent();
  const [chapters, learning] = await Promise.all([listChapters(), getStudentLearning(student.id)]);
  const progressById = new Map(learning.view.map((c) => [c.id, c]));
  return (
    <>
      <TopBar title="Chapters" subtitle="Start with chapter 1. Each one has Basic, Medium and Advanced levels." />
      <PageBody>
        {chapters.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No chapters yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {chapters.map((c) => (
              <ChapterCard key={c.id} chapter={c} progress={progressById.get(c.id)} />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
