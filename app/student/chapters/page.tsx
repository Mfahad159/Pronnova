import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { ChapterCard } from "@/features/curriculum/chapter-card";
import { listChapters } from "@/server/db/queries/curriculum";

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
  const chapters = await listChapters();
  return (
    <>
      <TopBar title="Chapters" subtitle="Work through them in order. Each has Basic, Medium and Advanced levels." />
      <PageBody>
        {chapters.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No chapters yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {chapters.map((c) => (
              <ChapterCard key={c.id} chapter={c} />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
