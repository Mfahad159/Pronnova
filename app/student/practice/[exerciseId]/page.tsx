import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PracticeWorkspace } from "@/features/practice";
import { getAllExercises, getExerciseById } from "@/lib/mock-data/curriculum";

export function generateStaticParams() {
  return getAllExercises().map((exercise) => ({
    exerciseId: exercise.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/student/practice/[exerciseId]">): Promise<Metadata> {
  const { exerciseId } = await params;
  const record = getExerciseById(exerciseId);

  if (!record) {
    return { title: "Exercise Not Found" };
  }

  return {
    title: `Practice: ${record.exercise.title}`,
  };
}

function PracticeSkeleton() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-full" />
      </div>

      <Card className="py-7">
        <CardHeader className="gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-56 w-full rounded-[22px]" />
        </CardContent>
      </Card>
    </div>
  );
}

async function PracticeExerciseContent({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const record = getExerciseById(exerciseId);

  if (!record) {
    notFound();
  }

  const { chapter, exercise } = record;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3 animate-fade-up">
      <Breadcrumb className="text-xs">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/student/chapters">Chapters</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/student/chapters/${chapter.id}`}>
                Ch. {chapter.number}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-brand-orange truncate max-w-[140px] sm:max-w-xs">
              {exercise.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="py-3 sm:py-4 border-border/70 shadow-xs">
        <CardHeader className="px-3 sm:px-5 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Chapter {chapter.number} · {exercise.title}
            </span>
            {typeof exercise.bestScore === "number" ? (
              <span className="font-medium text-success">
                Best: {exercise.bestScore}%
              </span>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-3 sm:px-5 pt-0">
          {/* Prominent, readable prompt sentence directly above workspace */}
          <div className="rounded-xl border border-brand-orange-soft/30 bg-surface-peach/30 px-4 py-3 sm:py-3.5">
            <p className="text-center text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
              {exercise.promptText}
            </p>
          </div>

          <PracticeWorkspace exerciseId={exerciseId} chapterId={chapter.id} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-0.5">
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
          <Link href={`/student/chapters/${chapter.id}`}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" className="size-3" />
            Back to Chapter {chapter.number}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link href="/student/progress">View Progress</Link>
        </Button>
      </div>
    </div>
  );
}

export default function StudentPracticePage({
  params,
}: PageProps<"/student/practice/[exerciseId]">) {
  return (
    <Suspense fallback={<PracticeSkeleton />}>
      <PracticeExerciseContent params={params} />
    </Suspense>
  );
}
