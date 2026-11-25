"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { classify, classificationLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

// Coloured band with a small slider (reference: testimonial band). We have no real reviews, so the
// slides are EXAMPLE results showing what students see — labelled as examples, not quotes.
const examples = [
  {
    words: [["We", 1], ["visited", 0], ["the", 1], ["village", 0], ["very", 1], ["early.", 1]] as const,
    score: 68,
    tip: "Sound to practise: /v/ — touch your top teeth to your bottom lip and push air out: v-v-very.",
  },
  {
    words: [["Three", 0], ["thin", 1], ["thieves", 0], ["thought", 1], ["about", 1], ["the", 1], ["weather.", 1]] as const,
    score: 74,
    tip: "Sound to practise: /θ/ — put your tongue lightly between your teeth and blow: th-three.",
  },
  {
    words: [["Could", 1], ["you", 1], ["please", 1], ["close", 1], ["the", 1], ["door?", 1]] as const,
    score: 91,
    tip: "Great reading! Every word was clear. The next level is open for you.",
  },
];

const pillTone = {
  excellent: "bg-score-excellent/10 text-score-excellent",
  good: "bg-score-good/10 text-score-good",
  average: "bg-score-average/10 text-score-average",
} as const;

export function FeedbackSlider() {
  const [i, setI] = useState(0);
  const ex = examples[i];
  const c = classify(ex.score);
  const go = (d: number) => setI((v) => (v + d + examples.length) % examples.length);

  return (
    <section id="feedback" aria-labelledby="feedback-title" className="scroll-mt-24 bg-secondary py-14 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 md:grid-cols-[1.3fr_0.7fr] md:px-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Example feedback</p>
          <h2 id="feedback-title" className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            See Exactly What To Fix
          </h2>

          <div aria-live="polite" className="mt-8">
            <p className="flex flex-wrap gap-x-2 gap-y-1 text-2xl leading-snug md:text-3xl">
              {ex.words.map(([w, ok], k) => (
                <span key={k} className={ok ? "font-semibold text-score-excellent" : "rounded-lg bg-score-average/10 px-1.5 font-semibold text-score-average"}>
                  {w}
                </span>
              ))}
            </p>
            <p className="mt-4 flex items-center gap-3 text-muted-foreground">
              <span aria-hidden className="h-px w-8 bg-foreground/30" />
              {ex.tip}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous example"
                className="flex size-10 items-center justify-center rounded-full border border-foreground/30 outline-none hover:bg-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next example"
                className="flex size-10 items-center justify-center rounded-full bg-foreground text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="ml-2 self-center text-sm text-muted-foreground tabular-nums">
                {i + 1} / {examples.length}
              </span>
            </div>
            <span className={cn("rounded-full px-4 py-2 font-semibold tabular-nums", pillTone[c])}>
              {ex.score}% · {classificationLabel[c]}
            </span>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[1.75rem]">
          <Image src="/avatar/avatar_speaking.png" alt="The Pronnova guide speaking clearly" fill sizes="320px" className="object-cover" />
        </div>
      </div>
    </section>
  );
}
