"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { ease } from "@animate-ui/react/utils/motion";
import { BookOpenText, Check, Info, UsersThree } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { ScorePill } from "@/features/assessment/score-pill";
import { cn } from "@/lib/utils";

const sampleStudents = [
  { name: "Ayesha Khan", progress: "14 / 15 items", score: 89, focus: "Ready for Advanced" },
  { name: "Bilal Ahmed", progress: "11 / 15 items", score: 74, focus: "/θ/ words (three, thin)" },
  { name: "Hina Tariq", progress: "15 / 15 items", score: 92, focus: "Completed Chapter 1" },
  { name: "Hamza Raza", progress: "8 / 15 items", score: 66, focus: "V vs W words (van, wet)" },
] as const;

const sampleDifficultyCounts = [
  { level: "Basic", sampleWords: "Cat, Window, Kitchen", completion: 86 },
  { level: "Medium", sampleWords: "Butterfly, Sharp pencil", completion: 68 },
  { level: "Advanced", sampleWords: "Elephant, 15-word sentences", completion: 44 },
] as const;

/**
 * SECTION 07 — TEACHER DASHBOARD: "Designed for Teachers"
 * Split layout with structured classroom benefits on the left and an interactive
 * Class Overview / Student Progress dashboard preview (clearly labelled sample data) on the right.
 */
export function TeacherPreview() {
  const [tab, setTab] = useState<"overview" | "students">("overview");
  // Slide in from the side of the tab you clicked.
  const dir = tab === "overview" ? -1 : 1;
  const tabs = [
    { id: "overview" as const, label: "Class Overview", Icon: BookOpenText },
    { id: "students" as const, label: "Student Progress", Icon: UsersThree },
  ];

  return (
    <MotionConfig reducedMotion="user">
    <section id="teachers" aria-labelledby="teachers-title" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <LandingSectionHeader
          id="teachers-title"
          lead="Designed for"
          accent="Teachers"
          subtitle="Give every learner speaking practice—and review attempts, difficulty levels, and tricky words in one calm dashboard."
        />

        <div className="mt-10 grid items-center gap-10 md:grid-cols-[0.88fr_1.12fr]">
          {/* Left: Structured benefits */}
          <div>
            <ul className="space-y-3">
            {[
              "Manage Basic, Medium, and Advanced exercises for your class.",
              "Upload custom words or sentences from your syllabus and assign due dates.",
              "Spot which students need extra support and which words the class misses most.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3.5" weight="bold" aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/onboarding"
            className="group/arrow mt-7 inline-flex h-11 items-center gap-2 rounded-xl border-2 border-foreground/20 bg-card px-5 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-foreground/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
          >
            Open Teacher Area
            <ArrowRight className="size-4 transition-transform group-hover/arrow:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>
        </div>

        {/* Right: Structured Teacher Dashboard Preview */}
        <div className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-primary" weight="duotone" aria-hidden />
              <span className="text-xs font-semibold text-muted-foreground">
                Sample Classroom Preview (Fictional Data)
              </span>
            </div>

            {/* Functional tab switcher */}
            <div role="tablist" aria-label="Teacher preview mode" className="inline-flex rounded-xl border border-border bg-card p-1">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring",
                    tab === id ? "text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* One black pill that glides between the tabs. */}
                  {tab === id ? (
                    <motion.span
                      layoutId="teacher-preview-tab"
                      className="absolute inset-0 rounded-lg bg-foreground"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="relative size-3.5" weight="duotone" aria-hidden />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Height eases between the two views; content slides in from the clicked side. */}
          <AutoHeight deps={[tab]} transition={{ duration: 0.4, ease: ease.resize }}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
          {tab === "overview" ? (
            <motion.div
              key="overview"
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.out } }}
              exit={{ opacity: 0, x: dir * -24, transition: { duration: 0.18, ease: ease.in } }}
              className="space-y-6 p-6"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Sample Students</p>
                  <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">28</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Weekly Attempts</p>
                  <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">146</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Class Avg (Demo)</p>
                  <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-score-good">79%</p>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Exercise Difficulty Completion (Sample)
                </p>
                {sampleDifficultyCounts.map((d) => (
                  <div key={d.level} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">
                        {d.level} <span className="font-normal text-muted-foreground">· {d.sampleWords}</span>
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">{d.completion}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${d.completion}%` }}
                        transition={{ duration: 0.8, delay: 0.15, ease: ease.out }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="students"
              custom={dir}
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: ease.out } }}
              exit={{ opacity: 0, x: dir * -24, transition: { duration: 0.18, ease: ease.in } }}
              className="p-6"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="pb-2.5 font-semibold">Student (Sample)</th>
                      <th className="pb-2.5 font-semibold">Completed</th>
                      <th className="pb-2.5 font-semibold">Latest Score</th>
                      <th className="pb-2.5 font-semibold">Needs Practice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sampleStudents.map((st, i) => (
                      <motion.tr
                        key={st.name}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.08 * i + 0.1, ease: ease.out }}
                      >
                        <td className="py-3 font-medium text-foreground">{st.name}</td>
                        <td className="py-3 text-xs text-muted-foreground tabular-nums">{st.progress}</td>
                        <td className="py-3">
                          <ScorePill score={st.score} />
                        </td>
                        <td className="py-3 text-xs text-muted-foreground">{st.focus}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          </AutoHeight>
        </div>
      </div>
      </div>
    </section>
    </MotionConfig>
  );
}
