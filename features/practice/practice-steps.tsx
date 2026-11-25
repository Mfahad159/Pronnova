"use client";

import { cn } from "@/lib/utils";
import { usePracticeStore } from "@/stores/practice-store";

const STEPS = ["Listen", "Record", "Check", "Result"] as const;

/** Step chips in the practice panel header (landing demo header strip). */
export function PracticeSteps() {
  const phase = usePracticeStore((s) => s.phase);
  const active =
    phase === "scored" || phase === "failed"
      ? 3
      : phase === "recorded" || phase === "submitting"
        ? 2
        : phase === "recording" || phase === "requesting"
          ? 1
          : 0;
  return (
    <ol aria-label="Practice steps" className="flex flex-wrap items-center gap-2">
      {STEPS.map((label, i) => (
        <li
          key={label}
          aria-current={i === active ? "step" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
            i === active
              ? "bg-primary text-primary-foreground"
              : i < active
                ? "bg-score-excellent/12 text-score-excellent"
                : "bg-card text-muted-foreground",
          )}
        >
          <span>{i + 1}.</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}
