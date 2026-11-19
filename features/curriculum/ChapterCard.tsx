import { ArrowRight, AudioLines } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getChapterProgress } from "@/lib/mock-data/curriculum";
import type { Chapter } from "@/types";
import { ACCENT_COVER_CLASSES } from "./levelStyles";

export interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const progress = getChapterProgress(chapter);
  const coverStyle = ACCENT_COVER_CLASSES[chapter.accentTone];

  return (
    <Card className="overflow-hidden py-0 transition-all duration-150 hover:border-foreground/20">
      <div className={`relative flex h-28 items-center justify-between p-4 ${coverStyle.surface}`}>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Chapter {String(chapter.number).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">
            {chapter.exercises.length} exercises · ~{chapter.estimatedMinutes}m
          </span>
        </div>

        <span
          className={`inline-flex size-9 items-center justify-center rounded-xl shadow-xs ${coverStyle.icon}`}
        >
          <AudioLines className="size-4" aria-hidden="true" />
        </span>
      </div>

      <CardHeader className="gap-1.5 pt-4">
        <CardTitle className="text-base line-clamp-1">
          {chapter.title} <span className="text-accent-pink">{chapter.accentWord}</span>
        </CardTitle>
        <CardDescription className="line-clamp-1">
          {chapter.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-end pt-1">
        {progress.completedCount > 0 ? (
          <div className="flex flex-col gap-1">
            <Progress value={progress.percentage} aria-label="Chapter progress" className="h-1.5" />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{progress.completedCount}/{progress.totalCount} completed</span>
              <span className="font-medium text-foreground">{progress.percentage}%</span>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            Sounds: {chapter.focusSounds.join(" · ")}
          </span>
        )}
      </CardContent>

      <CardFooter className="pb-4 pt-1">
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={`/student/chapters/${chapter.id}`}>
            {progress.completedCount > 0 ? "Continue" : "Start"}
            <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
