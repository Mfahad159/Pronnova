import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { levelBadge } from "@/components/brand/ui";
import { levelLabel } from "@/features/curriculum/level";
import type { ChapterView } from "@/lib/progress";
import type { Chapter } from "@/types";

const tints: Record<Chapter["tint"], string> = {
  peach: "bg-tint-peach",
  sky: "bg-tint-sky",
  mint: "bg-tint-mint",
  cream: "bg-tint-cream",
};

/** Illustrated chapter tile in the landing's learning-journey card style + the student's stage. */
export function ChapterCard({ chapter, progress }: { chapter: Chapter; progress?: ChapterView }) {
  const pct = progress && progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0;
  const done = !!progress && progress.total > 0 && !progress.currentLevel;
  const stage = !progress
    ? null
    : progress.total === 0
      ? "No words yet"
      : done
        ? "All done! 🎉"
        : `${progress.mastered}/${progress.total} words done`;
  return (
    <Link
      href={`/student/chapters/${chapter.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border-2 border-foreground/12 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        tints[chapter.tint],
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-foreground/10">
        <Image
          src={chapter.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 260px, 45vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span className="absolute top-2.5 left-2.5 rounded-full bg-card px-2.5 py-0.5 text-xs font-bold text-primary">
          Ch. {chapter.orderNo}
        </span>
        {progress?.currentLevel ? (
          <span
            className={cn(
              "absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
              levelBadge[progress.currentLevel],
            )}
          >
            {levelLabel[progress.currentLevel]}
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        <span className="block font-heading text-lg leading-tight font-bold">{chapter.title}</span>
        {stage ? (
          <div className="space-y-1.5">
            <div
              className="h-2.5 overflow-hidden rounded-full border border-foreground/10 bg-card"
              role="progressbar"
              aria-label={`${chapter.title} progress`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-score-excellent" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs font-semibold text-foreground/70">{stage}</p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
