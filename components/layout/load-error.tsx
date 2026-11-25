"use client";

import Image from "next/image";
import { ArrowCounterClockwise } from "@phosphor-icons/react/ssr";
import { KiddyButton } from "@/components/brand/kiddy-button";

/** Shared body for app/student/error.tsx and app/teacher/error.tsx (Piko, landing style). */
export function LoadError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const notConfigured = error.message.includes("Database is not configured");
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center" role="alert">
      <div className="flex size-28 items-center justify-center rounded-2xl border-2 border-foreground/12 bg-tint-peach p-2">
        <Image src="/hero/piko-portrait.png" alt="" width={419} height={420} sizes="112px" className="size-full object-contain" />
      </div>
      <h1 className="font-heading text-2xl font-bold">
        {notConfigured ? "The database isn't connected yet" : "We couldn't load this page"}
      </h1>
      <p className="text-muted-foreground">
        {notConfigured
          ? "Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local, run the migration and seed, then restart the dev server. Steps are in docs/team-guide.md."
          : "Please check your internet connection and try again."}
      </p>
      {error.digest ? <p className="text-xs text-muted-foreground">Error code: {error.digest}</p> : null}
      <KiddyButton onClick={reset}>
        <ArrowCounterClockwise weight="bold" /> Try again
      </KiddyButton>
    </div>
  );
}
