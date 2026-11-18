import {
  ArrowRight,
  Award,
  BookOpenCheck,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LEVEL_BADGE_VARIANT } from "@/features/chapters";
import {
  getAllChapters,
  getAllExercises,
  getRecentAttempts,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";
import { DIFFICULTY_LABELS } from "@/types";

export default function TeacherOverviewPage() {
  const chapters = getAllChapters();
  const exercises = getAllExercises();
  const recentAttempts = getRecentAttempts();
  const overview = getStudentProgressOverview();

  const metrics = [
    {
      label: "Active Chapters",
      value: `${chapters.length} Chapters`,
      detail: `${exercises.length} exercises across Basic, Medium & Advanced`,
      icon: BookOpenCheck,
      badge: "Curriculum",
      badgeVariant: "orange" as const,
      iconBox: "bg-surface-peach text-brand-orange",
    },
    {
      label: "Recent Attempts",
      value: `${recentAttempts.length} Logged`,
      detail: "Latest student read-aloud submissions",
      icon: ClipboardList,
      badge: "Activity",
      badgeVariant: "blue" as const,
      iconBox: "bg-surface-sky text-[#0284c7]",
    },
    {
      label: "Average Accuracy",
      value: `${overview.averageAccuracy}%`,
      detail: `Focus sounds: ${overview.focusSoundsToPractice.slice(0, 2).join(", ")}`,
      icon: Award,
      badge: "Performance",
      badgeVariant: "green" as const,
      iconBox: "bg-surface-mint text-success",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        title="Teacher"
        accentTitle="Overview"
        description="Manage reading chapters, organize difficulty levels, and monitor student pronunciation performance."
        action={
          <Button asChild>
            <Link href="/teacher/chapters">
              Manage Chapters
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Class metrics"
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        {metrics.map(
          ({ label, value, detail, icon: Icon, badge, badgeVariant, iconBox }) => (
            <Card key={label} className="gap-4 py-5">
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex size-10 items-center justify-center rounded-[14px] ${iconBox}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <Badge variant={badgeVariant}>{badge}</Badge>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="font-body text-xs text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          )
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Pronunciation Activity</CardTitle>
          <CardDescription>
            Latest student read-aloud attempts and flagged pronunciation words.
          </CardDescription>
          <CardAction>
            <Button asChild variant="outline" size="sm">
              <Link href="/teacher/students">View All Progress</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <Separator />
          {recentAttempts.slice(0, 4).map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col justify-between gap-2 rounded-[16px] border border-input bg-background/70 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {overview.studentName}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {attempt.exerciseTitle}
                  </span>
                  <Badge variant={LEVEL_BADGE_VARIANT[attempt.level]}>
                    {DIFFICULTY_LABELS[attempt.level]}
                  </Badge>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {attempt.chapterTitle} · {attempt.practicedAtLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {attempt.flaggedWords.length > 0 ? (
                  <Badge variant="orange">
                    {attempt.flaggedWords.length} word
                    {attempt.flaggedWords.length > 1 ? "s" : ""} to review
                  </Badge>
                ) : (
                  <Badge variant="green">Clear</Badge>
                )}
                <Badge variant={attempt.score >= 85 ? "green" : "orange"}>
                  {attempt.score}%
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
