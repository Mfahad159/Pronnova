"use client";

import { LoadError } from "@/components/layout/load-error";

export default function AreaError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <LoadError {...props} />;
}
