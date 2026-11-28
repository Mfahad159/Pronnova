"use client";

import { motion, useReducedMotion } from "motion/react";

// Each layer morphs between two wave shapes with the SAME command structure (so the path can
// interpolate). viewBox 1440 × 120; every shape closes along the bottom edge.
const layers = [
  {
    // back: soft brand coral
    a: "M0,30 C300,70 600,0 900,30 C1150,55 1300,10 1440,36 L1440,120 L0,120 Z",
    b: "M0,44 C300,8 600,64 900,40 C1150,16 1300,58 1440,24 L1440,120 L0,120 Z",
    fill: "var(--brand-coral)",
    opacity: 0.16,
    duration: 11,
  },
  {
    // middle: coral → footer colour gradient
    a: "M0,48 C260,92 520,8 780,44 C1040,80 1240,28 1440,56 L1440,120 L0,120 Z",
    b: "M0,62 C260,22 520,86 780,58 C1040,30 1240,82 1440,42 L1440,120 L0,120 Z",
    fill: "url(#footer-wave-gradient)",
    opacity: 1,
    duration: 9,
  },
  {
    // front: exactly the footer colour, so it melts into the footer
    a: "M0,70 C240,112 480,30 720,64 C960,98 1200,48 1440,78 L1440,120 L0,120 Z",
    b: "M0,84 C240,50 480,108 720,80 C960,52 1200,102 1440,70 L1440,120 L0,120 Z",
    fill: "var(--foreground)",
    opacity: 1,
    duration: 7,
  },
] as const;

/**
 * Seam between the page and the dark footer: three layered waves that slowly morph, ending in the
 * footer's own colour (the footer itself is unchanged). Decorative only; still for reduced motion.
 */
export function FooterWave() {
  const still = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none relative -mb-px h-20 w-full bg-gradient-to-b from-background to-tint-peach/50 md:h-28">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="footer-wave-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-coral)" stopOpacity="0.45" />
            <stop offset="70%" stopColor="var(--foreground)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {layers.map((l) => (
          <motion.path
            key={l.duration}
            d={l.a}
            fill={l.fill}
            fillOpacity={l.opacity}
            animate={still ? undefined : { d: [l.a, l.b, l.a] }}
            transition={{ duration: l.duration, ease: "easeInOut", repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
}
