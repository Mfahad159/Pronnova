import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * App top bar in the landing navbar's style (ADR-007): floating white rounded bar with a soft
 * border, bold title and one main action (usually a KiddyButton).
 */
export function TopBar({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  /** Detail pages: where "Back" goes (and its label for screen readers), so no page is a dead end. */
  back?: { href: string; label: string };
}) {
  return (
    <header className="app-top-bar sticky top-0 z-10 bg-background/80 px-3 pt-3 pb-1 backdrop-blur-md sm:px-5">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-card/95 px-3 py-2.5 sm:px-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="rounded-xl" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Show or hide the menu</TooltipContent>
        </Tooltip>
        {back ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={back.href}
                transitionTypes={["nav-back"]}
                aria-label={back.label}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-foreground/12 bg-card text-foreground outline-none transition-colors hover:border-primary/40 hover:bg-secondary/60 focus-visible:ring-3 focus-visible:ring-ring"
              >
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">{back.label}</TooltipContent>
          </Tooltip>
        ) : null}
        <div className="min-w-[10rem] flex-1 basis-40">
          <h1 className="truncate font-heading text-lg font-bold tracking-tight md:text-xl">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {/* No search box: there was one here that did nothing (Phase 5 QA, check 2 "no dead controls"). */}
        {action}
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-6 md:py-8">{children}</div>;
}
