import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Piko, the learning buddy (landing "Meet Your Learning Buddy"): portrait tile + speech bubble.
 * Use for guidance, empty states, locked levels, errors and encouragement (ADR-007).
 */
export function PikoSays({
  message,
  children,
  tone = "peach",
  size = "md",
  className,
  live = false,
}: {
  message: React.ReactNode;
  children?: React.ReactNode;
  tone?: "peach" | "cream" | "sky" | "mint" | "card";
  size?: "sm" | "md";
  className?: string;
  /** Announce changes to screen readers (e.g. results). */
  live?: boolean;
}) {
  const tones = {
    peach: "border-primary/20 bg-tint-peach/75",
    cream: "border-primary/20 bg-tint-cream/70",
    sky: "border-foreground/10 bg-tint-sky/70",
    mint: "border-score-excellent/25 bg-tint-mint/70",
    card: "border-foreground/12 bg-card",
  } as const;
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 rounded-2xl border-2 p-5 text-center sm:flex-row sm:text-left",
        size === "md" ? "sm:p-6" : "sm:p-4",
        tones[tone],
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl border-2 border-foreground/12 bg-card",
          size === "md" ? "size-28 p-2" : "size-20 p-1.5",
        )}
      >
        <Image
          src="/hero/piko-portrait.png"
          alt="Piko, Pronnova's learning buddy"
          width={419}
          height={420}
          sizes={size === "md" ? "112px" : "80px"}
          className="size-full object-contain"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div aria-live={live ? "polite" : undefined} className="rounded-xl border-2 border-foreground/15 bg-card px-4 py-3">
          <p className={cn("font-heading font-bold text-primary", size === "md" ? "text-lg sm:text-xl" : "text-base")}>{message}</p>
        </div>
        {children ? <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">{children}</div> : null}
      </div>
    </div>
  );
}
