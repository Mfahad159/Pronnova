import {
  ArrowRight,
  AudioLines,
  BookOpen,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo, Container, SiteHeader, type SiteNavItem } from "@/components/layout";
import { Button } from "@/components/ui/button";

const NAV_LINKS: SiteNavItem[] = [
  { label: "Home", href: "/", exact: true },
  { label: "About", href: "#about" },
  { label: "Programs", href: "/student/chapters" },
  { label: "Practice", href: "/student", exact: true },
  { label: "Teacher Portal", href: "/teacher" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen selection:bg-surface-tint-coral selection:text-cta-coral">
      {/* 1. Header */}
      <SiteHeader homeHref="/" nav={NAV_LINKS}>
        <Button asChild size="sm">
          <Link href="/student">Start Practice</Link>
        </Button>
      </SiteHeader>

      <main className="flex flex-col">
        {/* 2. Hero Section Card */}
        <section aria-label="Hero" className="w-full">
          <Container className="py-8 sm:py-14">
            <div className="w-full overflow-hidden rounded-3xl border border-input/70 bg-card shadow-xs grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-6">
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.12] text-ink font-heading">
                    Transform your voice and speak with confidence
                  </h1>
                  <p className="max-w-md text-base sm:text-lg text-muted-foreground font-body">
                    Master clear spoken English with structured exercises and instant acoustic assessment.
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <Button asChild size="lg" className="px-7 py-3 text-sm font-semibold">
                    <Link href="/student">
                      Start practice
                      <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="lg" className="px-5 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">
                    <Link href="/student/chapters">Explore curriculum</Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[360px] sm:min-h-[440px] bg-[#FCEAE6]">
                <Image
                  src="/avatar/avatar_standing_beside_dice.png"
                  alt="Speaker presenting with confidence"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* 3. Coral Breakthrough Section with Card Inside (Exact Reference Background Style) */}
        <section
          aria-label="Methods"
          className="w-full bg-cta-coral text-white py-16 sm:py-24"
        >
          <Container className="flex flex-col items-center gap-4 text-center">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
              Breakthrough
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-heading">
              Proven voice improvement methods
            </h2>

            <p className="max-w-lg text-sm sm:text-base text-white/90 font-body">
              Acoustic speech training built to develop lasting clarity and natural pronunciation.
            </p>

            <div className="pt-1">
              <Link
                href="/student/chapters"
                className="inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white transition-colors"
              >
                Explore exercises
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {/* The Unified Card Sitting Inside the Coral Background */}
            <div className="w-full text-left rounded-3xl bg-card text-foreground overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 mt-8 sm:mt-12">
              <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center gap-6">
                <span className="text-xs font-bold text-cta-coral uppercase tracking-wider">
                  Technique
                </span>

                <div className="flex flex-col gap-2.5">
                  <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink font-heading">
                    Master your vocal range
                  </h3>
                  <p className="max-w-md text-sm sm:text-base text-muted-foreground font-body">
                    Targeted acoustic practice builds vocal control and pronunciation clarity.
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2.5">
                    <AudioLines className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>Vowel & consonant accuracy</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Sparkles className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>Real-time pitch tracking</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <TrendingUp className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>Word-level phoneme feedback</span>
                  </li>
                </ul>

                <div className="pt-1">
                  <Button asChild variant="outline" size="sm" className="border-cta-coral text-cta-coral hover:bg-cta-coral hover:text-white">
                    <Link href="/student">Start training</Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 relative min-h-[340px] sm:min-h-[420px] bg-[#FCEAE6]">
                <Image
                  src="/avatar/avatar_speaking.png"
                  alt="Student vocal range practice"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* 4. Why Choose Pronnova Section (Interactive Discovery Grid with Object Images) */}
        <section aria-label="Why Choose Pronnova" className="w-full">
          <Container className="py-16 sm:py-24 flex flex-col gap-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink font-heading">
                Why choose <span className="text-cta-coral">Pronnova</span>?
              </h2>
              <p className="max-w-md text-sm sm:text-base text-muted-foreground font-body">
                Empowering learners through structured acoustic practice and guided mentorship.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
              {/* Card 1: img1.jpg (16:9) */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-colors hover:border-border">
                <div className="flex flex-col gap-1.5 mb-4">
                  <h3 className="text-base font-bold text-foreground font-heading">
                    Optimal Language Learning
                  </h3>
                  <p className="font-body text-xs text-muted-foreground line-clamp-1">
                    Acoustic exercises designed to build rock-solid foundation in English pronunciation.
                  </p>
                </div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-warm shadow-2xs">
                  <Image
                    src="/objects/img1.jpg"
                    alt="Optimal language learning practice"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Card 2: img2.jpg (4:3) */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-colors hover:border-border">
                <div className="flex flex-col gap-1.5 mb-4">
                  <h3 className="text-base font-bold text-foreground font-heading">
                    Interactive Sound Discovery
                  </h3>
                  <p className="font-body text-xs text-muted-foreground line-clamp-1">
                    Fun read-aloud lessons that foster joyful speaking habits and natural speech rhythm.
                  </p>
                </div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-warm shadow-2xs">
                  <Image
                    src="/objects/img2.jpg"
                    alt="Interactive pronunciation discovery"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>

              {/* Card 3: img3.jpg (4:3) */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-colors hover:border-border">
                <div className="flex flex-col gap-1.5 mb-4">
                  <h3 className="text-base font-bold text-foreground font-heading">
                    Comprehensive Skill Building
                  </h3>
                  <p className="font-body text-xs text-muted-foreground line-clamp-1">
                    Structured phonics curriculum with teacher oversight and instant acoustic scoring.
                  </p>
                </div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-surface-warm shadow-2xs">
                  <Image
                    src="/objects/img3.jpg"
                    alt="Comprehensive speech skill building"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 5. Guided Mentorship Section */}
        <section id="about" aria-label="Mentorship" className="w-full border-t border-input/60">
          <Container className="py-16 sm:py-24">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="relative order-2 flex items-center justify-center lg:order-1 lg:col-span-5">
                <div className="relative aspect-[4/3] w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl shadow-sm">
                  <Image
                    src="/avatar/avatar_sitting_with_studentrs.jpg"
                    alt="Teacher guiding students with speech practice"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </div>

              <div className="order-1 flex flex-col gap-6 lg:order-2 lg:col-span-7">
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink font-heading">
                    Guided speech learning
                  </h2>
                  <p className="max-w-md text-sm sm:text-base text-muted-foreground font-body">
                    Structured curriculum with teacher analytics and self-paced student practice.
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 text-sm font-medium text-foreground">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>10 structured difficulty levels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <BookOpen className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>Instant audio model playback</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <GraduationCap className="size-4 text-cta-coral shrink-0" aria-hidden="true" />
                    <span>Teacher accuracy tracking</span>
                  </li>
                </ul>

                <div className="flex items-center gap-3 pt-1">
                  <Button asChild size="sm">
                    <Link href="/student">Student portal</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/teacher">Teacher portal</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* 6. Sleek Minimal Footer */}
      <footer className="border-t border-input bg-card py-6">
        <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandLogo href="/" size="sm" />

          <nav aria-label="Footer navigation" className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/student" className="hover:text-foreground">
              Student Practice
            </Link>
            <Link href="/student/chapters" className="hover:text-foreground">
              Chapters
            </Link>
            <Link href="/teacher" className="hover:text-foreground">
              Teacher Portal
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; 2026 Pronnova
          </p>
        </Container>
      </footer>
    </div>
  );
}
