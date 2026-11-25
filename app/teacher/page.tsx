import { Suspense } from "react";
import { UploadSimple } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SectionHeading } from "@/components/brand/section-heading";
import { Panel, PanelHeader, PanelTitle, StatTile } from "@/components/brand/ui";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { classify } from "@/lib/scoring";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { getTeacherStats, listClassAttempts } from "@/server/db/queries/attempts";

export const metadata = { title: "Dashboard" };

const scoreTone = {
  excellent: "text-score-excellent",
  good: "text-score-good",
  average: "text-score-average",
} as const;

// Overview only, in the landing "teacher preview" style. Full monitoring (UC-12) and reports (UC-13) are FYP-2.
export default function TeacherHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <TeacherHome />
    </Suspense>
  );
}

async function TeacherHome() {
  const teacher = await getCurrentTeacher();
  const [stats, attempts] = await Promise.all([getTeacherStats(teacher.id), listClassAttempts(teacher.id, 8)]);

  return (
    <>
      <TopBar
        title={`Hello, ${teacher.name}`}
        subtitle="Here's how your class is doing."
        action={
          <KiddyButton size="sm" href="/teacher/materials/new">
            <UploadSimple weight="bold" /> Upload material
          </KiddyButton>
        }
      />
      <PageBody>
        <Panel>
          <PanelHeader>
            <PanelTitle>Class overview</PanelTitle>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">This week</span>
          </PanelHeader>
          <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 lg:grid-cols-4">
            <StatTile label="Students" value={stats.students} />
            <StatTile label="Attempts this week" value={stats.attemptsThisWeek} />
            <StatTile
              label="Class average"
              value={stats.classAverage == null ? "—" : `${stats.classAverage}%`}
              tone={stats.classAverage == null ? undefined : scoreTone[classify(stats.classAverage)]}
            />
            <StatTile label="Most missed word" value={stats.mostMissedWord ?? "—"} tone="text-primary" />
          </div>
        </Panel>

        <PikoSays
          size="sm"
          tone="sky"
          message={
            stats.mostMissedWord ? (
              <>
                Tip: your class often misses <span className="text-foreground">“{stats.mostMissedWord}”</span>. Practise it
                together in the next lesson.
              </>
            ) : (
              "Tips about common mistakes appear here once students start practising."
            )
          }
        />

        <section className="space-y-4">
          <SectionHeading title="Latest attempts" />
          <AttemptsTable attempts={attempts} showStudent />
        </section>
      </PageBody>
    </>
  );
}
