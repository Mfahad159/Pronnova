"use client";

import { ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssessmentResult } from "@/types/voice";
import { WordFeedbackList } from "./WordFeedbackList";

interface ScoreSummaryCardProps {
  result: AssessmentResult;
  exerciseId?: string;
  chapterId: string;
  onRetry: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const isGood = pct >= 80;
  const color = isGood ? "#22AD5A" : pct >= 60 ? "#FF8D28" : "#FF594B";

  return (
    <div className="relative inline-flex size-28 items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="relative text-center">
        <p className="text-3xl font-bold leading-none" style={{ color }}>
          {pct}%
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted-foreground">Score</p>
      </div>
    </div>
  );
}

export function ScoreSummaryCard({
  result,
  chapterId,
  onRetry,
}: ScoreSummaryCardProps) {
  const isPass = result.overallScore >= 80;

  return (
    <Card className="animate-fade-up">
      <CardHeader className="gap-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              {isPass && (
                <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
              )}
              <CardTitle className="text-xl">
                {isPass ? "Great pronunciation!" : "Keep practicing!"}
              </CardTitle>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              {isPass
                ? "You scored well on this exercise."
                : "Review the highlighted words and try again."}
            </p>
          </div>
          <ScoreRing score={result.overallScore} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">
            Word-by-Word Feedback
          </p>
          <WordFeedbackList words={result.words} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            Try Again
          </Button>
          <Button asChild>
            <Link href={`/student/chapters/${chapterId}`}>
              Back to Chapter
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
