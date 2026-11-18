import { Award, CheckCircle2, Target } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
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
import { Separator } from "@/components/ui/separator";
import {
  getAllChapters,
  getChapterProgress,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";

export const metadata: Metadata = {
  title: "Student Progress",
};

export default function TeacherStudentsPage() {
  const overview = getStudentProgressOverview();
  const chapters = getAllChapters();
  const completionPct = Math.round(
    (overview.completedExercises / overview.totalExercises) * 100
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        title="Student"
        accentTitle="Progress"
        description="Monitor pronunciation accuracy, chapter completion, and sounds needing focused review."
      />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <Avatar size="lg">
                <AvatarFallback className="bg-brand-orange-soft text-sm font-bold text-white">
                  AK
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <CardTitle className="text-xl">{overview.studentName}</CardTitle>
                <CardDescription>
                  {overview.totalAttempts} pronunciation attempts recorded
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="green">
                <Award aria-hidden="true" />
                {overview.averageAccuracy}% Avg Accuracy
              </Badge>
              <Badge variant="orange">
                <CheckCircle2 aria-hidden="true" />
                {overview.completedExercises}/{overview.totalExercises} Exercises
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Progress value={completionPct} aria-label="Overall student progress" />
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Overall Curriculum Completion</span>
              <span className="font-semibold text-foreground">{completionPct}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Separator />

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Target className="size-3.5 text-primary" aria-hidden="true" />
              Focus sounds:
            </span>
            {overview.focusSoundsToPractice.map((sound) => (
              <Badge key={sound} variant="coral">
                {sound}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {chapters.map((chapter) => {
              const progress = getChapterProgress(chapter);
              return (
                <div
                  key={chapter.id}
                  className="flex flex-col gap-2 rounded-[16px] border border-input bg-background/70 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Ch. {chapter.number}: {chapter.title} {chapter.accentWord}
                    </span>
                    <Badge
                      variant={
                        progress.averageScore !== null ? "green" : "outline"
                      }
                    >
                      {progress.averageScore !== null
                        ? `${progress.averageScore}%`
                        : "Not started"}
                    </Badge>
                  </div>
                  <Progress
                    value={progress.percentage}
                    aria-label={`${chapter.title} progress`}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {progress.completedCount} of {progress.totalCount} exercises
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
