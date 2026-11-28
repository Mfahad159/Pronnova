"use client";

import { LoadError } from "@/components/layout/load-error";

// Next 16.2+: `retry()` re-fetches and re-renders (recovers from a DB blip); `reset()` only re-renders.
export default function AreaError(props: { error: unknown; retry?: () => void; reset?: () => void }) {
  return <LoadError error={props.error} onRetry={props.retry ?? props.reset ?? (() => window.location.reload())} />;
}
