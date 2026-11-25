import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Closing call to action (layout idea: the reference repeats one main CTA at the end of the page).
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="grid items-center overflow-hidden rounded-[2rem] border bg-secondary md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 md:p-12">
            <h2 id="cta-title" className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Ready to hear the difference?
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">Pick student or teacher and try it now. No sign-in needed in this demo.</p>
            <Button asChild size="lg" className="group mt-6 h-12 rounded-full px-6 text-base">
              <Link href="/onboarding">
                Get started <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
              </Link>
            </Button>
          </div>
          <Image
            src="/objects/img4.jpg"
            alt="A friendly bunny teacher pointing at letters"
            width={1200}
            height={896}
            sizes="(min-width: 768px) 420px, 100vw"
            className="h-full max-h-80 w-full object-cover md:max-h-none"
          />
        </div>
      </div>
    </section>
  );
}
