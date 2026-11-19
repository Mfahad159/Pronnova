import { BookOpenCheck } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllChapters } from "@/lib/mock-data/curriculum";

export const metadata: Metadata = {
  title: "Chapters",
};

export default function TeacherChaptersPage() {
  const chapters = getAllChapters();

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <PageHeader
        title="Curriculum Chapters"
        description="Published pronunciation chapters and target sounds."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="py-4">
            <CardHeader className="gap-1.5 pb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Chapter {String(chapter.number).padStart(2, "0")} · {chapter.exercises.length} exercises</span>
                <BookOpenCheck className="size-4 text-foreground/60" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">
                {chapter.title} <span className="text-accent-pink">{chapter.accentWord}</span>
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {chapter.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sounds: {chapter.focusSounds.join(" · ")}</span>
                <span>~{chapter.estimatedMinutes}m</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
