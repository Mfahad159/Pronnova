import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MicDoodle, TrophyDoodle } from "@/components/icons/doodle";
import { Sparkles } from "@/components/landing/doodles";
import type { ItemView } from "@/lib/progress";

/** Big "pick up where you stopped" card at the top of the student home (UC-03 alt 1A). */
export function ContinueCard({ next, resumed }: { next: ItemView | null; resumed: boolean }) {
  if (!next) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-3xl border bg-tint-mint p-6 sm:flex-row sm:items-center md:p-8">
        <TrophyDoodle className="size-12 text-score-excellent" />
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-bold">You&apos;ve finished everything that&apos;s open!</h2>
          <p className="mt-1 text-muted-foreground">Go back to any chapter to practise again and beat your best score.</p>
        </div>
        <Button asChild size="lg" className="h-12 rounded-full px-6">
          <Link href="/student/chapters">See chapters</Link>
        </Button>
      </section>
    );
  }
  return (
    <section aria-labelledby="continue-title" className="grid overflow-hidden rounded-3xl border bg-tint-peach md:grid-cols-[1fr_260px]">
      <div className="relative p-6 md:p-8">
        <Sparkles className="absolute top-4 right-4 hidden sm:block" />
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <MicDoodle className="size-5" /> {resumed ? "Pick up where you stopped" : "Your first exercise"}
        </p>
        <h2 id="continue-title" className="mt-2 font-heading text-3xl font-bold break-words md:text-4xl">
          “{next.text}”
        </h2>
        <p className="mt-1 text-muted-foreground">
          {next.lessonTitle} · <span className="capitalize">{next.itemType}</span>
          {next.best != null ? ` · your best so far: ${Math.round(next.best)}%` : ""}
        </p>
        <Button asChild size="lg" className="group mt-5 h-12 rounded-full px-6 text-base">
          <Link href={`/student/practice/${next.id}`}>
            {resumed ? "Continue reading" : "Start reading"}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </Button>
      </div>
      <Image
        src="/objects/img1.jpg"
        alt=""
        width={520}
        height={400}
        sizes="260px"
        className="hidden h-full w-full object-cover md:block"
      />
    </section>
  );
}

