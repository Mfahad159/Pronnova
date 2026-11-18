"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIFFICULTY_LABELS, type DifficultyLevel, type Exercise } from "@/types";
import { ExerciseListItem } from "./ExerciseListItem";

type ExerciseLevelFilter = "all" | DifficultyLevel;

export interface ChapterDetailExercisesProps {
  exercises: Exercise[];
}

export function ChapterDetailExercises({
  exercises,
}: ChapterDetailExercisesProps) {
  const [selectedLevel, setSelectedLevel] = useState<ExerciseLevelFilter>("all");

  const presentLevels = useMemo(() => {
    const levels: DifficultyLevel[] = ["basic", "medium", "advanced"];
    return levels.filter((level) =>
      exercises.some((exercise) => exercise.level === level)
    );
  }, [exercises]);

  const visibleExercises = useMemo(() => {
    if (selectedLevel === "all") return exercises;
    return exercises.filter((exercise) => exercise.level === selectedLevel);
  }, [exercises, selectedLevel]);

  return (
    <section aria-label="Chapter exercises" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-foreground">
            Practice Exercises
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            Choose any exercise to open the read-aloud pronunciation screen.
          </p>
        </div>

        <Tabs
          value={selectedLevel}
          onValueChange={(value) =>
            setSelectedLevel(value as ExerciseLevelFilter)
          }
        >
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="all">All ({exercises.length})</TabsTrigger>
            {presentLevels.map((level) => (
              <TabsTrigger
                key={level}
                value={level}
                className={
                  level === "basic"
                    ? "data-[state=active]:bg-success"
                    : level === "advanced"
                      ? "data-[state=active]:bg-primary"
                      : undefined
                }
              >
                {DIFFICULTY_LABELS[level]} (
                {exercises.filter((ex) => ex.level === level).length})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {visibleExercises.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleExercises.map((exercise) => (
            <ExerciseListItem key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center text-sm text-muted-foreground">
            No exercises available for this level yet.
          </CardContent>
        </Card>
      )}
    </section>
  );
}
