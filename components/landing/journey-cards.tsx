import Image from "next/image";
import { Check } from "lucide-react";
import { PillLink } from "./pill-link";

// "Start your journey" (reference layout): centred title, then two tinted cards — text + two facts +
// button with the photo on the right; then photo on the left with a checklist + button.
// Facts are real product rules (no invented percentages or ratings).
const facts = [
  { big: "3 levels", small: "Basic, Medium and Advanced in every chapter" },
  { big: "UK + US", small: "Both British and American pronunciation count as correct" },
];

const teacherPoints = [
  "Upload words and sentences from your own syllabus, one per line.",
  "Assign them to your class with a due date — students see them as homework.",
  "See each student's scores and the words the whole class gets wrong.",
];

export function JourneyCards() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-24 py-12 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <h2 id="journey-title" className="mx-auto max-w-xl text-center font-heading text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Start Your Journey to Clear, Confident English
        </h2>

        <div className="mt-10 space-y-6">
          {/* Students */}
          <article className="grid items-center gap-6 rounded-[2rem] bg-tint-peach p-4 md:grid-cols-[1.15fr_0.85fr] md:p-6">
            <div className="p-2 md:p-6">
              <h3 className="font-heading text-2xl font-semibold md:text-3xl">Practice That Fits Every School Day</h3>
              <p className="mt-3 max-w-md text-muted-foreground">
                Pick a chapter, read the text aloud, and see your score in seconds. Try again as often as you like —
                the next level opens when you&apos;re ready.
              </p>
              <dl className="mt-6 grid max-w-md grid-cols-2 gap-6">
                {facts.map((f) => (
                  <div key={f.big}>
                    <dt className="font-heading text-2xl font-semibold">{f.big}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{f.small}</dd>
                  </div>
                ))}
              </dl>
              <PillLink href="/onboarding" size="sm" className="mt-8">
                Start Practising
              </PillLink>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] md:aspect-[4/4]">
              <Image src="/photos/girls-studying-hijab.jpg" alt="Girls in school scarves reading at their desks" fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
            </div>
          </article>

          {/* Teachers */}
          <article className="grid items-center gap-6 rounded-[2rem] bg-tint-sky p-4 md:grid-cols-[0.85fr_1.15fr] md:p-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] md:order-first md:aspect-[4/4]">
              <Image src="/photos/class-listening-to-teacher.jpg" alt="A class listening to their teacher at the board" fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
            </div>
            <div className="p-2 md:p-6">
              <h3 className="font-heading text-2xl font-semibold md:text-3xl">Hear Every Student, Without Extra Hours</h3>
              <ul className="mt-5 space-y-3">
                {teacherPoints.map((p) => (
                  <li key={p} className="flex gap-3 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <PillLink href="/onboarding" size="sm" className="mt-8">
                Start as a Teacher
              </PillLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
