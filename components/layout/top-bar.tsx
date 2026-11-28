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
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
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
