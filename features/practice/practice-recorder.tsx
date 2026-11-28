"use client";

import { useEffect, useState } from "react";
import {
  ArrowCounterClockwise,
  ArrowRight,
  CircleNotch,
  MicrophoneSlash,
  PaperPlaneTilt,
  Stop,
  X,
} from "@phosphor-icons/react/ssr";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { InkButton, OutlineButton } from "@/components/brand/ui";
import { ScorePill } from "@/features/assessment/score-pill";
import { MicCursor } from "@/features/voice/mic-cursor";
import { MicInline, MicStage, type MicStatus } from "@/features/voice/mic-status";
import { useRecorder } from "@/features/voice/use-recorder";
import { RECORDING } from "@/lib/audio";
import { classify } from "@/lib/scoring";
import { ListenButton } from "@/features/practice/listen-button";
import { cn } from "@/lib/utils";
import { usePracticeStore } from "@/stores/practice-store";
import type { AttemptResult } from "@/types";

const secs = (ms: number) => `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)}s`;

const cheer = {
  excellent: "Super star! You said it really well! 🌟",
  good: "Good job! Almost perfect — keep going!",
  average: "Nice try! Listen again and have another go.",
} as const;

/** UC-05 (record) + UC-04 (submit) + UC-06 (feedback), styled like the landing demo's right column. */
export function PracticeRecorder({ itemId, itemText, nextHref }: { itemId: string; itemText: string; nextHref: string | null }) {
  const { phase, error, elapsedMs, recording, result, set, reset } = usePracticeStore();
  const { start, stop, cancel } = useRecorder();
  const [status, setStatus] = useState("");

  // New exercise → fresh session (and free the old recording's memory).
  useEffect(() => {
    reset();
    return () => reset();
  }, [itemId, reset]);

  async function send(url: string, body?: FormData) {
    set({ phase: "submitting", error: null });
    setStatus("Checking your pronunciation…");
    try {
      const res = await fetch(url, { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as Partial<AttemptResult> & { error?: string };
      if (res.status === 200 && data.status === "scored") {
        set({ phase: "scored", result: data as AttemptResult });
        setStatus(`Your score is ${data.score} percent.`);
      } else if (res.status === 202 && data.attemptId) {
        // Saved on the server, scoring failed: keep it and offer Retry (SRS 3.3.7).
        set({ phase: "failed", result: data as AttemptResult });
        setStatus("Your recording is saved but couldn't be checked yet.");
      } else {
        // 4xx = this recording can't be used; 503 = nothing saved, the same recording can be sent again.
        const retryable = res.status >= 500;
        set({ phase: retryable ? "recorded" : "error", error: { kind: retryable ? "network" : "rejected", message: data.error ?? "Something went wrong. Please try again." } });
        setStatus(data.error ?? "Something went wrong.");
      }
    } catch {
      set({ phase: "recorded", error: { kind: "network", message: "No connection. Your recording is still here — try sending it again." } });
      setStatus("No connection.");
    }
  }

  function submit() {
    if (!recording || phase === "submitting") return; // double-click guard (server is idempotent too)
    const fd = new FormData();
    fd.append("attemptId", recording.attemptId);
    fd.append("itemId", itemId);
    fd.append("durationMs", String(Math.round(recording.durationMs)));
    fd.append("audio", recording.blob, `attempt.${recording.mime.includes("mp4") ? "m4a" : "webm"}`);
    void send("/api/attempts", fd);
  }

  function retry() {
    if (result?.attemptId) void send(`/api/attempts/${result.attemptId}/retry`);
  }

  function recordAgain() {
    reset();
    void start();
  }

  const isRecording = phase === "recording";
  // Mic state for the cursor tag (and the pills below).
  const micStatus: MicStatus =
    phase === "requesting"
      ? "requesting"
      : phase === "recording"
        ? "listening"
        : phase === "submitting"
          ? "processing"
          : phase === "recorded" || phase === "scored"
            ? "done"
            : phase === "error" || phase === "failed"
              ? "off"
              : "ready";
  const remaining = Math.max(0, RECORDING.maxMs - elapsedMs);
  const score = result?.score ?? 0;
  const wrongWords = result ? result.words.filter((w) => w.isError) : [];
  const trickySounds = result
    ? [...new Set(result.phonemes.filter((p) => p.isError).map((p) => p.expected || p.phoneme))].slice(0, 4)
    : [];

  return (
    // Animate UI AutoHeight: the card grows/shrinks smoothly between mic → recording → listen → result.
    <AutoHeight deps={[phase, !!error]} className="w-full">
    <div className="relative flex w-full flex-col gap-5">
      {/* Animate UI cursor: inside the mic section the pointer shows the mic state. */}
      <MicCursor status={micStatus} />
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {/* Record / stop (landing demo mic card) */}
      {phase === "idle" || phase === "requesting" || phase === "error" ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-6 text-center sm:p-8">
          {/* The dotted orb is the mic: tap it to start. State, then the hint, below it. */}
          <MicStage
            status={phase === "requesting" ? "requesting" : phase === "error" ? "off" : "ready"}
            onStart={start}
            startLabel="Start recording"
            hint={
              phase === "requesting"
                ? "Say yes when your browser asks."
                : `Tap stop when you finish. It stops by itself after ${RECORDING.maxMs / 1000} seconds.`
            }
          />
        </div>
      ) : null}

      {isRecording ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-primary/40 bg-secondary/40 p-6 text-center sm:p-8">
          {/* One clean indicator while recording: the orb, "Listening…", then the time. */}
          <MicStage status="listening" time={`${secs(elapsedMs)} · ${Math.ceil(remaining / 1000)}s left`} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={stop}
              aria-pressed
              aria-label="Stop recording"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground outline-none hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring"
            >
              <Stop className="size-4" weight="fill" aria-hidden /> Stop
            </button>
            <button
              type="button"
              onClick={cancel}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-foreground/20 bg-card px-4 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden /> Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* Problem that needs a new recording or a settings change */}
      {phase === "error" && error ? (
        <div role="alert" className="rounded-2xl border border-score-average/30 bg-score-average/5 p-5">
          <div className="flex items-start gap-3">
            <MicrophoneSlash className="mt-0.5 size-5 shrink-0 text-score-average" weight="duotone" aria-hidden />
            <div>
              <p className="font-heading text-base font-semibold text-foreground">Could not record</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Listen back, then submit or re-record */}
      {(phase === "recorded" || phase === "submitting") && recording ? (
        <div className="rounded-2xl border border-border bg-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {phase === "submitting" ? (
              <MicInline status="processing" />
            ) : (
              <p className="font-heading text-sm font-semibold text-foreground">Listen to yourself</p>
            )}
            <span className="text-xs text-muted-foreground tabular-nums">{secs(recording.durationMs)}</span>
          </div>
          <audio controls src={recording.url} className="mt-3 w-full" aria-label="Your recording" />
          {error?.kind === "network" ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <KiddyButton size="sm" onClick={submit} disabled={phase === "submitting"} aria-label="Send">
              {phase === "submitting" ? <CircleNotch className="animate-spin" weight="bold" /> : <PaperPlaneTilt weight="fill" />}
              {phase === "submitting" ? "Checking…" : "Send"}
            </KiddyButton>
            <OutlineButton onClick={recordAgain} disabled={phase === "submitting"}>
              <ArrowCounterClockwise weight="bold" /> Record again
            </OutlineButton>
          </div>
        </div>
      ) : null}

      {/* Saved, but scoring failed (SRS 3.3.7) */}
      {phase === "failed" && result ? (
        <div role="alert">
          <PikoSays size="sm" tone="cream" message="Your recording is saved, but I couldn't check it yet.">
            <p className="w-full text-sm text-muted-foreground">{result.error ?? "Please try again in a moment."}</p>
            <InkButton onClick={retry}>
              <ArrowCounterClockwise weight="bold" /> Try checking again
            </InkButton>
            <OutlineButton onClick={recordAgain}>Record again</OutlineButton>
          </PikoSays>
        </div>
      ) : null}

      {/* UC-06: score, class, coloured words, tricky sounds, listen, try again / next */}
      {phase === "scored" && result ? (
        <div className="rounded-2xl border-2 border-primary/25 bg-tint-cream/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ScorePill score={score} className="px-3.5 py-1.5 text-sm" />
            <span className="text-xs font-semibold text-muted-foreground">Your result</span>
          </div>
          <p className="mt-4 font-heading text-lg font-bold text-primary">{cheer[classify(score)]}</p>
          <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1.5 text-xl" aria-label="Your words">
            {result.words.map((w, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-lg px-2 py-0.5 font-heading font-bold",
                  w.isError ? "bg-score-average/10 text-score-average" : "bg-score-excellent/10 text-score-excellent",
                )}
                title={`${w.score}%`}
              >
                {w.word}
              </span>
            ))}
          </p>
          {wrongWords.length > 0 || trickySounds.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
              {wrongWords.length > 0 ? (
                <p>
                  <span className="font-semibold">Practise: </span>
                  {wrongWords.map((w) => w.word).join(", ")}
                </p>
              ) : null}
              {trickySounds.length > 0 ? (
                <p className="mt-1 text-muted-foreground">
                  Tricky sounds:{" "}
                  {trickySounds.map((p) => (
                    <span key={p} className="mr-1 inline-block rounded-md bg-secondary px-1.5 font-mono text-xs text-primary">
                      /{p}/
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <OutlineButton onClick={recordAgain}>
              <ArrowCounterClockwise weight="bold" /> Try again
            </OutlineButton>
            <ListenButton text={itemText} label="Hear it again" />
            {nextHref ? (
              <KiddyButton size="sm" href={nextHref}>
                Next word <ArrowRight weight="bold" />
              </KiddyButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
    </AutoHeight>
  );
}
