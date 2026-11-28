import { RoleTransition } from "@/components/animate-ui/components/page-transition";
import { LandingNav } from "@/components/layout/landing-nav";
import { AssessmentShowcase } from "@/components/landing/assessment-showcase";
import { ClassroomWorkflow } from "@/components/landing/classroom-workflow";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { HeroCard } from "@/components/landing/hero-card";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { LearningBuddy } from "@/components/landing/learning-buddy";
import { LearningJourney } from "@/components/landing/learning-journey";
import { SiteFooter } from "@/components/landing/site-footer";
import { TeacherPreview } from "@/components/landing/teacher-preview";
import { YoungLearners } from "@/components/landing/young-learners";

// Guided interactive product tour landing page (11 sections in order).
// Works completely without authentication (FYP-1 ADR-002); simulated landing previews
// are clearly labelled as illustrative demonstration data.
export default function Home() {
  return (
    <RoleTransition area="landing">
      <LandingNav />
      <main>
        <HeroCard />
        <InteractiveDemo />
        <HowItWorks />
        <LearningBuddy />
        <LearningJourney />
        <AssessmentShowcase />
        <TeacherPreview />
        <ClassroomWorkflow />
        <YoungLearners />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </RoleTransition>
  );
}
