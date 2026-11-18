import { AudioLines, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Chapter, ChapterProgress } from "@/types";
import { ACCENT_COVER_CLASSES } from "./levelStyles";

export interface ChapterProgressCardProps {
  chapter: Chapter;
  progress: ChapterProgress;
}

export function ChapterProgressCard({
  chapter,
  progress,
}: ChapterProgressCardProps) {
  const coverStyle = ACCENT_COVER_CLASSES[chapter.accentTone];

  return (
    <Link href={`/student/chapters/${chapter.id}`} className="group block">
      <Card
        variant="mint"
        className="py-5 transition-all duration-150 group-hover:border-success-bar/60 group-hover:shadow-card"
      >
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span
                className={`inline-flex size-12 shrink-0 items-center justify-center rounded-[16px] shadow-xs ${coverStyle.icon}`}
              >
                <AudioLines className="size-5" aria-hidden="true" />
              </span>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-foreground group-hover:text-success-deep">
                    Chapter {chapter.number}: {chapter.title} {chapter.accentWord}
                  </h3>
                  {progress.averageScore !== null ? (
                    <Badge variant="green">Avg {progress.averageScore}%</Badge>
                  ) : (
                    <Badge variant="outline">Not Started</Badge>
                  )}
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {progress.completedCount} of {progress.totalCount} exercises practiced
                  {progress.lastPracticedLabel
                    ? ` · Last practiced ${progress.lastPracticedLabel}`
                    : ""}
                </p>
              </div>
            </div>

            <ChevronRight
              className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Progress value={progress.percentage} aria-label="Chapter completion" />
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Progress</span>
              <span className="font-semibold text-foreground">
                {progress.percentage}% Completed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
