import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/layout/landing-nav";

export const metadata = { title: "Get started" };

const roles = [
  {
    href: "/student",
    title: "I'm a student",
    body: "Read words and sentences out loud, get a score for every word, and see what to practise next.",
    image: "/objects/img1.jpg",
    alt: "A student reading into a microphone",
  },
  {
    href: "/teacher",
    title: "I'm a teacher",
    body: "Upload practice material for your class, set due dates, and see who needs help with which sounds.",
    image: "/avatar/avatar_standing_beside_dice.png",
    alt: "A teacher at a lectern",
  },
] as const;

// Onboarding: choose a role. In FYP-1 this opens the demo student or demo teacher (no sign-in, ADR-002).
// FYP-2 will route these choices to Sign up / Sign in instead.
export default function OnboardingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNav />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-10 md:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">How will you use Pronnova?</h1>
        <p className="mt-2 text-muted-foreground">Choose one to continue. You can switch any time from the menu.</p>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {roles.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card outline-none transition-colors hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <Image src={r.image} alt={r.alt} fill sizes="(min-width: 640px) 420px, 100vw" className="object-cover object-top" />
                </div>
                <div className="flex flex-1 items-start gap-3 p-5">
                  <div className="flex-1">
                    <h2 className="font-heading text-xl font-semibold">{r.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                  </div>
                  <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">Demo mode: no sign-in, sample data only.</p>
      </main>
    </div>
  );
}
