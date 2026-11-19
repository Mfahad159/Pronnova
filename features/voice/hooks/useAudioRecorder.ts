"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoiceStore } from "@/stores/voiceStore";

const MAX_DURATION_MS = 15_000;
const PREFERRED_MIME = "audio/webm;codecs=opus";
const FALLBACK_MIME = "audio/mp4";

function getSupportedMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported(PREFERRED_MIME)) return PREFERRED_MIME;
  if (MediaRecorder.isTypeSupported(FALLBACK_MIME)) return FALLBACK_MIME;
  return "";
}

export function useAudioRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBlobUrlRef = useRef<string | null>(null);

  const { setSessionState, setAudioObjectUrl, setDuration, setError } =
    useVoiceStore();

  const stopRecording = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setSessionState("cancelled");
  }, [setSessionState]);

  const requestPermission = useCallback(async () => {
    setSessionState("requesting_permission");
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = userStream;
      setStream(userStream);
      setSessionState("ready");
    } catch (err) {
      const isNotAllowed =
        err instanceof DOMException && err.name === "NotAllowedError";
      setError({
        code: isNotAllowed ? "NOT_ALLOWED" : "NOT_FOUND",
        message: isNotAllowed
          ? "Microphone access was denied. Please allow access in your browser settings."
          : "No microphone found. Please connect a microphone and try again.",
        recoverable: !isNotAllowed,
      });
    }
  }, [setSessionState, setError]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mime = getSupportedMime();
    const recorder = new MediaRecorder(
      streamRef.current,
      mime ? { mimeType: mime } : undefined
    );
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const durationMs = Date.now() - startTimeRef.current;
      const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
      if (blob.size < 100) {
        setError({
          code: "EMPTY_AUDIO",
          message: "No audio was captured. Please try speaking louder or closer.",
          recoverable: true,
        });
        return;
      }
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      prevBlobUrlRef.current = url;
      setAudioObjectUrl(url);
      setDuration(durationMs);
      setSessionState("processing_audio");
    };

    recorder.start(250);
    startTimeRef.current = Date.now();
    setSessionState("recording");

    autoStopTimerRef.current = setTimeout(() => {
      stopRecording();
    }, MAX_DURATION_MS);
  }, [setSessionState, setAudioObjectUrl, setDuration, setError, stopRecording]);

  const teardown = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
      prevBlobUrlRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
    setStream(null);
  }, []);

  useEffect(() => {
    return () => teardown();
  }, [teardown]);

  const getBlob = useCallback((): Blob | null => {
    if (!chunksRef.current.length) return null;
    return new Blob(chunksRef.current, {
      type: getSupportedMime() || "audio/webm",
    });
  }, []);

  return {
    stream,
    requestPermission,
    startRecording,
    stopRecording,
    cancelRecording,
    teardown,
    getBlob,
  };
}
