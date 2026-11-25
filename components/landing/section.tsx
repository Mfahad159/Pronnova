import { cn } from "@/lib/utils";

/** Shared wrapper for landing sections: anchor id (navbar links), small label, title, intro. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn("scroll-mt-24 py-16 md:py-24", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          {eyebrow ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <SoundBars /> {eyebrow}
            </p>
          ) : null}
          <h2 id={id ? `${id}-title` : undefined} className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {title}
          </h2>
          {intro ? <p className="mt-3 text-lg text-muted-foreground">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Tiny sound-wave mark (echoes the logo's sound columns). Decorative. */
export function SoundBars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" aria-hidden className={cn("h-3.5 w-5", className)} fill="currentColor">
      <rect x="0" y="5" width="2.5" height="4" rx="1.25" />
      <rect x="4.4" y="2.5" width="2.5" height="9" rx="1.25" />
      <rect x="8.8" y="0" width="2.5" height="14" rx="1.25" />
      <rect x="13.2" y="2.5" width="2.5" height="9" rx="1.25" />
      <rect x="17.5" y="5" width="2.5" height="4" rx="1.25" />
    </svg>
  );
}
