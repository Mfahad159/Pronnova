import Image from "next/image";
import { PillLink } from "./pill-link";

// Hero (reference layout): one big rounded image card — audience badge top-left, white headline
// with a short line under it, and the "Get Started Today" pill bottom-left.
const faces = ["/photos/girls-reading-together.jpg", "/photos/boy-in-classroom-pakistan.jpg", "/photos/student-reading-library.jpg"];

export function HeroCard() {
  return (
    <section aria-labelledby="hero-title" className="px-3 pb-6 md:px-5">
      <div className="relative isolate mx-auto flex min-h-[34rem] max-w-[90rem] flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white md:min-h-[38rem] md:rounded-[2.5rem] md:p-12">
        <Image
          src="/hero/hero-hillside-reading.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[80%_center]"
        />
        {/* Dark wash from the left so white text stays readable on the light sky. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/40 to-black/5" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Top edge darker too: the badge sits on bright clouds. */}
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-2/5 bg-gradient-to-b from-black/55 to-transparent" />

        <div>
          <p className="flex items-center gap-3 text-sm font-medium">
            <span className="flex -space-x-2">
              {faces.map((f) => (
                <span key={f} className="relative size-8 overflow-hidden rounded-full border-2 border-white/80">
                  <Image src={f} alt="" fill sizes="32px" className="object-cover" />
                </span>
              ))}
            </span>
            For Class 6–10 in Pakistan
          </p>
        </div>

        <div className="my-10">
          <h1 id="hero-title" className="max-w-2xl font-heading text-4xl leading-[1.08] font-semibold tracking-tight md:text-6xl">
            Say It Out Loud
            <br />
            See Every Word
            <br />
            Speak With Confidence
          </h1>
          <p className="mt-5 max-w-md text-base text-white/90 md:text-lg">
            Pronnova checks every word and sound you read aloud, and keeps a list of the ones to practise.
          </p>
        </div>

        {/* CTA bottom-left, where the topic tags used to be. */}
        <PillLink href="/onboarding" tone="light">
          Get Started Today
        </PillLink>
      </div>
    </section>
  );
}
