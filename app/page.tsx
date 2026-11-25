import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/layout/landing-nav";
import { Benefits } from "@/components/landing/benefits";
import { Faq } from "@/components/landing/faq";
import { FeedbackPreview } from "@/components/landing/feedback-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { ForTeachers } from "@/components/landing/for-teachers";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Levels } from "@/components/landing/levels";
import { PhotoCollage } from "@/components/landing/photo-collage";
import { SiteFooter } from "@/components/landing/site-footer";

// Landing. "Get started" → /onboarding, where the visitor picks Student or Teacher.
// Section layout ideas from novakidenglish.com; all content, images and branding are Pronnova's.
// No login in FYP-1 (docs/decisions/002-fyp1-no-auth.md).
export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
      {/* Hero pulls up under the fixed navbar (-mt) so the photo shows behind it. */}
      <div className="relative isolate -mt-[4.5rem] pt-[4.5rem]">
        {/* Hero background: full-bleed photo with a white overlay so the text stays readable. */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <Image
            src="/hero/hero-hillside-reading.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[90%_bottom] md:object-[75%_bottom]"
          />
          {/* White overlay: an oval of white behind the centred text, fading out to the edges so the
              students on the right still show. Phones get an even wash (text covers the full width). */}
          <div className="absolute inset-0 bg-background/70 md:bg-transparent md:bg-[radial-gradient(ellipse_55%_60%_at_50%_45%,var(--background)_35%,color-mix(in_oklab,var(--background)_55%,transparent)_70%,transparent_100%)]" />
          {/* Bottom fade: the grass melts into the page colour instead of ending in a hard edge. */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-background/70 to-background md:h-56" />
        </div>

        <div className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl items-center justify-center px-4 py-12 md:px-6 md:py-20">
          <section className="flex max-w-2xl flex-col items-center space-y-6 text-center" aria-labelledby="hero-title">
            <h1 id="hero-title" className="font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl">
              Say it out loud. <span className="text-primary">See every word.</span>
            </h1>
            <p className="max-w-xl text-lg text-foreground/80">
              Read English words and sentences into your mic. Pronnova scores each word and sound, shows what to fix,
              and keeps track of the ones you keep missing.
            </p>
            <Button asChild size="lg" className="group h-12 rounded-full px-6 text-base">
              <Link href="/onboarding">
                Get started
                <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </Button>
            <p className="text-xs text-foreground/70">Demo mode: no sign-in, sample data only.</p>
          </section>
        </div>
      </div>

        <PhotoCollage />
        <Benefits />
        <HowItWorks />
        <FeedbackPreview />
        <Levels />
        <ForTeachers />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
