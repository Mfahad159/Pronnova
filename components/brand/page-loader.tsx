"use client";

import { useEffect, useRef, useState } from "react";
import { MODE_FRAMES, resolvePreset } from "thinking-orbs/engine";
import "./page-loader.css";

/*
 * Page loader: the thinking-orbs "working" orb (dots on tilted orbits) spins while the page loads;
 * once it has loaded, every dot glides into place to form a dotted Pronnova mark (the 7 tapered
 * columns + 2 end drops of public/icons/pronnova-mark.svg) and turns from ink to the brand
 * coral→orange gradient, then the overlay fades out.
 * - Drawn on a canvas at its real size × devicePixelRatio, so it is sharp on every screen; bigger on
 *   desktop than on phones (CSS clamp in page-loader.css).
 * - Before JavaScript runs, a static dotted mark (SVG, faded in by CSS) shows instead.
 * - Shows on every full page load (open, refresh); in-app navigation keeps the root layout, so it
 *   doesn't show again. Reduced motion: no orbit, the dotted mark appears and fades.
 */

type Pt = { x: number; y: number; r: number };

/** Logo as dots, in the mark's 0–100 viewBox. Columns taper to a point at the centre line (y = 50). */
const LOGO: Pt[] = (() => {
  const pts: Pt[] = [];
  const cols = [
    { x: 13.51, top: 22.49, w: 7.9 },
    { x: 23.62, top: 12.81, w: 11.13 },
    { x: 36.17, top: 6.63, w: 13.26 },
    { x: 50, top: 4.5, w: 14 },
  ];
  const column = (x: number, top: number, w: number) => {
    const half = 50 - top;
    const n = Math.round((2 * half) / 4.3);
    for (let i = 0; i <= n; i++) {
      const y = top + (i * 2 * half) / n;
      const k = Math.abs(y - 50) / half; // 0 at the pinch, 1 at the round ends
      pts.push({ x, y, r: Math.min(2.7, w * 0.19) * (0.42 + 0.58 * k) });
    }
  };
  for (const c of cols) {
    column(c.x, c.top, c.w);
    if (c.x !== 50) column(100 - c.x, c.top, c.w);
  }
  for (const x of [6.77, 93.23]) {
    for (let y = 37.4; y <= 62.7; y += 4.2) {
      const k = 1 - Math.abs(y - 50) / 13.8; // drops are widest in the middle
      pts.push({ x, y, r: 0.9 + 1.1 * k });
    }
  }
  return pts;
})();

const CORAL = [255, 89, 75];
const ORANGE = [255, 141, 40];
const INK = [58, 42, 34];
const PAPER = [255, 250, 245];

const MAX_WAIT_MS = 8000; // never block the site longer than this (e.g. a stuck image)
const MERGE_MS = 850; // one dot's flight into the logo
const STAGGER_MS = 260; // spread of start times across dots
const HOLD_MS = 380; // admire the finished mark
const FADE_MS = 450; // overlay fade-out; keep in sync with page-loader.css

type Phase = "loading" | "leaving" | "gone";

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export function PageLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [live, setLive] = useState(false); // canvas running (JS loaded) → hide the static fallback
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = canvas.getBoundingClientRect().width || 160;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    setLive(true);

    const { mode, speed, opts } = resolvePreset("working", 64);
    const orbit = MODE_FRAMES[mode];
    // Logo in canvas px: 76% of the canvas, centred.
    const scale = (size * 0.76) / 100;
    const off = size * 0.12;
    const logo = LOGO.map((p) => ({ x: off + p.x * scale, y: off + p.y * scale, r: Math.max(0.9, p.r * scale * 0.95), c: mix(CORAL, ORANGE, (p.x + p.y) / 200) }));
    const center = size / 2;
    const angle = (x: number, y: number) => Math.atan2(y - center, x - center);

    let raf = 0;
    let mergeStart = 0;
    let pairs: { from: Pt & { c: number[]; a: number }; to: (typeof logo)[number] | null; delay: number }[] = [];
    let ready = false;
    let leaveTimer = 0;

    const dot = (x: number, y: number, r: number, c: number[], a = 1) => {
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const startMerge = (orbDots: { x: number; y: number; r: number; white: number; a?: number }[]) => {
      // Pair orb dots with logo dots by their angle around the centre, so they swirl into place.
      const from = orbDots.map((d) => ({ x: d.x, y: d.y, r: d.r, c: mix(INK, PAPER, d.white), a: d.a ?? 1 }));
      from.sort((p, q) => angle(p.x, p.y) - angle(q.x, q.y));
      const to = [...logo].sort((p, q) => angle(p.x, p.y) - angle(q.x, q.y));
      // Every logo dot gets one orb dot, picked evenly around the circle; spare orb dots fade away.
      // (If the orb has fewer dots than the logo, some orb dots split into two.)
      const used = new Set<number>();
      pairs = to.map((target, j) => {
        const k = from.length ? Math.floor((j * from.length) / to.length) : -1;
        used.add(k);
        return {
          from: k >= 0 ? from[k] : { x: center, y: center, r: 1, c: INK, a: 1 },
          to: target,
          delay: (j / to.length) * STAGGER_MS,
        };
      });
      from.forEach((f, k) => {
        if (!used.has(k)) pairs.push({ from: f, to: null, delay: 0 });
      });
      mergeStart = performance.now();
    };

    const frame = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      if (!mergeStart) {
        const f = orbit(size, (now / 1000) * speed, opts);
        if (ready) {
          startMerge(f.dots);
        } else {
          for (const d of f.dots) dot(d.x, d.y, d.r, mix(INK, PAPER, d.white), d.a ?? 1);
          raf = requestAnimationFrame(frame);
          return;
        }
      }
      const t = now - mergeStart;
      for (const p of pairs) {
        const k = easeInOut(Math.min(1, Math.max(0, (t - p.delay) / MERGE_MS)));
        if (!p.to) {
          dot(p.from.x, p.from.y, p.from.r, p.from.c, p.from.a * (1 - k)); // extra orb dots fade away
          continue;
        }
        dot(
          p.from.x + (p.to.x - p.from.x) * k,
          p.from.y + (p.to.y - p.from.y) * k,
          p.from.r + (p.to.r - p.from.r) * k,
          mix(p.from.c, p.to.c, k),
          p.from.a + (1 - p.from.a) * k,
        );
      }
      if (t < MERGE_MS + STAGGER_MS) raf = requestAnimationFrame(frame);
      else leaveTimer = window.setTimeout(() => setPhase((p) => (p === "loading" ? "leaving" : p)), HOLD_MS);
    };

    const drawLogo = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      for (const p of logo) dot(p.x, p.y, p.r, p.c);
    };

    const markReady = () => {
      if (ready) return;
      ready = true;
      if (reduced) {
        drawLogo();
        leaveTimer = window.setTimeout(() => setPhase((p) => (p === "loading" ? "leaving" : p)), HOLD_MS);
      }
    };

    if (reduced) drawLogo();
    else raf = requestAnimationFrame(frame);
    if (document.readyState === "complete") markReady();
    else window.addEventListener("load", markReady, { once: true });
    const guard = window.setTimeout(() => setPhase((p) => (p === "loading" ? "leaving" : p)), MAX_WAIT_MS);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", markReady);
      window.clearTimeout(guard);
      window.clearTimeout(leaveTimer);
    };
  }, []);

  // Fade-out: unmount on transitionend, or after the fade time if that event never arrives.
  useEffect(() => {
    if (phase !== "leaving") return;
    const id = window.setTimeout(() => setPhase("gone"), FADE_MS + 100);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className="pn-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label={phase === "loading" ? "Loading Pronnova" : undefined}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && phase === "leaving") setPhase("gone");
      }}
    >
      <div className="pn-loader-stage">
        {/* Before JavaScript: a still dotted mark (fades in only if JS is slow). */}
        {!live ? (
          <svg viewBox="0 0 100 100" className="pn-loader-fallback" aria-hidden>
            {LOGO.map((p, i) => (
              <circle key={i} cx={12 + p.x * 0.76} cy={12 + p.y * 0.76} r={p.r * 0.72} fill="#ff6f45" />
            ))}
          </svg>
        ) : null}
        <canvas ref={canvasRef} className="pn-loader-canvas" aria-hidden />
      </div>
    </div>
  );
}
