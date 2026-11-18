import { ArrowLeft, Clock, Layers, Mic } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ACCENT_COVER_CLASSES,
  ChapterCard,
  ChapterDetailExercises,
  LEVEL_BADGE_VARIANT,
} from "@/features/chapters";
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

export default async function ChapterDetailPage({
  params,
}: PageProps<"/student/chapters/[chapterId]">) {
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
    <div className="flex flex-col gap-10 animate-fade-up">
      <section
        className={`rounded-[28px] border border-border p-6 shadow-card sm:p-8 ${coverStyle.surface}`}
      >
        <div className="flex flex-col gap-5">
          <div>
            <Button asChild size="xs">
              <Link href="/student/chapters">
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Back to Chapters
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`border-transparent ${coverStyle.badge}`}
                >
                  Chapter {String(chapter.number).padStart(2, "0")}
                </Badge>
                {levels.map((level) => (
                  <Badge key={level} variant={LEVEL_BADGE_VARIANT[level]}>
                    {DIFFICULTY_LABELS[level]}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {chapter.title}{" "}
                <span className="text-primary">{chapter.accentWord}</span>
              </h1>

              <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
                {chapter.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-primary" aria-hidden="true" />
                  <span>~{chapter.estimatedMinutes} mins total</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="size-4 text-brand-orange" aria-hidden="true" />
                  <span>{chapter.exercises.length} exercises</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {chapter.focusSounds.map((sound) => (
                    <Badge
                      key={sound}
                      variant="outline"
                      className="border-transparent bg-card/85 text-[11px] text-foreground"
                    >
                      {sound}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:min-w-60">
              <Button asChild size="lg" className="w-full">
                <Link href={`/student/practice/${nextExercise.id}`}>
                  <Mic data-icon="inline-start" aria-hidden="true" />
                  {progress.completedCount > 0
                    ? "Continue Practice"
                    : "Start Reading"}
                </Link>
              </Button>

              <Card className="bg-card/90 py-4">
                <CardContent className="flex flex-col gap-1.5 px-4">
                  <Progress
                    value={progress.percentage}
                    aria-label="Chapter progress"
                  />
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>
                      {progress.completedCount}/{progress.totalCount} practiced
                    </span>
                    <span className="font-semibold text-foreground">
                      {progress.percentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <ChapterDetailExercises exercises={chapter.exercises} />

      <Separator />

      <section aria-label="Recommended chapters" className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Recommended <span className="text-accent-pink">Chapters</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Continue strengthening your pronunciation across related sound patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommended.map((item) => (
            <ChapterCard key={item.id} chapter={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
