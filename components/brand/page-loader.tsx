"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./page-loader.css";

// The Pronnova mark (public/icons/pronnova-mark.svg) split into its parts so the jaws can move:
// upper teeth point down to the centre line, lower teeth point up, plus a drop at each end.
const UPPER =
  "M13.51,50 C14.69,42.94 17.46,38.23 17.46,26.45 A3.96,3.96 0 0 0 9.55,26.45 C9.55,38.23 12.32,42.94 13.51,50Z M23.62,50 C25.28,40.52 29.18,34.19 29.18,18.38 A5.57,5.57 0 0 0 18.05,18.38 C18.05,34.19 21.95,40.52 23.62,50Z M36.17,50 C38.16,38.98 42.8,31.63 42.8,13.26 A6.63,6.63 0 0 0 29.54,13.26 C29.54,31.63 34.18,38.98 36.17,50Z M50,50 C52.1,38.45 57,30.75 57,11.5 A7,7 0 0 0 43,11.5 C43,30.75 47.9,38.45 50,50Z M63.83,50 C65.82,38.98 70.46,31.63 70.46,13.26 A6.63,6.63 0 0 0 57.2,13.26 C57.2,31.63 61.84,38.98 63.83,50Z M76.38,50 C78.05,40.52 81.95,34.19 81.95,18.38 A5.57,5.57 0 0 0 70.82,18.38 C70.82,34.19 74.72,40.52 76.38,50Z M86.49,50 C87.68,42.94 90.45,38.23 90.45,26.45 A3.96,3.96 0 0 0 82.54,26.45 C82.54,38.23 85.31,42.94 86.49,50Z";
const LOWER =
  "M13.51,50 C14.69,57.06 17.46,61.77 17.46,73.55 A3.96,3.96 0 0 1 9.55,73.55 C9.55,61.77 12.32,57.06 13.51,50Z M23.62,50 C25.28,59.48 29.18,65.81 29.18,81.62 A5.57,5.57 0 0 1 18.05,81.62 C18.05,65.81 21.95,59.48 23.62,50Z M36.17,50 C38.16,61.02 42.8,68.37 42.8,86.74 A6.63,6.63 0 0 1 29.54,86.74 C29.54,68.37 34.18,61.02 36.17,50Z M50,50 C52.1,61.55 57,69.25 57,88.5 A7,7 0 0 1 43,88.5 C43,69.25 47.9,61.55 50,50Z M63.83,50 C65.82,61.02 70.46,68.37 70.46,86.74 A6.63,6.63 0 0 1 57.2,86.74 C57.2,68.37 61.84,61.02 63.83,50Z M76.38,50 C78.05,59.48 81.95,65.81 81.95,81.62 A5.57,5.57 0 0 1 70.82,81.62 C70.82,65.81 74.72,59.48 76.38,50Z M86.49,50 C87.68,57.06 90.45,61.77 90.45,73.55 A3.96,3.96 0 0 1 82.54,73.55 C82.54,61.77 85.31,57.06 86.49,50Z";
const ENDS =
  "M6.77,36.2 C10.55,42.41 10.55,57.59 6.77,63.8 C2.99,57.59 2.99,42.41 6.77,36.2Z M93.23,36.2 C97.01,42.41 97.01,57.59 93.23,63.8 C89.45,57.59 89.45,42.41 93.23,36.2Z";

const MAX_WAIT_MS = 8000; // never block the site longer than this (e.g. a stuck image)
const BITE_MS = 1100; // one open → closed → open cycle; keep in sync with page-loader.css
const FADE_MS = 450; // overlay fade-out; keep in sync with page-loader.css

type Phase = "loading" | "leaving" | "gone";

/**
 * Page loader: the Pronnova mark "bites" (jaws close so the teeth merge, then open)
 * until the page has fully loaded, then the overlay fades out at the end of a bite.
 * - Shows on every full page load (opening the site, refresh). In-app navigation keeps the root
 *   layout mounted, so moving between pages does not show it again.
 * - The bite is a CSS animation, so it runs from the first paint, before JavaScript loads.
 * - Respects prefers-reduced-motion (no bite, just the logo and a fade).
 */
export function PageLoader() {
  const [phase, setPhase] = useState<Phase>("loading");
  const ready = useRef(false);

  const leave = useCallback(() => {
    setPhase((p) => (p === "loading" ? "leaving" : p));
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cycleFallback = 0;
    const markReady = () => {
      ready.current = true;
      // With motion, leave when the current bite ends (onAnimationIteration). The timer is a
      // backup for when the browser pauses animation events (e.g. a background tab).
      if (reduced) leave();
      else cycleFallback = window.setTimeout(leave, BITE_MS + 150);
    };
    if (document.readyState === "complete") markReady();
    else window.addEventListener("load", markReady, { once: true });
    const guard = window.setTimeout(leave, MAX_WAIT_MS);
    return () => {
      window.removeEventListener("load", markReady);
      window.clearTimeout(guard);
      window.clearTimeout(cycleFallback);
    };
  }, [leave]);

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
        if (e.target === e.currentTarget && phase === "leaving")
          setPhase("gone");
      }}
    >
      <svg viewBox="0 0 100 100" className="pn-loader-mark" aria-hidden>
        <defs>
          {/* One gradient across the whole mark, so moving parts keep the logo's colours. */}
          <linearGradient
            id="pronnova-loader-g"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100"
            y2="100"
          >
            <stop offset="0" stopColor="#FF594B" />
            <stop offset="1" stopColor="#FF8D28" />
          </linearGradient>
        </defs>
        <g fill="url(#pronnova-loader-g)">
          {/* Each bite ends with the jaws open again — the natural moment to fade out. */}
          <path
            d={UPPER}
            className="pn-loader-upper"
            onAnimationIteration={() => {
              if (ready.current) leave();
            }}
          />
          <path d={LOWER} className="pn-loader-lower" />
          <path d={ENDS} className="pn-loader-ends" />
        </g>
      </svg>
    </div>
  );
}
