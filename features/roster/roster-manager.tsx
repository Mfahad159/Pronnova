"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArrowCounterClockwise, CircleNotch, PencilSimple, Plus, UsersThree } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { BrandSelect, Field, inputClass } from "@/components/brand/form";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { InkButton, OutlineButton, Panel, PanelHeader, PanelTitle } from "@/components/brand/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, fieldError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface RosterClass {
  id: string;
  name: string;
  studentCount: number;
}
export interface RosterStudent {
  id: string;
  fullName: string;
  rollNo: string;
  classId: string;
  archivedAt: string | null;
}

/** Classes & Students (roster for the "Who are you?" picker and assignments). Students are archived, never deleted. */
export function RosterManager({ classes, students }: { classes: RosterClass[]; students: RosterStudent[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(classes[0]?.id ?? null);
  const [showArchived, setShowArchived] = useState(false);
  const selected = classes.find((c) => c.id === selectedId) ?? classes[0] ?? null;
  const inClass = students.filter((s) => s.classId === selected?.id && (showArchived || !s.archivedAt));
  const archivedCount = students.filter((s) => s.classId === selected?.id && s.archivedAt).length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <ClassList classes={classes} selectedId={selected?.id ?? null} onSelect={setSelectedId} onChanged={() => router.refresh()} />

      {selected ? (
        <Panel>
          <PanelHeader>
            <PanelTitle>{selected.name}</PanelTitle>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
              Show archived{archivedCount ? ` (${archivedCount})` : ""}
            </label>
          </PanelHeader>
          <div className="grid gap-5 p-5 sm:p-6">
            <AddStudentForm classId={selected.id} onAdded={() => router.refresh()} />
            {inClass.length === 0 ? (
              <PikoSays size="sm" tone="card" message="No students in this class yet. Add the first one above." />
            ) : (
              <ul className="grid gap-2" aria-label={`Students in ${selected.name}`}>
                {inClass.map((s) => (
                  <StudentRow key={s.id} student={s} classes={classes} onChanged={() => router.refresh()} />
                ))}
              </ul>
            )}
          </div>
        </Panel>
      ) : (
        <PikoSays tone="cream" message="Add your first class to start your roster." />
      )}
    </div>
  );
}

function ClassList({
  classes,
  selectedId,
  onSelect,
  onChanged,
}: {
  classes: RosterClass[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const [renaming, setRenaming] = useState<string | null>(null);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await api<{ class: RosterClass }>("/api/classes", { json: { name } });
      if (!r.ok) return setError(fieldError(r.fieldErrors, "name") ?? r.error ?? undefined);
      setName("");
      setError(undefined);
      toast.success(`Class “${r.data!.class.name}” added.`);
      onSelect(r.data!.class.id);
      onChanged();
    });
  };

  return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Classes</PanelTitle>
        <span className="text-xs font-semibold text-muted-foreground">{classes.length}</span>
      </PanelHeader>
      <div className="grid gap-4 p-4">
        {classes.length ? (
          <ul className="grid gap-2">
            {classes.map((c) =>
              renaming === c.id ? (
                <li key={c.id}>
                  <RenameClass cls={c} onDone={(changed) => (setRenaming(null), changed && onChanged())} />
                </li>
              ) : (
                <li key={c.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-pressed={c.id === selectedId}
                    className={cn(
                      "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border-2 px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      c.id === selectedId ? "border-primary/40 bg-secondary text-primary" : "border-foreground/10 hover:border-primary/30",
                    )}
                  >
                    <span className="truncate font-heading font-bold">{c.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                      <UsersThree className="size-4" /> {c.studentCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Rename ${c.name}`}
                    onClick={() => setRenaming(c.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <PencilSimple className="size-4" />
                  </button>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No classes yet.</p>
        )}
        <form onSubmit={add} className="grid gap-2 border-t pt-4" aria-busy={pending}>
          <Field label="New class" error={error}>
            {(p) => <Input {...p} className={inputClass} placeholder="e.g. Class 1 – Red" value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <InkButton type="submit" disabled={pending || !name.trim()}>
            {pending ? <CircleNotch className="animate-spin" /> : <Plus weight="bold" />} Add class
          </InkButton>
        </form>
      </div>
    </Panel>
  );
}

function RenameClass({ cls, onDone }: { cls: RosterClass; onDone: (changed: boolean) => void }) {
  const [name, setName] = useState(cls.name);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-2 rounded-xl border-2 border-primary/30 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await api(`/api/classes/${cls.id}`, { method: "PATCH", json: { name } });
          if (!r.ok) return setError(fieldError(r.fieldErrors, "name") ?? r.error ?? undefined);
          toast.success("Class renamed.");
          onDone(true);
        });
      }}
    >
      <Field label={`Rename ${cls.name}`} error={error}>
        {(p) => <Input {...p} autoFocus className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <div className="flex gap-2">
        <InkButton type="submit" className="h-9 flex-1" disabled={pending}>
          {pending ? <CircleNotch className="animate-spin" /> : null} Save
        </InkButton>
        <OutlineButton className="h-9" onClick={() => onDone(false)}>
          Cancel
        </OutlineButton>
      </div>
    </form>
  );
}

function AddStudentForm({ classId, onAdded }: { classId: string; onAdded: () => void }) {
  const [fullName, setFullName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState<string>();
  const [pending, start] = useTransition();
  return (
    <form
      aria-busy={pending}
      className="grid gap-3 rounded-2xl border-2 border-dashed border-foreground/15 bg-muted/30 p-4 sm:grid-cols-[1fr_8rem_auto] sm:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await api<{ student: RosterStudent }>("/api/students", { json: { fullName, rollNo, classId } });
          if (!r.ok) {
            setErrors(r.fieldErrors);
            // A taken roll number is reported as a top-level 409: show it on the roll-no field.
            setMessage(r.status === 409 ? undefined : r.error ?? undefined);
            if (r.status === 409) setErrors({ rollNo: r.error });
            return;
          }
          toast.success(`${r.data!.student.fullName} added.`);
          setFullName("");
          setRollNo("");
          setErrors({});
          setMessage(undefined);
          onAdded();
        });
      }}
    >
      <Field label="Full name" error={fieldError(errors, "fullName")}>
        {(p) => <Input {...p} className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Ayesha Khan" />}
      </Field>
      <Field label="Roll no." error={fieldError(errors, "rollNo")}>
        {(p) => <Input {...p} className={inputClass} value={rollNo} onChange={(e) => setRollNo(e.target.value)} inputMode="numeric" placeholder="7" />}
      </Field>
      <div className="grid gap-2 sm:pt-7">
        <KiddyButton type="submit" size="sm" disabled={pending}>
          {pending ? <CircleNotch className="animate-spin" /> : <Plus weight="bold" />} Add student
        </KiddyButton>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-3">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function StudentRow({ student, classes, onChanged }: { student: RosterStudent; classes: RosterClass[]; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [pending, start] = useTransition();
  const archived = !!student.archivedAt;

  const unarchive = () =>
    start(async () => {
      const r = await api(`/api/students/${student.id}/unarchive`, { method: "POST" });
      if (!r.ok) return void toast.error(r.error);
      toast.success(`${student.fullName} is back on the roster.`);
      onChanged();
    });

  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-xl border-2 border-foreground/10 bg-card px-3 py-2.5", archived && "bg-muted/40 opacity-75")}>
      <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-secondary px-2 font-heading text-sm font-bold text-primary tabular-nums">
        {student.rollNo}
      </span>
      <span className="min-w-0 flex-1 truncate font-heading font-bold">{student.fullName}</span>
      {archived ? (
        <>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Archived</span>
          <OutlineButton className="h-9 px-3 text-xs" onClick={unarchive} disabled={pending} aria-label={`Unarchive ${student.fullName}`}>
            {pending ? <CircleNotch className="animate-spin" /> : <ArrowCounterClockwise weight="bold" />} <span className="hidden sm:inline">Unarchive</span>
          </OutlineButton>
        </>
      ) : (
        <div className="flex gap-1">
          <OutlineButton className="h-9 px-3 text-xs" onClick={() => setEditing(true)} aria-label={`Edit ${student.fullName}`}>
            <PencilSimple weight="bold" /> <span className="hidden sm:inline">Edit</span>
          </OutlineButton>
          <OutlineButton className="h-9 px-3 text-xs" onClick={() => setArchiving(true)} aria-label={`Archive ${student.fullName}`}>
            <Archive weight="bold" /> <span className="hidden sm:inline">Archive</span>
          </OutlineButton>
        </div>
      )}

      {editing ? <EditStudentDialog open onOpenChange={setEditing} student={student} classes={classes} onSaved={onChanged} /> : null}

      <Dialog open={archiving} onOpenChange={setArchiving}>
        <DialogContent className="rounded-2xl border-2 border-foreground/12">
          <DialogHeader>
            <DialogTitle className="font-heading">Archive {student.fullName}?</DialogTitle>
            <DialogDescription>
              They disappear from the “Who are you?” picker and can&apos;t be given new work. Their past attempts are kept. You can unarchive
              them any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <OutlineButton onClick={() => setArchiving(false)}>Cancel</OutlineButton>
            <InkButton
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await api(`/api/students/${student.id}/archive`, { method: "POST" });
                  if (!r.ok) return void toast.error(r.error);
                  toast.success(`${student.fullName} archived.`);
                  setArchiving(false);
                  onChanged();
                })
              }
            >
              {pending ? <CircleNotch className="animate-spin" /> : <Archive weight="bold" />} Archive
            </InkButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}

function EditStudentDialog({
  open,
  onOpenChange,
  student,
  classes,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  student: RosterStudent;
  classes: RosterClass[];
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(student.fullName);
  const [rollNo, setRollNo] = useState(student.rollNo);
  const [classId, setClassId] = useState(student.classId);
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 border-foreground/12">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit {student.fullName}</DialogTitle>
          <DialogDescription>Change the name or roll number, or move them to another class.</DialogDescription>
        </DialogHeader>
        <form
          id={`edit-${student.id}`}
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await api(`/api/students/${student.id}`, { method: "PATCH", json: { fullName, rollNo, classId } });
              if (!r.ok) {
                // 409 = roll number taken in that class → show it on the roll-no field.
                if (r.status === 409) setErrors({ rollNo: r.error });
                else if (Object.keys(r.fieldErrors).length) setErrors(r.fieldErrors);
                else setErrors({ form: r.error });
                return;
              }
              toast.success(classId !== student.classId ? `${fullName} moved.` : "Saved.");
              onOpenChange(false);
              onSaved();
            });
          }}
        >
          <Field label="Full name" error={fieldError(errors, "fullName")}>
            {(p) => <Input {...p} className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />}
          </Field>
          <Field label="Roll no." error={fieldError(errors, "rollNo")}>
            {(p) => <Input {...p} className={inputClass} value={rollNo} onChange={(e) => setRollNo(e.target.value)} />}
          </Field>
          <Field label="Class" error={fieldError(errors, "classId")}>
            {(p) => <BrandSelect {...p} value={classId} onChange={setClassId} options={classes.map((c) => ({ value: c.id, label: c.name }))} />}
          </Field>
          {fieldError(errors, "form") ? (
            <p role="alert" className="text-sm text-destructive">
              {fieldError(errors, "form")}
            </p>
          ) : null}
        </form>
        <DialogFooter>
          <OutlineButton onClick={() => onOpenChange(false)}>Cancel</OutlineButton>
          <InkButton type="submit" form={`edit-${student.id}`} disabled={pending}>
            {pending ? <CircleNotch className="animate-spin" /> : null} Save
          </InkButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
