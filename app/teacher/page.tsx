import { Suspense } from "react";
import { FileText, UploadSimple } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";
import { PikoSays } from "@/components/brand/piko";
import { SectionHeading } from "@/components/brand/section-heading";
import { OutlineLink, Panel, PanelHeader, PanelTitle, StatTile } from "@/components/brand/ui";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { classify } from "@/lib/scoring";
import { findCurrentStudent, getCurrentTeacher } from "@/server/db/demo-user";
import { getStudentLearning } from "@/server/db/queries/learning";
import { getTeacherStats, listClassAttempts } from "@/server/db/queries/attempts";

export const metadata = { title: "Dashboard" };

const scoreTone = {
  excellent: "text-score-excellent",
  good: "text-score-good",
  average: "text-score-average",
} as const;

// Overview of the one student (FYP-1: one teacher, one student), in the landing "teacher preview" style.
// Full monitoring (UC-12) and reports (UC-13) are FYP-2.
export default function TeacherHomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="cards" />}>
      <TeacherHome />
    </Suspense>
  );
}

async function TeacherHome() {
  const teacher = await getCurrentTeacher();
  const student = await findCurrentStudent();
  const [stats, attempts, learning] = await Promise.all([
    getTeacherStats(teacher.id),
    listClassAttempts(teacher.id, 8),
    student ? getStudentLearning(student) : Promise.resolve(null),
  ]);
  const name = student?.name ?? "your student";
  const assigned = learning?.homework.length ?? 0;

  return (
    <>
      <TopBar
        title={`Hello, ${teacher.name}`}
        subtitle={`Here's how ${name} is doing.`}
        action={
          <KiddyButton size="sm" href="/teacher/materials/new">
            <UploadSimple weight="bold" /> Upload material
          </KiddyButton>
        }
      />
      <PageBody>
        <Panel>
          <PanelHeader>
            <PanelTitle>{student ? `${student.name}'s progress` : "Progress"}</PanelTitle>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">This week</span>
          </PanelHeader>
          <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 lg:grid-cols-4">
            <StatTile label="Lessons assigned" value={assigned} />
            <StatTile label="Attempts this week" value={stats.attemptsThisWeek} />
            <StatTile
              label="Average score"
              value={stats.classAverage == null ? "—" : `${stats.classAverage}%`}
              tone={stats.classAverage == null ? undefined : scoreTone[classify(stats.classAverage)]}
            />
            <StatTile label="Most missed word" value={stats.mostMissedWord ?? "—"} tone="text-primary" />
          </div>
        </Panel>

        {/* Guide the teacher through the flow: upload → assign → student practises → results here. */}
        {assigned === 0 ? (
          <PikoSays size="sm" tone="sky" message={`Nothing assigned yet. Upload a lesson, then assign it to ${name}.`}>
            <OutlineLink href="/teacher/materials">
              <FileText weight="duotone" /> Go to materials
            </OutlineLink>
          </PikoSays>
        ) : (
          <PikoSays
            size="sm"
            tone="sky"
            message={
              stats.mostMissedWord ? (
                <>
                  Tip: {name} often misses <span className="text-foreground">“{stats.mostMissedWord}”</span>. Practise it together in
                  the next lesson.
                </>
              ) : (
                `${name}'s results appear here as soon as they practise.`
              )
            }
          />
        )}

        <section className="space-y-4">
          <SectionHeading title="Latest attempts" />
          <AttemptsTable attempts={attempts} showStudent />
        </section>
      </PageBody>
    </>
  );
}
