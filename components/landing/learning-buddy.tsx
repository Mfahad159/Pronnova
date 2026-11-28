"use client";

import { useState } from "react";
import Image from "next/image";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { cn } from "@/lib/utils";

const prompts = [
  { label: "Start practising", message: "Let's say it together!" },
  { label: "Missed a word", message: "Great effort! Try once more." },
  { label: "Score went up", message: "You're getting better!" },
  { label: "Finished a word", message: "Ready for another word?" },
] as const;

/**
 * SECTION 04 — MEET YOUR LEARNING BUDDY
 * Cardless full-width warm tint band featuring Piko on a soft halo with a comic speech bubble
 * and interactive moment chips.
 */
export function LearningBuddy() {
  const [idx, setIdx] = useState(0);

  return (
    <section id="buddy" aria-labelledby="buddy-title" className="scroll-mt-24 bg-tint-peach/45 py-14 md:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <LandingSectionHeader
          id="buddy-title"
          lead="Meet Your"
          accent="Learning Buddy"
          subtitle="Practising out loud can feel shy at first. Piko keeps feedback warm, encouraging, and stress-free across every activity."
        />

        <div className="mt-10 grid items-center gap-10 md:grid-cols-[0.78fr_1.22fr]">
          {/* Open Piko character column — transparent PNG directly on the band */}
          <div className="flex flex-col items-center text-center">
            <Image
              src="/hero/piko-portrait.png"
              alt="Piko, Pronnova's friendly coral learning buddy"
              width={419}
              height={420}
              sizes="200px"
              className="size-48 object-contain sm:size-52"
            />
            <p className="mt-3 font-heading text-base font-bold text-foreground">Piko · Speaking Buddy</p>
          </div>

          {/* Cartoon speech bubble + interactive moment chips */}
          <div>
            {/* Speech bubble with subtle tail pointing toward Piko on desktop */}
            <div aria-live="polite" className="relative w-fit max-w-full">
              <span
                aria-hidden
                className="absolute top-1/2 -left-2 hidden size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-foreground/15 bg-card md:block"
              />
              <div className="relative rounded-2xl border-2 border-foreground/15 bg-card px-6 py-4">
                <p className="font-heading text-xl font-bold text-primary sm:text-2xl">
                  “{prompts[idx].message}”
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tap a moment to hear from Piko:
              </p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                      idx === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground/15 bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
