import { Suspense } from "react";
import { CalendarBlank, FileText, LockSimple, UploadSimple } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { levelBadge } from "@/components/brand/ui";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { DuplicateMaterialButton } from "@/features/materials/duplicate-button";
import { cn } from "@/lib/utils";
import { listMaterials } from "@/server/db/queries/materials";

export const metadata = { title: "Materials" };

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Karachi",
});

// UC-10 teacher library: every material, how often it's assigned, and whether it's locked.
export default function MaterialsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Materials />
    </Suspense>
  );
}

async function Materials() {
  const materials = await listMaterials();

  return (
    <>
      <TopBar
        title="Materials"
        subtitle="Your library of practice material."
        action={
          <KiddyButton size="sm" href="/teacher/materials/new">
            <UploadSimple weight="bold" /> Upload material
          </KiddyButton>
        }
      />
      <PageBody>
        {materials.length === 0 ? (
          <PikoSays tone="cream" message="No materials yet. Upload words or sentences for your class to practise!">
            <KiddyButton size="sm" href="/teacher/materials/new">
              Upload your first material
            </KiddyButton>
          </PikoSays>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {materials.map((m) => (
              <li key={m.id} className="flex gap-4 rounded-2xl border-2 border-foreground/12 bg-card p-4 sm:p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-foreground/10 bg-tint-peach text-primary">
                  <FileText className="size-6" weight="duotone" />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-lg font-bold">{m.title}</p>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", levelBadge[m.level])}>{levelLabel[m.level]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {m.itemCount} item{m.itemCount === 1 ? "" : "s"} · added {dateFmt.format(new Date(m.createdAt))}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold",
                        m.assignmentCount ? "bg-secondary text-primary" : "border-2 border-dashed border-foreground/15 text-muted-foreground",
                      )}
                    >
                      <CalendarBlank className="size-3.5" weight="bold" />
                      {m.assignmentCount ? `Assigned ${m.assignmentCount}×` : "Not assigned yet"}
                    </span>
                    {m.locked ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-0.5 text-xs font-semibold text-muted-foreground"
                        title="Students have practised it, so its items can't change. Duplicate it to edit."
                      >
                        <LockSimple className="size-3.5" weight="bold" /> Items locked
                      </span>
                    ) : null}
                    <DuplicateMaterialButton materialId={m.id} title={m.title} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageBody>
    </>
  );
}
