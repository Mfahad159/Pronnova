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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          value={selectedLevel}
          onValueChange={(value) => setSelectedLevel(value as LevelFilter)}
        >
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="all">All Levels</TabsTrigger>
            <TabsTrigger
              value="basic"
              className="data-[state=active]:bg-success"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-primary"
            >
              Advanced
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <InputGroup className="h-11 rounded-full bg-card shadow-card md:max-w-xs">
          <InputGroupAddon align="inline-start">
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chapters, words, or sounds..."
            aria-label="Search chapters"
          />
          {query ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                variant="ghost"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>

      <p className="text-xs font-semibold text-muted-foreground">
        Showing {filteredChapters.length} of {chapters.length} chapters
      </p>

      {filteredChapters.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-[16px] bg-surface-peach text-brand-orange">
              <BookOpen className="size-6" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-foreground">
              No matching chapters found
            </h2>
            <p className="max-w-sm font-body text-sm text-muted-foreground">
              Try clearing your search term or switching back to All Levels.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("");
                setSelectedLevel("all");
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
