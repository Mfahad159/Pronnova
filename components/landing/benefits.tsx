import { Check } from "lucide-react";
import { ChaptersDoodle, EarDoodle, GlobeDoodle, IconBlob, MicDoodle, ProgressDoodle, TargetDoodle, TeacherDoodle, TrophyDoodle } from "@/components/icons/doodle";
import { Marker } from "./doodles";
import { Section } from "./section";

// Benefit pillars (layout idea: a strip of short benefits + two "learn / practise" cards).
const pillars = [
  { icon: MicDoodle, label: "A score for every word" },
  { icon: EarDoodle, label: "Tips for tricky sounds" },
  { icon: GlobeDoodle, label: "UK and US both correct" },
  { icon: ChaptersDoodle, label: "Chapters in order" },
  { icon: ProgressDoodle, label: "Progress you can see" },
  { icon: TeacherDoodle, label: "A dashboard for teachers" },
];

const cards = [
  {
    title: "Practise",
    icon: TargetDoodle,
    tint: "bg-tint-peach",
    points: [
      "Read words, short phrases and sentences out loud",
      "Practise alone, at your own pace — no one listening",
      "Try again as many times as you like",
    ],
  },
  {
    title: "Improve",
    icon: TrophyDoodle,
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
      title={<>Read it right, one <Marker>word</Marker> at a time</>}
      intro="Speech tools that only write down what you said can't tell you how you said it. Pronnova checks each word and sound."
    >
      <ul className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3">
        {pillars.map(({ icon: Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium">
            <Icon className="size-5 text-primary" /> {label}
          </li>
        ))}
      </ul>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className={`rounded-3xl border p-6 md:p-8 ${c.tint}`}>
            <div className="flex items-center gap-3">
              <IconBlob className="bg-card">
                <c.icon className="size-7" />
              </IconBlob>
              <h3 className="font-heading text-2xl font-bold">{c.title}</h3>
            </div>
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
