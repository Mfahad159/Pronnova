"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";
import { ease } from "@animate-ui/react/utils/motion";
import { cn } from "@/lib/utils";
import { SharpOrb } from "@/features/voice/sharp-orb";

/** What the microphone is doing, everywhere we record (practice recorder, landing demo). */
export type MicStatus = "ready" | "requesting" | "listening" | "processing" | "done" | "off";

/** Brand coral ink (KiddyButton coral, keep-brand-coral decision). */
export const CORAL = "#ff594b";
const CORAL_RGB = { r: 255, g: 89, b: 75 };

const WIDE = "(min-width: 640px)";
function subscribeWide(onChange: () => void) {
  const mql = window.matchMedia(WIDE);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
/** Tailwind `sm` and up (no setState-in-effect). */
function useWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
}

export const LOOK: Record<MicStatus, { orb: OrbState; label: string; active: boolean; tint: boolean }> = {
  ready: { orb: "breathing", label: "Tap to speak", active: false, tint: false },
  requesting: { orb: "connecting", label: "Asking for the mic", active: true, tint: false },
  listening: { orb: "listening", label: "Listening", active: true, tint: true },
  processing: { orb: "working", label: "Checking your voice", active: true, tint: true },
  done: { orb: "shaping", label: "Tap to record again", active: false, tint: false },
  off: { orb: "breathing", label: "Mic is off", active: false, tint: false },
};

/** "…" that fills in one dot at a time while the mic is busy. */
function Dots() {
  return (
    <span aria-hidden className="inline-flex w-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

/** State text that cross-fades (with a little blur) when the mic state changes. */
function StateLabel({ status, className }: { status: MicStatus; className?: string }) {
  const look = LOOK[status];
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.p
        key={status}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.25, ease: ease.out }}
        className={cn("flex items-center justify-center font-heading font-bold", look.tint ? "text-primary" : "text-foreground", className)}
      >
        {look.label}
        {look.active ? <Dots /> : null}
      </motion.p>
    </AnimatePresence>
  );
}

/**
 * The mic, as one dotted thinking-orb (no mic button, no pill): the orb's animation IS the state
 * (breathing = ready, connecting = asking permission, listening = recording, working = checking,
 * shaping = recorded). Below it: the state text, then the time, then an optional hint.
 * Pass `onStart` to make the orb itself the tap target (when not recording).
 * Pinned to the light theme: Pronnova has no dark mode, and "auto" would draw light dots on our
 * light cards when the OS is dark. Reduced motion gets a still frame (built into thinking-orbs).
 */
export function MicStage({
  status,
  time,
  hint,
  onStart,
  startLabel = "Start recording",
  className,
}: {
  status: MicStatus;
  time?: string;
  hint?: React.ReactNode;
  onStart?: () => void;
  startLabel?: string;
  className?: string;
}) {
  const look = LOOK[status];
  // Drawn crisply at its real size (SharpOrb), bigger from 640px up.
  const wide = useWide();
  const orb = (
    <span className="flex size-28 items-center justify-center sm:size-32">
      <SharpOrb state={look.orb} size={wide ? 128 : 112} color={look.tint ? CORAL_RGB : undefined} paused={status === "off"} />
    </span>
  );
  return (
    <MotionConfig reducedMotion="user">
      <div data-mic-status={status} className={cn("flex flex-col items-center text-center", className)}>
        {onStart ? (
          <button
            type="button"
            onClick={onStart}
            disabled={status === "requesting"}
            aria-label={startLabel}
            className="rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring active:scale-95 disabled:opacity-70 motion-reduce:transition-none"
          >
            {orb}
          </button>
        ) : (
          orb
        )}
        <StateLabel status={status} className="mt-3 text-lg sm:text-xl" />
        {time ? <p className="mt-1 font-heading text-base font-semibold tabular-nums text-muted-foreground">{time}</p> : null}
        {hint ? <div className="mt-1.5 max-w-xs text-sm text-muted-foreground">{hint}</div> : null}
      </div>
    </MotionConfig>
  );
}

/** Small inline form (20px orb + state text, no pill), e.g. "Checking your voice…" next to a recording. */
export function MicInline({ status, className }: { status: MicStatus; className?: string }) {
  const look = LOOK[status];
  return (
    <span data-mic-status={status} className={cn("inline-flex items-center gap-2", className)}>
      <ThinkingOrb state={look.orb} size={20} theme="light" color={look.tint ? CORAL : undefined} aria-hidden />
      <StateLabel status={status} className="text-sm" />
    </span>
  );
}
