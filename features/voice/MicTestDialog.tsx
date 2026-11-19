"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic, Play, RefreshCw, Square, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function MicTestDialog() {
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [testState, setTestState] = useState<
    "idle" | "recording" | "ready_to_play" | "playing" | "error"
  >("idle");
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>(
    "Tap 'Start Mic Check' to verify your audio."
  );

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const stopLiveAnalysis = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
    setVolumeLevel(0);
    setTestState("idle");
    if (testAudioUrl) {
      URL.revokeObjectURL(testAudioUrl);
      setTestAudioUrl(null);
    }
  }, [testAudioUrl]);

  const startLiveAnalysis = useCallback(async () => {
    try {
      setFeedback("Requesting microphone access…");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new ArrayBuffer(analyser.frequencyBinCount);
      const dataArray = new Uint8Array(buffer);
      setIsListening(true);
      setFeedback("Microphone active! Speak into your microphone to test levels.");

      function checkVolume() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolumeLevel(normalized);

        rafRef.current = requestAnimationFrame(checkVolume);
      }
      checkVolume();
    } catch {
      setFeedback(
        "Microphone access was denied or not detected. Please check browser permissions."
      );
      setIsListening(false);
    }
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        startLiveAnalysis();
      } else {
        stopLiveAnalysis();
      }
    },
    [startLiveAnalysis, stopLiveAnalysis]
  );

  const recordSample = useCallback(async () => {
    let stream = streamRef.current;
    if (!stream || !stream.getAudioTracks().some((t) => t.readyState === "live")) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (err) {
        console.warn("Microphone re-acquisition failed:", err);
        setFeedback("Microphone access unavailable. Please grant browser permissions.");
        setTestState("error");
        return;
      }
    }

    // Determine supported MIME type across browsers (Edge, Chrome, Firefox, Safari)
    const candidateTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/aac",
    ];
    let selectedMimeType = "";
    if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
      selectedMimeType = candidateTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
    }

    try {
      audioChunksRef.current = [];
      const options: MediaRecorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalType = selectedMimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(blob);
        setTestAudioUrl(url);
        setTestState("ready_to_play");
        setFeedback("Sample recorded! Tap 'Play Back Audio' to hear how you sound.");
      };

      recorder.onerror = () => {
        setFeedback("Recording encountered an issue. Tap Re-record to try again.");
        setTestState("error");
      };

      // Safely start recorder (with timeslice fallback)
      try {
        recorder.start(250);
      } catch {
        recorder.start();
      }

      setTestState("recording");
      setFeedback("Recording 3-second sample… Say: 'Hello, testing one two three!'");

      setTimeout(() => {
        try {
          if (recorder.state === "recording") {
            recorder.stop();
          }
        } catch (stopErr) {
          console.warn("MediaRecorder stop error:", stopErr);
        }
      }, 3000);
    } catch (recorderErr) {
      console.warn("MediaRecorder start failed:", recorderErr);
      setFeedback("Audio recording could not start on this browser. Sound level detection is still active.");
      setTestState("error");
    }
  }, []);

  const playSample = useCallback(() => {
    if (!testAudioUrl) return;
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(testAudioUrl);
    } else {
      audioElementRef.current.src = testAudioUrl;
    }

    setTestState("playing");
    setFeedback("Playing back your test recording…");

    audioElementRef.current.onended = () => {
      setTestState("ready_to_play");
      setFeedback("Playback complete. If your voice sounded clear, you're ready to practice!");
    };

    audioElementRef.current.play().catch(() => {
      setTestState("ready_to_play");
      setFeedback("Playback could not start. Please check your output speaker.");
    });
  }, [testAudioUrl]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const levelColor =
    volumeLevel > 50
      ? "bg-success"
      : volumeLevel > 15
        ? "bg-brand-orange"
        : "bg-muted";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mic className="size-3.5" aria-hidden="true" />
          Test Microphone
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[94vw] sm:max-w-md gap-4 sm:gap-5 p-4 sm:p-6">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Microphone Check</DialogTitle>
            <Badge variant={isListening ? "green" : "outline"}>
              {isListening ? "Mic Connected" : "Inactive"}
            </Badge>
          </div>
          <DialogDescription>
            Verify your microphone sensitivity and audio clarity before starting lessons.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-surface-peach/40 p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Input Level (VU Meter)</span>
            <span className="tabular-nums text-foreground">{volumeLevel}%</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-input">
            <div
              className={`h-full transition-all duration-75 ${levelColor}`}
              style={{ width: `${Math.min(100, Math.max(4, volumeLevel))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Quiet</span>
            <span>Normal Voice</span>
            <span>Loud</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[18px] border border-border bg-background p-4 text-center">
          <p
            className="font-body text-xs leading-relaxed text-foreground"
            aria-live="polite"
          >
            {feedback}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {isListening && testState === "idle" && (
              <Button size="sm" variant="orange" onClick={recordSample}>
                <Mic data-icon="inline-start" aria-hidden="true" />
                Record 3s Sample
              </Button>
            )}

            {testState === "recording" && (
              <Button size="sm" variant="destructive" disabled>
                <Square
                  data-icon="inline-start"
                  aria-hidden="true"
                  className="fill-current"
                />
                Recording sample…
              </Button>
            )}

            {testState === "ready_to_play" && (
              <>
                <Button size="sm" variant="green" onClick={playSample}>
                  <Play data-icon="inline-start" aria-hidden="true" />
                  Play Back Audio
                </Button>
                <Button size="sm" variant="outline" onClick={recordSample}>
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  Re-record
                </Button>
              </>
            )}

            {testState === "playing" && (
              <Button size="sm" variant="outline" disabled>
                <Volume2
                  data-icon="inline-start"
                  aria-hidden="true"
                  className="animate-pulse"
                />
                Playing audio…
              </Button>
            )}

            {testState === "error" && (
              <Button size="sm" variant="outline" onClick={recordSample}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                Retry Sample
              </Button>
            )}

            {!isListening && (
              <Button size="sm" variant="outline" onClick={startLiveAnalysis}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                Retry Access
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            <span>Ready for pronunciation assessment</span>
          </div>
          <Button size="sm" variant="default" onClick={() => handleOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
