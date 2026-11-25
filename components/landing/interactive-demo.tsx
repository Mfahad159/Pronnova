"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  CheckCircle,
  CircleNotch,
  Info,
  Microphone,
  SpeakerHigh,
  Stop,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { LiveWaveform } from "@/features/voice/live-waveform";
import { useRecorder } from "@/features/voice/use-recorder";
import { ScorePill } from "@/features/assessment/score-pill";
import { RECORDING } from "@/lib/audio";
import { speakReference } from "@/lib/speech-tts";
import { usePracticeStore } from "@/stores/practice-store";
import { cn } from "@/lib/utils";
import { AppleIllustration } from "./illustrations";

const DEMO_STEPS = [
  { id: "listen", num: "1", label: "Listen" },
  { id: "speak", num: "2", label: "Speak" },
  { id: "assess", num: "3", label: "Assess" },
  { id: "improve", num: "4", label: "Improve" },
] as const;

/**
 * SECTION 02 — INTERACTIVE DEMO: "Experience Pronnova"
 * Self-contained landing demo reusing Pronnova's real MediaRecorder + LiveWaveform hook
 * and browser Web Speech API, paired with a clearly labelled demonstration assessment result.
 */
export function InteractiveDemo() {
  const { phase, error, elapsedMs, recording, reset } = usePracticeStore();
  const { start, stop, cancel, analyserRef } = useRecorder();

  const [ttsState, setTtsState] = useState<"idle" | "speaking" | "unsupported">("idle");
  const [hasListened, setHasListened] = useState(false);
  const [demoStage, setDemoStage] = useState<"idle" | "checking" | "done">("idle");

  // Keep practice store clean when leaving the landing page.
  useEffect(() => {
    return () => reset();
  }, [reset]);

  const effectiveStage = phase === "recorded" ? demoStage : "idle";

  const handleStart = () => {
    setDemoStage("idle");
    start();
  };

  const handleListen = () => {
    setHasListened(true);
    speakReference("Apple", {
      onStart: () => setTtsState("speaking"),
      onEnd: () => setTtsState("idle"),
      onUnsupported: () => setTtsState("unsupported"),
    });
  };

  const handleAssessDemo = () => {
    setDemoStage("checking");
    window.setTimeout(() => {
      setDemoStage("done");
    }, 650);
  };

  const handleRetry = () => {
    setDemoStage("idle");
    reset();
  };

  const activeStep =
    effectiveStage === "done"
      ? 3
      : effectiveStage === "checking" || phase === "recorded"
        ? 2
        : phase === "recording" || phase === "requesting"
          ? 1
          : hasListened
            ? 1
            : 0;

  const seconds = (elapsedMs / 1000).toFixed(1);
  const maxSec = RECORDING.maxMs / 1000;

  return (
    <section id="demo" aria-labelledby="demo-title" className="scroll-mt-24 py-12 md:py-18">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Interactive Demo · No Sign-In Required
          </p>
          <h2 id="demo-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Experience Pronnova
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Try a real microphone recording on a sample word right here—listen first, then speak out loud.
          </p>
        </div>

        {/* Application-like student practice container */}
        <div className="mt-8 overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
          {/* Top app bar + 4-step progress strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/50 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-2.5">
              <span className="inline-block size-2.5 rounded-full bg-primary" aria-hidden />
              <span className="font-heading text-sm font-semibold text-foreground">Student Practice Preview · Level: Basic</span>
            </div>
            <ol aria-label="Practice steps" className="flex flex-wrap items-center gap-2">
              {DEMO_STEPS.map((s, idx) => (
                <li
                  key={s.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    idx === activeStep
                      ? "bg-primary text-primary-foreground"
                      : idx < activeStep
                        ? "bg-score-excellent/12 text-score-excellent"
                        : "bg-card text-muted-foreground",
                  )}
                >
                  <span>{s.num}.</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-10">
            {/* Left: Illustrated Apple Flashcard + Listen control */}
            <div className="flex flex-col items-center rounded-2xl border border-primary/15 bg-tint-peach/70 p-6 text-center sm:p-8">
              <span className="rounded-lg bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                Sample Flashcard
              </span>

              <div className="mt-4 flex size-32 items-center justify-center rounded-2xl border-2 border-foreground/10 bg-card">
                <AppleIllustration className="size-24" />
              </div>

              <p className="mt-5 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Apple
              </p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">/ˈæp.əl/</p>

              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Listen to the word, then try saying it yourself.
              </p>

              <button
                type="button"
                onClick={handleListen}
                className="mt-5 inline-flex h-12 items-center gap-2.5 rounded-xl border-2 border-foreground/15 bg-card px-6 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <SpeakerHigh className={cn("size-5 text-primary", ttsState === "speaking" && "animate-pulse")} weight="duotone" aria-hidden />
                {ttsState === "speaking" ? "Playing “Apple”..." : "Listen to “Apple”"}
              </button>

              {ttsState === "unsupported" ? (
                <p role="status" className="mt-3 text-xs text-muted-foreground">
                  Browser speech playback is unavailable in this environment. Pronounce “Apple” (AP-uhl) into your mic.
                </p>
              ) : null}
            </div>

            {/* Right: Live Microphone Recording + Assessment Preview */}
            <div className="flex flex-col justify-between gap-5">
              {/* IDLE / REQUESTING */}
              {(phase === "idle" || phase === "requesting") && (
                <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-6 text-center sm:p-8">
                  <button
                    type="button"
                    disabled={phase === "requesting"}
                    onClick={handleStart}
                    aria-label="Record your pronunciation of Apple"
                    className="flex size-20 items-center justify-center rounded-full bg-brand-coral text-white shadow-[0_5px_0_0_var(--primary)] outline-none transition-[transform,box-shadow,filter] duration-150 hover:translate-y-[3px] hover:shadow-[0_2px_0_0_var(--primary)] focus-visible:ring-3 focus-visible:ring-ring/60 active:translate-y-[3px] active:shadow-[0_2px_0_0_var(--primary)] disabled:opacity-60 motion-reduce:transition-none"
                  >
                    {phase === "requesting" ? (
                      <CircleNotch className="size-8 animate-spin" weight="bold" aria-hidden />
                    ) : (
                      <Microphone className="size-8" weight="duotone" aria-hidden />
                    )}
                  </button>
                  <p className="mt-5 font-heading text-lg font-semibold text-foreground">
                    {phase === "requesting" ? "Waiting for microphone permission..." : "Tap the microphone & say “Apple”"}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Uses your real browser microphone. Audio stays on your device in this demo and is released automatically.
                  </p>
                </div>
              )}

              {/* RECORDING */}
              {phase === "recording" && (
                <div className="flex flex-col items-center rounded-2xl border-2 border-primary/40 bg-secondary/40 p-6 text-center sm:p-8">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <span className="size-2.5 animate-pulse rounded-full bg-primary" aria-hidden />
                    <span>Recording · {seconds}s / {maxSec}s</span>
                  </div>

                  <div className="mt-4 flex w-full justify-center">
                    <LiveWaveform analyserRef={analyserRef} active />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={stop}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Stop className="size-4" weight="fill" aria-hidden />
                      Stop Recording
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="inline-flex h-11 items-center rounded-xl border border-foreground/20 bg-card px-4 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ERROR (mic permission denied, silent, too short, unsupported) */}
              {phase === "error" && error && (
                <div role="alert" className="rounded-2xl border border-score-average/30 bg-score-average/5 p-6">
                  <div className="flex items-start gap-3">
                    <WarningCircle className="mt-0.5 size-5 shrink-0 text-score-average" weight="duotone" aria-hidden />
                    <div>
                      <p className="font-heading text-base font-semibold text-foreground">Could not record</p>
                      <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <ArrowCounterClockwise className="size-4" weight="bold" aria-hidden />
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RECORDED: Playback + Check Pronunciation / Processing / Demo Result */}
              {phase === "recorded" && recording && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-heading text-sm font-semibold text-foreground">
                        Your recording ({(recording.durationMs / 1000).toFixed(1)}s)
                      </p>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <ArrowCounterClockwise className="size-3.5" weight="bold" aria-hidden />
                        Re-record
                      </button>
                    </div>
                    <audio src={recording.url} controls className="mt-3 w-full" aria-label="Playback of your recording" />

                    {effectiveStage === "idle" && (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleAssessDemo}
                          className="inline-flex h-11 items-center gap-2 rounded-[0.875rem] bg-brand-coral px-6 font-heading text-sm font-semibold text-white shadow-[0_4px_0_0_var(--primary)] outline-none transition-[transform,box-shadow] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--primary)] focus-visible:ring-3 focus-visible:ring-ring/60 motion-reduce:transition-none"
                        >
                          See Sample Assessment
                        </button>
                      </div>
                    )}

                    {effectiveStage === "checking" && (
                      <p role="status" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CircleNotch className="size-4 animate-spin text-primary" weight="bold" aria-hidden />
                        Preparing demonstration assessment preview...
                      </p>
                    )}
                  </div>

                  {effectiveStage === "done" && (
                    <div className="rounded-2xl border-2 border-primary/25 bg-tint-cream/60 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          <Info className="size-3.5 text-primary" weight="duotone" aria-hidden />
                          Illustrative Demo Result (Simulated Preview)
                        </span>
                        <ScorePill score={78} />
                      </div>

                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                        <CheckCircle className="size-5 shrink-0 text-score-good" weight="duotone" aria-hidden />
                        <div>
                          <p className="font-heading text-lg font-bold text-foreground">Apple</p>
                          <p className="text-xs text-muted-foreground">Status: Good clarity · Practice focus: opening vowel /æ/</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-foreground">
                        <strong>Example feedback:</strong> “Good effort! Listen carefully to the initial vowel sound and try again.”
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        This landing preview shows a fixed example result so you can explore the workflow without logging in. Live scoring runs inside Student Practice.
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleListen}
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-foreground/15 bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <SpeakerHigh className="size-4 text-primary" weight="duotone" aria-hidden />
                          Listen Again
                        </button>
                        <button
                          type="button"
                          onClick={handleRetry}
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-foreground/15 bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <ArrowCounterClockwise className="size-4" weight="bold" aria-hidden />
                          Try Again
                        </button>
                        <Link
                          href="/onboarding"
                          className="inline-flex h-10 items-center rounded-xl bg-foreground px-4 text-xs font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          Open Full Student Practice →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
