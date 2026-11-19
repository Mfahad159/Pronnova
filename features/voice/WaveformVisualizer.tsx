"use client";
import { useCallback, useEffect, useRef } from "react";
import { useAudioAnalyser } from "./hooks/useAudioAnalyser";

interface WaveformVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

const BAR_COUNT = 32;
const BAR_GAP = 3;
const IDLE_HEIGHTS = [0.3, 0.5, 0.4, 0.6, 0.35, 0.55, 0.45, 0.3, 0.6, 0.4, 0.5, 0.35, 0.65, 0.45, 0.3, 0.55, 0.4, 0.6, 0.35, 0.5, 0.45, 0.3, 0.6, 0.4, 0.55, 0.35, 0.65, 0.45, 0.3, 0.5, 0.4, 0.6];

function drawWaveform(canvas: HTMLCanvasElement, data: Uint8Array | null, isActive: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const totalBars = BAR_COUNT;
  const barWidth = (width - BAR_GAP * (totalBars - 1)) / totalBars;

  for (let i = 0; i < totalBars; i++) {
    let ratio: number;
    if (isActive && data) {
      const dataIndex = Math.floor((i / totalBars) * data.length);
      ratio = Math.max(0.08, data[dataIndex] / 255);
    } else {
      ratio = IDLE_HEIGHTS[i % IDLE_HEIGHTS.length] * 0.4;
    }

    const barHeight = Math.max(4, ratio * height);
    const x = i * (barWidth + BAR_GAP);
    const y = (height - barHeight) / 2;

    // Gradient from coral to orange
    const grad = ctx.createLinearGradient(x, y, x, y + barHeight);
    grad.addColorStop(0, "#FF594B");
    grad.addColorStop(1, "#FF8D28");
    ctx.fillStyle = grad;

    // Rounded rect bars
    const r = Math.min(barWidth / 2, barHeight / 2, 4);
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, r);
    ctx.fill();
  }
}

export function WaveformVisualizer({ stream, isActive, className }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestData = useRef<Uint8Array | null>(null);

  const onFrame = useCallback((data: Uint8Array) => {
    latestData.current = data;
    if (canvasRef.current) drawWaveform(canvasRef.current, latestData.current, true);
  }, []);

  const { connect, disconnect } = useAudioAnalyser({ onFrame });

  useEffect(() => {
    if (isActive && stream) {
      connect(stream);
    } else {
      disconnect();
      if (canvasRef.current) drawWaveform(canvasRef.current, null, false);
    }
    return () => disconnect();
  }, [isActive, stream, connect, disconnect]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={56}
      className={className}
      aria-hidden="true"
    />
  );
}
