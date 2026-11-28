"use client";

import { useEffect, useState } from "react";
import {
  ArrowCounterClockwise,
  CircleNotch,
  SpeakerHigh,
  Stop,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { AppleIllustration } from "@/components/brand/illustrations";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { OutlineButton, Panel } from "@/components/brand/ui";
import { MicCursor } from "@/features/voice/mic-cursor";
import { MicStage, type MicStatus } from "@/features/voice/mic-status";
import { useRecorder } from "@/features/voice/use-recorder";
import { RECORDING } from "@/lib/audio";
import { playReference } from "@/features/practice/reference-audio";
import { DemoResult, saveDemoTry, type DemoScore } from "@/components/landing/demo-result";
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
 * the dotted-orb recorder on the right, and below it a LIVE check by the Pronnova engine
 * (POST /api/demo/score). Nothing is stored on the server; the last tries stay in localStorage.
 */
export function InteractiveDemo() {
  const { phase, error, elapsedMs, recording, reset } = usePracticeStore();
  const { start, stop, cancel } = useRecorder();

  const [ttsState, setTtsState] = useState<"idle" | "speaking" | "unsupported">("idle");
  const [hasListened, setHasListened] = useState(false);
  // Live check with the real engine (POST /api/demo/score). Nothing is stored on the server.
  const [demoStage, setDemoStage] = useState<"idle" | "checking" | "done" | "rejected" | "failed">("idle");
  const [demoResult, setDemoResult] = useState<DemoScore | null>(null);
  const [demoError, setDemoError] = useState("");

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
    playReference("Apple", "normal", {
      onStart: () => setTtsState("speaking"),
      onEnd: () => setTtsState("idle"),
      onUnsupported: () => setTtsState("unsupported"),
    });
  };

  const handleAssessDemo = async () => {
    if (!recording) return;
    setDemoStage("checking");
    setDemoError("");
    const fd = new FormData();
    fd.append("audio", recording.blob, `demo.${recording.mime.includes("mp4") ? "m4a" : "webm"}`);
    fd.append("durationMs", String(Math.round(recording.durationMs)));
    try {
      const res = await fetch("/api/demo/score", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as Partial<DemoScore> & { status?: string; error?: string };
      if (res.ok && data.status === "scored") {
        const result = data as DemoScore;
        setDemoResult(result);
        setDemoStage("done");
        saveDemoTry({ at: new Date().toISOString(), score: result.score, classification: result.classification });
      } else if (res.status === 503) {
        setDemoStage("failed"); // engine off or slow: the same recording can be checked again
        setDemoError(data.error ?? "The speech checker isn't available right now.");
      } else {
        setDemoStage("rejected"); // unclear audio or unusable recording: record again
        setDemoError(data.error ?? "We couldn't hear you clearly. Try again.");
      }
    } catch {
      setDemoStage("failed");
      setDemoError("No connection. Your recording is still here — try checking again.");
    }
  };

  const handleRetry = () => {
    setDemoStage("idle");
    setDemoResult(null);
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
  // One mic state for the status pill and the cursor tag.
  const micStatus: MicStatus = isRequesting
    ? "requesting"
    : isRecording
      ? "listening"
      : phase === "error"
        ? "off"
        : effectiveStage === "checking"
          ? "processing"
          : phase === "recorded"
            ? "done"
            : "ready";
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

            {/* Right half: Voice Orb (Animate UI cursor shows the mic state while the pointer is here) */}
            <div className="relative flex flex-col items-center justify-center px-6 py-9 text-center sm:px-10 sm:py-12">
              <MicCursor status={micStatus} />
              {/* The dotted thinking-orb is the mic: tap it to record; its animation shows the state.
                  Below it: the state text, the time while recording, and a short hint. */}
              <MicStage
                status={micStatus}
                onStart={isRecording ? undefined : handleStart}
                startLabel="Tap the orb to record Apple"
                time={isRecording ? `${seconds}s / ${maxSec}s` : undefined}
                hint={
                  isRecording || phase === "error"
                    ? undefined
                    : isRequesting
                      ? "Say yes when your browser asks."
                      : "Say “Apple” after you tap. Audio stays on your device in this demo."
                }
              />

              {/* Stop / Cancel row keeps its height when hidden, so the orb never shifts between states. */}
              <div className="mt-2 flex h-10 items-center justify-center gap-3">
                {isRecording ? (
                  <>
                    <button
                      type="button"
                      onClick={stop}
                      aria-pressed
                      aria-label="Stop recording"
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 font-heading text-xs font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      <Stop className="size-3.5" weight="fill" aria-hidden />
                      Stop
                    </button>
                    <button
                      type="button"
                      onClick={cancel}
                      className="inline-flex h-10 items-center rounded-xl border border-foreground/20 bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      Cancel
                    </button>
                  </>
                ) : null}
              </div>

              {phase === "error" && error ? (
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
              ) : null}
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
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ArrowCounterClockwise className="size-3.5" weight="bold" aria-hidden />
                      Re-record
                    </button>
                  </div>
                  <audio src={recording.url} controls className="w-full max-w-md" aria-label="Playback of your recording" />
                </div>

                {effectiveStage === "idle" ? (
                  <KiddyButton onClick={handleAssessDemo} size="md">
                    Check my pronunciation
                  </KiddyButton>
                ) : effectiveStage === "checking" ? (
                  <p role="status" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CircleNotch className="size-4 animate-spin text-primary" weight="bold" aria-hidden />
                    Checking your pronunciation…
                  </p>
                ) : null}
              </div>

              {/* Unclear audio (no score) or the speech checker is off (check the SAME recording again). */}
              {effectiveStage === "rejected" || effectiveStage === "failed" ? (
                <div role="alert" className="mt-5 rounded-2xl border border-score-average/30 bg-score-average/5 p-4">
                  <p className="inline-flex items-center gap-1.5 font-heading text-base font-semibold text-foreground">
                    <WarningCircle className="size-5 shrink-0 text-score-average" weight="duotone" aria-hidden />
                    {effectiveStage === "rejected" ? "We couldn't hear you clearly" : "Couldn't check it yet"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{demoError}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {effectiveStage === "failed" ? (
                      <OutlineButton onClick={handleAssessDemo}>
                        <ArrowCounterClockwise weight="bold" aria-hidden /> Check again
                      </OutlineButton>
                    ) : null}
                    <OutlineButton onClick={handleRetry}>Record again</OutlineButton>
                  </div>
                </div>
              ) : null}

              {effectiveStage === "done" && demoResult ? <DemoResult result={demoResult} onTryAgain={handleRetry} /> : null}
            </div>
          ) : null}
        </Panel>
      </div>
    </section>
  );
}
