"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ThinkingOrb, type OrbState } from "thinking-orbs";
import { ease } from "@animate-ui/react/utils/motion";
import { cn } from "@/lib/utils";

/** What the microphone is doing, everywhere we record (practice recorder, landing demo). */
export type MicStatus = "ready" | "requesting" | "listening" | "processing" | "done" | "off";

/** Brand coral ink (KiddyButton coral, keep-brand-coral decision). */
const CORAL = "#ff594b";

const LOOK: Record<MicStatus, { orb: OrbState; label: string; active: boolean; tint: boolean }> = {
  ready: { orb: "breathing", label: "Ready", active: false, tint: false },
  requesting: { orb: "connecting", label: "Asking for the mic", active: true, tint: false },
  listening: { orb: "listening", label: "Listening", active: true, tint: true },
  processing: { orb: "working", label: "Checking your voice", active: true, tint: true },
  done: { orb: "shaping", label: "Done", active: false, tint: false },
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

/**
 * Mic status pill in the thinking-orbs style: a dotted orb whose animation shows the mic state
 * (breathing = ready, connecting = asking permission, listening = recording, working = checking),
 * plus a short label that cross-fades when the state changes. `detail` adds e.g. the timer.
 * The orb is decorative; the label is the accessible text (the recorders keep their own live region).
 * Pinned to the light theme: Pronnova has no dark mode, and "auto" would draw light dots on our light
 * cards when the OS is dark.
 */
export function MicStatusPill({ status, detail, className }: { status: MicStatus; detail?: string; className?: string }) {
  const look = LOOK[status];
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        layout
        transition={{ duration: 0.35, ease: ease.out }}
        data-mic-status={status}
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-full border py-1 pr-4 pl-1 sm:gap-2.5",
          look.tint ? "border-primary/25 bg-secondary/70" : "border-foreground/10 bg-card",
          className,
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          <ThinkingOrb
            state={look.orb}
            size={32}
            theme="light"
            color={look.tint ? CORAL : undefined}
            paused={status === "off"}
            aria-hidden
          />
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: ease.out }}
            className={cn("flex min-w-0 items-center text-sm font-semibold", look.tint ? "text-primary" : "text-muted-foreground")}
          >
            <span className="truncate">{look.label}</span>
            {look.active ? <Dots /> : null}
            {detail ? <span className="ml-1.5 shrink-0 font-medium tabular-nums opacity-80">{detail}</span> : null}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </MotionConfig>
  );
}

/**
 * The big orb for the recording moment: the 64px tuned design on tablets and up, the 32px one
 * scaled up on phones so it still reads at a glance without crowding the card.
 */
export function MicOrb({ status, className }: { status: MicStatus; className?: string }) {
  const look = LOOK[status];
  const common = { state: look.orb, theme: "light" as const, color: look.tint ? CORAL : undefined, paused: status === "off", "aria-hidden": true };
  return (
    <span className={cn("flex items-center justify-center", className)}>
      <span className="flex size-12 items-center justify-center sm:hidden">
        <ThinkingOrb {...common} size={32} className="scale-150" />
      </span>
      <span className="hidden sm:flex">
        <ThinkingOrb {...common} size={64} />
      </span>
    </span>
  );
}
