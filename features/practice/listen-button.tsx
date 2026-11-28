"use client";

import { useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { speakReference, type TtsStatus } from "@/lib/speech-tts";

/** "Listen to the word" button from the landing demo (browser voice, UC-06 play correct word). */
export function ListenButton({ text, label, className }: { text: string; label?: string; className?: string }) {
  const [state, setState] = useState<TtsStatus>("idle");
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <button
        type="button"
        onClick={() =>
          speakReference(text, {
            onStart: () => setState("speaking"),
            onEnd: () => setState("idle"),
            onUnsupported: () => setState("unsupported"),
          })
        }
        className="inline-flex h-12 items-center gap-2.5 rounded-xl border-2 border-foreground/15 bg-card px-6 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring"
      >
        <SpeakerHigh className={cn("size-5 text-primary", state === "speaking" && "animate-pulse")} weight="duotone" aria-hidden />
        {label ?? "Listen"}
      </button>
      {state === "unsupported" ? (
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          This browser can&apos;t speak words. Ask your teacher to say it.
        </p>
      ) : null}
    </div>
  );
}
