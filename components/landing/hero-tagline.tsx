"use client";

import { SwappingText } from "@animate-ui/react/primitives/texts/swapping";
import { ease } from "@animate-ui/react/utils/motion";

const WORDS = ["word", "sound", "smile"];

/**
 * Hero headline with the rolling key word (Animate UI SwappingText), slowed down. The word sits in
 * a slot as wide as the longest word (all words stacked invisibly in one grid cell), so a swap never
 * changes where the line breaks: "… at a time." can't jump to another line mid-animation.
 */
export function HeroTagline() {
  return (
    <h1
      id="hero-title"
      className="font-heading text-4xl leading-[1.08] font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.35rem]"
    >
      Helping little voices grow,{" "}
      <span className="text-brand-coral">
        one{" "}
        <span className="whitespace-nowrap">
          <span className="inline-grid justify-items-center">
            {WORDS.map((w) => (
              <span key={w} aria-hidden className="invisible col-start-1 row-start-1">
                {w}
              </span>
            ))}
            <SwappingText
              text={WORDS}
              duration={3800}
              delay={1600}
              stagger={0.07}
              transition={{ duration: 0.45, ease: ease.out }}
              className="col-start-1 row-start-1"
            />
          </span>{" "}
          at a time.
        </span>
      </span>
    </h1>
  );
}
