"use client";

import { useEffect, useRef } from "react";

/** Live bars from the mic while recording (decorative; the timer and status text carry the meaning). */
export function LiveWaveform({ analyserRef, active }: { analyserRef: React.RefObject<AnalyserNode | null>; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const color = getComputedStyle(canvas).color;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const draw = () => {
      const analyser = analyserRef.current;
      const { width, height } = canvas;
      g.clearRect(0, 0, width, height);
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const bars = 32;
        const step = Math.floor(data.length / 2 / bars) || 1; // speech lives in the lower half
        const w = width / bars;
        g.fillStyle = color;
        for (let i = 0; i < bars; i++) {
          const v = data[i * step] / 255;
          const h = Math.max(3, v * height);
          g.globalAlpha = 0.35 + v * 0.65;
          g.beginPath();
          g.roundRect(i * w + w * 0.2, (height - h) / 2, w * 0.6, h, 2);
          g.fill();
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
      else raf = window.setTimeout(draw, 250) as unknown as number;
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(raf);
    };
  }, [active, analyserRef]);

  return <canvas ref={canvasRef} width={320} height={56} aria-hidden className="h-14 w-full max-w-xs text-primary" />;
}
