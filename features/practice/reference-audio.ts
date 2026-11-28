"use client";

import { speakReference } from "@/lib/speech-tts";

export type Speed = "normal" | "slow";

// Signed URLs from /api/tts, remembered for this page view (they last an hour).
const urls = new Map<string, Promise<string | null>>();
let current: HTMLAudioElement | null = null;

function fetchUrl(text: string, speed: Speed): Promise<string | null> {
  const key = `${speed}|${text}`;
  let p = urls.get(key);
  if (!p) {
    p = fetch(`/api/tts?${new URLSearchParams({ text, speed })}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ url: string }>) : null))
      .then((d) => d?.url ?? null)
      .catch(() => null);
    urls.set(key, p);
    p.then((u) => !u && urls.delete(key)); // don't remember failures
  }
  return p;
}

/**
 * Plays the reference pronunciation: the Pronnova engine's voice (Kokoro, cached on the server,
 * normal or 0.75× slow). If the engine isn't available, falls back to the browser's own voice so
 * the button always does something.
 */
export async function playReference(
  text: string,
  speed: Speed,
  cb: { onStart?: () => void; onEnd?: () => void; onUnsupported?: () => void } = {},
): Promise<void> {
  current?.pause();
  const url = await fetchUrl(text, speed);
  if (url) {
    const audio = new Audio(url);
    current = audio;
    audio.onplay = () => cb.onStart?.();
    audio.onended = audio.onerror = audio.onpause = () => cb.onEnd?.();
    try {
      await audio.play();
      return;
    } catch {
      /* autoplay blocked or decode error → browser voice */
    }
  }
  speakReference(text, cb);
}

/** Warm the cache (e.g. the word on screen) so the first tap plays at once. */
export function prefetchReference(text: string) {
  void fetchUrl(text, "normal");
}
