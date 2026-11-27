import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PikoSays } from "@/components/brand/piko";
import { Panel, PanelHeader, PanelTitle } from "@/components/brand/ui";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { cn } from "@/lib/utils";
import { isUuid } from "@/server/db/queries/curriculum";
import { listClasses, listStudents } from "@/server/db/queries/roster";

export const metadata = { title: "Who are you?" };

const tints = ["bg-tint-peach", "bg-tint-sky", "bg-tint-mint", "bg-tint-cream", "bg-tint-lavender", "bg-tint-rose"];

// "Who are you?" — pick your class, then your name (no login in FYP-1, ADR-002). The choice is
// remembered by POST /api/student/session. Works without JavaScript (plain links + form posts).
export default function WhoPage(props: PageProps<"/student/who">) {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <Who searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Who({ searchParams }: { searchParams: PageProps<"/student/who">["searchParams"] }) {
  const sp = await searchParams;
  const classId = typeof sp.class === "string" && isUuid(sp.class) ? sp.class : null;
  const classes = await listClasses();
  const chosen = classId ? classes.find((c) => c.id === classId) : undefined;
  const students = chosen ? await listStudents({ classId: chosen.id }) : [];

  return (
    <>
      <TopBar title="Who are you?" subtitle={chosen ? `Find your name in ${chosen.name}.` : "First, pick your class."} />
      <PageBody>
        {!chosen ? (
          classes.length === 0 ? (
            <PikoSays tone="cream" message="No classes yet. Ask your teacher!" />
          ) : (
            <Panel>
              <PanelHeader>
                <PanelTitle>Your class</PanelTitle>
              </PanelHeader>
              <ul className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                {classes.map((c, i) => (
                  <li key={c.id}>
                    <Link
                      href={`/student/who?class=${c.id}`}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl border-2 border-foreground/12 p-4 font-heading text-lg font-bold outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                        tints[i % tints.length],
                      )}
                    >
                      {c.name}
                      <span className="text-sm font-semibold text-muted-foreground">{c.studentCount} students</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )
        ) : (
          <Panel>
            <PanelHeader>
              <PanelTitle>{chosen.name}</PanelTitle>
              <Link href="/student/who" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                <ArrowLeft className="size-4" aria-hidden /> Other class
              </Link>
            </PanelHeader>
            {students.length === 0 ? (
              <div className="p-5">
                <PikoSays size="sm" tone="cream" message="No students in this class yet." />
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6">
                {students.map((s, i) => (
                  <li key={s.id}>
                    <form method="post" action="/api/student/session">
                      <input type="hidden" name="studentId" value={s.id} />
                      <button
                        type="submit"
                        className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-foreground/12 bg-card p-4 outline-none transition-colors hover:border-primary/40 hover:bg-secondary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className={cn("flex size-14 items-center justify-center rounded-full border-2 border-card font-heading text-xl font-bold", tints[i % tints.length])}>
                          {s.fullName.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-heading font-bold">{s.fullName}</span>
                        <span className="text-xs text-muted-foreground">Roll no. {s.rollNo}</span>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </PageBody>
    </>
  );
}
