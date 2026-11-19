"use client";

import { useEffect, useRef } from "react";

interface DitherVeilProps {
  className?: string;
  dotSize?: number;
}

export function DitherVeil({ className, dotSize = 4 }: DitherVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    }

    resize();
    window.addEventListener("resize", resize);

    const bayer4x4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];

    let time = 0;

    function render() {
      time += 0.02;
      ctx!.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const cols = Math.ceil(width / dotSize);
      const rows = Math.ceil(height / dotSize);

      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const x = c * dotSize;
          const y = r * dotSize;

          // Distance to interactive cursor
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cursorFactor = Math.max(0, 1 - dist / 180);

          // Atmospheric wave
          const wave =
            Math.sin(x * 0.008 + time) * 0.5 + Math.cos(y * 0.008 + time * 0.7) * 0.5;

          const threshold = bayer4x4[r % 4][c % 4] / 16;
          const intensity = Math.min(1, Math.max(0, (wave * 0.35 + 0.45) * (1 - cursorFactor * 0.75)));

          if (intensity > threshold) {
            const alpha = Math.min(0.22, intensity * 0.25);
            // Palette matches brand warm coral / orange
            ctx!.fillStyle = `rgba(255, 89, 75, ${alpha})`;
            ctx!.fillRect(x, y, dotSize, dotSize);
          }
        }
      }

      animId = requestAnimationFrame(render);
    }

    render();

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [dotSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
