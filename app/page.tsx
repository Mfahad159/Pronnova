import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Presentation } from "lucide-react";
import { LandingNav } from "@/components/layout/landing-nav";

// Landing: pick a demo role. No login in FYP-1 (docs/decisions/002-fyp1-no-auth.md).
export default function Home() {
  return (
    <div className="relative isolate flex min-h-svh flex-col">
      {/* Hero background: full-bleed photo with a white overlay so the text stays readable. */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/avatar/avatar_sitting_with_studentrs.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        {/* Stronger on the text side (left), lighter on the right so the teacher and students still show. */}
        <div className="absolute inset-0 bg-background/85 md:bg-transparent md:bg-gradient-to-r md:from-background md:via-background/85 md:to-background/30" />
      </div>

      <LandingNav />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-12 md:px-6 md:py-20">
        <section className="max-w-xl space-y-6">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Say it out loud. <span className="text-primary">See every word.</span>
          </h1>
          <p className="max-w-prose text-lg text-foreground/80">
            Read English words and sentences into your mic. Pronnova scores each word and sound, shows what to fix, and
            keeps track of the ones you keep missing.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <RoleLink href="/student" icon={<GraduationCap />} title="I'm a student" note="Practise lessons" />
            <RoleLink href="/teacher" icon={<Presentation />} title="I'm a teacher" note="Upload and track" />
          </div>
          <p className="text-xs text-foreground/70">Demo mode: no sign-in, sample data only.</p>
        </section>
      </main>
    </div>
  );
}

function RoleLink({ href, icon, title, note }: { href: string; icon: React.ReactNode; title: string; note: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border bg-card/90 p-4 shadow-sm outline-none backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{note}</span>
      </span>
      <ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
