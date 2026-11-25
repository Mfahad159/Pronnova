import Image from "next/image";
import Link from "next/link";
import { BookOpen, Microphone, Sparkle, SpeakerHigh } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "./kiddy-button";

/**
 * SECTION 01 — HERO: "Helping Little Voices Grow"
 * Uses the existing Pronnova Gemini swing illustration paired with surrounding floating
 * 2D learning elements (letters, sound waves, mic, book, stars) and high-contrast copy.
 */
export function HeroCard() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-background pt-6 pb-12 md:pt-8 md:pb-16">
      {/* Subtle floating decorative learning elements around the hero (hidden from screen readers) */}
      <div aria-hidden className="pointer-events-none mx-auto max-w-6xl">
        <span className="pronnova-float absolute top-14 left-[6%] hidden size-11 items-center justify-center rounded-xl border-2 border-foreground/15 bg-tint-peach font-heading text-xl font-bold text-primary lg:flex">
          A
        </span>
        <span className="pronnova-float-slow absolute top-44 left-[4%] hidden items-center gap-1.5 rounded-xl border-2 border-foreground/15 bg-tint-sky px-3 py-2 text-xs font-semibold text-foreground lg:flex">
          <SpeakerHigh className="size-4 text-primary" weight="duotone" />
          /æp.əl/
        </span>
        <span className="pronnova-float absolute bottom-20 left-[7%] hidden size-10 items-center justify-center rounded-xl border-2 border-foreground/15 bg-tint-cream text-chart-5 lg:flex">
          <Sparkle className="size-5" weight="duotone" />
        </span>

        <span className="pronnova-float-slow absolute top-16 right-[6%] hidden size-11 items-center justify-center rounded-xl border-2 border-foreground/15 bg-tint-mint font-heading text-xl font-bold text-score-excellent lg:flex">
          B
        </span>
        <span className="pronnova-float absolute top-48 right-[5%] hidden items-center gap-1.5 rounded-xl border-2 border-foreground/15 bg-secondary px-3 py-2 text-xs font-semibold text-primary lg:flex">
          <Microphone className="size-4" weight="duotone" />
          Speak!
        </span>
        <span className="pronnova-float-slow absolute right-[8%] bottom-24 hidden size-11 items-center justify-center rounded-xl border-2 border-foreground/15 bg-tint-lavender text-foreground lg:flex">
          <BookOpen className="size-5 text-primary" weight="duotone" />
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        {/* Existing Pronnova swing crew header illustration */}
        <div className="mx-auto -mt-6 w-full max-w-lg sm:-mt-8 sm:max-w-xl lg:max-w-[35rem]">
          <Image
            src="/hero/pronnova-swing-crew.png"
            alt="Pronnova's friendly 2D cartoon characters sitting together on a wooden swing with a book and headphones"
            width={1200}
            height={772}
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 560px, (min-width: 640px) 576px, 100vw"
            className="h-auto w-full object-contain object-top"
          />
        </div>

        {/* Central headline, supporting copy, and dual CTAs */}
        <div className="mx-auto mt-3 flex max-w-2xl flex-col items-center text-center md:mt-5">
          <h1
            id="hero-title"
            className="font-heading text-4xl leading-[1.08] font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[3.35rem]"
          >
            Helping little voices grow,{" "}
            <span className="text-primary">one word at a time.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            An interactive pronunciation learning experience for young learners in Pakistan, helping students practise speaking while teachers understand their progress.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <KiddyButton href="/#demo" size="lg">
              Explore the Experience
            </KiddyButton>
            <Link
              href="/#how-it-works"
              className="inline-flex h-13.5 items-center justify-center rounded-[0.875rem] border-2 border-foreground/20 bg-card px-7 font-heading text-base font-semibold text-foreground outline-none transition-colors hover:border-foreground/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
