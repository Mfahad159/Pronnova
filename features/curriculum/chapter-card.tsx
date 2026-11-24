import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { levelLabel } from "@/features/curriculum/level";
import type { ChapterView } from "@/lib/progress";
import type { Chapter } from "@/types";

const tints: Record<Chapter["tint"], string> = {
  peach: "bg-tint-peach",
  sky: "bg-tint-sky",
  mint: "bg-tint-mint",
  cream: "bg-tint-cream",
};

/** Illustrated chapter tile (the reference's category tiles, with our kids art) + the student's stage. */
export function ChapterCard({ chapter, progress }: { chapter: Chapter; progress?: ChapterView }) {
  const pct = progress && progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0;
  const stage = !progress
    ? null
    : progress.total === 0
      ? "No exercises yet"
      : progress.currentLevel
        ? `${levelLabel[progress.currentLevel]} · ${progress.mastered}/${progress.total} done`
        : "Completed 🎉";
  return (
    <Link
      href={`/student/chapters/${chapter.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border outline-none transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
        tints[chapter.tint],
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={chapter.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 260px, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-heading font-semibold">{chapter.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground">Ch. {chapter.orderNo}</span>
        </div>
        {stage ? (
          <div className="space-y-1">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
              role="progressbar"
              aria-label={`${chapter.title} progress`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-score-excellent" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{stage}</p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
