import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pill link with a round arrow badge on the right (the reference's "Learn More ↗" button).
 * dark  = ink pill + coral circle (default, on light backgrounds)
 * light = white pill + coral circle (on photos / dark backgrounds)
 * small = compact size for cards
 */
export function PillLink({
  href,
  children,
  tone = "dark",
  size = "md",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex w-fit items-center rounded-full font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        size === "md" ? "h-12 gap-3 pr-1.5 pl-5 text-[0.95rem]" : "h-9 gap-2 pr-1 pl-3.5 text-xs",
        tone === "dark" ? "bg-foreground text-background hover:bg-foreground/90" : "bg-white text-foreground hover:bg-white/90",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
          size === "md" ? "size-9" : "size-7",
        )}
        aria-hidden
      >
        <ArrowUpRight
          className={cn(
            "transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none",
            size === "md" ? "size-4" : "size-3.5",
          )}
        />
      </span>
    </Link>
  );
}
