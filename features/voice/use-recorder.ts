"use client";

import { useCallback, useEffect, useRef } from "react";
import { RECORDING, RECORDING_MIME_PREFERENCE, recordingProblem } from "@/lib/audio";
import { usePracticeStore, type PracticeErrorKind } from "@/stores/practice-store";

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return RECORDING_MIME_PREFERENCE.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

const MIC_ERRORS: Record<string, { kind: PracticeErrorKind; message: string }> = {
  NotAllowedError: { kind: "denied", message: "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again." },
  SecurityError: { kind: "denied", message: "Microphone access is blocked. Allow the microphone for this site in your browser settings, then try again." },
  NotFoundError: { kind: "no-mic", message: "No microphone found. Plug in a microphone or headset and try again." },
  OverconstrainedError: { kind: "no-mic", message: "No microphone found. Plug in a microphone or headset and try again." },
  NotReadableError: { kind: "busy", message: "Your microphone is being used by another app. Close it and try again." },
};

/**
 * UC-05 Record Speech. Handles mic permission, MediaRecorder (webm/opus, mp4 on Safari),
 * live level for the waveform, a 15 s auto-stop, cancel, and silence/too-short checks.
 * The mic is released as soon as recording stops, is cancelled, or the page closes.
 */
export function useRecorder() {
  const set = usePracticeStore((s) => s.set);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const startedAt = useRef(0);
  const peak = useRef(0);
  const cancelled = useRef(false);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; stop?: ReturnType<typeof setTimeout>; raf?: number }>({});

  const release = useCallback(() => {
    clearInterval(timers.current.tick);
    clearTimeout(timers.current.stop);
    if (timers.current.raf) cancelAnimationFrame(timers.current.raf);
    timers.current = {};
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (ctxRef.current && ctxRef.current.state !== "closed") ctxRef.current.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      release();
    };
  }, [release]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    stop();
  }, [stop]);

  const start = useCallback(async () => {
    const mime = pickMime();
    if (!navigator.mediaDevices?.getUserMedia || !mime) {
      set({ phase: "error", error: { kind: "unsupported", message: "This browser can't record audio. Please use a recent Chrome, Edge, Firefox or Safari." } });
      return;
    }
    set({ phase: "requesting", error: null, result: null, elapsedMs: 0 });
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      set({ phase: "error", error: MIC_ERRORS[name] ?? { kind: "no-mic", message: "We couldn't start the microphone. Please try again." } });
      return;
    }
    streamRef.current = stream;

    // Level meter: peak loudness tells us if the student was silent.
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    peak.current = 0;
    const buf = new Float32Array(analyser.fftSize);
    const measure = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      peak.current = Math.max(peak.current, Math.sqrt(sum / buf.length));
      timers.current.raf = requestAnimationFrame(measure);
    };
    measure();

    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = recorder;
    chunks.current = [];
    cancelled.current = false;
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
    recorder.onstop = () => {
      const durationMs = performance.now() - startedAt.current;
      const loudest = peak.current;
      release();
      if (cancelled.current) {
        set({ phase: "idle", elapsedMs: 0 }); // UC-05 alt 3A: audio discarded
        return;
      }
      const type = recorder.mimeType || mime;
      const blob = new Blob(chunks.current, { type });
      const problem = recordingProblem({ bytes: blob.size, durationMs, mime: type });
      if (problem) {
        set({ phase: "error", error: { kind: "too-short", message: problem } });
        return;
      }
      if (loudest < RECORDING.silenceLevel) {
        set({ phase: "error", error: { kind: "silent", message: "We couldn't hear you. Move closer to the microphone and speak clearly." } });
        return;
      }
      set({
        phase: "recorded",
        recording: { blob, url: URL.createObjectURL(blob), durationMs, mime: type, attemptId: crypto.randomUUID() },
      });
    };

    recorder.start(250);
    startedAt.current = performance.now();
    set({ phase: "recording" });
    timers.current.tick = setInterval(() => set({ elapsedMs: performance.now() - startedAt.current }), 100);
    timers.current.stop = setTimeout(() => stop(), RECORDING.maxMs); // auto-stop at 15 s
  }, [release, set, stop]);

  return { start, stop, cancel, analyserRef };
}
