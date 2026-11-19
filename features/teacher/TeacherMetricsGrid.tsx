import { Award, BookOpenCheck, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Chapter, Exercise, RecentAttemptSummary, StudentProgressOverview } from "@/types";

interface TeacherMetricsGridProps {
  chapters: Chapter[];
  exercises: Exercise[];
  recentAttempts: RecentAttemptSummary[];
  overview: StudentProgressOverview;
}

export function TeacherMetricsGrid({
  chapters,
  recentAttempts,
  overview,
}: TeacherMetricsGridProps) {
  const metrics = [
    {
      label: "Active Chapters",
      value: `${chapters.length}`,
      unit: "Chapters",
      icon: BookOpenCheck,
    },
    {
      label: "Recent Attempts",
      value: `${recentAttempts.length}`,
      unit: "Logged",
      icon: ClipboardList,
    },
    {
      label: "Average Accuracy",
      value: `${overview.averageAccuracy}%`,
      unit: "Class avg",
      icon: Award,
    },
  ] as const;

  return (
    <section
      aria-label="Class metrics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {metrics.map(({ label, value, unit, icon: Icon }) => (
        <Card key={label} className="py-4">
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{label}</span>
              <Icon className="size-4 text-foreground/60" aria-hidden="true" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
                {value}
              </span>
              <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
