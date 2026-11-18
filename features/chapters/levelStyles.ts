import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type { ChapterAccentTone, DifficultyLevel } from "@/types";

export const LEVEL_BADGE_VARIANT: Record<
  DifficultyLevel,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  basic: "green",
  medium: "orange",
  advanced: "coral",
};

export const ACCENT_COVER_CLASSES: Record<
  ChapterAccentTone,
  { surface: string; badge: string; icon: string }
> = {
  peach: {
    surface: "bg-gradient-to-br from-surface-peach via-surface-warm to-[#ffd9a6]",
    badge: "bg-card/90 text-brand-orange",
    icon: "bg-brand-orange-soft text-white",
  },
  sky: {
    surface: "bg-gradient-to-br from-surface-sky via-[#c7ecff] to-[#a9e2ff]",
    badge: "bg-card/90 text-[#0284c7]",
    icon: "bg-info-blue text-white",
  },
  mint: {
    surface: "bg-gradient-to-br from-surface-mint via-[#daf0cb] to-[#c7e7b3]",
    badge: "bg-card/90 text-success",
    icon: "bg-success text-white",
  },
  cream: {
    surface: "bg-gradient-to-br from-surface-cream via-[#f7f1d0] to-[#efe5b3]",
    badge: "bg-card/90 text-[#b45309]",
    icon: "bg-warning text-white",
  },
};
