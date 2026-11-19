"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseAudioAnalyserOptions {
  onFrame: (data: Uint8Array) => void;
}

export function useAudioAnalyser({ onFrame }: UseAudioAnalyserOptions) {
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const disconnect = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {
        // safe ignore
      }
      sourceRef.current = null;
    }
    if (contextRef.current) {
      if (contextRef.current.state !== "closed") {
        contextRef.current.close().catch(() => {});
      }
      contextRef.current = null;
    }
    analyserRef.current = null;
    dataRef.current = null;
  }, []);

  const connect = useCallback(
    (stream: MediaStream) => {
      // Disconnect any existing context before creating a new one to avoid hardware limit
      disconnect();

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      contextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      const buffer = new ArrayBuffer(analyser.frequencyBinCount);
      dataRef.current = new Uint8Array(buffer);

      function loop() {
        if (!contextRef.current || contextRef.current.state === "closed") return;
        rafRef.current = requestAnimationFrame(loop);
        if (analyserRef.current && dataRef.current) {
          analyserRef.current.getByteFrequencyData(dataRef.current);
          onFrame(dataRef.current);
        }
      }
      loop();
    },
    [disconnect, onFrame]
  );

  useEffect(() => () => disconnect(), [disconnect]);

  return { connect, disconnect };
}
