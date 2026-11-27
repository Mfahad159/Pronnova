import { Suspense } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MaterialLibrary } from "@/features/materials/material-library";
import { listMaterials } from "@/server/db/queries/materials";
import { listClasses, listStudents } from "@/server/db/queries/roster";

export const metadata = { title: "Materials" };

// UC-10 teacher library (+ UC-08 assign only, from the Assign dialog).
export default function MaterialsPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <Materials />
    </Suspense>
  );
}

async function Materials() {
  const [materials, classes, students] = await Promise.all([listMaterials(), listClasses(), listStudents()]);
  return (
    <>
      <TopBar
        title="Materials"
        subtitle="Your library of practice material."
        action={
          <KiddyButton size="sm" href="/teacher/materials/new">
            <Plus weight="bold" /> New material
          </KiddyButton>
        }
      />
      <PageBody>
        <MaterialLibrary
          materials={materials.map((m) => ({
            id: m.id,
            title: m.title,
            level: m.level,
            itemCount: m.itemCount,
            assignmentCount: m.assignmentCount,
            locked: m.locked,
          }))}
          classes={classes.map((c) => ({ id: c.id, name: c.name, studentCount: c.studentCount }))}
          students={students.map((s) => ({ id: s.id, fullName: s.fullName, rollNo: s.rollNo, classId: s.classId }))}
        />
      </PageBody>
    </>
  );
}
