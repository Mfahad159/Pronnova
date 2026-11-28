"use client";

import { useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { ease } from "@animate-ui/react/utils/motion";
import { ArrowCounterClockwise, CheckCircle, Info, SpeakerHigh, Target, Warning } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { ScorePill } from "@/features/assessment/score-pill";
import { speakReference } from "@/lib/speech-tts";
import { cn } from "@/lib/utils";

const points = [
  {
    Icon: Target,
    title: "Checked against the target",
    text: "Every attempt is scored 0–100 against the expected word: Excellent, Good or Average.",
  },
  {
    Icon: ArrowCounterClockwise,
    title: "A clear next step",
    text: "Students see which sound to practise and get one simple tip for the next try.",
  },
] as const;

const sounds = [
  { label: "Ending “-ple”", status: "Clear", ok: true },
  { label: "First vowel /æ/", status: "Practise", ok: false },
] as const;

const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-80px" } } as const;

/**
 * SECTION 06 — PRONUNCIATION ASSESSMENT: "Understand Every Attempt"
 * Short copy (speech recognition = what was said, Pronnova = how clearly) + a clearly labelled
 * SAMPLE result for "Apple". Motion: the score counts up and its bar fills when it scrolls into
 * view; feedback rows slide in one after another (Animate UI CountingNumber + motion).
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
    <MotionConfig reducedMotion="user">
      <section id="assessment" aria-labelledby="assessment-title" className="scroll-mt-24 bg-muted/50 py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <LandingSectionHeader
            id="assessment-title"
            lead="Understand"
            accent="Every Attempt"
            subtitle="Pronnova checks how clearly each word was spoken, not just what was said."
          />

          <div className="mt-10 grid items-center gap-10 md:grid-cols-[0.95fr_1.05fr]">
            {/* Left: the idea in one line + two short points */}
            <div>
              <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                Speech recognition hears <em>what</em> was said. Pronnova checks <em>how clearly</em> it was said.
              </p>
              <motion.dl {...inView} variants={{ show: { transition: { staggerChildren: 0.12 } } }} className="mt-6 space-y-4">
                {points.map(({ Icon, title, text }) => (
                  <motion.div
                    key={title}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: ease.out } } }}
                    className="flex gap-3.5 rounded-2xl border-2 border-foreground/10 bg-card p-4"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint-peach text-primary">
                      <Icon className="size-5" weight="duotone" aria-hidden />
                    </span>
                    <div>
                      <dt className="font-heading text-sm font-bold text-foreground">{title}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
                    </div>
                  </motion.div>
                ))}
              </motion.dl>
            </div>

            {/* Right: sample result panel */}
            <div className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-6 py-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Info className="size-4 text-primary" weight="duotone" aria-hidden />
                  Sample result
                </span>
                <ScorePill score={78} />
              </div>

              <div className="space-y-5 p-6 sm:p-7">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Target word</p>
                    <p className="mt-1 font-heading text-2xl font-bold text-foreground">Apple</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs font-medium text-muted-foreground">Heard</p>
                    <p className="mt-1 inline-flex items-center gap-2 font-heading text-2xl font-bold text-score-good">
                      <CheckCircle className="size-5 shrink-0" weight="duotone" aria-hidden />
                      “Apple”
                    </p>
                  </div>
                </div>

                {/* Score: counts up + bar fills when visible */}
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Score</span>
                    <span className="tabular-nums text-score-good">
                      <CountingNumber number={78} inView inViewOnce transition={{ stiffness: 60, damping: 20 }} aria-hidden /> / 100 · Good
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={78}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Sample score 78 out of 100"
                    className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      whileInView={{ width: "78%" }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1.1, ease: ease.out }}
                      className="h-full rounded-full bg-score-good"
                    />
                  </div>
                </div>

                {/* Sounds: slide in one by one */}
                <motion.div {...inView} variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }} className="space-y-2.5 rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold text-muted-foreground">Sounds</p>
                  {sounds.map((s) => (
                    <motion.div
                      key={s.label}
                      variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: ease.out } } }}
                      className="flex items-center justify-between gap-3 rounded-lg bg-card px-3.5 py-2.5 text-sm"
                    >
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        {s.ok ? (
                          <CheckCircle className="size-4 text-score-excellent" weight="duotone" aria-hidden />
                        ) : (
                          <Warning className="size-4 text-score-good" weight="duotone" aria-hidden />
                        )}
                        {s.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          s.ok ? "bg-score-excellent/10 text-score-excellent" : "bg-score-good/10 text-score-good",
                        )}
                      >
                        {s.status}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4 text-sm text-foreground">
                  <p className="font-semibold text-primary">Tip</p>
                  <p className="mt-1">“Good try! Listen to the first sound, then say it again.”</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleListen}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-foreground/15 bg-background px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
                  >
                    <SpeakerHigh className={cn("size-4 text-primary", speaking && "animate-pulse")} weight="duotone" aria-hidden />
                    {speaking ? "Playing…" : "Hear “Apple”"}
                  </button>
                  <Link
                    href="/#demo"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring"
                  >
                    <ArrowCounterClockwise className="size-3.5" weight="bold" aria-hidden />
                    Try it in the demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
