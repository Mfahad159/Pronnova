import Image from "next/image";
import { Marker, Sparkles } from "./doodles";
import { Section } from "./section";

// A "product screenshot" built from real UI pieces (layout idea: feature row with a product image).
// Sample sentence + scores are illustrative only.
const words: { w: string; ok: boolean }[] = [
  { w: "We", ok: true },
  { w: "visited", ok: false },
  { w: "the", ok: true },
  { w: "village", ok: false },
  { w: "very", ok: true },
  { w: "early.", ok: true },
];

export function FeedbackPreview() {
  return (
    <Section
      id="feedback"
      eyebrow="Feedback"
      title={<>Not just “right” or <Marker>“wrong”</Marker></>}
      intro="Pronnova lines up what you said with the text and checks each sound, so you know exactly what to practise."
    >
      <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border bg-card p-6 md:p-8" aria-label="Example result">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">Example result</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-score-average/10 px-4 py-2 text-lg font-semibold text-score-average">68% · Average</span>
            <span className="text-sm text-muted-foreground">Try again to unlock the next level</span>
          </div>
          <p className="mt-6 flex flex-wrap gap-x-2 gap-y-2 text-2xl md:text-3xl">
            {words.map((x) => (
              <span
                key={x.w}
                className={x.ok ? "font-semibold text-score-excellent" : "rounded-lg bg-score-average/10 px-1.5 font-semibold text-score-average"}
              >
                {x.w}
              </span>
            ))}
          </p>
          <div className="mt-6 rounded-2xl bg-muted p-4">
            <p className="font-medium">
              Sound to practise: <span className="text-primary">/v/</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Touch your top teeth to your bottom lip and push air out: <em>v-v-very</em>. A /w/ uses round lips instead.
            </p>
          </div>
        </div>
        <div className="relative mx-auto max-w-sm">
          <Sparkles className="absolute -top-6 -left-4 z-10" />
          <Image
            src="/avatar/avatar_speaking.png"
            alt="The Pronnova guide speaking clearly"
            width={1192}
            height={1307}
            sizes="(min-width: 768px) 380px, 80vw"
            className="w-full rounded-3xl border bg-tint-peach"
          />
        </div>
      </div>
    </Section>
  );
}
