import { Award, CheckCircle2, Mic, Play, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressFilterList } from "@/features/chapters";
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
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        title="Pronunciation"
        accentTitle="Progress"
        description="Track chapter completion, review past attempts, and focus on sounds that need extra practice."
      />

      <section
        aria-label="Progress metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="gap-2 py-5">
          <CardHeader className="gap-2">
            <span className="inline-flex size-10 items-center justify-center rounded-[14px] bg-surface-mint text-success">
              <Award className="size-5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Accuracy
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {overview.averageAccuracy}%
            </p>
          </CardContent>
        </Card>

        <Card className="gap-2 py-5">
          <CardHeader className="gap-2">
            <span className="inline-flex size-10 items-center justify-center rounded-[14px] bg-surface-peach text-brand-orange">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Exercises Practiced
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {overview.completedExercises} / {overview.totalExercises}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-2 py-5">
          <CardHeader className="gap-2">
            <span className="inline-flex size-10 items-center justify-center rounded-[14px] bg-surface-sky text-[#0284c7]">
              <Mic className="size-5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Attempts
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {overview.totalAttempts}
            </p>
          </CardContent>
        </Card>

        <Card className="gap-2 py-5">
          <CardHeader className="gap-2">
            <span className="inline-flex size-10 items-center justify-center rounded-[14px] bg-surface-tint-coral text-primary">
              <Target className="size-5" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Focus Sounds
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {overview.focusSoundsToPractice.map((sound) => (
                <Badge key={sound} variant="orange">
                  {sound}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card variant="peach" className="py-7">
        <CardContent className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-3">
            <Badge variant="orange">In Progress</Badge>
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-foreground">
                Chapter {activeItem.chapter.number}: {activeItem.chapter.title}{" "}
                {activeItem.chapter.accentWord}
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                {activeItem.progress.completedCount} of{" "}
                {activeItem.progress.totalCount} exercises practiced
              </p>
            </div>
            <div className="flex max-w-md flex-col gap-1.5">
              <Progress
                value={activeItem.progress.percentage}
                aria-label="Chapter completion"
              />
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Chapter completion</span>
                <span className="font-semibold text-foreground">
                  {activeItem.progress.percentage}% Completed
                </span>
              </div>
            </div>
          </div>

          <Button asChild variant="orange" size="lg" className="shrink-0">
            <Link href={`/student/practice/${nextExercise.id}`}>
              Continue
              <Play data-icon="inline-end" aria-hidden="true" />
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
