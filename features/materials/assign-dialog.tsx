"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CircleNotch, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Field, fieldClass } from "@/components/brand/form";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { OutlineButton } from "@/components/brand/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, fieldError } from "@/lib/api-client";
import { todayInPakistan } from "@/lib/materials";
import { cn } from "@/lib/utils";

export interface AssignClass {
  id: string;
  name: string;
  studentCount: number;
}
export interface AssignStudent {
  id: string;
  fullName: string;
  rollNo: string;
  classId: string;
}

/** "10-A (32 students) + 3 individual students" */
export function assignSummary(classes: AssignClass[], classIds: string[], studentCount: number) {
  const parts = classes
    .filter((c) => classIds.includes(c.id))
    .map((c) => `${c.name} (${c.studentCount} student${c.studentCount === 1 ? "" : "s"})`);
  if (studentCount) parts.push(`${studentCount} individual student${studentCount === 1 ? "" : "s"}`);
  return parts.join(" + ");
}

/** UC-08 assign only: classes and/or individual students (archived hidden) + a due date. */
export function AssignDialog({
  open,
  onOpenChange,
  materialId,
  materialTitle,
  classes,
  students,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialTitle: string;
  classes: AssignClass[];
  students: AssignStudent[]; // active students only
}) {
  const router = useRouter();
  const today = todayInPakistan();
  const [classIds, setClassIds] = useState<string[]>([]);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState<string>();
  const [pending, start] = useTransition();

  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const q = query.trim().toLowerCase();
  const grouped = useMemo(
    () =>
      classes
        .map((c) => ({
          cls: c,
          students: students.filter((s) => s.classId === c.id && (!q || s.fullName.toLowerCase().includes(q) || s.rollNo === q)),
        }))
        .filter((g) => g.students.length > 0),
    [classes, students, q],
  );
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && dueDate >= today;
  const targets = classIds.length + studentIds.length;
  const summary = assignSummary(classes, classIds, studentIds.length);

  const submit = () =>
    start(async () => {
      setMessage(undefined);
      const r = await api("/api/assignments", { json: { materialId, dueDate, classIds, studentIds } });
      if (!r.ok) {
        setErrors(r.fieldErrors);
        if (!Object.keys(r.fieldErrors).length) setMessage(r.error ?? undefined);
        else if (!fieldError(r.fieldErrors, "dueDate") && !fieldError(r.fieldErrors, "targets")) setMessage(r.error ?? undefined);
        return;
      }
      toast.success(`Assigned “${materialTitle}” to ${summary}.`);
      onOpenChange(false);
      setClassIds([]);
      setStudentIds([]);
      setDueDate("");
      setErrors({});
      router.refresh(); // library's "assigned N times" updates
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto rounded-2xl border-2 border-foreground/12 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Assign “{materialTitle}”</DialogTitle>
          <DialogDescription>Pick whole classes and/or individual students, then a due date.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-heading text-sm font-semibold">Classes</legend>
            {classes.length === 0 ? <p className="text-sm text-muted-foreground">No classes yet — add them on Classes &amp; Students.</p> : null}
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => {
                const on = classIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold",
                      on ? "border-primary/50 bg-secondary text-primary" : "border-foreground/12",
                    )}
                  >
                    <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={on} onChange={() => toggle(classIds, setClassIds, c.id)} />
                    {c.name}
                    <span className="text-xs font-medium text-muted-foreground">({c.studentCount})</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="grid gap-2">
            <legend className="mb-2 font-heading text-sm font-semibold">Individual students</legend>
            <div className="relative">
              <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input aria-label="Search students" className={cn(fieldClass, "h-10 pl-9")} placeholder="Search by name or roll no." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border-2 border-foreground/10">
              {grouped.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">{q ? "No students match." : "No students yet."}</p>
              ) : (
                grouped.map((g) => (
                  <div key={g.cls.id} role="group" aria-label={g.cls.name}>
                    <p className="sticky top-0 bg-muted px-3 py-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">{g.cls.name}</p>
                    {g.students.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-secondary/40">
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--primary)]"
                          checked={studentIds.includes(s.id)}
                          onChange={() => toggle(studentIds, setStudentIds, s.id)}
                        />
                        <span className="w-8 text-xs font-semibold text-muted-foreground tabular-nums">#{s.rollNo}</span>
                        <span className="font-semibold">{s.fullName}</span>
                      </label>
                    ))}
                  </div>
                ))
              )}
            </div>
            {fieldError(errors, "targets") ? (
              <p role="alert" className="text-sm text-destructive">
                {fieldError(errors, "targets")}
              </p>
            ) : null}
          </fieldset>

          <Field label="Due date" error={fieldError(errors, "dueDate")} hint={dueDate && !validDate ? "Pick today or a later date." : undefined}>
            {(p) => <Input {...p} type="date" min={today} className={cn(fieldClass, "h-11 max-w-xs")} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
          </Field>

          <p aria-live="polite" className="flex items-start gap-2 rounded-xl bg-tint-mint/60 px-3 py-2 text-sm">
            <CalendarCheck className="mt-0.5 size-4 shrink-0 text-score-excellent" weight="bold" />
            <span>{targets ? <>For: <strong>{summary}</strong></> : "Nobody picked yet."}</span>
          </p>
          {message ? (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <OutlineButton onClick={() => onOpenChange(false)}>Cancel</OutlineButton>
          <KiddyButton size="sm" onClick={submit} disabled={pending || targets === 0 || !validDate}>
            {pending ? <CircleNotch className="animate-spin" /> : null} Assign
          </KiddyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
