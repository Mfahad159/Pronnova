import { Suspense } from "react";
import { Plus } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MaterialLibrary } from "@/features/materials/material-library";
import { listMaterials } from "@/server/db/queries/materials";
import { getStudent } from "@/server/db/queries/roster";
import { DEMO_STUDENT_ID } from "@/server/db/demo-user";

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
  const [materials, student] = await Promise.all([listMaterials(), getStudent(DEMO_STUDENT_ID)]);
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
          student={student && !student.archivedAt ? { id: student.id, name: student.fullName } : null}
        />
      </PageBody>
    </>
  );
}
