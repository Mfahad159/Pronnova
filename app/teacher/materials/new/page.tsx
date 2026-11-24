import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MaterialForm } from "@/features/materials/material-form";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { listChapters } from "@/server/db/queries/curriculum";
import { listTeacherClasses } from "@/server/db/queries/materials";

export const metadata = { title: "Upload material" };

// UC-10 Upload Practice Material.
export default function UploadMaterialPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <UploadMaterial />
    </Suspense>
  );
}

async function UploadMaterial() {
  const teacher = await getCurrentTeacher();
  const [chapters, classes] = await Promise.all([listChapters(), listTeacherClasses(teacher.id)]);
  return (
    <>
      <TopBar title="Upload practice material" subtitle="Add words, phrases or sentences, then assign them to a class." />
      <PageBody>
        <MaterialForm
          chapters={chapters.map((c) => ({ id: c.id, label: `${c.orderNo}. ${c.title}` }))}
          classes={classes.map((c) => ({ id: c.id, label: c.name }))}
        />
      </PageBody>
    </>
  );
}
