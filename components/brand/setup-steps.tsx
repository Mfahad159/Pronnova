"use client";

import { Fragment } from "react";
import { MotionConfig, motion } from "motion/react";
import { ease } from "@animate-ui/react/utils/motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** The path from "Get started" to the student dashboard. Teachers go from step 1 to their dashboard. */
const STEPS = ["Choose role", "Pick class", "Find your name", "Start"] as const;

export type SetupStep = 0 | 1 | 2 | 3;

/**
 * Setup progress above role selection and the "Who are you?" picker, in the landing demo's pill
 * style: "1. Choose role — 2. Pick class — …". The current step is a filled coral pill that glides
 * to the next step (shared layoutId); done steps get a check. `finished` ticks the last step just
 * before the dashboard opens.
 */
export function SetupSteps({ current, finished = false, className }: { current: SetupStep; finished?: boolean; className?: string }) {
  const at = finished ? STEPS.length - 1 : current;
  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Setup progress" className={className}>
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5 sm:gap-x-3">
          {STEPS.map((label, i) => {
            const active = i === at;
            const done = finished || i < current;
            return (
              <Fragment key={label}>
                <li
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 sm:text-sm",
                    active ? "border-transparent text-primary-foreground" : "border-foreground/15 bg-card text-foreground/80",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="setup-step-pill"
                      aria-hidden
                      className="absolute inset-0 -m-px rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <span className="relative inline-flex items-center gap-1.5">
                    {done ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, ease: ease.out }} className="inline-flex">
                        <Check className={cn("size-3.5", active ? "text-primary-foreground" : "text-score-excellent")} strokeWidth={3} aria-hidden />
                      </motion.span>
                    ) : null}
                    {i + 1}. {label}
                    {done ? <span className="sr-only"> (done)</span> : null}
                  </span>
                </li>
                {i < STEPS.length - 1 ? <li aria-hidden className="h-px w-4 bg-foreground/15 sm:w-6" /> : null}
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </MotionConfig>
  );
}
