import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { TeacherStudentProgressList } from "@/features/teacher";
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
  const chaptersWithProgress = chapters.map((chapter) => ({
    chapter,
    progress: getChapterProgress(chapter),
  }));

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <PageHeader
        title="Student Progress"
        description="Student accuracy rates and chapter completion records."
      />

      <TeacherStudentProgressList
        overview={overview}
        chaptersWithProgress={chaptersWithProgress}
      />
    </div>
  );
}
