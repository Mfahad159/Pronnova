import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBody, TopBar } from "@/components/layout/top-bar";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import { AttemptsTable } from "@/features/assessment/attempts-table";
import { SparkleDoodle } from "@/components/icons/doodle";
import { getCurrentTeacher } from "@/server/db/demo-user";
import { getTeacherStats, listClassAttempts } from "@/server/db/queries/attempts";

export const metadata = { title: "Dashboard" };

// Overview only. Full monitoring (UC-12) and reports (UC-13) are FYP-2.
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
  const tiles = [
    { label: "Students", value: String(stats.students) },
    { label: "Attempts this week", value: String(stats.attemptsThisWeek) },
    { label: "Class average", value: stats.classAverage == null ? "—" : `${stats.classAverage}%` },
    { label: "Most missed word", value: stats.mostMissedWord ?? "—" },
  ];

  return (
    <>
      <TopBar
        title={`Hello, ${teacher.name}`}
        subtitle="Here's how your class is doing."
        action={
          <Button asChild size="lg">
            <Link href="/teacher/materials/new">
              <Upload /> Upload material
            </Link>
          </Button>
        }
      />
      <PageBody>
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="truncate font-heading text-2xl tabular-nums">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </section>
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">Latest attempts</h2>
            <AttemptsTable attempts={attempts} showStudent />
          </div>
          {/* Compact tip: small illustration + one useful sentence (no big empty panel). */}
          <Card className="bg-secondary xl:self-start">
            <CardContent className="flex items-center gap-4 xl:flex-col xl:text-center">
              <Image
                src="/avatar/avatar_standing_beside_dice.png"
                alt=""
                width={1197}
                height={1792}
                sizes="120px"
                className="h-28 w-auto shrink-0 xl:h-36"
              />
              <div className="text-sm">
                <p className="inline-flex items-center gap-1.5 font-semibold text-primary">
                  <SparkleDoodle className="size-4" /> Teaching tip
                </p>
                <p className="mt-1">
                  {stats.mostMissedWord ? (
                    <>
                      Your class often misses <strong>“{stats.mostMissedWord}”</strong>. Practise it together in your next lesson.
                    </>
                  ) : (
                    "Once students start practising, the word your class finds hardest will show up here."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </PageBody>
    </>
  );
}
