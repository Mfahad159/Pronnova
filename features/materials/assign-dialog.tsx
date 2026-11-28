"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CircleNotch } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { Field, fieldClass } from "@/components/brand/form";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { OutlineButton } from "@/components/brand/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, fieldError } from "@/lib/api-client";
import { todayInPakistan } from "@/lib/materials";
import { cn } from "@/lib/utils";

/** The one student in FYP-1 (team decision 2026-11-28: one teacher, one student, no roster screens). */
export interface AssignTarget {
  id: string;
  name: string;
}

/**
 * UC-08 assign: send this material to the student with a due date. The same material can be assigned
 * again later (e.g. a new due date). Still posts to /api/assignments with `studentIds`, so FYP-2 can
 * bring back classes and many students without an API change.
 */
export function AssignDialog({
  open,
  onOpenChange,
  materialId,
  materialTitle,
  student,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialTitle: string;
  student: AssignTarget | null;
}) {
  const router = useRouter();
  const today = todayInPakistan();
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [message, setMessage] = useState<string>();
  const [pending, start] = useTransition();
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate) && dueDate >= today;

  const submit = () =>
    start(async () => {
      if (!student) return;
      setMessage(undefined);
      const r = await api("/api/assignments", { json: { materialId, dueDate, classIds: [], studentIds: [student.id] } });
      if (!r.ok) {
        setErrors(r.fieldErrors);
        if (!fieldError(r.fieldErrors, "dueDate")) setMessage(fieldError(r.fieldErrors, "targets") ?? r.error ?? undefined);
        return;
      }
      toast.success(`Assigned “${materialTitle}” to ${student.name}.`);
      onOpenChange(false);
      setDueDate("");
      setErrors({});
      router.refresh(); // library's "assigned N times" updates
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto rounded-2xl border-2 border-foreground/12 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Assign “{materialTitle}”</DialogTitle>
          <DialogDescription>Pick a due date. It shows up on {student?.name ?? "the student"}&apos;s home page straight away.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <Field label="Due date" error={fieldError(errors, "dueDate")} hint={dueDate && !validDate ? "Pick today or a later date." : undefined}>
            {(p) => <Input {...p} type="date" min={today} className={cn(fieldClass, "h-11 max-w-xs")} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />}
          </Field>

          <p aria-live="polite" className="flex items-start gap-2 rounded-xl bg-tint-mint/60 px-3 py-2 text-sm">
            <CalendarCheck className="mt-0.5 size-4 shrink-0 text-score-excellent" weight="bold" />
            <span>
              {student ? (
                <>
                  For: <strong>{student.name}</strong>
                </>
              ) : (
                "The student is missing. Run npm run db:seed."
              )}
            </span>
          </p>
          {message ? (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <OutlineButton onClick={() => onOpenChange(false)}>Cancel</OutlineButton>
          <KiddyButton size="sm" onClick={submit} disabled={pending || !student || !validDate}>
            {pending ? <CircleNotch className="animate-spin" /> : null} Assign
          </KiddyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
