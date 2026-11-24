import { cn } from "@/lib/utils";
import { classify, classificationLabel } from "@/lib/scoring";

const styles = {
  excellent: "bg-score-excellent/10 text-score-excellent",
  good: "bg-score-good/10 text-score-good",
  average: "bg-score-average/10 text-score-average",
} as const;

/** Score + SRS classification (Excellent ≥85, Good 70–84, Average <70). */
export function ScorePill({ score, className }: { score: number; className?: string }) {
  const c = classify(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        styles[c],
        className,
      )}
    >
      {score}%<span className="font-medium">· {classificationLabel[c]}</span>
    </span>
  );
}
