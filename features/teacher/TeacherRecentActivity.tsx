import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentAttemptSummary } from "@/types";

interface TeacherRecentActivityProps {
  recentAttempts: RecentAttemptSummary[];
  studentName: string;
}

export function TeacherRecentActivity({
  recentAttempts,
  studentName,
}: TeacherRecentActivityProps) {
  return (
    <Card className="py-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <CardDescription>
            Student read-aloud attempts and pronunciation scores.
          </CardDescription>
        </div>
        <CardAction>
          <Button asChild variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
            <Link href="/teacher/students">View All</Link>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pt-0">
        {recentAttempts.slice(0, 4).map((attempt) => (
          <div
            key={attempt.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {studentName}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground truncate">
                  {attempt.exerciseTitle}
                </span>
                <span className="text-[11px] text-muted-foreground capitalize hidden sm:inline">
                  ({attempt.level})
                </span>
              </div>
              <p className="font-body text-[11px] text-muted-foreground truncate">
                {attempt.chapterTitle} · {attempt.practicedAtLabel}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {attempt.flaggedWords.length > 0 ? (
                <span className="text-[11px] text-brand-orange font-medium hidden sm:inline">
                  {attempt.flaggedWords.length} review
                </span>
              ) : (
                <span className="text-[11px] text-success font-medium hidden sm:inline">
                  Clear
                </span>
              )}
              <span className={`text-xs font-semibold ${attempt.score >= 85 ? "text-success" : "text-brand-orange"}`}>
                {attempt.score}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
