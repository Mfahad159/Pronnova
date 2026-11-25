// Small playful details (our own drawings): marker underline, sparkles, sticker label, dashed path.
// Use sparingly — one marker word per heading, one sticker per page.
import { cn } from "@/lib/utils";

/** Highlights a word with a hand-drawn marker stroke underneath. */
export function Marker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-x-[-4%] bottom-[-0.12em] z-0 h-[0.42em] w-[108%] text-primary/30"
      >
        <path d="M3 10.5C42 5.6 99 4.1 197 7.2" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M14 13.4c48-3.1 104-3.6 170-1.7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".7" />
      </svg>
    </span>
  );
}

/** A little cluster of sparkles to float next to a heading or image. */
export function Sparkles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" aria-hidden className={cn("h-10 w-12 text-primary", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 4c.9 5.2 3 7.5 8.1 8.4-5.1.9-7.2 3.2-8.1 8.4-.9-5.2-3.1-7.5-8.2-8.4C14 11.5 16.1 9.2 17 4z" />
      <path d="M36 21c.5 2.8 1.6 4.1 4.4 4.6-2.8.5-3.9 1.8-4.4 4.6-.5-2.8-1.7-4.1-4.5-4.6 2.8-.5 4-1.8 4.5-4.6z" />
      <path d="M8 29v4M6 31h4" />
    </svg>
  );
}

/** Tilted sticker label (one highlight per page). */
export function Sticker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-3 items-center gap-1.5 rounded-xl border-2 border-foreground bg-accent px-3 py-1 text-sm font-bold tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Dashed, wiggly "sound path" line — decorative background doodle. */
export function DashedPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 120" aria-hidden className={cn("text-primary/25", className)} fill="none">
      <path
        d="M4 96c38-58 70-74 104-50s52 42 86 18 52-64 92-58c20 3 30 14 30 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
    </svg>
  );
}
