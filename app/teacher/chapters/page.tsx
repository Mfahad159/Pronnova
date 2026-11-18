import { BookOpenCheck, Clock, Layers } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LEVEL_BADGE_VARIANT } from "@/features/chapters";
import { getAllChapters, getChapterLevels } from "@/lib/mock-data/curriculum";
import { DIFFICULTY_LABELS } from "@/types";

export const metadata: Metadata = {
  title: "Chapters & Exercises",
};

export default function TeacherChaptersPage() {
  const chapters = getAllChapters();

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <PageHeader
        title="Chapters &"
        accentTitle="Exercises"
        description="Review published pronunciation chapters, difficulty levels, and target sound areas."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {chapters.map((chapter) => {
          const levels = getChapterLevels(chapter);
          return (
            <Card key={chapter.id} className="gap-4 py-5">
              <CardHeader className="gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="orange">
                    Chapter {String(chapter.number).padStart(2, "0")}
                  </Badge>
                  <span className="inline-flex size-9 items-center justify-center rounded-[12px] bg-surface-peach text-brand-orange">
                    <BookOpenCheck className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <CardTitle className="text-lg">
                  {chapter.title} {chapter.accentWord}
                </CardTitle>
                <CardDescription>{chapter.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {levels.map((level) => (
                    <Badge key={level} variant={LEVEL_BADGE_VARIANT[level]}>
                      {DIFFICULTY_LABELS[level]}
                    </Badge>
                  ))}
                  {chapter.focusSounds.map((sound) => (
                    <Badge key={sound} variant="secondary">
                      {sound}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="size-3.5" aria-hidden="true" />
                    {chapter.exercises.length} exercises
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden="true" />
                    ~{chapter.estimatedMinutes} mins
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
