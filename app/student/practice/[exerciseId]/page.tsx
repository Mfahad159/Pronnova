import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LEVEL_BADGE_VARIANT } from "@/features/chapters";
import { getAllExercises, getExerciseById } from "@/lib/mock-data/curriculum";
import { DIFFICULTY_LABELS, EXERCISE_KIND_LABELS } from "@/types";

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

export default async function StudentPracticePage({
  params,
}: PageProps<"/student/practice/[exerciseId]">) {
  const { exerciseId } = await params;
  const record = getExerciseById(exerciseId);

  if (!record) {
    notFound();
  }

  const { chapter, exercise } = record;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 animate-fade-up">
      <Breadcrumb>
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
                Chapter {chapter.number}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-brand-orange">
              {exercise.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="py-7">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={LEVEL_BADGE_VARIANT[exercise.level]}>
                {DIFFICULTY_LABELS[exercise.level]}
              </Badge>
              <Badge variant="outline">
                {EXERCISE_KIND_LABELS[exercise.kind]}
              </Badge>
              {exercise.focusSounds.map((sound) => (
                <Badge key={sound} variant="orange">
                  {sound}
                </Badge>
              ))}
            </div>

            {typeof exercise.bestScore === "number" ? (
              <Badge variant="green">Best Score: {exercise.bestScore}%</Badge>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-2xl sm:text-3xl">
              {exercise.title}
            </CardTitle>
            <CardDescription>
              Read the text below aloud at a natural pace to check your pronunciation.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="rounded-[20px] border-l-4 border-brand-orange bg-surface-tint-orange px-6 py-7">
            <p className="text-center text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
              {exercise.promptText}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-[22px] border border-border bg-background/80 p-6 text-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon-lg" disabled aria-label="Listen to reference audio">
                <Volume2 aria-hidden="true" />
              </Button>
              <Button
                size="icon-lg"
                disabled
                aria-label="Start recording"
                className="size-16 shadow-glow-orange [&_svg:not([class*='size-'])]:size-7"
              >
                <Mic aria-hidden="true" />
              </Button>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Tap the microphone when voice recording is connected to capture and score your speech.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href={`/student/chapters/${chapter.id}`}>
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Back to Chapter {chapter.number}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/progress">View Progress</Link>
        </Button>
      </div>
    </div>
  );
}
