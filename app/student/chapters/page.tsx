import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { ChaptersCatalog } from "@/features/chapters";
import { getAllChapters } from "@/lib/mock-data/curriculum";

export const metadata: Metadata = {
  title: "Chapters",
};

export default function StudentChaptersPage() {
  const chapters = getAllChapters();

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        align="center"
        title="Pronunciation"
        accentTitle="Chapters & Levels"
        description="Structured read-aloud practice organized into Basic, Medium, and Advanced levels for clear spoken English."
      />

      <ChaptersCatalog chapters={chapters} />
    </div>
  );
}
