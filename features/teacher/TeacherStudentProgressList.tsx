import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Chapter, ChapterProgress, StudentProgressOverview } from "@/types";

interface TeacherStudentProgressListProps {
  overview: StudentProgressOverview;
  chaptersWithProgress: { chapter: Chapter; progress: ChapterProgress }[];
}

export function TeacherStudentProgressList({
  overview,
  chaptersWithProgress,
}: TeacherStudentProgressListProps) {
  const completionPct = Math.round(
    (overview.completedExercises / overview.totalExercises) * 100
  );

  return (
    <div className="flex flex-col gap-5">
      <Card className="py-4">
        <CardHeader className="gap-3 pb-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Avatar size="default">
                <AvatarFallback className="bg-brand-orange text-xs font-bold text-white">
                  AK
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-base">{overview.studentName}</CardTitle>
                <CardDescription>
                  {overview.totalAttempts} attempts recorded
                </CardDescription>
              </div>
            </div>

            <span className="text-xs font-semibold text-success">
              {overview.averageAccuracy}% Accuracy
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col rounded-xl border border-border/60 bg-background/50 p-3">
              <span className="text-[11px] text-muted-foreground">Exercises</span>
              <span className="text-lg font-bold text-foreground font-heading">
                {overview.completedExercises}/{overview.totalExercises}
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-border/60 bg-background/50 p-3">
              <span className="text-[11px] text-muted-foreground">Completion</span>
              <span className="text-lg font-bold text-foreground font-heading">
                {completionPct}%
              </span>
            </div>

            <div className="flex flex-col rounded-xl border border-border/60 bg-background/50 p-3">
              <span className="text-[11px] text-muted-foreground">Target Sounds</span>
              <span className="text-lg font-bold text-foreground font-heading">
                {overview.focusSoundsToPractice.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall Completion</span>
              <span className="font-medium text-foreground">{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chapter Breakdown</CardTitle>
          <CardDescription>
            Completion and accuracy across curriculum chapters.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {chaptersWithProgress.map(({ chapter, progress }) => (
            <div
              key={chapter.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5 text-xs"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-brand-orange">
                    CH {chapter.number}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-medium text-foreground truncate">
                    {chapter.title} {chapter.accentWord}
                  </span>
                </div>
                <p className="font-body text-[11px] text-muted-foreground">
                  {progress.completedCount} of {progress.totalCount} exercises
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex w-24 flex-col gap-1">
                  <Progress value={progress.percentage} className="h-1" />
                </div>

                <Badge variant={progress.percentage >= 60 ? "green" : "outline"} className="text-[11px] h-5 py-0 px-2">
                  {progress.averageScore !== null ? `${progress.averageScore}%` : "Not Started"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
