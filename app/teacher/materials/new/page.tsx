import { Suspense } from "react";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { MaterialForm } from "@/features/materials/material-form";
import { listClasses } from "@/server/db/queries/roster";

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
  const classes = await listClasses();
  return (
    <>
      <TopBar title="Upload practice material" subtitle="Paste text or import a Word file, check the items, then save — and assign it if you like." />
      <PageBody>
        <MaterialForm classes={classes.map((c) => ({ id: c.id, label: c.name }))} />
      </PageBody>
    </>
  );
}
