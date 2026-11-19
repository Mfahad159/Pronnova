import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { ChaptersCatalog } from "@/features/curriculum";
import { getAllChapters } from "@/lib/mock-data/curriculum";

export const metadata: Metadata = {
  title: "Chapters",
};

export default function StudentChaptersPage() {
  const chapters = getAllChapters();

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <PageHeader
        align="center"
        title="Curriculum Chapters"
        description="Structured read-aloud practice organized by difficulty level."
      />

      <ChaptersCatalog chapters={chapters} />
    </div>
  );
}
