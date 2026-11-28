"use client";

import { MousePointer2 } from "lucide-react";
import { Cursor, CursorProvider } from "@animate-ui/react/primitives/cursor";

/**
 * App-wide Animate UI cursor: the pointer is a coral arrow everywhere (no label). Mounted once in
 * the root layout. Mouse and pen only: touch is ignored by the primitive, so phones and tablets
 * keep normal touch. Decorative (aria-hidden); the native cursor is hidden only while it shows.
 */
export function AppCursor() {
  return (
    <CursorProvider global>
      <Cursor aria-hidden>
        <MousePointer2 className="size-5 -translate-x-0.5 -translate-y-0.5 fill-primary text-primary" />
      </Cursor>
    </CursorProvider>
  );
}
