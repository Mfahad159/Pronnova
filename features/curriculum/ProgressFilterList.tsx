"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Chapter, ChapterProgress, RecentAttemptSummary } from "@/types";
import { ChapterProgressCard } from "./ChapterProgressCard";

export interface ProgressFilterListProps {
  chapterItems: { chapter: Chapter; progress: ChapterProgress }[];
  recentAttempts: RecentAttemptSummary[];
}

export function ProgressFilterList({
  chapterItems,
  recentAttempts,
}: ProgressFilterListProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    if (!normalized) return chapterItems;
    return chapterItems.filter(({ chapter }) =>
      `${chapter.title} ${chapter.accentWord} ${chapter.focusSounds.join(" ")}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [chapterItems, normalized]);

  const filteredAttempts = useMemo(() => {
    if (!normalized) return recentAttempts;
    return recentAttempts.filter((attempt) =>
      `${attempt.chapterTitle} ${attempt.exerciseTitle} ${attempt.promptText} ${attempt.flaggedWords.join(" ")}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [recentAttempts, normalized]);

  return (
    <Tabs defaultValue="chapters" className="gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="attempts">Recent Attempts</TabsTrigger>
        </TabsList>

        <InputGroup className="h-9 rounded-full bg-card shadow-xs sm:max-w-xs">
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5" aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search progress..."
            aria-label="Search progress"
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

      <TabsContent value="chapters">
        {filteredChapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredChapters.map(({ chapter, progress }) => (
              <ChapterProgressCard
                key={chapter.id}
                chapter={chapter}
                progress={progress}
              />
            ))}
          </div>
        ) : (
          <Card className="py-6">
            <CardContent className="text-center text-xs text-muted-foreground">
              No chapters match &ldquo;{query}&rdquo;.
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="attempts">
        {filteredAttempts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredAttempts.map((attempt) => (
              <Card key={attempt.id} className="py-3.5">
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {attempt.exerciseTitle}
                      </span>
                      <span className="text-xs font-medium text-success">
                        {attempt.score}%
                      </span>
                      <span className="text-[11px] text-muted-foreground capitalize">
                        · {attempt.level}
                      </span>
                    </div>

                    <p className="font-body text-xs text-muted-foreground truncate">
                      &ldquo;{attempt.promptText}&rdquo;
                    </p>

                    <div className="text-[11px] text-muted-foreground">
                      <span>{attempt.chapterTitle}</span>
                      <span> · </span>
                      <span>{attempt.practicedAtLabel}</span>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0">
                    <Link href={`/student/practice/${attempt.exerciseId}`}>
                      Practice
                      <ArrowRight data-icon="inline-end" aria-hidden="true" className="size-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-6">
            <CardContent className="text-center text-xs text-muted-foreground">
              No attempts match &ldquo;{query}&rdquo;.
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
