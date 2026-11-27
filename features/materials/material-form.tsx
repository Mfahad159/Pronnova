"use client";

import { useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, FileDoc, Plus, Scissors, Trash, WarningCircle } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { OutlineButton, PanelHeader, PanelTitle } from "@/components/brand/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelLabel, levels } from "@/features/curriculum/level";
import { MATERIAL_LIMITS, itemProblem, itemWarnings, todayInPakistan, wordCount, type MaterialErrors, type MaterialWarning } from "@/lib/materials";
import type { PreviewItem, SplitMode } from "@/lib/split-items";
import { cn } from "@/lib/utils";
import type { Level } from "@/types";

interface Option {
  id: string;
  label: string;
}

const fieldClass = "rounded-xl border-2 border-foreground/12";
const selectClass =
  "h-11 w-full rounded-xl border-2 border-foreground/12 bg-background px-3 text-sm aria-invalid:border-destructive data-[size=default]:h-11";

// Literal classes so Tailwind generates them (level colours from the landing, ADR-007).
const levelDot = {
  basic: { bg: "bg-score-excellent", before: "before:bg-score-excellent" },
  medium: { bg: "bg-[#ffb000]", before: "before:bg-[#ffb000]" },
  advanced: { bg: "bg-[#2db8ff]", before: "before:bg-[#2db8ff]" },
} as const;

type FieldErrors = MaterialErrors & { assign?: Partial<Record<"dueDate" | "targets", string>> };

/**
 * UC-10 upload (teacher library): paste text or import a Word file → editable preview list →
 * save (and optionally assign to classes in the same transaction). Warnings never block saving.
 */
export function MaterialForm({ classes }: { classes: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [level, setLevel] = useState<Level>("basic");
  const [items, setItems] = useState<string[]>([]);
  const [paste, setPaste] = useState("");
  const [mode, setMode] = useState<SplitMode>("sentence");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverWarnings, setServerWarnings] = useState<MaterialWarning[]>([]);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addPreview = (preview: PreviewItem[]) => {
    setItems((cur) => [...cur, ...preview.map((p) => p.text)].slice(0, 50));
    setImportMsg(`Added ${preview.length} item${preview.length === 1 ? "" : "s"}. Check and edit them below.`);
  };

  async function splitPaste() {
    setImportMsg("");
    setImporting(true);
    try {
      const res = await fetch("/api/materials/split", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: paste, mode, level }),
      });
      const data = (await res.json()) as { items?: PreviewItem[]; error?: string };
      if (!res.ok || !data.items) return setImportMsg(data.error ?? "Couldn't split that text.");
      addPreview(data.items);
      setPaste("");
    } catch {
      setImportMsg("No connection. Try again.");
    } finally {
      setImporting(false);
    }
  }

  async function importWord(file: File) {
    setImportMsg("");
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      fd.append("level", level);
      const res = await fetch("/api/materials/import", { method: "POST", body: fd });
      const data = (await res.json()) as { items?: PreviewItem[]; error?: string };
      if (!res.ok || !data.items) return setImportMsg(data.error ?? "Couldn't read that file.");
      addPreview(data.items);
    } catch {
      setImportMsg("No connection. Try again.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const cleanItems = items.map((t) => t.replace(/\s+/g, " ").trim());
    const assign = classIds.length ? { dueDate, classIds, studentIds: [] } : null;
    startTransition(async () => {
      try {
        const res = await fetch("/api/materials", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, level, instructions, items: cleanItems, assign }),
        });
        const data = (await res.json()) as { id?: string; error?: string; fieldErrors?: FieldErrors; warnings?: MaterialWarning[] };
        setServerWarnings(data.warnings ?? []);
        if (res.ok && data.id) {
          toast.success(assign ? "Material saved and assigned." : "Material saved to your library.");
          router.push("/teacher/materials");
          return;
        }
        setErrors(data.fieldErrors ?? {});
        setMessage(data.error ?? "We couldn't save the material. Nothing was saved — please try again.");
      } catch {
        setMessage("No connection to the server. Check your internet and try again — nothing was saved.");
      }
    });
  }

  const materialWarnings = serverWarnings.filter((w) => w.item === undefined);

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card" aria-busy={pending}>
      <PanelHeader>
        <PanelTitle>New practice material</PanelTitle>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Class 1</span>
      </PanelHeader>
      <div className="grid gap-6 p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <Field label="Title" error={errors.title}>
            {(p) => (
              <Input {...p} className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MATERIAL_LIMITS.titleMax} placeholder="e.g. Animal words — homework 1" />
            )}
          </Field>
          <Field label="Level" error={errors.level} hint={levelHint(level)}>
            {(p) => (
              <BrandSelect
                {...p}
                value={level}
                onChange={(v) => setLevel(v as Level)}
                options={levels.map((l) => ({ value: l, label: levelLabel[l], dot: levelDot[l] }))}
              />
            )}
          </Field>
        </div>
        <Field label="Instructions (optional)" error={errors.instructions}>
          {(p) => (
            <Textarea {...p} className={fieldClass} value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Listen first, then say each word slowly." />
          )}
        </Field>

        {/* Add items: paste or Word → preview (nothing is saved until "Save"). */}
        <section aria-labelledby="add-items" className="grid gap-3 rounded-2xl border-2 border-dashed border-foreground/15 bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="add-items" className="font-heading font-bold">Add items</h2>
            <div role="radiogroup" aria-label="Split by" className="inline-flex rounded-xl border-2 border-foreground/12 bg-card p-1 text-sm">
              {(["sentence", "line"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className="rounded-lg px-3 py-1 font-semibold text-foreground/70 aria-checked:bg-foreground aria-checked:text-background"
                >
                  {m === "sentence" ? "By sentence" : "By line"}
                </button>
              ))}
            </div>
          </div>
          <Field label="Paste text" hint="Bullets and numbering are removed. Nothing is saved until you press Save.">
            {(p) => (
              <Textarea {...p} className={fieldClass} rows={4} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"cat\nred ball\nI see a big dog."} />
            )}
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <OutlineButton onClick={splitPaste} disabled={!paste.trim() || importing}>
              <Scissors weight="bold" /> Split into items
            </OutlineButton>
            <OutlineButton onClick={() => fileRef.current?.click()} disabled={importing}>
              <FileDoc weight="bold" /> Import Word (.docx)
            </OutlineButton>
            <input
              ref={fileRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              aria-label="Word file to import"
              onChange={(e) => e.target.files?.[0] && void importWord(e.target.files[0])}
            />
            {importing ? <CircleNotch className="size-5 animate-spin text-primary" aria-label="Working" /> : null}
          </div>
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {importMsg}
          </p>
        </section>

        {/* Editable preview */}
        <section aria-labelledby="items-heading" className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="items-heading" className="font-heading font-bold">
              Items <span className="text-sm font-medium text-muted-foreground">({items.length}/{MATERIAL_LIMITS.itemsMax})</span>
            </h2>
            <button type="button" onClick={() => setItems((c) => [...c, ""])} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              <Plus weight="bold" className="size-4" /> Add item
            </button>
          </div>
          {errors.items ? <p className="text-sm text-destructive">{errors.items}</p> : null}
          {items.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-foreground/15 p-4 text-center text-sm text-muted-foreground">
              No items yet — paste text, import a Word file, or add items one by one.
            </p>
          ) : (
            <ol className="grid gap-2">
              {items.map((text, i) => {
                const problem = errors.itemErrors?.[i] ?? (text.trim() ? itemProblem(text) : null);
                const warns = problem ? [] : itemWarnings(text, level);
                return (
                  <li key={i} className={cn("grid gap-1 rounded-xl border-2 border-foreground/10 bg-background p-2", problem && "border-destructive/40 bg-destructive/5")}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      <Input
                        aria-label={`Item ${i + 1}`}
                        className="h-9 flex-1 rounded-lg"
                        value={text}
                        onChange={(e) => setItems((c) => c.map((t, j) => (j === i ? e.target.value : t)))}
                      />
                      <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">{wordCount(text)} w</span>
                      <button
                        type="button"
                        aria-label={`Remove item ${i + 1}`}
                        onClick={() => setItems((c) => c.filter((_, j) => j !== i))}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>
                    {problem ? <p className="pl-8 text-sm text-destructive">{problem}</p> : null}
                    {warns.map((w) => (
                      <p key={w} className="flex items-center gap-1 pl-8 text-sm text-score-good">
                        <WarningCircle className="size-4 shrink-0" /> {w}
                      </p>
                    ))}
                  </li>
                );
              })}
            </ol>
          )}
          {materialWarnings.map((w) => (
            <p key={w.message} className="flex items-center gap-1 text-sm text-score-good">
              <WarningCircle className="size-4 shrink-0" /> {w.message}
            </p>
          ))}
        </section>

        {/* Assign now (optional) — UC-08 assign only */}
        <fieldset className="grid gap-3 rounded-2xl border-2 border-foreground/12 p-4">
          <legend className="px-1 font-heading font-bold">Assign now (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {classes.map((c) => {
              const on = classIds.includes(c.id);
              return (
                <label key={c.id} className={cn("flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold", on ? "border-primary/50 bg-secondary text-primary" : "border-foreground/12")}>
                  <input type="checkbox" className="accent-[var(--primary)]" checked={on} onChange={() => setClassIds((c2) => (on ? c2.filter((x) => x !== c.id) : [...c2, c.id]))} />
                  {c.label}
                </label>
              );
            })}
          </div>
          {errors.assign?.targets ? <p className="text-sm text-destructive">{errors.assign.targets}</p> : null}
          <Field label={classIds.length ? "Due date" : "Due date (when assigning)"} error={errors.assign?.dueDate}>
            {(p) => <Input {...p} className={cn(fieldClass, "max-w-xs")} type="date" min={todayInPakistan()} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
          </Field>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <KiddyButton type="submit" disabled={pending}>
            {pending ? <CircleNotch className="animate-spin" /> : null}
            {pending ? "Saving…" : classIds.length ? "Save and assign" : "Save material"}
          </KiddyButton>
          <p role="status" aria-live="polite" className={cn("text-sm", message && "text-destructive")}>
            {message}
          </p>
        </div>
      </div>
    </form>
  );
}

function levelHint(level: Level) {
  return { basic: "Best with 1–3 words per item.", medium: "Best with 4–10 words per item.", advanced: "Best with 11–20 words per item." }[level];
}

interface SelectOption {
  value: string;
  label: string;
  /** Colour dot: `bg` for the closed trigger, `before` for the list (Radix moves item text into the trigger). */
  dot?: { bg: string; before: string };
}

/** Animate UI select (opens with a spring, check glides) in the brand field style. */
function BrandSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  ...trigger
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Select value={value || undefined} onValueChange={onChange}>
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

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-2">
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
        <p id={`${id}-err`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
