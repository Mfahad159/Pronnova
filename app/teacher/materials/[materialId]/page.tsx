import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarBlank, UsersThree, User } from "@phosphor-icons/react/ssr";
import { Panel, PanelHeader, PanelTitle } from "@/components/brand/ui";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MaterialEditor } from "@/features/materials/material-editor";
import { isUuid } from "@/server/db/queries/curriculum";
import { getMaterial } from "@/server/db/queries/materials";

const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// UC-10 edit (same editor as "new") + read-only list of this material's assignments (UC-08 assign only).
export default function EditMaterialPage(props: PageProps<"/teacher/materials/[materialId]">) {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <EditMaterial params={props.params} />
    </Suspense>
  );
}

async function EditMaterial({ params }: { params: PageProps<"/teacher/materials/[materialId]">["params"] }) {
  const { materialId } = await params;
  if (!isUuid(materialId)) notFound();
  const m = await getMaterial(materialId);
  if (!m) notFound();

  return (
    <>
      <TopBar title={m.title} subtitle={m.locked ? "Items locked — students have attempted this." : "Edit the material, then save."} />
      <PageBody>
        <MaterialEditor
          material={{ id: m.id, title: m.title, level: m.level, instructions: m.instructions, locked: m.locked, items: m.items.map((i) => i.text) }}
        />
        <Panel className="max-w-3xl">
          <PanelHeader>
            <PanelTitle>Assignments</PanelTitle>
            <span className="text-xs font-semibold text-muted-foreground">{m.assignments.length}</span>
          </PanelHeader>
          {m.assignments.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Not assigned yet. Use “Assign” in the library.</p>
          ) : (
            <ul className="divide-y">
              {m.assignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    <CalendarBlank className="size-3.5" weight="bold" /> Due {dateFmt.format(new Date(`${a.dueDate}T00:00:00Z`))}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {a.targets.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full border-2 border-foreground/10 px-2.5 py-0.5 text-xs font-semibold">
                        {t.classId ? <UsersThree className="size-3.5" /> : <User className="size-3.5" />}
                        {t.className ?? t.studentName ?? "—"}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </PageBody>
    </>
  );
}
