import {
  ArrowRight,
  Award,
  BookOpen,
  Flame,
  Layers,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChapterCard } from "@/features/chapters";
import {
  getAllChapters,
  getChapterProgress,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";

const LEVEL_TILES = [
  {
    level: "basic",
    title: "Basic Level",
    subtitle: "Clear words & short starter phrases",
    countLabel: "Foundational sounds",
    cardVariant: "mint" as const,
    iconBg: "bg-success text-white",
    icon: Sparkles,
  },
  {
    level: "medium",
    title: "Medium Level",
    subtitle: "Everyday phrases & sound contrasts",
    countLabel: "Connected speech",
    cardVariant: "peach" as const,
    iconBg: "bg-brand-orange-soft text-white",
    icon: Layers,
  },
  {
    level: "advanced",
    title: "Advanced Level",
    subtitle: "Full sentences up to 15 words",
    countLabel: "Fluency & clarity",
    cardVariant: "sky" as const,
    iconBg: "bg-info-blue text-white",
    icon: Award,
  },
] as const;

export default function StudentHomePage() {
  const chapters = getAllChapters();
  const overview = getStudentProgressOverview();

  const activeChapter =
    chapters.find((chapter) => {
      const progress = getChapterProgress(chapter);
      return progress.completedCount > 0 && progress.completedCount < progress.totalCount;
    }) ?? chapters[0];

  const activeProgress = getChapterProgress(activeChapter);
  const nextExercise =
    activeChapter.exercises.find((exercise) => !exercise.completed) ??
    activeChapter.exercises[0];

  const featuredChapters = chapters.slice(0, 3);

  return (
    <div className="flex flex-col gap-9 animate-fade-up">
      <PageHeader
        title="Welcome Back,"
        accentTitle={overview.studentName}
        description="Continue your read-aloud practice or explore chapters organized by difficulty level."
        action={
          <Button asChild>
            <Link href="/student/chapters">
              <BookOpen data-icon="inline-start" aria-hidden="true" />
              All Chapters
            </Link>
          </Button>
        }
      />

      <Card variant="peach" className="py-7">
        <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="orange">Continue Practicing</Badge>
              <Badge variant="outline">
                Chapter {String(activeChapter.number).padStart(2, "0")}
              </Badge>
              {activeProgress.averageScore !== null ? (
                <Badge variant="green">Avg {activeProgress.averageScore}%</Badge>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-bold text-foreground">
                {activeChapter.title} {activeChapter.accentWord}
              </h2>
              <p className="max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
                Next up:{" "}
                <span className="font-semibold text-foreground">
                  {nextExercise.title}
                </span>{" "}
                — &ldquo;{nextExercise.promptText}&rdquo;
              </p>
            </div>

            <div className="flex max-w-md flex-col gap-1.5">
              <Progress
                value={activeProgress.percentage}
                aria-label="Active chapter progress"
              />
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>
                  {activeProgress.completedCount} of {activeProgress.totalCount}{" "}
                  exercises practiced
                </span>
                <span className="font-semibold text-foreground">
                  {activeProgress.percentage}% Completed
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row md:flex-col">
            <Button asChild variant="orange" size="lg">
              <Link href={`/student/practice/${nextExercise.id}`}>
                <Mic data-icon="inline-start" aria-hidden="true" />
                Continue Exercise
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/student/chapters/${activeChapter.id}`}>
                Open Chapter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section aria-label="Practice by level" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-foreground">Practice by Level</h2>
          <Button asChild variant="outline" size="xs">
            <Link href="/student/chapters">
              More
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LEVEL_TILES.map(
            ({ level, title, subtitle, countLabel, cardVariant, iconBg, icon: Icon }) => (
              <Link key={level} href="/student/chapters" className="group block">
                <Card
                  variant={cardVariant}
                  className="h-full transition-transform duration-150 group-hover:-translate-y-0.5"
                >
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex size-10 items-center justify-center rounded-[14px] shadow-xs ${iconBg}`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {countLabel}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="text-xs">{subtitle}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>

      <section aria-label="Featured chapters" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold text-foreground">Featured Chapters</h2>
            <p className="font-body text-sm text-muted-foreground">
              Focused read-aloud lessons aligned with everyday English pronunciation.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/chapters">View All ({chapters.length})</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </section>

      <Card variant="cream" className="py-5">
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-card text-success shadow-xs">
              <TrendingUp className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                <span>{overview.averageAccuracy}% Average Accuracy</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
                  <Flame className="size-3.5" aria-hidden="true" />
                  {overview.completedExercises}/{overview.totalExercises} exercises done
                </span>
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Focus sounds to revisit: {overview.focusSoundsToPractice.join(" · ")}
              </p>
            </div>
          </div>
          <Button asChild variant="green" size="sm">
            <Link href="/student/progress">
              View Full Progress
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
