"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  CloudUpload,
  Mic,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RetryBanner } from "@/features/assessment/RetryBanner";
import { ScoreSummaryCard } from "@/features/assessment/ScoreSummaryCard";
import {
  CrystalizedBall,
  MicTestDialog,
  PermissionBanner,
  RecordButton,
  RecordingTimer,
  useAudioRecorder,
} from "@/features/voice";
import { useVoiceStore } from "@/stores/voiceStore";
import type { AssessmentResult, VoiceSessionState } from "@/types/voice";

interface PracticeWorkspaceProps {
  exerciseId: string;
  chapterId: string;
}

interface StateDisplayConfig {
  step: string;
  badgeLabel: string;
  badgeVariant: "outline" | "orange" | "coral" | "blue" | "green";
  title: string;
  instruction: string;
  icon: typeof Mic;
}

const STATE_CONFIGS: Record<VoiceSessionState, StateDisplayConfig> = {
  idle: {
    step: "01",
    badgeLabel: "Idle",
    badgeVariant: "outline",
    title: "Ready to start",
    instruction: "Tap the microphone to speak",
    icon: Mic,
  },
  requesting_permission: {
    step: "02",
    badgeLabel: "Requesting permission",
    badgeVariant: "orange",
    title: "Browser microphone permission",
    instruction: "Allow microphone access to record your voice",
    icon: ShieldCheck,
  },
  ready: {
    step: "02",
    badgeLabel: "Ready",
    badgeVariant: "outline",
    title: "Microphone connected",
    instruction: "Tap the microphone to start recording",
    icon: Mic,
  },
  recording: {
    step: "03",
    badgeLabel: "Recording",
    badgeVariant: "coral",
    title: "Live audio capture",
    instruction: "Listening… speak now",
    icon: Mic,
  },
  processing_audio: {
    step: "04",
    badgeLabel: "Uploading / processing",
    badgeVariant: "blue",
    title: "Audio being submitted",
    instruction: "Your voice is being processed…",
    icon: CloudUpload,
  },
  uploading: {
    step: "04",
    badgeLabel: "Uploading / processing",
    badgeVariant: "blue",
    title: "Audio being submitted",
    instruction: "Your voice is being processed…",
    icon: CloudUpload,
  },
  evaluating: {
    step: "05",
    badgeLabel: "Evaluating",
    badgeVariant: "blue",
    title: "Pronunciation analysis",
    instruction: "Checking your pronunciation…",
    icon: BrainCircuit,
  },
  completed: {
    step: "06",
    badgeLabel: "Result",
    badgeVariant: "green",
    title: "Assessment complete",
    instruction: "Here is your result",
    icon: CheckCircle2,
  },
  error: {
    step: "--",
    badgeLabel: "Error",
    badgeVariant: "coral",
    title: "Assessment paused",
    instruction: "Please check your microphone or retry scoring.",
    icon: Mic,
  },
  cancelled: {
    step: "01",
    badgeLabel: "Cancelled",
    badgeVariant: "outline",
    title: "Recording cancelled",
    instruction: "Tap the microphone to try again.",
    icon: Mic,
  },
  permission_denied: {
    step: "02",
    badgeLabel: "Permission Denied",
    badgeVariant: "coral",
    title: "Microphone blocked",
    instruction: "Enable microphone permission in browser settings.",
    icon: ShieldCheck,
  },
};

export function PracticeWorkspace({
  exerciseId,
  chapterId,
}: PracticeWorkspaceProps) {
  const {
    sessionState,
    assessmentResult,
    durationMs,
    error,
    setSessionState,
    setAssessmentResult,
    setError,
    reset,
  } = useVoiceStore();

  const {
    stream,
    requestPermission,
    startRecording,
    stopRecording,
    teardown,
    getBlob,
  } = useAudioRecorder();

  const refAudioRef = useRef<HTMLAudioElement | null>(null);

  // Asynchronous evaluation submission triggered after audio preparation
  useEffect(() => {
    if (sessionState !== "processing_audio") return;

    let isMounted = true;
    const abortController = new AbortController();

    async function submit() {
      setSessionState("uploading");
      const blob = getBlob();
      if (!blob) {
        setError({
          code: "EMPTY_AUDIO",
          message: "No audio captured. Please try recording again.",
          recoverable: true,
        });
        return;
      }

      setSessionState("evaluating");
      try {
        const form = new FormData();
        form.append("audio", blob);
        form.append("exerciseId", exerciseId);
        form.append("durationMs", String(durationMs));

        const res = await fetch("/api/attempts", {
          method: "POST",
          body: form,
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error("Evaluation failed");
        const result: AssessmentResult = await res.json();
        if (isMounted) {
          setAssessmentResult(result);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setError({
            code: "EVAL_FAILED",
            message:
              "Scoring failed. Your recording is saved — tap Retry to re-score.",
            recoverable: true,
          });
        }
      }
    }

    submit();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [
    sessionState,
    durationMs,
    exerciseId,
    getBlob,
    setAssessmentResult,
    setError,
    setSessionState,
  ]);

  useEffect(() => {
    return () => {
      teardown();
      reset();
    };
  }, [teardown, reset]);

  // Synchronous user click handling
  const handleRecord = useCallback(async () => {
    if (sessionState === "idle") {
      await requestPermission();
    } else if (
      sessionState === "ready" ||
      sessionState === "cancelled" ||
      sessionState === "completed"
    ) {
      startRecording();
    }
  }, [sessionState, requestPermission, startRecording]);

  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleRetry = useCallback(() => {
    reset();
    requestPermission();
  }, [reset, requestPermission]);

  const isRecording = sessionState === "recording";
  const isProcessing = [
    "processing_audio",
    "uploading",
    "evaluating",
  ].includes(sessionState);

  const activeConfig = STATE_CONFIGS[sessionState];
  const StateIcon = activeConfig.icon;

  return (
    <div className="flex flex-col gap-3">
      {/* Top action bar: Reference audio + Mic Test dialog */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-1.5 text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refAudioRef.current?.play()}
          disabled={isRecording || isProcessing}
          className="h-7 gap-1.5 text-xs px-2 text-muted-foreground hover:text-foreground"
        >
          <Volume2 className="size-3.5" aria-hidden="true" />
          Listen to Example
        </Button>
        <audio ref={refAudioRef} className="hidden" aria-hidden="true" />

        <MicTestDialog />
      </div>

      {/* Permission/error banner */}
      {(sessionState === "permission_denied" || sessionState === "error") &&
        error && <PermissionBanner error={error} onRetry={handleRetry} />}

      {/* Main recording workspace */}
      {sessionState !== "completed" && (
        <div className="flex flex-col items-center gap-2.5 pt-1 pb-1">
          {/* Minimal single status indicator */}
          <Badge variant={activeConfig.badgeVariant} className="text-xs font-medium h-6 px-3">
            <StateIcon className="mr-1.5 size-3 inline" aria-hidden="true" />
            {activeConfig.instruction}
          </Badge>

          {/* Calm, bounded Crystalized Ball */}
          <div className="relative mx-auto flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center">
            <CrystalizedBall
              preset="ember"
              color="#FF6B35"
              theme="light"
              stream={isRecording ? stream : null}
              isActive={isRecording}
              size={0.7}
              interactive={true}
              hoverStrength={0.6}
            />
          </div>

          {/* Elapsed Timer during recording */}
          <RecordingTimer isRecording={isRecording} />

          {/* Tactile Microphone / Action Button with live states */}
          <RecordButton
            sessionState={sessionState}
            onRecord={handleRecord}
            onStop={handleStop}
            onRetry={handleRetry}
          />
        </div>
      )}

      {/* Error retry banner */}
      {sessionState === "error" && error?.recoverable && (
        <RetryBanner onRetry={handleRetry} />
      )}

      {/* Assessment result view */}
      {sessionState === "completed" && assessmentResult && (
        <ScoreSummaryCard
          result={assessmentResult}
          exerciseId={exerciseId}
          chapterId={chapterId}
          onRetry={() => {
            reset();
          }}
        />
      )}
    </div>
  );
}
