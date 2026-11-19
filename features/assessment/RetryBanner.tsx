"use client";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface RetryBannerProps {
  onRetry: () => void;
}

export function RetryBanner({ onRetry }: RetryBannerProps) {
  return (
    <Alert variant="destructive" className="animate-fade-up">
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertTitle>Recording saved — evaluation failed</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>Your audio was captured but could not be scored. Tap Retry to re-evaluate.</p>
        <Button size="sm" variant="outline" onClick={onRetry} className="w-fit">
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Retry Evaluation
        </Button>
      </AlertDescription>
    </Alert>
  );
}
