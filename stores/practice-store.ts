"use client";

import { create } from "zustand";
import type { AttemptResult } from "@/types";

// One practice session (UC-05 record → UC-04 submit → result). Only UI state lives here;
// the attempt itself is saved on the server. Reset whenever a new item opens.

export type PracticePhase =
  | "idle" // ready to record
  | "requesting" // asking for the microphone
  | "recording"
  | "recorded" // listen back, submit or re-record
  | "submitting"
  | "scored"
  | "failed" // saved on the server, but scoring failed → Retry
  | "error"; // nothing saved (mic problem, too short, network...) → message + next step

export type PracticeErrorKind = "denied" | "no-mic" | "busy" | "unsupported" | "too-short" | "silent" | "network" | "rejected";

export interface Recording {
  blob: Blob;
  url: string;
  durationMs: number;
  mime: string;
  attemptId: string; // made once per recording → resending is idempotent
}

interface PracticeState {
  phase: PracticePhase;
  error: { kind: PracticeErrorKind; message: string } | null;
  elapsedMs: number;
  recording: Recording | null;
  result: AttemptResult | null;
  set: (patch: Partial<Omit<PracticeState, "set" | "reset">>) => void;
  reset: () => void;
}

const initial = { phase: "idle" as PracticePhase, error: null, elapsedMs: 0, recording: null, result: null };

export const usePracticeStore = create<PracticeState>((set, get) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => {
    const url = get().recording?.url;
    if (url) URL.revokeObjectURL(url);
    set(initial);
  },
}));
