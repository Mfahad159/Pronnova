import { Suspense } from "react";
import Link from "next/link";
import { CalendarClock, FileText, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { levelLabel } from "@/features/curriculum/level";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { listTeacherMaterials } from "@/server/db/queries/materials";

export const metadata = { title: "Materials" };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" });

// UC-10: what the teacher has uploaded, and to whom it is assigned.
export default function MaterialsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Materials />
    </Suspense>
  );
}

async function Materials() {
  const teacher = await getCurrentTeacher();
  const materials = await listTeacherMaterials(teacher.id);

  return (
    <>
      <TopBar
        title="Materials"
        subtitle="Everything you've uploaded, and who it's assigned to."
        action={
          <Button asChild size="lg">
            <Link href="/teacher/materials/new">
              <Upload /> Upload material
            </Link>
          </Button>
        }
      />
      <PageBody>
        {materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-medium">No materials yet</p>
            <p className="mb-4 text-sm text-muted-foreground">Upload words or sentences for your class to practise.</p>
            <Button asChild>
              <Link href="/teacher/materials/new">Upload your first material</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3">
            {materials.map((m) => (
              <li key={m.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl border bg-card p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold">{m.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {m.chapterTitle} · {levelLabel[m.level]} · {m.itemCount} item{m.itemCount === 1 ? "" : "s"} · added{" "}
                    {dateFmt.format(new Date(m.createdAt))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {m.assignedTo.length === 0 ? (
                    <Badge variant="outline">Not assigned yet</Badge>
                  ) : (
                    m.assignedTo.map((a, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        <CalendarClock className="size-3" />
                        {a.className}
                        {a.deadline ? ` · due ${dateFmt.format(new Date(a.deadline))}` : ""}
                      </Badge>
                    ))
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageBody>
    </>
  );
}
