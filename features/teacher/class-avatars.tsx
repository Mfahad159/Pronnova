"use client";

import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from "@animate-ui/react/primitives/avatar-group";
import { cn } from "@/lib/utils";

const tints = ["bg-tint-peach", "bg-tint-sky", "bg-tint-mint", "bg-tint-cream", "bg-tint-lavender", "bg-tint-rose"];

/** Animate UI avatar group: the class's students; hover one to lift it and see the name. */
export function ClassAvatars({ students, max = 8 }: { students: { id: string; name: string }[]; max?: number }) {
  if (students.length === 0) return null;
  const shown = students.slice(0, max);
  const extra = students.length - shown.length;
  return (
    <div className="flex items-center gap-3">
      <AvatarGroup className="flex h-10 -space-x-2.5" invertOverlap aria-label={`Students: ${students.map((s) => s.name).join(", ")}`}>
        {shown.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border-2 border-card font-heading text-sm font-bold text-foreground",
              tints[i % tints.length],
            )}
          >
            {initials(s.name)}
            <AvatarGroupTooltip className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
              <AvatarGroupTooltipArrow className="size-2.5 fill-foreground" />
              <p>{s.name}</p>
            </AvatarGroupTooltip>
          </div>
        ))}
      </AvatarGroup>
      {extra > 0 ? <span className="text-xs font-semibold text-muted-foreground">+{extra} more</span> : null}
    </div>
  );
}

function initials(name: string) {
  const parts = name.replace(/^(Mr|Ms|Mrs|Miss)\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
