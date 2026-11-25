import { ArrowRight, BookOpen, ChartBar, ClipboardText, Microphone, Sparkle } from "@phosphor-icons/react/ssr";

const workflow = [
  {
    step: "1",
    title: "Teacher selects exercise difficulty",
    detail: "Choose or upload Basic, Medium, or Advanced lessons tailored to the class.",
    Icon: ClipboardText,
    tone: "bg-tint-peach",
  },
  {
    step: "2",
    title: "Student practises assigned words",
    detail: "Learners listen to clear examples and record their own pronunciation.",
    Icon: Microphone,
    tone: "bg-tint-sky",
  },
  {
    step: "3",
    title: "Pronnova evaluates the attempt",
    detail: "Attempts are scored with word-level clarity feedback and saved safely.",
    Icon: Sparkle,
    tone: "bg-tint-cream",
  },
  {
    step: "4",
    title: "Teacher reviews student performance",
    detail: "Results appear in the teacher dashboard for class-wide visibility.",
    Icon: ChartBar,
    tone: "bg-tint-mint",
  },
  {
    step: "5",
    title: "Teacher identifies practice areas",
    detail: "Spot tricky words and assign targeted follow-up practice.",
    Icon: BookOpen,
    tone: "bg-tint-lavender",
  },
] as const;

/**
 * SECTION 08 — LEARNING THAT ADAPTS TO THE CLASSROOM
 * Connected 5-step teacher-student workflow highlighting teacher-controlled difficulty
 * without making unimplemented autonomous adaptation claims.
 */
export function ClassroomWorkflow() {
  return (
    <section id="classroom" aria-labelledby="classroom-title" className="scroll-mt-24 bg-secondary/45 py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Student–Teacher Loop
          </p>
          <h2 id="classroom-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Learning That Fits the Classroom
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Supporting teachers with clearer insights into every learner&apos;s pronunciation journey.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {workflow.map((w, i) => {
            const Icon = w.Icon;
            return (
              <li key={w.step} className="relative flex flex-col rounded-2xl border border-foreground/10 bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className={`flex size-10 items-center justify-center rounded-xl ${w.tone} text-foreground`}>
                    <Icon className="size-5 text-primary" weight="duotone" aria-hidden />
                  </span>
                  <span className="font-heading text-xs font-bold text-muted-foreground">Step {w.step}</span>
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-foreground">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.detail}</p>
                {i < workflow.length - 1 ? (
                  <ArrowRight
                    aria-hidden
                    className="mt-auto hidden pt-3 text-primary/50 lg:block lg:self-end"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
