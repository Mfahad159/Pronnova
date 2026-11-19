import {
  ArrowRight,
  Award,
  BookOpen,
  Layers,
  Mic,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChapterCard } from "@/features/curriculum";
import {
  getAllChapters,
  getChapterProgress,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";

const LEVEL_TILES = [
  {
    level: "basic",
    title: "Basic",
    subtitle: "Words & starter phrases",
    meta: "6 chapters",
    cardVariant: "mint" as const,
    icon: Sparkles,
  },
  {
    level: "medium",
    title: "Medium",
    subtitle: "Sound contrasts & flow",
    meta: "8 chapters",
    cardVariant: "peach" as const,
    icon: Layers,
  },
  {
    level: "advanced",
    title: "Advanced",
    subtitle: "Connected sentences",
    meta: "4 chapters",
    cardVariant: "sky" as const,
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
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        title="Student Practice"
        description="Daily read-aloud exercises and pronunciation feedback."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/student/chapters">
              <BookOpen data-icon="inline-start" aria-hidden="true" />
              All Chapters
            </Link>
          </Button>
        }
      />

      {/* Primary Action Card: Resume practice */}
      <Card variant="peach" className="py-6">
        <CardContent className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-orange">
              <span>Chapter {String(activeChapter.number).padStart(2, "0")}</span>
              <span>·</span>
              <span>In Progress</span>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                {activeChapter.title} {activeChapter.accentWord}
              </h2>
              <p className="font-body text-xs sm:text-sm text-muted-foreground truncate">
                Next: <span className="font-medium text-foreground">{nextExercise.title}</span> — &ldquo;{nextExercise.promptText}&rdquo;
              </p>
            </div>

            <div className="flex max-w-sm flex-col gap-1.5 pt-1">
              <Progress
                value={activeProgress.percentage}
                aria-label="Active chapter progress"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{activeProgress.completedCount} of {activeProgress.totalCount} exercises</span>
                <span className="font-medium text-foreground">{activeProgress.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2.5 sm:flex-row md:flex-col">
            <Button asChild size="default" className="w-full sm:w-auto">
              <Link href={`/student/practice/${nextExercise.id}`}>
                <Mic data-icon="inline-start" aria-hidden="true" />
                Continue
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto text-muted-foreground">
              <Link href={`/student/chapters/${activeChapter.id}`}>
                View Chapter
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Levels section */}
      <section aria-label="Practice by level" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground font-heading">Practice by Level</h2>
          <Button asChild variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
            <Link href="/student/chapters">
              View all
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVEL_TILES.map(
            ({ level, title, subtitle, meta, cardVariant, icon: Icon }) => (
              <Link key={level} href="/student/chapters" className="group block">
                <Card
                  variant={cardVariant}
                  className="h-full py-4 transition-all duration-150 hover:border-foreground/20"
                >
                  <CardHeader className="gap-2">
                    <div className="flex items-center justify-between">
                      <Icon className="size-4 text-foreground/70" aria-hidden="true" />
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {meta}
                      </span>
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{subtitle}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          )}
        </div>
      </section>

      {/* Featured Chapters */}
      <section aria-label="Featured chapters" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground font-heading">Featured Chapters</h2>
          <Button asChild variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
            <Link href="/student/chapters">View All ({chapters.length})</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featuredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </section>

      {/* Clean metric banner */}
      <Card className="py-4">
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 text-success shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {overview.averageAccuracy}% Accuracy · {overview.completedExercises}/{overview.totalExercises} Completed
              </p>
              <p className="text-xs text-muted-foreground">
                Target sounds: {overview.focusSoundsToPractice.join(" · ")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/student/progress">
              View Progress
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
