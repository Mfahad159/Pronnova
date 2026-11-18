import { ArrowRight, AudioLines, Clock, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { getChapterLevels, getChapterProgress } from "@/lib/mock-data/curriculum";
import { DIFFICULTY_LABELS, type Chapter } from "@/types";
import { ACCENT_COVER_CLASSES, LEVEL_BADGE_VARIANT } from "./levelStyles";

export interface ChapterCardProps {
  chapter: Chapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const levels = getChapterLevels(chapter);
  const progress = getChapterProgress(chapter);
  const coverStyle = ACCENT_COVER_CLASSES[chapter.accentTone];

  return (
    <Card className="overflow-hidden py-0 transition-transform duration-150 hover:-translate-y-0.5">
      <div
        className={`relative flex h-40 flex-col justify-between p-5 ${coverStyle.surface}`}
      >
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={`border-transparent shadow-xs ${coverStyle.badge}`}>
            Chapter {String(chapter.number).padStart(2, "0")}
          </Badge>
          <span
            className={`inline-flex size-10 items-center justify-center rounded-[14px] shadow-sm ${coverStyle.icon}`}
          >
            <AudioLines className="size-5" aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {chapter.focusSounds.map((sound) => (
            <Badge
              key={sound}
              variant="outline"
              className="border-transparent bg-card/85 text-[11px] text-foreground backdrop-blur-xs"
            >
              {sound}
            </Badge>
          ))}
        </div>
      </div>

      <CardHeader className="gap-3 pt-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {levels.map((level) => (
            <Badge key={level} variant={LEVEL_BADGE_VARIANT[level]}>
              {DIFFICULTY_LABELS[level]}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-lg">
          {chapter.title}{" "}
          <span className="text-accent-pink">{chapter.accentWord}</span>
        </CardTitle>
        <CardDescription>{chapter.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>{chapter.estimatedMinutes} mins</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5" aria-hidden="true" />
            <span>{chapter.exercises.length} exercises</span>
          </span>
        </div>

        {progress.completedCount > 0 ? (
          <div className="flex flex-col gap-1.5">
            <Progress value={progress.percentage} aria-label="Chapter progress" />
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                {progress.completedCount} of {progress.totalCount} practiced
              </span>
              <span className="font-semibold text-foreground">
                {progress.percentage}%
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="pb-5">
        <Button asChild className="w-full">
          <Link href={`/student/chapters/${chapter.id}`}>
            {progress.completedCount > 0 ? "Continue Chapter" : "Open Chapter"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
