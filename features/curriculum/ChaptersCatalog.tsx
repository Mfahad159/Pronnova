"use client";

import { BookOpen, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chapter, DifficultyLevel } from "@/types";
import { ChapterCard } from "./ChapterCard";

type LevelFilter = "all" | DifficultyLevel;

export interface ChaptersCatalogProps {
  chapters: Chapter[];
  initialLevel?: LevelFilter;
}

export function ChaptersCatalog({
  chapters,
  initialLevel = "all",
}: ChaptersCatalogProps) {
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>(initialLevel);
  const [query, setQuery] = useState("");

  const filteredChapters = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return chapters.filter((chapter) => {
      const matchesLevel =
        selectedLevel === "all" ||
        chapter.exercises.some((exercise) => exercise.level === selectedLevel);

      if (!matchesLevel) return false;
      if (!normalized) return true;

      const haystack = [
        chapter.title,
        chapter.accentWord,
        chapter.description,
        ...chapter.focusSounds,
        ...chapter.exercises.map((ex) => `${ex.title} ${ex.promptText}`),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [chapters, query, selectedLevel]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={selectedLevel}
          onValueChange={(value) => setSelectedLevel(value as LevelFilter)}
        >
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>

        <InputGroup className="h-9 rounded-full bg-card shadow-xs sm:max-w-xs">
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chapters or sounds..."
            aria-label="Search chapters"
            className="text-xs"
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X className="size-3" aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>

      {filteredChapters.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      ) : (
        <Card className="py-8">
          <CardContent className="flex flex-col items-center gap-2 text-center">
            <BookOpen className="size-6 text-muted-foreground/60" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              No chapters found
            </h3>
            <p className="font-body text-xs text-muted-foreground">
              Try clearing your search or switching level filter.
            </p>
            <Button
              variant="outline"
              size="xs"
              className="mt-1"
              onClick={() => {
                setQuery("");
                setSelectedLevel("all");
              }}
            >
              Reset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
