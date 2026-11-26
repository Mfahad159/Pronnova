import Link from "next/link";
import { cn } from "@/lib/utils";

/** Section title row used on app pages (landing section heading, smaller). */
export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "See all",
}: {
  id?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="font-heading text-xl font-bold tracking-tight">
        {title}
      </h2>
      {href ? (
        <Link href={href} className="text-sm font-semibold text-primary hover:underline">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Centered landing section header matching the clean two-tone headline + muted subtext style
 * (no eyebrow pill badge).
 */
export function LandingSectionHeader({
  id,
  lead,
  accent,
  subtitle,
  className,
}: {
  id: string;
  lead: React.ReactNode;
  accent: React.ReactNode;
  subtitle: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2 id={id} className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
        {lead} <span className="text-brand-coral">{accent}</span>
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{subtitle}</p>
    </div>
  );
}
