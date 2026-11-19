import { CheckCircle2, Mic, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types";

export interface ExerciseListItemProps {
  exercise: Exercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
  return (
    <Card className="py-3.5 transition-colors hover:border-foreground/20">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
              exercise.completed
                ? "bg-surface-mint text-success"
                : "bg-surface-peach text-brand-orange"
            )}
            aria-label={exercise.completed ? "Completed" : "Not completed"}
          >
            {exercise.completed ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              String(exercise.order).padStart(2, "0")
            )}
          </span>

          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {exercise.title}
              </h3>
              <span className="text-[11px] text-muted-foreground capitalize">
                · {exercise.level}
              </span>
            </div>

            <p className="font-body text-xs text-muted-foreground truncate">
              &ldquo;{exercise.promptText}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {typeof exercise.bestScore === "number" ? (
            <span className="text-xs font-medium text-success hidden sm:inline">
              {exercise.bestScore}%
            </span>
          ) : null}

          <Button
            asChild
            variant={exercise.completed ? "ghost" : "default"}
            size="sm"
            className="h-8 text-xs px-3"
          >
            <Link href={`/student/practice/${exercise.id}`}>
              {exercise.completed ? (
                <>
                  <Play data-icon="inline-start" aria-hidden="true" className="size-3" />
                  Review
                </>
              ) : (
                <>
                  <Mic data-icon="inline-start" aria-hidden="true" className="size-3" />
                  Practice
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
