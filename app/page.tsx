import { LandingNav } from "@/components/layout/landing-nav";
import { Faq } from "@/components/landing/faq";
import { FeedbackSlider } from "@/components/landing/feedback-slider";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroCard } from "@/components/landing/hero-card";
import { JourneyCards } from "@/components/landing/journey-cards";
import { PhotoCollage } from "@/components/landing/photo-collage";
import { PractiseCards } from "@/components/landing/practise-cards";
import { SiteFooter } from "@/components/landing/site-footer";
import { SoundGuides } from "@/components/landing/sound-guides";
import { ValueCards } from "@/components/landing/value-cards";

// Landing. UI/UX follows the "Mindora" reference (rounded hero card, value cards, photo cards,
// tinted journey cards, coloured slider band, guides grid) with Pronnova's images, colours and content.
// Every "Get started" → /onboarding (Student or Teacher). No login in FYP-1 (ADR-002).
export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroCard />
        <ValueCards />
        <PractiseCards />
        <PhotoCollage />
        <JourneyCards />
        <FeedbackSlider />
        <SoundGuides />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
