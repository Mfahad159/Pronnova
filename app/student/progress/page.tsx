import { Award, CheckCircle2, Mic, Play, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressFilterList } from "@/features/curriculum";
import {
  getAllChapters,
  getChapterProgress,
  getRecentAttempts,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";

export const metadata: Metadata = {
  title: "Progress",
};

export default function StudentProgressPage() {
  const chapters = getAllChapters();
  const overview = getStudentProgressOverview();
  const recentAttempts = getRecentAttempts();

  const chapterItems = chapters.map((chapter) => ({
    chapter,
    progress: getChapterProgress(chapter),
  }));

  const activeItem =
    chapterItems.find(
      ({ progress }) =>
        progress.completedCount > 0 && progress.completedCount < progress.totalCount
    ) ?? chapterItems[0];

  const nextExercise =
    activeItem.chapter.exercises.find((exercise) => !exercise.completed) ??
    activeItem.chapter.exercises[0];

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <PageHeader
        title="Student Progress"
        description="Track completed exercises, accuracy rates, and target sounds."
      />

      {/* Big Number + Tiny Label metrics */}
      <section
        aria-label="Progress metrics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Average Accuracy</span>
              <Award className="size-4 text-success" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">
              {overview.averageAccuracy}%
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Exercises Done</span>
              <CheckCircle2 className="size-4 text-brand-orange" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">
              {overview.completedExercises}/{overview.totalExercises}
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Attempts</span>
              <Mic className="size-4 text-info-blue" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-foreground font-heading">
              {overview.totalAttempts}
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Target Sounds</span>
              <Target className="size-4 text-cta-coral" aria-hidden="true" />
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {overview.focusSoundsToPractice.map((sound) => (
                <Badge key={sound} variant="orange" className="text-[11px] h-5 py-0 px-1.5">
                  {sound}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Active chapter progress */}
      <Card variant="peach" className="py-5">
        <CardContent className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
              <span>Chapter {activeItem.chapter.number}</span>
              <span>·</span>
              <span>In Progress</span>
            </div>

            <h2 className="text-lg font-bold text-foreground font-heading">
              {activeItem.chapter.title} {activeItem.chapter.accentWord}
            </h2>

            <div className="flex max-w-sm flex-col gap-1">
              <Progress
                value={activeItem.progress.percentage}
                aria-label="Chapter completion"
                className="h-1.5"
              />
              <span className="text-xs text-muted-foreground">
                {activeItem.progress.completedCount} of {activeItem.progress.totalCount} exercises ({activeItem.progress.percentage}%)
              </span>
            </div>
          </div>

          <Button asChild size="sm" className="shrink-0">
            <Link href={`/student/practice/${nextExercise.id}`}>
              Continue
              <Play data-icon="inline-end" aria-hidden="true" className="size-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <ProgressFilterList
        chapterItems={chapterItems}
        recentAttempts={recentAttempts}
      />
    </div>
  );
}
