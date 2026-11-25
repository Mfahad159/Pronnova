import { BarChart3, BookOpen, Check, Ear, Globe2, Mic, Users } from "lucide-react";
import { Section } from "./section";

// Benefit pillars (layout idea: a strip of short benefits + two "learn / practise" cards).
const pillars = [
  { icon: Mic, label: "Score for every word" },
  { icon: Ear, label: "Tips for tricky sounds" },
  { icon: Globe2, label: "UK and US both correct" },
  { icon: BookOpen, label: "Chapters in order" },
  { icon: BarChart3, label: "Progress you can see" },
  { icon: Users, label: "Teacher dashboard" },
];

const cards = [
  {
    title: "Practise",
    tint: "bg-tint-peach",
    points: [
      "Read words, short phrases and sentences out loud",
      "Practise alone, at your own pace — no one listening",
      "Try again as many times as you like",
    ],
  },
  {
    title: "Improve",
    tint: "bg-tint-sky",
    points: [
      "See which words you got right and which to fix",
      "Find the sounds you keep missing, like v and w",
      "Unlock the next level when you're ready",
    ],
  },
];

export function Benefits() {
  return (
    <Section
      id="why"
      eyebrow="Why Pronnova"
      title="Read it right, one word at a time"
      intro="Speech tools that only write down what you said can't tell you how you said it. Pronnova checks each word and sound."
    >
      <ul className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3">
        {pillars.map(({ icon: Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium">
            <Icon className="size-4 text-primary" aria-hidden /> {label}
          </li>
        ))}
      </ul>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className={`rounded-3xl border p-6 md:p-8 ${c.tint}`}>
            <h3 className="font-heading text-2xl font-bold">{c.title}</h3>
            <ul className="mt-4 space-y-3">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
