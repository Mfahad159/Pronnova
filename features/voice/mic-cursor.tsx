"use client";

import { AnimatePresence, motion } from "motion/react";
import { MousePointer2 } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import { Cursor, CursorContainer, CursorFollow, CursorProvider } from "@animate-ui/react/primitives/cursor";
import { ease } from "@animate-ui/react/utils/motion";
import { CORAL, LOOK, type MicStatus } from "@/features/voice/mic-status";
import { cn } from "@/lib/utils";

/**
 * Animate UI cursor for the mic section: inside the section the pointer becomes a coral arrow with a
 * small tag that follows it and shows the mic state (tiny thinking-orb + "Ready", "Listening"…).
 * Drop it in as a child of the mic section; it listens on that parent. Mouse and pen only (touch is
 * ignored by the primitive), decorative (aria-hidden): the state is also written out in the section.
 */
export function MicCursor({ status }: { status: MicStatus }) {
  const look = LOOK[status];
  return (
    <CursorProvider>
      <CursorContainer aria-hidden className="pointer-events-none absolute inset-0">
        <Cursor>
          <MousePointer2 className="size-5 -translate-x-0.5 -translate-y-0.5 fill-primary text-primary" />
        </Cursor>
        <CursorFollow side="bottom" align="end" sideOffset={10}>
          <motion.span
            layout
            transition={{ duration: 0.25, ease: ease.out }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1 text-xs font-semibold whitespace-nowrap shadow-sm",
              look.tint ? "border-primary/25 bg-secondary text-primary" : "border-foreground/10 bg-card text-foreground/80",
            )}
          >
            <ThinkingOrb state={look.orb} size={20} theme="light" color={look.tint ? CORAL : undefined} paused={status === "off"} aria-hidden />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: ease.out }}
              >
                {look.label}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        </CursorFollow>
      </CursorContainer>
    </CursorProvider>
  );
}
