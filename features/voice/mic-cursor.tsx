"use client";

import { AnimatePresence, motion } from "motion/react";
import { Hourglass, Mic, MicOff, RotateCcw, ShieldCheck } from "lucide-react";
import { CursorContainer, CursorFollow, CursorProvider } from "@animate-ui/react/primitives/cursor";
import { ease } from "@animate-ui/react/utils/motion";
import type { MicStatus } from "@/features/voice/mic-status";
import { cn } from "@/lib/utils";

/**
 * What a click does right now. Deliberately NOT the state text shown under the orb (that would say
 * the same thing twice): the tag is a short action hint with an icon.
 */
const HINT: Record<MicStatus, { text: string; Icon?: typeof Mic; rec?: boolean }> = {
  ready: { text: "Click to record", Icon: Mic },
  requesting: { text: "Allow the mic", Icon: ShieldCheck },
  listening: { text: "Recording", rec: true },
  processing: { text: "One moment", Icon: Hourglass },
  done: { text: "Click to redo", Icon: RotateCcw },
  off: { text: "Check your mic", Icon: MicOff },
};

/**
 * Animate UI cursor tag for the mic section: a small action hint that follows the app-wide coral arrow
 * (components/brand/app-cursor.tsx). Drop it in as a child of the mic section; it listens on that
 * parent. Mouse and pen only (touch is ignored by the primitive); decorative (aria-hidden).
 */
export function MicCursor({ status }: { status: MicStatus }) {
  const hint = HINT[status];
  return (
    <CursorProvider>
      <CursorContainer aria-hidden className="pointer-events-none absolute inset-0">
        <CursorFollow side="bottom" align="end" sideOffset={10}>
          <motion.span
            layout
            transition={{ duration: 0.25, ease: ease.out }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-md",
              hint.rec ? "bg-primary text-primary-foreground" : "bg-foreground text-background",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: ease.out }}
                className="inline-flex items-center gap-1.5"
              >
                {hint.rec ? (
                  <motion.span
                    className="size-2 rounded-full bg-primary-foreground"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : hint.Icon ? (
                  <hint.Icon className="size-3.5" />
                ) : null}
                {hint.text}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </CursorFollow>
      </CursorContainer>
    </CursorProvider>
  );
}
