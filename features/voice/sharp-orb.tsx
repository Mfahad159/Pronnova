"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { MODE_FRAMES, paintFrame, resolvePreset } from "thinking-orbs/engine";
import type { OrbState } from "thinking-orbs";

/**
 * A thinking-orb drawn crisply at ANY size. The `ThinkingOrb` component only renders its tuned 64/32/20px
 * canvases, so showing it bigger meant stretching a small bitmap (blurry dots). The library's engine is
 * pure geometry over (size, time, options), so here we draw the tuned 64px design straight at the real
 * size × devicePixelRatio. Light theme only (Pronnova has no dark mode). Reduced motion: one still frame.
 */
export function SharpOrb({
  state,
  size,
  color,
  paused = false,
  className,
}: {
  state: OrbState;
  /** CSS pixels. */
  size: number;
  /** Optional `{ r, g, b }` ink tint; omit for the stock grey ink. */
  color?: { r: number; g: number; b: number };
  paused?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const tint = color ? `${color.r},${color.g},${color.b}` : "";

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    const { mode, speed, opts } = resolvePreset(state, 64);
    const frameFn = MODE_FRAMES[mode];
    const ink = tint ? { r: Number(tint.split(",")[0]), g: Number(tint.split(",")[1]), b: Number(tint.split(",")[2]) } : undefined;
    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      paintFrame(ctx, frameFn(size, t, opts), false, ink);
    };
    if (reduced || paused) {
      draw(paused ? (performance.now() / 1000) * speed : 1.2);
      return;
    }
    let raf = 0;
    const step = () => {
      draw((performance.now() / 1000) * speed);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [state, size, tint, paused, reduced]);

  return <canvas ref={ref} aria-hidden className={className} style={{ width: size, height: size, display: "block" }} />;
}
