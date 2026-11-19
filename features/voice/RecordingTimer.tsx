"use client";

import { useEffect, useState } from "react";

const MAX_DURATION_S = 15;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function RecordingTimer({ isRecording }: { isRecording: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const startTimestamp = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.min(MAX_DURATION_S, Math.floor((now - startTimestamp) / 1000)));
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-semibold tabular-nums text-muted-foreground">
      <span
        className="inline-block size-2 animate-pulse rounded-full bg-destructive"
        aria-hidden="true"
      />
      <span
        aria-live="polite"
        aria-label={`Recording time: ${formatTime(elapsed)}`}
      >
        {formatTime(elapsed)} / {formatTime(MAX_DURATION_S)}
      </span>
    </div>
  );
}
