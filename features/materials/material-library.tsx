"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarBlank, FileText, LockSimple, MagnifyingGlass, PaperPlaneTilt, PencilSimple, Plus } from "@phosphor-icons/react/ssr";
import { fieldClass } from "@/components/brand/form";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { OutlineButton, OutlineLink, levelBadge } from "@/components/brand/ui";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { levelLabel, levels } from "@/features/curriculum/level";
import { cn } from "@/lib/utils";
import type { Level } from "@/types";
import { AssignDialog, type AssignClass, type AssignStudent } from "./assign-dialog";
import { DuplicateMaterialButton } from "./duplicate-button";

export interface LibraryMaterial {
  id: string;
  title: string;
  level: Level;
  itemCount: number;
  assignmentCount: number;
  locked: boolean;
}

/** UC-10 teacher library: search, filter by level, Open / Assign / Duplicate. */
export function MaterialLibrary({ materials, classes, students }: { materials: LibraryMaterial[]; classes: AssignClass[]; students: AssignStudent[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [assigning, setAssigning] = useState<LibraryMaterial | null>(null);

  if (materials.length === 0) {
    return (
      <PikoSays tone="cream" message="No materials yet. Create your first lesson.">
        <KiddyButton size="sm" href="/teacher/materials/new">
          <Plus weight="bold" /> New material
        </KiddyButton>
      </PikoSays>
    );
  }

  const q = query.trim().toLowerCase();
  const shown = materials.filter((m) => (level === "all" || m.level === level) && (!q || m.title.toLowerCase().includes(q)));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search materials by title" className={cn(fieldClass, "h-11 pl-9")} placeholder="Search by title" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div role="radiogroup" aria-label="Filter by level" className="inline-flex flex-wrap rounded-xl border-2 border-foreground/12 bg-card p-1 text-sm">
          {(["all", ...levels] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={level === l}
              onClick={() => setLevel(l)}
              className="rounded-lg px-3 py-1.5 font-semibold text-foreground/70 aria-checked:bg-foreground aria-checked:text-background"
            >
              {l === "all" ? "All" : levelLabel[l]}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-foreground/15 p-6 text-center text-sm text-muted-foreground">No materials match your search.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {shown.map((m) => (
            <li key={m.id} className="flex flex-col gap-4 rounded-2xl border-2 border-foreground/12 bg-card p-4 sm:p-5">
              <div className="flex gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/10 bg-tint-peach text-primary">
                  <FileText className="size-6" weight="duotone" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/teacher/materials/${m.id}`} className="font-heading text-lg leading-tight font-bold hover:text-primary hover:underline">
                      {m.title}
                    </Link>
                    {m.locked ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} aria-label="Items locked: students have attempted this" className="text-muted-foreground">
                            <LockSimple className="size-4" weight="bold" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Students have attempted it, so its items are locked</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", levelBadge[m.level])}>{levelLabel[m.level]}</span>
                    <span>
                      {m.itemCount} item{m.itemCount === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarBlank className="size-3.5" weight="bold" />
                      {m.assignmentCount ? `assigned ${m.assignmentCount} time${m.assignmentCount === 1 ? "" : "s"}` : "not assigned yet"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <OutlineLink href={`/teacher/materials/${m.id}`} className="h-9 px-3 text-xs">
                  <PencilSimple weight="bold" /> Open
                </OutlineLink>
                <OutlineButton className="h-9 px-3 text-xs" onClick={() => setAssigning(m)} aria-label={`Assign ${m.title}`}>
                  <PaperPlaneTilt weight="bold" /> Assign
                </OutlineButton>
                <DuplicateMaterialButton materialId={m.id} title={m.title} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {assigning ? (
        <AssignDialog
          key={assigning.id}
          open
          onOpenChange={(o) => !o && setAssigning(null)}
          materialId={assigning.id}
          materialTitle={assigning.title}
          classes={classes}
          students={students}
        />
      ) : null}
    </div>
  );
}
