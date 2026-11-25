"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PanelHeader, PanelTitle } from "@/components/brand/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelLabel, levels } from "@/features/curriculum/level";
import {
  MATERIAL_LIMITS,
  itemProblem,
  itemWarning,
  itemTypes,
  parseItemLines,
  todayInPakistan,
  validateMaterial,
  type MaterialErrors,
  type MaterialInput,
} from "@/lib/materials";
import { cn } from "@/lib/utils";
import type { ItemType } from "@/types";
import { saveMaterial } from "./actions";

interface Option {
  id: string;
  label: string;
}

const fieldClass = "rounded-xl border-2 border-foreground/12";
const selectClass =
  "h-11 w-full rounded-xl border-2 border-foreground/12 bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/** UC-10 form. Controlled fields so nothing is lost when validation fails. */
export function MaterialForm({ chapters, classes }: { chapters: Option[]; classes: Option[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [level, setLevel] = useState("basic");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [deadline, setDeadline] = useState("");
  const [rawItems, setRawItems] = useState("");
  const [typeOverrides, setTypeOverrides] = useState<Record<string, ItemType>>({});
  const [errors, setErrors] = useState<MaterialErrors>({});
  const [message, setMessage] = useState("");

  const items = useMemo(
    () => parseItemLines(rawItems).map((i) => ({ ...i, itemType: typeOverrides[i.text.toLowerCase()] ?? i.itemType })),
    [rawItems, typeOverrides],
  );
  const input: MaterialInput = { title, instructions, chapterId, level, classId, deadline, items };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const local = validateMaterial(input, todayInPakistan());
    setErrors(local);
    if (Object.keys(local).length) {
      setMessage("Please fix the highlighted fields.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      try {
        const res = await saveMaterial(input);
        if (res.ok) {
          toast.success(res.assigned ? "Material saved and assigned to the class." : "Material saved. You can assign it later.");
          router.push("/teacher/materials");
        } else {
          setErrors(res.errors);
          setMessage(res.message);
        }
      } catch {
        setMessage("No connection to the server. Check your internet and try again — nothing was saved.");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="max-w-3xl overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card"
      aria-busy={pending}
    >
      <PanelHeader>
        <PanelTitle>New practice material</PanelTitle>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Class 1</span>
      </PanelHeader>
      <div className="grid gap-5 p-5 sm:p-6">
      <Field label="Title" error={errors.title}>
        {(p) => <Input {...p} className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MATERIAL_LIMITS.titleMax} placeholder="e.g. Animal words — homework 1" />}
      </Field>
      <Field label="Instructions (optional)" error={errors.instructions}>
        {(p) => <Textarea {...p} className={fieldClass} value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Listen first, then say each word slowly." />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Chapter" error={errors.chapterId}>
          {(p) => (
            <select {...p} className={selectClass} value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              <option value="">Choose a chapter…</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Level" error={errors.level}>
          {(p) => (
            <select {...p} className={selectClass} value={level} onChange={(e) => setLevel(e.target.value)}>
              {levels.map((l) => (
                <option key={l} value={l}>{levelLabel[l]}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Assign to class" error={errors.classId} hint="Choose “Don't assign yet” to save it and assign later.">
          {(p) => (
            <select {...p} className={selectClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
              <option value="">Don&apos;t assign yet</option>
            </select>
          )}
        </Field>
        <Field label={classId ? "Due date" : "Due date (optional)"} error={errors.deadline}>
          {(p) => <Input {...p} className={fieldClass} type="date" min={todayInPakistan()} value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
        </Field>
      </div>

      <Field
        label="Practice items — one per line"
        error={errors.items}
        hint={`Class 1: words, short phrases or short sentences (best ${MATERIAL_LIMITS.sentenceWordsWarn} words or fewer, max ${MATERIAL_LIMITS.sentenceWordsMax}). Duplicates are removed.`}
      >
        {(p) => (
          <Textarea
            {...p}
            className={fieldClass}
            value={rawItems}
            onChange={(e) => setRawItems(e.target.value)}
            rows={6}
            placeholder={"cat\nred ball\nI see a big dog."}
          />
        )}
      </Field>

      {items.length > 0 ? (
        <section aria-label="Items preview" className="space-y-2">
          <p className="text-sm font-medium">
            {items.length} item{items.length === 1 ? "" : "s"} — check the type of each one
          </p>
          <ol className="divide-y overflow-hidden rounded-xl border-2 border-foreground/12">
            {items.map((it, i) => {
              const problem = errors.itemErrors?.[i] ?? itemProblem(it);
              const warning = problem ? null : itemWarning(it);
              return (
                <li key={it.text} className={cn("flex flex-wrap items-center gap-3 px-3 py-2", problem && "bg-destructive/5")}>
                  <span className="w-6 text-right text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1 break-words">{it.text}</span>
                  <select
                    aria-label={`Type for “${it.text}”`}
                    className={cn(selectClass, "h-8 w-32")}
                    value={it.itemType}
                    onChange={(e) => setTypeOverrides((o) => ({ ...o, [it.text.toLowerCase()]: e.target.value as ItemType }))}
                  >
                    {itemTypes.map((t) => (
                      <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  {problem ? <p className="w-full pl-9 text-sm text-destructive">{problem}</p> : null}
                  {warning ? <p className="w-full pl-9 text-sm text-score-good">{warning}</p> : null}
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <KiddyButton type="submit" disabled={pending}>
          {pending ? <CircleNotch className="animate-spin" /> : null}
          {pending ? "Saving…" : classId ? "Save and assign" : "Save material"}
        </KiddyButton>
        <p role="status" aria-live="polite" className={cn("text-sm", message && "text-destructive")}>
          {message}
        </p>
      </div>
      </div>
    </form>
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
      <Label htmlFor={id} className="font-heading font-semibold">{label}</Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p id={`${id}-err`} className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
