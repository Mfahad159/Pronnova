"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CircleNotch, Check } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SetupSteps } from "@/components/brand/setup-steps";
import { Panel, PanelHeader, PanelTitle } from "@/components/brand/ui";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { checkStudent, forgetStudent, readSavedStudentId, rememberStudent } from "./identity";

interface PickerClass {
  id: string;
  name: string;
  studentCount: number;
}
interface PickerStudent {
  id: string;
  fullName: string;
  rollNo: string;
}

const tints = ["bg-tint-peach", "bg-tint-sky", "bg-tint-mint", "bg-tint-cream", "bg-tint-lavender", "bg-tint-rose"];

/**
 * "Who are you?" (first visit on this device). This replaces login until auth arrives in FYP-2
 * (ADR-002). If a saved student is still valid we go straight to the dashboard; if they were
 * archived or removed (404), the saved id is cleared and the picker shows.
 */
export function StudentPicker({ classes }: { classes: PickerClass[] }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<PickerStudent[] | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const [finished, setFinished] = useState(false);

  // Returning visitor: re-use the saved student if they're still active.
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = readSavedStudentId();
      if (saved) {
        const r = await checkStudent(saved);
        if (r.ok && (await rememberStudent(saved)).ok) return router.replace("/student");
        await forgetStudent(); // archived / missing → start again
      }
      if (alive) setChecking(false);
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  useEffect(() => {
    if (!classId) return;
    let alive = true;
    (async () => {
      const r = await api<{ students: PickerStudent[] }>(`/api/students?classId=${classId}`);
      if (!alive) return;
      if (r.ok) setStudents(r.data!.students);
      else setLoadError(r.error ?? undefined);
    })();
    return () => {
      alive = false;
    };
  }, [classId]);

  const pickClass = (id: string | null) => {
    setClassId(id);
    setStudents(null);
    setLoadError(undefined);
    setChosen(null);
    setError(undefined);
  };

  const proceed = () => {
    if (!chosen) return;
    // Outside the transition so the last step ticks green at once, while the dashboard loads.
    setFinished(true);
    start(async () => {
      const r = await rememberStudent(chosen);
      if (!r.ok) {
        setFinished(false);
        return setError(r.status === 404 ? "That name isn't available any more. Pick again." : (r.error ?? undefined));
      }
      router.replace("/student");
      router.refresh();
    });
  };

  if (checking) {
    return (
      <div role="status" className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
        <CircleNotch className="size-6 animate-spin text-primary" /> Getting things ready…
      </div>
    );
  }

  const cls = classes.find((c) => c.id === classId);

  return (
    <div className="space-y-6">
      <SetupSteps current={cls ? 2 : 1} finished={finished} />
      {cls ? renderNames(cls) : renderClasses()}
    </div>
  );

  function renderClasses() {
    return classes.length === 0 ? (
      <PikoSays tone="cream" message="No classes yet. Ask your teacher!" />
    ) : (
      <Panel>
        <PanelHeader>
          <PanelTitle>Pick your class</PanelTitle>
        </PanelHeader>
        <ul className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          {classes.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => pickClass(c.id)}
                className={cn(
                  "flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl border-2 border-foreground/12 p-5 text-left font-heading text-xl font-bold outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring",
                  tints[i % tints.length],
                )}
              >
                {c.name}
                <ArrowRight className="size-6 shrink-0 text-primary" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  function renderNames(cls: PickerClass) {
    return (
    <Panel>
      <PanelHeader>
        <PanelTitle>Find your name in {cls.name}</PanelTitle>
        <button type="button" onClick={() => pickClass(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Other class
        </button>
      </PanelHeader>
      <div className="grid gap-5 p-5 sm:p-6">
        {loadError ? (
          <p role="alert" className="text-sm text-destructive">
            {loadError}
          </p>
        ) : students === null ? (
          <div role="status" className="flex items-center gap-2 text-muted-foreground">
            <CircleNotch className="size-5 animate-spin text-primary" /> Loading names…
          </div>
        ) : students.length === 0 ? (
          <PikoSays size="sm" tone="cream" message="No names in this class yet. Ask your teacher." />
        ) : (
          <ul role="radiogroup" aria-label="Your name" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {students.map((s, i) => {
              const on = chosen === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setChosen(s.id)}
                    className={cn(
                      "relative flex w-full flex-col items-center gap-2 rounded-2xl border-2 p-4 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                      on ? "border-primary bg-secondary" : "border-foreground/12 bg-card hover:border-primary/40",
                    )}
                  >
                    {on ? <Check className="absolute top-2 right-2 size-5 text-primary" weight="bold" aria-hidden /> : null}
                    <span className={cn("flex size-14 items-center justify-center rounded-full border-2 border-card font-heading text-xl font-bold", tints[i % tints.length])}>
                      {s.fullName.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-heading text-lg font-bold">{s.fullName}</span>
                    <span className="text-xs text-muted-foreground">Roll no. {s.rollNo}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <KiddyButton size="lg" onClick={proceed} disabled={!chosen || pending} className="w-full sm:w-fit">
          {pending ? <CircleNotch className="animate-spin" /> : null} Continue <ArrowRight className="size-5" aria-hidden />
        </KiddyButton>
      </div>
    </Panel>
    );
  }
}
