import Image from "next/image";
import Link from "next/link";
import { KiddyButton } from "@/components/brand/kiddy-button";

/**
 * SECTION 11A — FINAL CTA
 * Closes the landing tour with dual entry points into Student & Teacher experiences
 * and Pronnova's consistent mascot illustration.
 */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-16 md:py-22">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid items-center gap-8 overflow-hidden rounded-2xl border-2 border-primary/20 bg-tint-peach/80 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-12">
          <div>
            <h2 id="cta-title" className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Every little voice deserves to be heard.
            </h2>
            <p className="mt-3 max-w-lg text-base text-muted-foreground md:text-lg">
              Explore how Pronnova brings pronunciation practice and classroom guidance together—no sign-in required in this demo.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <KiddyButton href="/student" size="md">
                Explore Student Experience
              </KiddyButton>
              <Link
                href="/teacher"
                className="inline-flex h-12 items-center justify-center rounded-[0.875rem] border-2 border-foreground/20 bg-card px-6 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-foreground/40 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Explore Teacher Experience
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <Image
              src="/hero/piko-portrait.png"
              alt="Piko, the Pronnova learning buddy, smiling"
              width={419}
              height={420}
              sizes="(min-width: 768px) 240px, 180px"
              className="size-44 object-contain sm:size-56"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
