"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Shared form pieces in the brand style (ADR-007): rounded-xl fields with a soft 2px border,
// labels in the heading font, hint + error under the field (error wins the colour).

export const fieldClass = "rounded-xl border-2 border-foreground/12";
/** Single-line inputs: same 44px height as BrandSelect and the brand buttons. */
export const inputClass = "h-11 rounded-xl border-2 border-foreground/12";
const selectClass =
  "h-11 w-full rounded-xl border-2 border-foreground/12 bg-background px-3 text-sm aria-invalid:border-destructive data-[size=default]:h-11";

/** Literal classes so Tailwind generates them (level colours from the landing). */
export const levelDot = {
  basic: { bg: "bg-score-excellent", before: "before:bg-score-excellent" },
  medium: { bg: "bg-[#ffb000]", before: "before:bg-[#ffb000]" },
  advanced: { bg: "bg-[#2db8ff]", before: "before:bg-[#2db8ff]" },
} as const;

export type FieldProps = { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string };

/** Label + control + hint + error, wired for screen readers. */
export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: (props: FieldProps) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="font-heading font-semibold">
        {label}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  /** Colour dot: `bg` for the closed trigger, `before` for the list (Radix moves item text into the trigger). */
  dot?: { bg: string; before: string };
}

/** Animate UI select (opens with a spring, check glides) in the brand field style. */
export function BrandSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  ...trigger
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger {...trigger} className={cn(selectClass, className)}>
        <span className="flex min-w-0 items-center gap-2">
          {current?.dot ? <span className={cn("size-2.5 shrink-0 rounded-full", current.dot.bg)} aria-hidden /> : null}
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent position="popper" className="rounded-xl border-2 border-foreground/12 ring-0">
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            className={cn("rounded-lg py-2", o.dot && "gap-2 before:size-2.5 before:shrink-0 before:rounded-full before:content-['']", o.dot?.before)}
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
