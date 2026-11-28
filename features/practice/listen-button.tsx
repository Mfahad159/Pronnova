"use client";

import { useEffect, useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react/ssr";
import { Turtle } from "lucide-react";
import { cn } from "@/lib/utils";
import { playReference, prefetchReference, type Speed } from "./reference-audio";

/**
 * "Listen to the word" (UC-06 play the correct word): the Pronnova engine's voice, cached on the
 * server, with a 🐢 slow (0.75×) button next to it. Falls back to the browser voice if the engine is off.
 */
export function ListenButton({ text, label, className, slow = true }: { text: string; label?: string; className?: string; slow?: boolean }) {
  const [playing, setPlaying] = useState<Speed | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  useEffect(() => prefetchReference(text), [text]);

  const play = (speed: Speed) =>
    playReference(text, speed, {
      onStart: () => setPlaying(speed),
      onEnd: () => setPlaying(null),
      onUnsupported: () => setUnsupported(true),
    });

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => play("normal")}
          className="inline-flex h-12 items-center gap-2.5 rounded-xl border-2 border-foreground/15 bg-card px-6 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring"
        >
          <SpeakerHigh className={cn("size-5 text-primary", playing === "normal" && "animate-pulse")} weight="duotone" aria-hidden />
          {label ?? "Listen"}
        </button>
        {slow ? (
          <button
            type="button"
            onClick={() => play("slow")}
            aria-label={`Listen slowly to “${text}”`}
            title="Slow"
            className="inline-flex size-12 items-center justify-center rounded-xl border-2 border-foreground/15 bg-card text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring"
          >
            <Turtle className={cn("size-5 text-primary", playing === "slow" && "animate-pulse")} aria-hidden />
          </button>
        ) : null}
      </div>
      {unsupported ? (
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          This browser can&apos;t speak words. Ask your teacher to say it.
        </p>
      ) : null}
    </div>
  );
}
