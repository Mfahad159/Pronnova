"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  CircleNotch,
  Copy,
  DotsSixVertical,
  FileDoc,
  LockSimple,
  PencilSimpleLine,
  Plus,
  Scissors,
  Trash,
  UploadSimple,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { BrandSelect, Field, fieldClass, inputClass, levelDot } from "@/components/brand/form";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { InkButton, OutlineButton, PanelHeader, PanelTitle, tabsListClass, tabsTriggerClass } from "@/components/brand/ui";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { levelLabel, levels } from "@/features/curriculum/level";
import { api, fieldError } from "@/lib/api-client";
import { MATERIAL_LIMITS, itemProblem, itemWarnings, wordCount } from "@/lib/materials";
import type { PreviewItem, SplitMode } from "@/lib/split-items";
import { cn } from "@/lib/utils";
import type { Level } from "@/types";

export interface EditorMaterial {
  id: string;
  title: string;
  level: Level;
  instructions: string | null;
  locked: boolean;
  items: string[];
}

interface Row {
  key: string;
  text: string;
}

let seq = 0;
const row = (text: string): Row => ({ key: `r${++seq}`, text });

const LOCKED_MSG = "Students have attempted this material, so items are locked.";

/**
 * New / Edit material (UC-10 teacher library). One item list fed by three tabs (Write, Paste,
 * Upload Word). Hard limit 25 words/item disables Save; level fit is only a warning. A locked
 * material (students attempted it) keeps items read-only; title/level/instructions stay editable.
 */
export function MaterialEditor({ material }: { material?: EditorMaterial }) {
  const router = useRouter();
  const editing = !!material;
  const locked = material?.locked ?? false;
  const [title, setTitle] = useState(material?.title ?? "");
  const [level, setLevel] = useState<Level>(material?.level ?? "basic");
  const [instructions, setInstructions] = useState(material?.instructions ?? "");
  const [rows, setRows] = useState<Row[]>(() => (material?.items ?? []).map(row));
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [duplicating, startDuplicate] = useTransition();

  const touch = () => setDirty(true);
  const texts = rows.map((r) => r.text);
  const tooLong = rows.filter((r) => wordCount(r.text) > MATERIAL_LIMITS.itemWordsMax).length;
  const warningCount = rows.filter((r) => !itemProblem(r.text) && itemWarnings(r.text, level).length).length;
  const tooMany = rows.length > MATERIAL_LIMITS.itemsMax;
  const canSave = !saving && !tooLong && !tooMany && (locked || rows.length > 0);

  // Guards link clicks + tab close. Save/Cancel/Duplicate navigate in code, which the guard never blocks.
  useUnsavedChangesGuard(dirty);

  const addItems = (newTexts: string[], replace = false) => {
    setRows((cur) => [...(replace ? [] : cur), ...newTexts.map(row)]);
    touch();
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setMessage(undefined);
    startSave(async () => {
      const body = { title, level, instructions, ...(locked ? {} : { items: texts }) };
      const r = editing
        ? await api(`/api/materials/${material.id}`, { method: "PATCH", json: body })
        : await api<{ id: string }>("/api/materials", { json: body });
      if (!r.ok) {
        setErrors(r.fieldErrors);
        setMessage(r.error ?? undefined);
        return;
      }
      setDirty(false);
      toast.success(editing ? "Material saved." : "Material added to your library.");
      router.push("/teacher/materials");
      router.refresh();
    });
  }

  const duplicate = () =>
    startDuplicate(async () => {
      const r = await api<{ id: string }>(`/api/materials/${material!.id}/duplicate`, { method: "POST" });
      if (!r.ok) return void toast.error(r.error);
      toast.success("Copy created — you can edit its items.");
      router.push(`/teacher/materials/${r.data!.id}`);
    });

  const itemErrors = (errors.itemErrors ?? {}) as Record<string, string>;

  return (
    <form onSubmit={save} noValidate className="grid max-w-3xl gap-6" aria-busy={saving}>
      {locked ? (
        <div role="status" className="flex flex-col items-start gap-3 rounded-2xl border-2 border-score-good/30 bg-tint-cream/70 p-4 sm:flex-row sm:items-center">
          <p className="flex min-w-0 flex-1 items-center gap-3 font-heading font-semibold">
            <LockSimple className="size-6 shrink-0 text-score-good" weight="duotone" />
            {LOCKED_MSG}
          </p>
          <InkButton onClick={duplicate} disabled={duplicating}>
            {duplicating ? <CircleNotch className="animate-spin" /> : <Copy weight="bold" />} Duplicate &amp; edit
          </InkButton>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
        <PanelHeader>
          <PanelTitle>{editing ? "Edit material" : "New material"}</PanelTitle>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Class 1</span>
        </PanelHeader>
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
            <Field label="Title" error={fieldError(errors, "title")}>
              {(p) => (
                <Input
                  {...p}
                  className={inputClass}
                  value={title}
                  onChange={(e) => (setTitle(e.target.value), touch())}
                  maxLength={MATERIAL_LIMITS.titleMax}
                  placeholder="e.g. Animal words — homework 1"
                />
              )}
            </Field>
            <Field label="Level" error={fieldError(errors, "level")} hint={levelHint[level]}>
              {(p) => (
                <BrandSelect
                  {...p}
                  value={level}
                  onChange={(v) => (setLevel(v as Level), touch())}
                  options={levels.map((l) => ({ value: l, label: levelLabel[l], dot: levelDot[l] }))}
                />
              )}
            </Field>
          </div>
          <Field label="Instructions (optional)" error={fieldError(errors, "instructions")}>
            {(p) => (
              <Textarea
                {...p}
                className={fieldClass}
                value={instructions}
                onChange={(e) => (setInstructions(e.target.value), touch())}
                rows={2}
                placeholder="Listen first, then say each word slowly."
              />
            )}
          </Field>
        </div>
      </div>

      {locked ? null : <AddItems level={level} hasItems={rows.length > 0} onAdd={addItems} />}

      <section aria-labelledby="items-heading" className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
        <PanelHeader>
          <h2 id="items-heading" className="font-heading text-sm font-semibold">
            Items
          </h2>
          {locked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <LockSimple className="size-3.5" weight="bold" /> Read-only
            </span>
          ) : null}
        </PanelHeader>
        <div className="grid gap-3 p-4 sm:p-5">
          {typeof errors.items === "string" ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.items}
            </p>
          ) : null}
          {rows.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-foreground/15 p-6 text-center text-sm text-muted-foreground">
              No items yet. Write them one by one, paste text, or upload a Word file above.
            </p>
          ) : (
            <Reorder.Group axis="y" values={rows} onReorder={(next) => (setRows(next), touch())} className="grid gap-2" as="ol">
              {rows.map((r, i) => (
                <ItemRow
                  key={r.key}
                  row={r}
                  index={i}
                  count={rows.length}
                  level={level}
                  locked={locked}
                  serverError={itemErrors[String(i)]}
                  onChange={(text) => (setRows((cur) => cur.map((x) => (x.key === r.key ? { ...x, text } : x))), touch())}
                  onRemove={() => (setRows((cur) => cur.filter((x) => x.key !== r.key)), touch())}
                  onMove={(d) => {
                    setRows((cur) => {
                      const j = i + d;
                      if (j < 0 || j >= cur.length) return cur;
                      const next = [...cur];
                      [next[i], next[j]] = [next[j], next[i]];
                      return next;
                    });
                    touch();
                  }}
                />
              ))}
            </Reorder.Group>
          )}
          {/* Footer, e.g. "12 items · 2 warnings" (one sentence so screen readers read it naturally). */}
          <p className="border-t pt-3 text-sm font-semibold text-muted-foreground" aria-live="polite">
            <span className={tooMany ? "text-destructive" : undefined}>
              {`${rows.length} item${rows.length === 1 ? "" : "s"}${tooMany ? ` (max ${MATERIAL_LIMITS.itemsMax})` : ""}`}
            </span>
            {" · "}
            <span className={warningCount ? "text-score-good" : undefined}>{`${warningCount} warning${warningCount === 1 ? "" : "s"}`}</span>
            {tooLong ? (
              <>
                {" · "}
                <span className="text-destructive">{`${tooLong} too long (max ${MATERIAL_LIMITS.itemWordsMax} words)`}</span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <KiddyButton type="submit" disabled={!canSave}>
          {saving ? <CircleNotch className="animate-spin" /> : null}
          {saving ? "Saving…" : editing ? "Save changes" : "Save material"}
        </KiddyButton>
        <OutlineButton
          onClick={() => {
            if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
            router.push("/teacher/materials");
          }}
        >
          Cancel
        </OutlineButton>
        {tooLong ? <span className="text-sm text-destructive">Shorten or split the red items to save.</span> : null}
        {message ? (
          <p role="alert" className="w-full text-sm text-destructive">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

const levelHint: Record<Level, string> = {
  basic: "Best with 1–3 words per item.",
  medium: "Best with 4–10 words per item.",
  advanced: "Best with 11–20 words per item.",
};

function ItemRow({
  row: r,
  index,
  count,
  level,
  locked,
  serverError,
  onChange,
  onRemove,
  onMove,
}: {
  row: Row;
  index: number;
  count: number;
  level: Level;
  locked: boolean;
  serverError?: string;
  onChange: (text: string) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}) {
  const controls = useDragControls();
  const words = wordCount(r.text);
  const problem = serverError ?? (r.text.trim() ? itemProblem(r.text) : null);
  const warnings = problem ? [] : itemWarnings(r.text, level);
  return (
    <Reorder.Item
      value={r}
      dragListener={false}
      dragControls={controls}
      as="li"
      className={cn(
        "grid gap-1 rounded-xl border-2 bg-background p-2",
        problem ? "border-destructive/50 bg-destructive/5" : warnings.length ? "border-score-good/30" : "border-foreground/10",
      )}
    >
      <div className="flex items-center gap-1.5">
        {locked ? null : (
          <button
            type="button"
            aria-label={`Drag item ${index + 1}`}
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          >
            <DotsSixVertical className="size-4" weight="bold" />
          </button>
        )}
        <span className="w-6 text-right text-xs font-semibold text-muted-foreground tabular-nums">{index + 1}</span>
        <Input
          aria-label={`Item ${index + 1}`}
          aria-invalid={problem ? true : undefined}
          readOnly={locked}
          className={cn("h-9 min-w-0 flex-1 rounded-lg", locked && "bg-muted/40")}
          value={r.text}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className={cn("w-12 shrink-0 text-right text-xs tabular-nums", words > MATERIAL_LIMITS.itemWordsMax ? "font-bold text-destructive" : "text-muted-foreground")}>
          {words} w
        </span>
        {locked ? null : (
          <span className="flex shrink-0">
            {/* Up/down = keyboard alternative to dragging; on phones the drag handle (touch) is enough. */}
            <span className="hidden sm:flex">
            <IconBtn label={`Move item ${index + 1} up`} disabled={index === 0} onClick={() => onMove(-1)}>
              <ArrowUp className="size-4" />
            </IconBtn>
            <IconBtn label={`Move item ${index + 1} down`} disabled={index === count - 1} onClick={() => onMove(1)}>
              <ArrowDown className="size-4" />
            </IconBtn>
            </span>
            <IconBtn label={`Remove item ${index + 1}`} onClick={onRemove} danger>
              <Trash className="size-4" />
            </IconBtn>
          </span>
        )}
      </div>
      {problem ? <p className="pl-14 text-sm text-destructive">{problem}</p> : null}
      {warnings.map((w) => (
        <p key={w} className="flex items-center gap-1 pl-14 text-sm text-score-good">
          <WarningCircle className="size-4 shrink-0" /> {w}
        </p>
      ))}
    </Reorder.Item>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn("rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30", danger ? "hover:text-destructive" : "hover:text-foreground")}
    >
      {children}
    </button>
  );
}

/** Write / Paste / Upload Word → items. Paste and Upload ask "Add or Replace?" when the list isn't empty. */
function AddItems({ level, hasItems, onAdd }: { level: Level; hasItems: boolean; onAdd: (texts: string[], replace?: boolean) => void }) {
  const [one, setOne] = useState("");
  const [paste, setPaste] = useState("");
  const [mode, setMode] = useState<SplitMode>("sentence");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [pending, setPending] = useState<PreviewItem[] | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const offer = (items: PreviewItem[]) => {
    setProblem(undefined);
    if (items.length === 0) return setProblem("No items found in that text.");
    if (hasItems) setPending(items);
    else onAdd(items.map((i) => i.text));
    return true;
  };

  async function split() {
    setBusy(true);
    const r = await api<{ items: PreviewItem[] }>("/api/materials/split", { json: { text: paste, mode, level } });
    setBusy(false);
    if (!r.ok) return setProblem(r.error ?? undefined);
    if (offer(r.data!.items)) setPaste("");
  }

  async function upload(file: File) {
    setBusy(true);
    setProblem(undefined);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    fd.append("level", level);
    const r = await api<{ items: PreviewItem[] }>("/api/materials/import", { body: fd });
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!r.ok) return setProblem(r.error ?? undefined);
    offer(r.data!.items);
  }

  const addOne = () => {
    if (!one.trim()) return;
    onAdd([one.trim()]);
    setOne("");
  };

  const modeToggle = (
    <div role="radiogroup" aria-label="Split" className="inline-flex rounded-xl border-2 border-foreground/12 bg-card p-1 text-sm">
      {(["sentence", "line"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => setMode(m)}
          className="rounded-lg px-3 py-1 font-semibold text-foreground/70 aria-checked:bg-foreground aria-checked:text-background"
        >
          {m === "sentence" ? "By sentence" : "One per line"}
        </button>
      ))}
    </div>
  );

  return (
    <section aria-labelledby="add-items" className="overflow-hidden rounded-2xl border-2 border-foreground/12 bg-card">
      <PanelHeader>
        <h2 id="add-items" className="font-heading text-sm font-semibold">
          Add items
        </h2>
      </PanelHeader>
      <div className="p-4 sm:p-5">
        <Tabs defaultValue="write" onValueChange={() => setProblem(undefined)}>
          <TabsList className={cn(tabsListClass, "grid w-full grid-cols-3 sm:inline-flex sm:w-fit")}>
            <TabsTrigger value="write" className={tabsTriggerClass}>
              <PencilSimpleLine className="size-4" /> Write
            </TabsTrigger>
            <TabsTrigger value="paste" className={tabsTriggerClass}>
              <Scissors className="size-4" /> Paste
            </TabsTrigger>
            <TabsTrigger value="upload" className={tabsTriggerClass} aria-label="Upload Word">
              <FileDoc className="size-4" /> <span className="sm:hidden">Word</span>
              <span className="hidden sm:inline">Upload Word</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="pt-4">
            <div className="flex gap-2">
              <Input
                aria-label="New item"
                className={cn(fieldClass, "h-11")}
                placeholder="Type a word or sentence, then press Enter"
                value={one}
                onChange={(e) => setOne(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOne();
                  }
                }}
              />
              <InkButton onClick={addOne} disabled={!one.trim()} className="shrink-0 whitespace-nowrap">
                <Plus weight="bold" /> Add item
              </InkButton>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="grid gap-3 pt-4">
            <Field label="Paste text" hint="Bullets and numbering are removed. Nothing is saved until you press Save.">
              {(p) => <Textarea {...p} className={fieldClass} rows={4} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"cat\nred ball\nI see a big dog."} />}
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              {modeToggle}
              <InkButton onClick={split} disabled={!paste.trim() || busy}>
                {busy ? <CircleNotch className="animate-spin" /> : <Scissors weight="bold" />} Split into items
              </InkButton>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="grid gap-3 pt-4">
            <div
              onDragOver={(e) => (e.preventDefault(), setDragOver(true))}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void upload(f);
              }}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                dragOver ? "border-primary bg-secondary/60" : "border-foreground/20 bg-muted/30",
              )}
            >
              {busy ? (
                <CircleNotch className="size-8 animate-spin text-primary" aria-label="Reading the file" />
              ) : (
                <UploadSimple className="size-8 text-primary" weight="duotone" />
              )}
              <p className="text-sm text-muted-foreground">{busy ? "Reading your Word file…" : "Drop a Word (.docx) file here, up to 5 MB"}</p>
              <OutlineButton onClick={() => fileRef.current?.click()} disabled={busy}>
                <FileDoc weight="bold" /> Choose a .docx file
              </OutlineButton>
              <input
                ref={fileRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                aria-label="Word file to import"
                onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
              />
            </div>
            {modeToggle}
          </TabsContent>
        </Tabs>

        {problem ? (
          <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl border-2 border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-semibold text-destructive">
            <WarningCircle className="size-4 shrink-0" weight="bold" /> {problem}
          </p>
        ) : null}
        {pending ? (
          <div role="status" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border-2 border-primary/25 bg-secondary/50 p-3 text-sm">
            <span className="min-w-0 flex-1 font-semibold">
              Found {pending.length} item{pending.length === 1 ? "" : "s"}. Your list already has items:
            </span>
            <InkButton className="h-9" onClick={() => (onAdd(pending.map((i) => i.text)), setPending(null))}>
              Add to list
            </InkButton>
            <OutlineButton className="h-9" onClick={() => (onAdd(pending.map((i) => i.text), true), setPending(null))}>
              Replace list
            </OutlineButton>
            <button type="button" className="px-2 text-muted-foreground hover:underline" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Warn before leaving with unsaved changes: browser close/reload (beforeunload) and in-app link
 * clicks (the App Router has no route-change blocker, so link clicks are checked in the capture phase).
 */
function useUnsavedChangesGuard(active: boolean) {
  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!active) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || a.getAttribute("target") === "_blank" || e.defaultPrevented) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [active],
  );
  useEffect(() => {
    if (!active) return;
    const before = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", onClick, true);
    };
  }, [active, onClick]);
}
