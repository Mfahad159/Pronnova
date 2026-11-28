"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowCounterClockwise, CheckCircle, Info, SpeakerHigh, Warning } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { ScorePill } from "@/features/assessment/score-pill";
import { speakReference } from "@/lib/speech-tts";
import { cn } from "@/lib/utils";

/**
 * SECTION 06 — PRONUNCIATION ASSESSMENT: "Understand Every Attempt"
 * Analytical, structured assessment preview clearly explaining Speech Recognition vs.
 * Pronunciation Assessment and displaying an illustrative sample output for "Apple" (78/100).
 */
export function AssessmentShowcase() {
  const [speaking, setSpeaking] = useState(false);

  const handleListen = () => {
    speakReference("Apple", {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <section id="assessment" aria-labelledby="assessment-title" className="scroll-mt-24 bg-muted/50 py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <LandingSectionHeader
          id="assessment-title"
          lead="Understand"
          accent="Every Attempt"
          subtitle="Pronnova does more than convert speech to text—evaluating how clearly each expected word was spoken."
        />

        <div className="mt-10 grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
          {/* Left: Technical explanation */}
          <div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Speech recognition tells you <em>what</em> was said—pronunciation assessment evaluates <em>how clearly</em> the expected word was spoken.
            </p>

            <dl className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="font-heading text-sm font-bold text-foreground">Expected vs. Spoken Comparison</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                Attempts are scored against the curriculum target word or sentence on a 0–100 scale (Excellent ≥85, Good 70–84, Average &lt;70).
              </dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="font-heading text-sm font-bold text-foreground">Actionable Improvement Guidance</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                Instead of a bare number, students see which words need practice and a clear suggestion to guide their next attempt.
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: Structured, application-like result panel */}
        <div className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-6 py-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Info className="size-4 text-primary" weight="duotone" aria-hidden />
              Illustrative Assessment Result
            </span>
            <ScorePill score={78} />
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            {/* Target vs Attempt summary */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">Expected Word</p>
                <p className="mt-1 font-heading text-2xl font-bold text-foreground">Apple</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-medium text-muted-foreground">Recognized Attempt (Sample)</p>
                <p className="mt-1 inline-flex items-center gap-2 font-heading text-2xl font-bold text-score-good">
                  <CheckCircle className="size-5 shrink-0" weight="duotone" aria-hidden />
                  “Apple”
                </p>
              </div>
            </div>

            {/* Overall accuracy bar */}
            <div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Illustrative Overall Score</span>
                <span className="tabular-nums text-score-good">78 / 100 · Good</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={78}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Illustrative overall score 78 out of 100"
                className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted"
              >
                <div className="h-full w-[78%] rounded-full bg-score-good" />
              </div>
            </div>

            {/* Word & issue breakdown (no color-only reliance) */}
            <div className="space-y-2.5 rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Supported Feedback Breakdown (Illustrative)
              </p>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-card px-3.5 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle className="size-4 text-score-excellent" weight="duotone" aria-hidden />
                  Ending syllable (-ple)
                </span>
                <span className="rounded-full bg-score-excellent/10 px-2.5 py-0.5 text-xs font-semibold text-score-excellent">
                  Clear
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg bg-card px-3.5 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <Warning className="size-4 text-score-good" weight="duotone" aria-hidden />
                  Initial vowel sound (/æ/)
                </span>
                <span className="rounded-full bg-score-good/10 px-2.5 py-0.5 text-xs font-semibold text-score-good">
                  Needs practice
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4 text-sm text-foreground">
              <p className="font-semibold text-primary">Example Feedback</p>
              <p className="mt-1">“Good effort! Listen carefully to the initial vowel sound and try again.”</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleListen}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/15 bg-background px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
              >
                <SpeakerHigh className={cn("size-4 text-primary", speaking && "animate-pulse")} weight="duotone" aria-hidden />
                {speaking ? "Playing Reference..." : "Play Reference Pronunciation"}
              </button>
              <Link
                href="/#demo"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring"
              >
                <ArrowCounterClockwise className="size-3.5" weight="bold" aria-hidden />
                Try This Word in Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
