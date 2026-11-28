"use client";

import "./globals.css";

// Last-resort error screen (errors in the root layout). Must render its own <html>/<body>.
// Plain markup in the brand colours: the rest of the app (fonts, providers) may be what failed.
export default function GlobalError({ retry, reset }: { error: unknown; retry?: () => void; reset?: () => void }) {
  const again = retry ?? reset ?? (() => window.location.reload());
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
        <main role="alert" className="flex max-w-md flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">Please check your internet connection and try again.</p>
          <button
            type="button"
            onClick={again}
            className="h-12 rounded-[0.875rem] bg-brand-coral px-7 font-semibold text-white shadow-[0_5px_0_0_var(--primary)]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
