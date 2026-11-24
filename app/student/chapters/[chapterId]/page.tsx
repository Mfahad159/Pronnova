import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel, levels } from "@/features/curriculum/level";
import { getChapterContent } from "@/server/db/queries/curriculum";

// UC-03 steps 2–6: levels → items. Params and DB reads are request-time data, so they're read
// inside Suspense (Cache Components; node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md).
// Level locking arrives in Phase 2.
export default function ChapterPage(props: PageProps<"/student/chapters/[chapterId]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChapterContent params={props.params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: { params: PageProps<"/student/chapters/[chapterId]">["params"] }) {
  const { chapterId } = await params;
  const content = await getChapterContent(chapterId);
  if (!content) notFound();
  const { chapter, lessons } = content;

  return (
    <>
      <TopBar title={chapter.title} subtitle={`Chapter ${chapter.orderNo} · ${chapter.gradeTag}`} />
      <PageBody>
        {levels.map((level) => {
          const items = lessons.filter((l) => l.level === level).flatMap((l) => l.items);
          return (
            <section key={level} className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">{levelLabel[level]}</h2>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No exercises in this level yet.
                </p>
              ) : (
                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/student/practice/${item.id}`}
                        className="flex items-center gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:bg-muted"
                      >
                        <span className="flex-1 font-medium">{item.text}</span>
                        <Badge variant="secondary" className="capitalize">
                          {item.itemType}
                        </Badge>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </PageBody>
    </>
  );
}
