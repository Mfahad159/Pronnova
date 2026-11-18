import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Mic,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose a Chapter",
    description:
      "Browse curriculum-aligned chapters organized across Basic, Medium, and Advanced levels.",
    icon: BookOpen,
    cardVariant: "peach" as const,
    iconBg: "bg-brand-orange-soft text-white",
  },
  {
    step: "02",
    title: "Read Aloud",
    description:
      "Listen to reference pronunciation and record words, phrases, or short sentences clearly.",
    icon: Mic,
    cardVariant: "sky" as const,
    iconBg: "bg-info-blue text-white",
  },
  {
    step: "03",
    title: "Review Word Feedback",
    description:
      "See instant accuracy scores, word-level highlights, and progress tracked over time.",
    icon: CheckCircle2,
    cardVariant: "mint" as const,
    iconBg: "bg-success text-white",
  },
] as const;

export default function RoleEntryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-input bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" />
          <Badge variant="orange">English Pronunciation</Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center animate-fade-up">
          <Badge variant="coral">AI-Assisted Pronunciation Practice</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Speak English with{" "}
            <span className="text-accent-pink">Clarity &amp; Confidence</span>
          </h1>
          <p className="max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Choose your workspace below. Students practice structured read-aloud
            lessons with instant word-level feedback while teachers organize chapters
            and monitor progress.
          </p>
        </section>

        <section
          aria-label="Choose a portal"
          className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Card className="justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <CardHeader className="gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-12 items-center justify-center rounded-[16px] bg-surface-peach text-brand-orange">
                  <UserRound className="size-6" aria-hidden="true" />
                </span>
                <Badge variant="orange">Learners</Badge>
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription>
                Explore leveled chapters, listen to reference audio, record your
                pronunciation, and review word-by-word feedback.
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <Button asChild variant="orange" size="lg" className="w-full">
                <Link href="/student">
                  Enter Student Portal
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="justify-between transition-transform duration-150 hover:-translate-y-0.5">
            <CardHeader className="gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-12 items-center justify-center rounded-[16px] bg-surface-mint text-success">
                  <GraduationCap className="size-6" aria-hidden="true" />
                </span>
                <Badge variant="green">Educators</Badge>
              </div>
              <CardTitle className="text-2xl">Teacher Portal</CardTitle>
              <CardDescription>
                Manage curriculum chapters and difficulty levels, organize practice
                prompts, and review student pronunciation accuracy.
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <Button asChild variant="green" size="lg" className="w-full">
                <Link href="/teacher">
                  Enter Teacher Portal
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </section>

        <section aria-label="How Pronnova works" className="flex flex-col gap-4">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
            How Practice Works
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map(
              ({ step, title, description, icon: Icon, cardVariant, iconBg }) => (
                <Card key={step} variant={cardVariant}>
                  <CardHeader className="gap-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex size-10 items-center justify-center rounded-[14px] ${iconBg}`}
                      >
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-bold tracking-wider text-muted-foreground">
                        STEP {step}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-input bg-card/70 py-5 text-center text-xs font-medium text-muted-foreground">
        Pronnova — English Pronunciation Practice &amp; Progress
      </footer>
    </div>
  );
}
