"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DIFFICULTY_LABELS,
  type Chapter,
  type ChapterProgress,
  type RecentAttemptSummary,
} from "@/types";
import { ChapterProgressCard } from "./ChapterProgressCard";
import { LEVEL_BADGE_VARIANT } from "./levelStyles";

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
    <Tabs defaultValue="chapters" className="gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <TabsList>
          <TabsTrigger
            value="chapters"
            className="data-[state=active]:bg-success"
          >
            Chapter Progress
          </TabsTrigger>
          <TabsTrigger value="attempts">Recent Attempts</TabsTrigger>
        </TabsList>

        <InputGroup className="h-11 rounded-full bg-card shadow-card md:max-w-xs">
          <InputGroupAddon align="inline-start">
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chapters, exercises, or words..."
            aria-label="Search progress"
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

      <TabsContent value="chapters">
        {filteredChapters.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredChapters.map(({ chapter, progress }) => (
              <ChapterProgressCard
                key={chapter.id}
                chapter={chapter}
                progress={progress}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center text-sm text-muted-foreground">
              No chapters match &ldquo;{query}&rdquo;.
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="attempts">
        {filteredAttempts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredAttempts.map((attempt) => {
              const scoreBadgeVariant =
                attempt.score >= 85
                  ? "green"
                  : attempt.score >= 75
                    ? "orange"
                    : "coral";

              return (
                <Card key={attempt.id} className="py-5">
                  <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-foreground">
                          {attempt.exerciseTitle}
                        </span>
                        <Badge variant={LEVEL_BADGE_VARIANT[attempt.level]}>
                          {DIFFICULTY_LABELS[attempt.level]}
                        </Badge>
                        <Badge variant={scoreBadgeVariant}>
                          {attempt.score}% Accuracy
                        </Badge>
                      </div>

                      <p className="font-body text-sm text-muted-foreground">
                        &ldquo;{attempt.promptText}&rdquo;
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                        <span>{attempt.chapterTitle}</span>
                        <span>·</span>
                        <span>{attempt.practicedAtLabel}</span>
                        {attempt.flaggedWords.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-brand-orange">
                            <AlertCircle className="size-3.5" aria-hidden="true" />
                            <span>
                              Practice words: {attempt.flaggedWords.join(", ")}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-success">
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            <span>All words clear</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <Button asChild variant="outline" size="sm" className="shrink-0">
                      <Link href={`/student/practice/${attempt.exerciseId}`}>
                        Retry
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center text-sm text-muted-foreground">
              No attempts match &ldquo;{query}&rdquo;.
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
