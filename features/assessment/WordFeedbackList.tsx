"use client";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WordResult } from "@/types/voice";

const BADGE_VARIANT: Record<WordResult["status"], "green" | "orange" | "coral"> = {
  correct: "green",
  review: "orange",
  missed: "coral",
};

const STATUS_LABEL: Record<WordResult["status"], string> = {
  correct: "Correct",
  review: "Needs practice",
  missed: "Mispronounced",
};

interface WordFeedbackListProps {
  words: WordResult[];
}

export function WordFeedbackList({ words }: WordFeedbackListProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-2" role="list" aria-label="Word-level pronunciation feedback">
        {words.map((w, i) => (
          <div key={i} role="listitem">
            {w.phonemeHint ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant={BADGE_VARIANT[w.status]}
                    className="cursor-help text-sm"
                    aria-label={`${w.word}: ${STATUS_LABEL[w.status]}`}
                  >
                    {w.word}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{w.phonemeHint}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Badge
                variant={BADGE_VARIANT[w.status]}
                className="text-sm"
                aria-label={`${w.word}: ${STATUS_LABEL[w.status]}`}
              >
                {w.word}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
