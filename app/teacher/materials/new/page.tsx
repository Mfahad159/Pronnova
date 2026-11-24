import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { levelLabel, levels } from "@/features/curriculum/level";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { listChapters } from "@/server/db/queries/curriculum";

export const metadata = { title: "Upload material" };

// UC-10 form layout. Saving (POST /api/materials) arrives in Phase 2 (specs/fyp1-implementation-plan.md).
export default function UploadMaterialPage() {
  return (
    <Suspense fallback={<PageSkeleton variant="panel" />}>
      <UploadMaterial />
    </Suspense>
  );
}

async function UploadMaterial() {
  const chapters = await listChapters();
  return (
    <>
      <TopBar title="Upload practice material" subtitle="Add words, phrases or sentences for your students." />
      <PageBody>
        <form className="grid max-w-2xl gap-5 rounded-2xl border bg-card p-6">
          <Field id="title" label="Title">
            <Input id="title" name="title" required placeholder="e.g. TH sounds — homework 1" />
          </Field>
          <Field id="instructions" label="Instructions">
            <Textarea id="instructions" name="instructions" placeholder="Read each line slowly and clearly." />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="chapter" label="Chapter">
              <NativeSelect id="chapter" name="chapterId" options={chapters.map((c) => [c.id, c.title])} />
            </Field>
            <Field id="level" label="Level">
              <NativeSelect id="level" name="level" options={levels.map((l) => [l, levelLabel[l]])} />
            </Field>
            <Field id="due" label="Due date">
              <Input id="due" name="deadline" type="date" />
            </Field>
          </div>
          <Field id="items" label="Practice items (one per line)">
            <Textarea id="items" name="items" required rows={6} placeholder={"three\nthin thieves\nThree thin thieves thought about the weather."} />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" disabled>
              Save material
            </Button>
            <span className="text-sm text-muted-foreground">Saving is coming in Phase 2.</span>
          </div>
        </form>
      </PageBody>
    </>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({ id, name, options }: { id: string; name: string; options: [string, string][] }) {
  return (
    <select
      id={id}
      name={name}
      className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {options.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  );
}
