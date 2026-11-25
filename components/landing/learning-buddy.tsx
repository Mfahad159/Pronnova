"use client";

import { useState } from "react";
import Image from "next/image";
import { ChatCircleDots } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

const prompts = [
  { label: "Start practising", message: "Let's say it together!" },
  { label: "Missed a word", message: "Great effort! Try once more." },
  { label: "Score went up", message: "You're getting better!" },
  { label: "Finished a word", message: "Ready for another word?" },
] as const;

/**
 * SECTION 04 — MEET YOUR LEARNING BUDDY
 * Uses one consistent Pronnova mascot (Piko, Gemini-generated in Pronnova's coral palette)
 * with interactive prompt chips showing encouraging student responses.
 */
export function LearningBuddy() {
  const [idx, setIdx] = useState(0);

  return (
    <section id="buddy" aria-labelledby="buddy-title" className="scroll-mt-24 py-12 md:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <div className="grid items-center gap-8 rounded-2xl border-2 border-primary/20 bg-tint-peach/75 p-6 sm:p-10 md:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col items-center">
            <div className="relative flex size-52 items-center justify-center rounded-2xl border-2 border-foreground/12 bg-card p-4">
              <Image
                src="/hero/piko-portrait.png"
                alt="Piko, Pronnova's friendly coral learning buddy"
                width={419}
                height={420}
                sizes="180px"
                className="size-44 object-contain"
              />
            </div>
            <p className="mt-3 font-heading text-base font-bold text-foreground">Piko · Your Speaking Buddy</p>
          </div>

          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary uppercase">
              <ChatCircleDots className="size-3.5" weight="duotone" aria-hidden />
              Friendly Guidance
            </p>
            <h2 id="buddy-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Meet Your Learning Buddy
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Practising out loud can feel shy at first. Piko keeps feedback warm, encouraging, and stress-free across every student activity.
            </p>

            {/* Speech bubble */}
            <div
              aria-live="polite"
              className="mt-5 rounded-xl border-2 border-foreground/15 bg-card px-5 py-4"
            >
              <p className="font-heading text-xl font-bold text-primary sm:text-2xl">
                “{prompts[idx].message}”
              </p>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Click a moment to see Piko&apos;s response:
              </p>
              <div className="flex flex-wrap gap-2">
                {prompts.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
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
