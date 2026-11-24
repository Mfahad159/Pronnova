"use client";

import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shared body for app/student/error.tsx and app/teacher/error.tsx. */
export function LoadError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const notConfigured = error.message.includes("Database is not configured");
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center" role="alert">
      <Image src="/avatar/avatar_speaking.png" alt="" width={110} height={120} className="rounded-2xl" />
      <h1 className="font-heading text-xl font-semibold">
        {notConfigured ? "The database isn't connected yet" : "We couldn't load this page"}
      </h1>
      <p className="text-muted-foreground">
        {notConfigured
          ? "Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local, run the migration and seed, then restart the dev server. Steps are in docs/team-guide.md."
          : "Please check your internet connection and try again."}
      </p>
      {error.digest ? <p className="text-xs text-muted-foreground">Error code: {error.digest}</p> : null}
      <Button onClick={reset} size="lg">
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
