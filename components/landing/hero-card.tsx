import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { HeroTagline } from "@/components/landing/hero-tagline";

/**
 * SECTION 01 — HERO: "Helping Little Voices Grow"
 * Clean centered hero using the Pronnova swing crew illustration, SwappingText headline,
 * and dual CTAs.
 */
export function HeroCard() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden bg-background pt-6 pb-12 md:pt-8 md:pb-16">
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
          <HeroTagline />

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            An interactive pronunciation learning experience for Class 1 learners in Pakistan, helping students practise speaking while teachers understand their progress.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            {/* Primary: straight to role selection (onboarding). Secondary: try the voice demo here. */}
            <KiddyButton href="/onboarding" size="lg">
              Get started <ArrowRight className="size-5" aria-hidden />
            </KiddyButton>
            <Link
              href="/#demo"
              className="inline-flex h-13.5 items-center justify-center rounded-[0.875rem] border-2 border-foreground/20 bg-card px-7 font-heading text-base font-semibold text-foreground outline-none transition-colors hover:border-foreground/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring"
            >
              Try the demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
