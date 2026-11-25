import Image from "next/image";
import { cn } from "@/lib/utils";
import { DashedPath, Marker } from "./doodles";
import { Section } from "./section";

// Alternating image / text rows (layout idea: "you will get" feature rows), with numbered steps.
const steps = [
  {
    title: "Pick a lesson",
    body: "Chapters go from single words to full sentences. Start with Basic, then unlock Medium and Advanced as you improve. Homework from your teacher shows up at the top.",
    image: "/objects/img2.jpg",
    alt: "A boy holding word flashcards",
    tint: "bg-tint-peach",
  },
  {
    title: "Read it out loud",
    body: "Tap the mic and read the text clearly. Listen back, then tap “Check my reading”. If it was too quiet or too short, we’ll tell you right away.",
    image: "/objects/img1.jpg",
    alt: "A girl reading a book into a microphone",
    tint: "bg-tint-mint",
  },
  {
    title: "See every word",
    body: "Get a score out of 100 and a rating — Excellent, Good or Average. Words you said well turn green; words to fix turn red, with tips for the sounds behind them.",
    image: "/objects/img3.jpg",
    alt: "A student pointing at letters on a board",
    tint: "bg-tint-sky",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" eyebrow="How it works" title={<>Three steps, a few <Marker>minutes</Marker> a day</>} className="relative overflow-hidden bg-card">
      <DashedPath className="pointer-events-none absolute top-10 -left-10 hidden w-80 md:block" />
      <ol className="space-y-12 md:space-y-20">
        {steps.map((s, i) => (
          <li key={s.title} className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className={cn("relative overflow-hidden rounded-3xl border", s.tint, i % 2 === 1 && "md:order-2")}>
              <Image src={s.image} alt={s.alt} width={1200} height={896} sizes="(min-width: 768px) 520px, 100vw" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary font-heading text-xl font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-2xl font-bold md:text-3xl">{s.title}</h3>
              <p className="mt-3 text-lg text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
