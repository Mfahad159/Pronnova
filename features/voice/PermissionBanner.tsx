"use client";
import { MicOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AudioError } from "@/types/voice";

interface PermissionBannerProps {
  error: AudioError;
  onRetry?: () => void;
}

export function PermissionBanner({ error, onRetry }: PermissionBannerProps) {
  return (
    <Alert variant="destructive">
      <MicOff className="size-4" aria-hidden="true" />
      <AlertTitle>Microphone Access Required</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <p>{error.message}</p>
        {error.code === "NOT_ALLOWED" && (
          <p className="text-xs opacity-80">
            In Chrome: click the camera icon in the address bar → Allow. In Safari: Safari → Settings → Websites → Microphone → Allow.
          </p>
        )}
        {error.recoverable && onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="w-fit">
            <RefreshCw data-icon="inline-start" aria-hidden="true" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
