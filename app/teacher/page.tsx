import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  TeacherMetricsGrid,
  TeacherRecentActivity,
} from "@/features/teacher";
import {
  getAllChapters,
  getAllExercises,
  getRecentAttempts,
  getStudentProgressOverview,
} from "@/lib/mock-data/curriculum";

export default function TeacherOverviewPage() {
  const chapters = getAllChapters();
  const exercises = getAllExercises();
  const recentAttempts = getRecentAttempts();
  const overview = getStudentProgressOverview();

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <PageHeader
        title="Teacher Dashboard"
        description="Class performance metrics and curriculum oversight."
        action={
          <Button asChild size="sm">
            <Link href="/teacher/chapters">
              Chapters
              <ArrowRight data-icon="inline-end" aria-hidden="true" className="size-3.5 ml-1" />
            </Link>
          </Button>
        }
      />

      <TeacherMetricsGrid
        chapters={chapters}
        exercises={exercises}
        recentAttempts={recentAttempts}
        overview={overview}
      />

      <TeacherRecentActivity
        recentAttempts={recentAttempts}
        studentName={overview.studentName}
      />
    </div>
  );
}
