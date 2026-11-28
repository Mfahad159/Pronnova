"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { ease } from "@animate-ui/react/utils/motion";
import { BookOpen, ChartBar, ClipboardText, Microphone, Sparkle } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { cn } from "@/lib/utils";

const workflow = [
  {
    step: "1",
    title: "Teacher picks the level",
    detail: "Choose or upload Basic, Medium or Advanced lessons for the class.",
    Icon: ClipboardText,
    tone: "bg-tint-peach",
  },
  {
    step: "2",
    title: "Student practises",
    detail: "Learners listen to a clear example, then record their own voice.",
    Icon: Microphone,
    tone: "bg-tint-sky",
  },
  {
    step: "3",
    title: "Pronnova checks it",
    detail: "Each attempt gets word-level feedback and is saved safely.",
    Icon: Sparkle,
    tone: "bg-tint-cream",
  },
  {
    step: "4",
    title: "Teacher reviews",
    detail: "Results appear on the teacher dashboard for the whole class.",
    Icon: ChartBar,
    tone: "bg-tint-mint",
  },
  {
    step: "5",
    title: "Teacher targets practice",
    detail: "Spot tricky words and assign the next round of practice.",
    Icon: BookOpen,
    tone: "bg-tint-lavender",
  },
] as const;

type Pt = { x: number; y: number };

/**
 * SECTION 08 — LEARNING THAT FITS THE CLASSROOM
 * Five teacher ↔ student steps on a zigzag: high/low on desktop, left/right on phones. The line is
 * measured from the real node positions (so it always passes through each step at any width) and
 * draws itself when the section scrolls into view. Cards and nodes rise in one after another.
 */
export function ClassroomWorkflow() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [points, setPoints] = useState<Pt[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Layout positions (offsetLeft/offsetTop), which IGNORE transforms: the cards rise in with a
  // transform, and getBoundingClientRect() measured mid-animation put the line 18px off (Phase 6 check).
  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const pts = nodeRefs.current.flatMap((n) => {
      if (!n) return [];
      let x = 0;
      let y = 0;
      for (let el: HTMLElement | null = n; el && el !== wrap; el = el.offsetParent as HTMLElement | null) {
        x += el.offsetLeft;
        y += el.offsetTop;
      }
      // The node is centred with translate(-50%), so its visual centre x is its layout left edge.
      return [{ x, y: y + n.offsetHeight / 2 }];
    });
    setSize({ w: wrap.offsetWidth, h: wrap.offsetHeight });
    setPoints(pts);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const d = points.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <MotionConfig reducedMotion="user">
      <section id="classroom" aria-labelledby="classroom-title" className="scroll-mt-24 bg-secondary/45 py-14 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <LandingSectionHeader
            id="classroom-title"
            lead="Learning That Fits the"
            accent="Classroom"
            subtitle="Supporting teachers with clearer insights into every learner's pronunciation journey."
          />

          <div ref={wrapRef} className="relative mt-14">
            {/* Zigzag line through the step nodes: a faint track + a coral line that draws in. */}
            {d ? (
              <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h}>
                <path d={d} fill="none" stroke="var(--primary)" strokeOpacity={0.15} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
                <motion.path
                  d={d}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 1.6, ease: ease.inOut }}
                />
              </svg>
            ) : null}

            <motion.ol
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-120px" }}
              variants={{ show: { transition: { staggerChildren: 0.18 } } }}
              className="relative flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-5"
            >
              {workflow.map((w, i) => {
                const Icon = w.Icon;
                const low = i % 2 === 1; // zigzag: steps 2 and 4 sit lower (desktop) / on the right (phones)
                return (
                  <motion.li
                    key={w.step}
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } } }}
                    className={cn(
                      "relative w-[85%] sm:w-[62%] lg:w-auto",
                      low ? "self-end lg:mt-28" : "self-start lg:mt-0",
                    )}
                  >
                    {/* Step node on the line (top centre of the card). */}
                    <span
                      ref={(el) => {
                        nodeRefs.current[i] = el;
                      }}
                      className="absolute -top-5 left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground ring-4 ring-[color-mix(in_oklab,var(--secondary)_45%,var(--background))]"
                    >
                      {w.step}
                    </span>
                    <div className="flex h-full flex-col rounded-2xl border-2 border-foreground/10 bg-card p-5 pt-8 transition-colors hover:border-primary/30">
                      <span className={cn("flex size-11 items-center justify-center rounded-xl", w.tone)}>
                        <Icon className="size-6 text-primary" weight="duotone" aria-hidden />
                      </span>
                      <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                        <span className="sr-only">Step {w.step}: </span>
                        {w.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{w.detail}</p>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
