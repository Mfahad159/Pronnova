"use client";

import {
  AlertCircle,
  BrainCircuit,
  Check,
  Loader2,
  Mic,
  RotateCcw,
  Shield,
  Square,
} from "lucide-react";
import type { VoiceSessionState } from "@/types/voice";
import { cn } from "@/lib/utils";

interface RecordButtonProps {
  sessionState: VoiceSessionState;
  onRecord: () => void;
  onStop: () => void;
  onRetry?: () => void;
  className?: string;
}

interface StateStyle {
  label: string;
  pillColor: string;
  buttonClass: string;
  icon: typeof Mic;
  iconClass?: string;
  disabled?: boolean;
}

const STATE_STYLES: Record<VoiceSessionState, StateStyle> = {
  idle: {
    label: "Tap to Speak",
    pillColor: "border-border/80 bg-background/80 text-muted-foreground",
    buttonClass:
      "bg-cta-coral text-white hover:bg-cta-coral-deep shadow-[0_8px_24px_rgba(255,89,75,0.35)] active:scale-95",
    icon: Mic,
  },
  ready: {
    label: "Ready • Tap to Speak",
    pillColor: "border-brand-orange/40 bg-surface-peach text-brand-orange",
    buttonClass:
      "bg-cta-coral text-white hover:bg-cta-coral-deep shadow-[0_8px_24px_rgba(255,89,75,0.4)] active:scale-95 ring-4 ring-brand-orange/20",
    icon: Mic,
  },
  requesting_permission: {
    label: "Requesting Permission…",
    pillColor: "border-amber-400/50 bg-amber-50 text-amber-700",
    buttonClass: "bg-amber-500 text-white cursor-wait opacity-90 shadow-none",
    icon: Shield,
    iconClass: "animate-pulse",
    disabled: true,
  },
  permission_denied: {
    label: "Mic Denied • Tap to Retry",
    pillColor: "border-destructive/40 bg-red-50 text-destructive",
    buttonClass:
      "bg-destructive text-white hover:bg-destructive/90 shadow-[0_6px_20px_rgba(239,68,68,0.3)] active:scale-95",
    icon: RotateCcw,
  },
  recording: {
    label: "Listening… Tap to Finish",
    pillColor: "border-red-500/40 bg-red-50 text-red-600 font-semibold",
    buttonClass:
      "bg-red-600 text-white hover:bg-red-700 shadow-[0_0_30px_rgba(239,68,68,0.55)] active:scale-95",
    icon: Square,
    iconClass: "fill-current",
  },
  processing_audio: {
    label: "Processing Audio…",
    pillColor: "border-sky-400/50 bg-sky-50 text-sky-700",
    buttonClass: "bg-sky-600 text-white cursor-wait opacity-90 shadow-none",
    icon: Loader2,
    iconClass: "animate-spin",
    disabled: true,
  },
  uploading: {
    label: "Submitting Recording…",
    pillColor: "border-sky-400/50 bg-sky-50 text-sky-700",
    buttonClass: "bg-sky-600 text-white cursor-wait opacity-90 shadow-none",
    icon: Loader2,
    iconClass: "animate-spin",
    disabled: true,
  },
  evaluating: {
    label: "Analyzing Pronunciation…",
    pillColor: "border-purple-400/50 bg-purple-50 text-purple-700",
    buttonClass:
      "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white cursor-wait opacity-95 shadow-[0_0_24px_rgba(147,51,234,0.35)]",
    icon: BrainCircuit,
    iconClass: "animate-pulse",
    disabled: true,
  },
  completed: {
    label: "Complete",
    pillColor: "border-success/40 bg-green-50 text-success",
    buttonClass: "bg-success text-white shadow-none",
    icon: Check,
  },
  error: {
    label: "Error • Tap to Retry",
    pillColor: "border-destructive/40 bg-red-50 text-destructive",
    buttonClass:
      "bg-destructive text-white hover:bg-destructive/90 shadow-[0_6px_20px_rgba(239,68,68,0.3)] active:scale-95",
    icon: RotateCcw,
  },
  cancelled: {
    label: "Cancelled • Tap to Speak",
    pillColor: "border-border/80 bg-background/80 text-muted-foreground",
    buttonClass:
      "bg-cta-coral text-white hover:bg-cta-coral-deep shadow-[0_8px_24px_rgba(255,89,75,0.35)] active:scale-95",
    icon: Mic,
  },
};

export function RecordButton({
  sessionState,
  onRecord,
  onStop,
  onRetry,
  className,
}: RecordButtonProps) {
  const current = STATE_STYLES[sessionState] || STATE_STYLES.idle;
  const isRecording = sessionState === "recording";
  const isError = sessionState === "error" || sessionState === "permission_denied";
  const IconComponent = current.icon;

  const handleClick = () => {
    if (current.disabled) return;
    if (isRecording) {
      onStop();
    } else if (isError) {
      if (onRetry) onRetry();
      else onRecord();
    } else {
      onRecord();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative flex items-center justify-center">
        {/* Dynamic expanding ripple wave during active recording */}
        {isRecording && (
          <>
            <span
              className="pointer-events-none absolute size-16 sm:size-18 rounded-full border-2 border-red-500/70 animate-ping opacity-75"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute size-18 sm:size-20 rounded-full bg-red-500/20 animate-pulse"
              aria-hidden="true"
            />
          </>
        )}

        {/* Dynamic state circular button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={current.disabled}
          aria-label={current.label}
          className={cn(
            "relative z-10 flex size-14 sm:size-16 items-center justify-center rounded-full transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
            current.buttonClass
          )}
        >
          <IconComponent
            className={cn(
              "size-6 sm:size-7 transition-transform duration-150",
              current.iconClass
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Dynamic mic state chip showing current operational mode */}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors shadow-2xs backdrop-blur-sm",
          current.pillColor
        )}
        aria-live="polite"
      >
        {isRecording && (
          <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
        )}
        {sessionState === "evaluating" && (
          <span className="size-1.5 rounded-full bg-purple-500 animate-ping" />
        )}
        {isError && (
          <AlertCircle className="size-3 text-destructive" aria-hidden="true" />
        )}
        {current.label}
      </span>
    </div>
  );
}

export default RecordButton;
