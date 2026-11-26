"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, ChartBar, Microphone, SpeakerHigh } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { cn } from "@/lib/utils";

const steps = [
  {
    num: "01",
    title: "LISTEN",
    short: "Hear a clear reference pronunciation before you speak.",
    detail: "The student listens to the target word with an illustrated flashcard and clear audio example.",
    tone: "bg-tint-peach border-primary/25",
    badge: "bg-primary text-primary-foreground",
    Icon: SpeakerHigh,
    previewTitle: "Reference audio: “Apple”",
    previewText: "Clear, steady playback at a learner-friendly pace.",
  },
  {
    num: "02",
    title: "SPEAK",
    short: "Record your own voice right in the browser.",
    detail: "The student taps Record, speaks into their microphone, watches live sound waves, and can listen back.",
    tone: "bg-tint-sky border-chart-3/35",
    badge: "bg-chart-3 text-foreground",
    Icon: Microphone,
    previewTitle: "Live microphone waveform",
    previewText: "Up to 15 seconds per attempt, with silence and length checks.",
  },
  {
    num: "03",
    title: "UNDERSTAND",
    short: "See how closely the attempt matched the target word.",
    detail: "Pronnova evaluates the recorded attempt against the expected text and highlights areas to work on.",
    tone: "bg-tint-cream border-chart-5/35",
    badge: "bg-chart-5 text-foreground",
    Icon: ChartBar,
    previewTitle: "Word-by-word evaluation",
    previewText: "Score percentage + rating (Excellent ≥85, Good 70–84, Average <70).",
  },
  {
    num: "04",
    title: "IMPROVE",
    short: "Read simple feedback and try again safely.",
    detail: "Encouraging tips guide the learner to practise tricky words again until they feel confident.",
    tone: "bg-tint-mint border-score-excellent/25",
    badge: "bg-score-excellent text-white",
    Icon: ArrowCounterClockwise,
    previewTitle: "Retry anytime",
    previewText: "No exam pressure—every retry helps build clearer habits.",
  },
] as const;

/**
 * SECTION 03 — HOW PRONNOVA WORKS
 * Alternating left/right scroll steps around a center progress line that smoothly fills
 * from step 01 to step 04 as the user scrolls down the page.
 */
export function HowItWorks() {
  const [selected, setSelected] = useState<number | null>(null);
  const [reached, setReached] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const updateRailBounds = useCallback(() => {
    const wrap = wrapperRef.current;
    const rail = railRef.current;
    const first = nodeRefs.current[0];
    const last = nodeRefs.current[steps.length - 1];
    if (!wrap || !rail || !first || !last) return;

    const wrapRect = wrap.getBoundingClientRect();
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const top = firstRect.top - wrapRect.top + firstRect.height / 2;
    const bottom = lastRect.top - wrapRect.top + lastRect.height / 2;
    rail.style.top = `${top}px`;
    rail.style.height = `${Math.max(0, bottom - top)}px`;
  }, []);

  const syncFillTransform = useCallback(() => {
    const rail = railRef.current;
    const fill = fillRef.current;
    if (!rail || !fill) return false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fill.style.transform = "scaleY(1)";
      return true;
    }

    const rect = rail.getBoundingClientRect();
    const focalY = window.innerHeight * 0.58;
    const raw = rect.height > 0 ? (focalY - rect.top) / rect.height : 0;
    const clamped = Math.max(0, Math.min(1, raw));
    fill.style.transform = `scaleY(${clamped})`;
    return false;
  }, []);

  const updateProgress = useCallback(() => {
    const reduced = syncFillTransform();
    if (reduced) {
      setReached(steps.length - 1);
      return;
    }

    const focalY = window.innerHeight * 0.58;
    let lastReached = 0;
    for (let i = 0; i < nodeRefs.current.length; i++) {
      const node = nodeRefs.current[i];
      if (!node) continue;
      const nRect = node.getBoundingClientRect();
      if (nRect.top + nRect.height / 2 <= focalY + 8) {
        lastReached = i;
      }
    }
    setReached((prev) => (prev === lastReached ? prev : lastReached));
  }, [syncFillTransform]);

  const activeIdx = selected ?? reached;

  // Re-measure rail bounds and fill transform synchronously before paint whenever activeIdx changes
  // (expanding/collapsing a card shifts node 01/04 vertical centers even if net wrapper height is unchanged).
  useLayoutEffect(() => {
    updateRailBounds();
    syncFillTransform();
  }, [activeIdx, updateRailBounds, syncFillTransform]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          updateProgress();
        });
      }
    };
    const onResize = () => {
      updateRailBounds();
      updateProgress();
    };

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro && wrapperRef.current) ro.observe(wrapperRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateRailBounds, updateProgress]);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24 py-12 md:py-18">
      <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
        <LandingSectionHeader
          id="how-title"
          lead="How Pronnova"
          accent="Works"
          subtitle="Four simple steps designed to turn hesitation into confident speaking."
        />

        {/* Alternating left/right timeline with center scroll progress line */}
        <div ref={wrapperRef} className="relative mt-12">
          {/* Base rail + scroll-driven fill anchored strictly between Step 01 center and Step 04 center */}
          <div
            ref={railRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-5 w-1 -translate-x-1/2 overflow-hidden rounded-full bg-border md:left-1/2"
          >
            <div
              ref={fillRef}
              style={{ transform: "scaleY(0)" }}
              className="h-full w-full origin-top rounded-full bg-primary will-change-transform"
            />
          </div>

          <ol className="space-y-8 md:space-y-12">
            {steps.map((step, idx) => {
              const isReached = idx <= reached;
              const isActive = idx === activeIdx;
              const isLeft = idx % 2 === 0;
              const Icon = step.Icon;

              const card = (
                <button
                  type="button"
                  onClick={() => setSelected((prev) => (prev === idx ? null : idx))}
                  aria-expanded={isActive}
                  className={cn(
                    "flex w-full flex-col items-start rounded-2xl border-2 p-5 text-left outline-none transition-colors sm:p-6 focus-visible:ring-3 focus-visible:ring-ring/50",
                    isActive ? step.tone : "border-border bg-card hover:border-primary/30",
                  )}
                >
                  <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 font-heading text-xs font-bold", step.badge)}>
                    <span>{step.num}</span>
                    <span>{step.title}</span>
                  </span>

                  <div className="mt-4 flex items-start gap-3.5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-card text-foreground">
                      <Icon className="size-5 text-primary" weight="duotone" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-heading text-lg font-semibold text-foreground">{step.short}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="mt-4 w-full rounded-xl border border-foreground/10 bg-card px-4 py-2.5 text-xs">
                      <span className="font-semibold text-primary">{step.previewTitle}: </span>
                      <span className="text-muted-foreground">{step.previewText}</span>
                    </div>
                  ) : null}
                </button>
              );

              return (
                <li key={step.num} className="relative pl-12 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8 md:pl-0">
                  {/* Single card placed left (odd) or right (even) on desktop */}
                  <div className={cn("md:row-start-1", isLeft ? "md:col-start-1" : "md:col-start-3")}>
                    {card}
                  </div>

                  {/* Center progress node */}
                  <div
                    aria-hidden="true"
                    className="absolute top-6 left-5 z-10 -translate-x-1/2 md:static md:col-start-2 md:row-start-1 md:translate-x-0"
                  >
                    <span
                      ref={(el) => {
                        nodeRefs.current[idx] = el;
                      }}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border-2 font-heading text-xs font-bold transition-colors duration-200",
                        isReached
                          ? `border-foreground ${step.badge}`
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {step.num}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
