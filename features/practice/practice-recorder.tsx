"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowCounterClockwise,
  ArrowRight,
  CircleNotch,
  Microphone,
  MicrophoneSlash,
  PaperPlaneTilt,
  Stop,
  X,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { ScorePill } from "@/features/assessment/score-pill";
import { LiveWaveform } from "@/features/voice/live-waveform";
import { useRecorder } from "@/features/voice/use-recorder";
import { RECORDING } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { usePracticeStore } from "@/stores/practice-store";
import type { AttemptResult } from "@/types";

const secs = (ms: number) => `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)}s`;

/** UC-05 (record) + UC-04 (submit). The full feedback view (UC-06) builds on the result in Phase 4. */
export function PracticeRecorder({ itemId, nextHref }: { itemId: string; nextHref: string | null }) {
  const { phase, error, elapsedMs, recording, result, set, reset } = usePracticeStore();
  const { start, stop, cancel, analyserRef } = useRecorder();
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
  const remaining = Math.max(0, RECORDING.maxMs - elapsedMs);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {/* Record / stop */}
      {phase === "idle" || phase === "requesting" || isRecording || phase === "error" ? (
        <>
          <button
            type="button"
            onClick={isRecording ? stop : start}
            disabled={phase === "requesting"}
            aria-pressed={isRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={cn(
              "relative flex size-24 items-center justify-center rounded-full text-primary-foreground outline-none focus-visible:ring-4 focus-visible:ring-ring/50 disabled:opacity-60",
              isRecording ? "bg-destructive" : "bg-primary hover:bg-primary/90",
            )}
          >
            {isRecording ? (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30 motion-reduce:hidden" />
                <Stop className="relative size-8" weight="fill" />
              </>
            ) : phase === "requesting" ? (
              <CircleNotch className="size-9 animate-spin" />
            ) : (
              <Microphone className="size-10" />
            )}
          </button>
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <LiveWaveform analyserRef={analyserRef} active={isRecording} />
              <p className="text-sm tabular-nums text-muted-foreground">
                Recording {secs(elapsedMs)} · stops by itself in {Math.ceil(remaining / 1000)}s
              </p>
              <Button variant="ghost" size="sm" onClick={cancel}>
                <X /> Cancel
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {phase === "requesting" ? "Allow the microphone when your browser asks." : "Tap the microphone, read the text aloud, then tap stop."}
            </p>
          )}
        </>
      ) : null}

      {/* Problem that needs a new recording or a settings change */}
      {phase === "error" && error ? (
        <div role="alert" className="flex max-w-md items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left text-sm">
          <MicrophoneSlash className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p>{error.message}</p>
        </div>
      ) : null}

      {/* Listen back, then submit or re-record */}
      {(phase === "recorded" || phase === "submitting") && recording ? (
        <div className="flex w-full max-w-md flex-col items-center gap-4">
          <audio controls src={recording.url} className="w-full" aria-label="Your recording" />
          <p className="text-sm text-muted-foreground">Listen to yourself. Happy with it? Send it to get your score.</p>
          {error?.kind === "network" ? (
            <p role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="h-11 px-5" onClick={submit} disabled={phase === "submitting"}>
              {phase === "submitting" ? <CircleNotch className="animate-spin" /> : <PaperPlaneTilt />}
              {phase === "submitting" ? "Checking…" : "Send"}
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-5" onClick={recordAgain} disabled={phase === "submitting"}>
              <ArrowCounterClockwise /> Record again
            </Button>
          </div>
        </div>
      ) : null}

      {/* Saved, but scoring failed */}
      {phase === "failed" && result ? (
        <div role="alert" className="flex max-w-md flex-col items-center gap-3 rounded-xl border bg-secondary p-5 text-center">
          <p className="font-medium">Your recording is saved, but we couldn&apos;t check it yet.</p>
          <p className="text-sm text-muted-foreground">{result.error ?? "Please try again in a moment."}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={retry}>
              <ArrowCounterClockwise /> Try checking again
            </Button>
            <Button variant="outline" onClick={recordAgain}>
              Record again
            </Button>
          </div>
        </div>
      ) : null}

      {/* Scored — short summary; full feedback (UC-06) comes in Phase 4 */}
      {phase === "scored" && result ? (
        <div className="flex w-full max-w-xl flex-col items-center gap-4">
          <ScorePill score={result.score ?? 0} className="px-4 py-2 text-base" />
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-lg" aria-label="Your words">
            {result.words.map((w, i) => (
              <span
                key={i}
                className={cn("rounded-md px-1.5 py-0.5 font-medium", w.isError ? "bg-score-average/10 text-score-average" : "text-score-excellent")}
                title={`${w.score}%`}
              >
                {w.word}
              </span>
            ))}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="outline" className="h-11 px-5" onClick={recordAgain}>
              <ArrowCounterClockwise /> Try again
            </Button>
            {nextHref ? (
              <Button asChild size="lg" className="h-11 px-5">
                <Link href={nextHref}>
                  Next exercise <ArrowRight />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
