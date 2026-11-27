import { PageBody, TopBar } from "@/components/layout/top-bar";
import { MaterialEditor } from "@/features/materials/material-editor";

export const metadata = { title: "New material" };

// UC-10: the one upload path — new material (Write / Paste / Upload Word → item list → Save).
export default function NewMaterialPage() {
  return (
    <>
      <TopBar title="New material" subtitle="Write, paste or upload a Word file, check the items, then save." />
      <PageBody>
        <MaterialEditor />
      </PageBody>
    </>
  );
}
