import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Presentation } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

// Landing: pick a demo role. No login in FYP-1 (docs/decisions/002-fyp1-no-auth.md).
export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-6 md:px-6">
      <BrandLogo />
      <section className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Say it out loud. <span className="text-primary">See every word.</span>
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">
            Read English words and sentences into your mic. Pronnova scores each word and sound, shows what to fix, and
            keeps track of the ones you keep missing.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <RoleLink href="/student" icon={<GraduationCap />} title="I'm a student" note="Practise lessons" />
            <RoleLink href="/teacher" icon={<Presentation />} title="I'm a teacher" note="Upload and track" />
          </div>
          <p className="text-xs text-muted-foreground">Demo mode: no sign-in, sample data only.</p>
        </div>
        <Image
          src="/avatar/avatar_sitting_with_studentrs.jpg"
          alt="A teacher helping two students practise reading"
          width={2400}
          height={1792}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="w-full rounded-3xl"
          priority
        />
      </section>
    </main>
  );
}

function RoleLink({ href, icon, title, note }: { href: string; icon: React.ReactNode; title: string; note: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5"
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
