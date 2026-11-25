import Link from "next/link";
import { cn } from "@/lib/utils";

// Small building blocks copied from the landing page's class patterns (ADR-007), so app pages
// look exactly like the landing sections. Change the look here, not in pages.

/** Uppercase section label chip (landing: "Interactive Demo · No Sign-In Required"). */
export function Eyebrow({
  children,
  tone = "coral",
  className,
}: {
  children: React.ReactNode;
  tone?: "coral" | "mint" | "sky" | "card";
  className?: string;
}) {
  const tones = {
    coral: "bg-secondary text-primary",
    mint: "bg-tint-mint text-score-excellent",
    sky: "bg-tint-sky text-foreground",
    card: "bg-card text-primary",
  } as const;
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold tracking-wide uppercase [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}

/** App-like panel (landing: demo + teacher preview containers). */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card", className)}>{children}</div>;
}

/** Grey header strip on top of a Panel (title left, chips/tabs right). */
export function PanelHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/50 px-5 py-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

/** Dot + bold small title used in panel headers. */
export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-block size-2.5 rounded-full bg-primary" aria-hidden />
      <span className="font-heading text-sm font-semibold text-foreground">{children}</span>
    </div>
  );
}

const outline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-foreground/15 bg-card px-5 font-heading text-sm font-semibold text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/50 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-5";
const ink =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-5 font-heading text-sm font-semibold text-background outline-none transition-colors hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4";

/** Secondary action (landing: "Listen to “Apple”"). */
export function OutlineButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={cn(outline, className)} />;
}
export function OutlineLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(outline, className)}>
      {children}
    </Link>
  );
}

/** Ink "go" action (landing: "Try Recording in Demo"). */
export function InkLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(ink, className)}>
      {children}
    </Link>
  );
}
export function InkButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={cn(ink, className)} />;
}

/** Landing tab switcher ("Class Overview / Student Progress") for shadcn Tabs. */
export const tabsListClass = "h-auto rounded-xl border-2 border-foreground/12 bg-card p-1";
export const tabsTriggerClass =
  "h-9 rounded-lg px-4 font-heading text-sm font-semibold text-foreground/70 data-active:bg-foreground data-active:text-background";

/** Level badge colours from the landing's learning-journey cards. */
export const levelBadge = {
  basic: "bg-score-excellent text-white",
  medium: "bg-[#ffb000] text-foreground",
  advanced: "bg-[#2db8ff] text-foreground",
} as const;
/** Selected level card tone from the landing. */
export const levelTone = {
  basic: "border-score-excellent/40 bg-tint-mint",
  medium: "border-[#ffb000]/50 bg-tint-cream",
  advanced: "border-[#2db8ff]/40 bg-tint-sky",
} as const;

/** Small number tile (landing teacher preview: "Sample Students 28"). */
export function StatTile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 truncate font-heading text-2xl font-bold tabular-nums text-foreground", tone)}>{value}</p>
    </div>
  );
}

/** Check bullet used in landing lists. */
export function CheckDot({ className }: { className?: string }) {
  return (
    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary", className)} aria-hidden>
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    </span>
  );
}
