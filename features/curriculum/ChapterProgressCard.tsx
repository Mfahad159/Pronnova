import { AudioLines, ChevronRight } from "lucide-react";
import Link from "next/link";
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
        className="py-4 transition-all duration-150 hover:border-foreground/20"
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl ${coverStyle.icon}`}
              >
                <AudioLines className="size-4" aria-hidden="true" />
              </span>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    Chapter {chapter.number}: {chapter.title} {chapter.accentWord}
                  </h3>
                  {progress.averageScore !== null ? (
                    <span className="text-xs font-medium text-success">
                      {progress.averageScore}%
                    </span>
                  ) : null}
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  {progress.completedCount} of {progress.totalCount} completed
                </p>
              </div>
            </div>

            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>

          <Progress value={progress.percentage} aria-label="Chapter completion" className="h-1.5" />
        </CardContent>
      </Card>
    </Link>
  );
}
