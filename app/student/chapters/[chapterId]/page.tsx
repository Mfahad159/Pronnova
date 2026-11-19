import { Suspense } from "react";
import { ArrowLeft, Mic } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACCENT_COVER_CLASSES,
  ChapterCard,
  ChapterDetailExercises,
} from "@/features/curriculum";
import {
  getAllChapters,
  getChapterById,
  getChapterLevels,
  getChapterProgress,
  getRecommendedChapters,
} from "@/lib/mock-data/curriculum";
import { DIFFICULTY_LABELS } from "@/types";

export function generateStaticParams() {
  return getAllChapters().map((chapter) => ({
    chapterId: chapter.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/student/chapters/[chapterId]">): Promise<Metadata> {
  const { chapterId } = await params;
  const chapter = getChapterById(chapterId);

  if (!chapter) {
    return { title: "Chapter Not Found" };
  }

  return {
    title: `${chapter.title} ${chapter.accentWord}`,
    description: chapter.description,
  };
}

function ChapterDetailSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <Skeleton className="h-64 w-full rounded-[28px]" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}

async function ChapterDetailContent({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getChapterById(chapterId);

  if (!chapter) {
    notFound();
  }

  const levels = getChapterLevels(chapter);
  const progress = getChapterProgress(chapter);
  const coverStyle = ACCENT_COVER_CLASSES[chapter.accentTone];
  const nextExercise =
    chapter.exercises.find((exercise) => !exercise.completed) ??
    chapter.exercises[0];
  const recommended = getRecommendedChapters(chapter.id, 3);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <section
        className={`rounded-2xl border border-border/70 p-5 sm:p-7 ${coverStyle.surface}`}
      >
        <div className="flex flex-col gap-4">
          <div>
            <Button asChild variant="ghost" size="xs" className="h-7 text-xs text-muted-foreground hover:text-foreground">
              <Link href="/student/chapters">
                <ArrowLeft data-icon="inline-start" aria-hidden="true" className="size-3" />
                Chapters
              </Link>
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex max-w-xl flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Chapter {chapter.number}</span>
                <span>·</span>
                <span className="capitalize">{levels.map((l) => DIFFICULTY_LABELS[l]).join(", ")}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
                {chapter.title}{" "}
                <span className="text-accent-pink">{chapter.accentWord}</span>
              </h1>

              <p className="font-body text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {chapter.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col">
              {nextExercise && (
                <Button asChild size="default">
                  <Link href={`/student/practice/${nextExercise.id}`}>
                    <Mic data-icon="inline-start" aria-hidden="true" />
                    {progress.completedCount === 0 ? "Start" : "Continue"}
                  </Link>
                </Button>
              )}

              <Card className="gap-2 py-2.5">
                <CardContent className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-foreground">
                      {progress.percentage}%
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-1.5" />
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{progress.completedCount}/{progress.totalCount} completed</span>
                    <span>~{chapter.estimatedMinutes}m</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <ChapterDetailExercises exercises={chapter.exercises} />

      <Separator />

      <section aria-label="Recommended chapters" className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-foreground font-heading">
          Recommended Chapters
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((item) => (
            <ChapterCard key={item.id} chapter={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ChapterDetailPage({
  params,
}: PageProps<"/student/chapters/[chapterId]">) {
  return (
    <Suspense fallback={<ChapterDetailSkeleton />}>
      <ChapterDetailContent params={params} />
    </Suspense>
  );
}
