import { cn } from "cn";
import { CheckCircle2, Clock, Mic, Play } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DIFFICULTY_LABELS,
  EXERCISE_KIND_LABELS,
  type Exercise,
} from "@/types";
import { LEVEL_BADGE_VARIANT } from "./levelStyles";

export interface ExerciseListItemProps {
  exercise: Exercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  return (
    <Card className="py-5 transition-colors hover:border-brand-orange/60">
      <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] text-sm font-bold",
              exercise.completed
                ? "bg-surface-mint text-success"
                : "bg-surface-peach text-brand-orange"
            )}
          >
            {exercise.completed ? (
              <CheckCircle2 className="size-5" aria-hidden="true" />
            ) : (
              String(exercise.order).padStart(2, "0")
            )}
          </span>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                {exercise.title}
              </h3>
              <Badge variant={LEVEL_BADGE_VARIANT[exercise.level]}>
                {DIFFICULTY_LABELS[exercise.level]}
              </Badge>
              <Badge variant="outline">
                {EXERCISE_KIND_LABELS[exercise.kind]}
              </Badge>
            </div>

            <p className="font-body text-sm font-medium text-muted-foreground">
              &ldquo;{exercise.promptText}&rdquo;
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                <span>{exercise.estimatedMinutes} min</span>
              </span>
              {exercise.focusSounds.map((sound) => (
                <Badge key={sound} variant="secondary" className="text-[11px]">
                  {sound}
                </Badge>
              ))}
              {typeof exercise.bestScore === "number" ? (
                <Badge variant="green">Best: {exercise.bestScore}%</Badge>
              ) : null}
            </div>
          </div>
        </div>

        <Button
          asChild
          variant={exercise.completed ? "outline" : "orange"}
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          <Link href={`/student/practice/${exercise.id}`}>
            {exercise.completed ? (
              <>
                <Play data-icon="inline-start" aria-hidden="true" />
                Practice Again
              </>
            ) : (
              <>
                <Mic data-icon="inline-start" aria-hidden="true" />
                Practice
              </>
            )}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
