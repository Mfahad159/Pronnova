"use client";

export type TtsStatus = "idle" | "speaking" | "unsupported";

/**
 * Plays a reference English pronunciation using the browser's Web Speech API.
 * Never invents pronunciations; relies strictly on the provided curriculum text.
 */
export function speakReference(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onUnsupported?: () => void;
  },
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    callbacks?.onUnsupported?.();
    return false;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.88;

  const voices = synth.getVoices();
  const english =
    voices.find((v) => v.lang.startsWith("en-GB")) ??
    voices.find((v) => v.lang.startsWith("en-US")) ??
    voices.find((v) => v.lang.startsWith("en"));
  if (english) utterance.voice = english;

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => callbacks?.onEnd?.();

  synth.speak(utterance);
  return true;
}
