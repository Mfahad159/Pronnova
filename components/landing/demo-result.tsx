"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowCounterClockwise, ArrowRight, Info } from "@phosphor-icons/react/ssr";
import { OutlineButton } from "@/components/brand/ui";
import { ScorePill } from "@/features/assessment/score-pill";
import { ListenButton } from "@/features/practice/listen-button";
import { cn } from "@/lib/utils";
import type { Classification, PhonemeResult, WordResult } from "@/types";

/** What POST /api/demo/score returns when the recording was scored (nothing is stored on the server). */
export interface DemoScore {
  word: string;
  score: number;
  classification: Classification;
  words: WordResult[];
  phonemes: PhonemeResult[];
  trickySounds: { phoneme: string; count: number }[];
}

// ── Last tries: this browser only (localStorage), never the database ─────────────
const KEY = "pronnova.demoTries";
const EVENT = "pronnova-demo-tries";
const MAX = 5;
export interface DemoTry {
  at: string;
  score: number;
  classification: Classification;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}
function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]"; // private mode / blocked storage
  }
}

/** Remember a scored demo try on this device (newest first, last 5). */
export function saveDemoTry(t: DemoTry) {
  try {
    const list = JSON.parse(readRaw()) as DemoTry[];
    window.localStorage.setItem(KEY, JSON.stringify([t, ...list].slice(0, MAX)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage blocked: the result still shows, it just isn't remembered */
  }
}

function clearDemoTries() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

function useDemoTries(): DemoTry[] {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "[]");
  return useMemo(() => {
    try {
      const list = JSON.parse(raw) as DemoTry[];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, [raw]);
}

// ── Result panel ──────────────────────────────────────────────────────────────
const cheer: Record<Classification, string> = {
  excellent: "Super star! You said it really well! 🌟",
  good: "Good job! Almost perfect — keep going!",
  average: "Nice try! Listen again and have another go.",
};
const soundTone = {
  ok: "bg-score-excellent/10 text-score-excellent",
  near: "bg-score-good/10 text-score-good",
  sub: "bg-score-average/10 text-score-average",
  del: "bg-score-average/10 text-score-average",
} as const;
const wordTone = { ok: soundTone.ok, near: soundTone.near, bad: soundTone.sub } as const;
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

/** Real engine result for the landing demo (scored live, stored only in this browser). */
export function DemoResult({ result, onTryAgain }: { result: DemoScore; onTryAgain: () => void }) {
  const tries = useDemoTries();
  const word = result.words[0];
  const colour = word?.status ?? (word?.isError ? "bad" : "ok");
  return (
    <div className="mt-5 border-t border-border/70 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          <Info className="size-3.5 text-primary" weight="duotone" aria-hidden />
          Live result · saved on this device only
        </span>
        <ScorePill score={result.score} className="px-3.5 py-1.5 text-sm" />
      </div>

      <p className="mt-3 font-heading text-lg font-bold text-primary">{cheer[result.classification]}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className={cn("rounded-lg px-2.5 py-0.5 font-heading text-xl font-bold", wordTone[colour])}>{result.word}</span>
        {/* Each sound of the word: green = right, amber = close, red = wrong or missing. */}
        <span className="flex flex-wrap gap-1.5" aria-label="Sounds">
          {result.phonemes.map((p, i) => (
            <span
              key={i}
              title={p.status === "ok" ? "Right" : p.detected ? `Heard /${p.detected}/` : "Missing"}
              className={cn("rounded-md px-1.5 py-0.5 font-mono text-sm", soundTone[p.status ?? (p.isError ? "sub" : "ok")])}
            >
              /{p.expected}/
            </span>
          ))}
        </span>
      </div>

      {result.trickySounds.length > 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Practise the sound{result.trickySounds.length > 1 ? "s" : ""}{" "}
          {result.trickySounds.map((t) => (
            <span key={t.phoneme} className="mr-1 inline-block rounded-md bg-secondary px-1.5 font-mono text-xs text-primary">
              /{t.phoneme}/
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ListenButton text={result.word} label={`Hear “${result.word}”`} />
        <OutlineButton onClick={onTryAgain}>
          <ArrowCounterClockwise weight="bold" aria-hidden />
          Try again
        </OutlineButton>
        <Link
          href="/onboarding"
          className="group/arrow inline-flex h-11 items-center gap-1.5 rounded-xl bg-foreground px-5 font-heading text-sm font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring"
        >
          Open full practice
          <ArrowRight className="size-4 transition-transform group-hover/arrow:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>

      {tries.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold">Your last tries (this device):</span>
          {tries.map((t, i) => (
            <span key={`${t.at}-${i}`} className="rounded-full border border-border bg-card px-2.5 py-0.5 tabular-nums">
              {t.score}% · {timeFmt.format(new Date(t.at))}
            </span>
          ))}
          <button type="button" onClick={clearDemoTries} className="font-semibold text-primary hover:underline">
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
