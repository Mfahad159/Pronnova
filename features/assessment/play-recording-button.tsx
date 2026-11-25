"use client";

import { useEffect, useRef, useState } from "react";
import { CircleNotch, Play, Stop, WarningCircle } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

type State = "idle" | "loading" | "playing" | "error";

/** Round play button for a saved recording: asks the server for a short-lived link, then plays it. */
export function PlayRecordingButton({
  attemptId,
  text,
  hasAudio,
  as = "student",
}: {
  attemptId: string;
  text: string;
  hasAudio: boolean;
  as?: "student" | "teacher";
}) {
  const [state, setState] = useState<State>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function toggle() {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`/api/recordings/${attemptId}?as=${as}`, { cache: "no-store" });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error("no url");
      audioRef.current?.pause();
      const audio = new Audio(data.url);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("error");
      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }

  const label = !hasAudio
    ? `No recording saved: ${text}`
    : state === "playing"
      ? `Stop recording: ${text}`
      : state === "error"
        ? `Couldn't play, try again: ${text}`
        : `Play recording: ${text}`;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!hasAudio || state === "loading"}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-9 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:size-4",
        state === "error" ? "bg-destructive/10 text-destructive" : "bg-secondary text-primary hover:bg-primary hover:text-primary-foreground",
      )}
    >
      {state === "loading" ? (
        <CircleNotch className="animate-spin" weight="bold" />
      ) : state === "playing" ? (
        <Stop weight="fill" />
      ) : state === "error" ? (
        <WarningCircle weight="bold" />
      ) : (
        <Play weight="fill" />
      )}
    </button>
  );
}
