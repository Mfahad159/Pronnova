"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Info,
  Microphone,
  SpeakerHigh,
  Stop,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { AppleIllustration } from "@/components/brand/illustrations";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { OutlineButton, Panel } from "@/components/brand/ui";
import { ScorePill } from "@/features/assessment/score-pill";
import { LiveWaveform } from "@/features/voice/live-waveform";
import { useRecorder } from "@/features/voice/use-recorder";
import { RECORDING } from "@/lib/audio";
import { speakReference } from "@/lib/speech-tts";
import { cn } from "@/lib/utils";
import { usePracticeStore } from "@/stores/practice-store";

const DEMO_STEPS = [
  { id: "listen", num: "1", label: "Listen" },
  { id: "speak", num: "2", label: "Speak" },
  { id: "assess", num: "3", label: "Assess" },
  { id: "improve", num: "4", label: "Improve" },
] as const;

/**
 * SECTION 02 — INTERACTIVE DEMO: "Experience Pronnova"
 * Cardless single-row layout inside one clean Panel: illustrated target word on the left,
 * interactive Voice Orb recorder on the right, and a clearly labelled demonstration assessment below.
 */
export function InteractiveDemo() {
  const { phase, error, elapsedMs, recording, reset } = usePracticeStore();
  const { start, stop, cancel, analyserRef } = useRecorder();

  const [ttsState, setTtsState] = useState<"idle" | "speaking" | "unsupported">("idle");
  const [hasListened, setHasListened] = useState(false);
  const [demoStage, setDemoStage] = useState<"idle" | "checking" | "done">("idle");

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

  const isRecording = phase === "recording";
  const isRequesting = phase === "requesting";
  const seconds = (elapsedMs / 1000).toFixed(1);
  const maxSec = RECORDING.maxMs / 1000;

  return (
    <section id="demo" aria-labelledby="demo-title" className="scroll-mt-24 py-12 md:py-18">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <LandingSectionHeader
          id="demo-title"
          lead="Experience"
          accent="Pronnova"
          subtitle="Try a real microphone recording on a sample word right here—listen first, then speak out loud."
        />

        {/* Centered 4-step indicator */}
        <ol aria-label="Practice steps" className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {DEMO_STEPS.map((s, idx) => (
            <li key={s.id} className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  idx === activeStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : idx < activeStep
                      ? "border-score-excellent/25 bg-score-excellent/12 text-score-excellent"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </span>
              {idx < DEMO_STEPS.length - 1 ? (
                <span aria-hidden className="hidden h-px w-4 bg-border sm:inline-block" />
              ) : null}
            </li>
          ))}
        </ol>

        <Panel className="mt-6">
          {/* Single clean row: Word & Listen on left, Voice Orb on right — no nested card boxes */}
          <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            {/* Left half: Apple + Listen */}
            <div className="flex flex-col items-center justify-center px-6 py-9 text-center sm:px-10 sm:py-12">
              <div className="flex size-28 items-center justify-center rounded-full bg-tint-peach">
                <AppleIllustration className="size-20" />
              </div>

              <p className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Apple
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">/ˈæp.əl/</p>

              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Listen to the word, then try saying it yourself.
              </p>

              <OutlineButton onClick={handleListen} className="mt-5">
                <SpeakerHigh
                  className={cn("text-primary", ttsState === "speaking" && "animate-pulse")}
                  weight="duotone"
                  aria-hidden
                />
                {ttsState === "speaking" ? "Playing “Apple”..." : "Listen to “Apple”"}
              </OutlineButton>

              {ttsState === "unsupported" ? (
                <p role="status" className="mt-3 max-w-xs text-xs text-muted-foreground">
                  Browser speech playback is unavailable here. Say “Apple” (AP-uhl) into your mic.
                </p>
              ) : null}
            </div>

            {/* Right half: Voice Orb */}
            <div className="flex flex-col items-center justify-center px-6 py-9 text-center sm:px-10 sm:py-12">
              {/* Interactive Voice Orb */}
              <div className="relative flex size-36 items-center justify-center">
                {/* Outer ambient/pulse ring */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 rounded-full transition-transform duration-300 motion-reduce:animate-none",
                    isRecording
                      ? "animate-ping bg-brand-coral/20"
                      : "bg-tint-peach/90",
                  )}
                />
                {/* Middle glow ring */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-3 rounded-full transition-colors",
                    isRecording ? "bg-brand-coral/30" : "bg-brand-coral/15",
                  )}
                />

                <button
                  type="button"
                  disabled={isRequesting}
                  onClick={isRecording ? stop : handleStart}
                  aria-pressed={isRecording}
                  aria-label={isRecording ? "Stop recording" : "Tap the orb to record Apple"}
                  className={cn(
                    "relative z-10 flex size-22 items-center justify-center rounded-full bg-gradient-to-br from-brand-coral to-chart-1 text-white outline-none transition-transform duration-150 hover:scale-105 focus-visible:ring-4 focus-visible:ring-ring/60 active:scale-95 disabled:opacity-60 motion-reduce:transition-none",
                    isRecording && "from-destructive to-primary",
                  )}
                >
                  {isRequesting ? (
                    <CircleNotch className="size-8 animate-spin" weight="bold" aria-hidden />
                  ) : isRecording ? (
                    <Stop className="size-8" weight="fill" aria-hidden />
                  ) : (
                    <Microphone className="size-9" weight="duotone" aria-hidden />
                  )}
                </button>
              </div>

              {isRecording ? (
                <div className="mt-3 flex w-full max-w-xs flex-col items-center gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
                    Recording · {seconds}s / {maxSec}s
                  </p>
                  <LiveWaveform analyserRef={analyserRef} active />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={stop}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 font-heading text-xs font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Stop className="size-3.5" weight="fill" aria-hidden />
                      Stop
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="inline-flex h-10 items-center rounded-xl border border-foreground/20 bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : phase === "error" && error ? (
                <div role="alert" className="mt-3 max-w-xs space-y-3">
                  <p className="inline-flex items-center gap-1.5 font-heading text-base font-semibold text-score-average">
                    <WarningCircle className="size-5 shrink-0" weight="duotone" aria-hidden />
                    Could not record
                  </p>
                  <p className="text-sm text-muted-foreground">{error.message}</p>
                  <OutlineButton onClick={handleRetry}>
                    <ArrowCounterClockwise weight="bold" aria-hidden />
                    Try Again
                  </OutlineButton>
                </div>
              ) : (
                <>
                  <p className="mt-4 font-heading text-lg font-semibold text-foreground">
                    {isRequesting
                      ? "Waiting for microphone permission..."
                      : phase === "recorded"
                        ? "Recording captured — tap orb to re-record"
                        : "Tap the orb & say “Apple”"}
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                    Uses your real browser microphone. Audio stays on your device in this demo and is released automatically.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Recorded playback & illustrative demo assessment strip */}
          {phase === "recorded" && recording ? (
            <div className="border-t border-border bg-tint-cream/40 px-6 py-6 sm:px-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-heading text-sm font-semibold text-foreground">
                      Your recording ({(recording.durationMs / 1000).toFixed(1)}s)
                    </p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <ArrowCounterClockwise className="size-3.5" weight="bold" aria-hidden />
                      Re-record
                    </button>
                  </div>
                  <audio src={recording.url} controls className="w-full max-w-md" aria-label="Playback of your recording" />
                </div>

                {effectiveStage === "idle" ? (
                  <KiddyButton onClick={handleAssessDemo} size="md">
                    See Sample Assessment
                  </KiddyButton>
                ) : effectiveStage === "checking" ? (
                  <p role="status" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CircleNotch className="size-4 animate-spin text-primary" weight="bold" aria-hidden />
                    Preparing demonstration assessment preview...
                  </p>
                ) : null}
              </div>

              {effectiveStage === "done" ? (
                <div className="mt-5 border-t border-border/70 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                        <Info className="size-3.5 text-primary" weight="duotone" aria-hidden />
                        Illustrative Demo Result (Simulated Preview)
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <CheckCircle className="size-4 text-score-good" weight="duotone" aria-hidden />
                        Apple · Practice focus: opening vowel /æ/
                      </span>
                    </div>
                    <ScorePill score={78} />
                  </div>

                  <p className="mt-3 text-sm text-foreground">
                    <strong>Example feedback:</strong> “Good effort! Listen carefully to the initial vowel sound and try again.”{" "}
                    <span className="text-muted-foreground">
                      (Fixed sample preview — live AI scoring runs inside Student Practice.)
                    </span>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <OutlineButton onClick={handleListen}>
                      <SpeakerHigh className="text-primary" weight="duotone" aria-hidden />
                      Listen Again
                    </OutlineButton>
                    <OutlineButton onClick={handleRetry}>
                      <ArrowCounterClockwise weight="bold" aria-hidden />
                      Try Again
                    </OutlineButton>
                    <Link
                      href="/onboarding"
                      className="group/arrow inline-flex h-11 items-center gap-1.5 rounded-xl bg-foreground px-5 font-heading text-sm font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Open Full Student Practice
                      <ArrowRight className="size-4 transition-transform group-hover/arrow:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
