import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * App top bar in the landing navbar's style (ADR-007): floating white rounded bar with a soft
 * border, bold title, optional search, and one main action (usually a KiddyButton).
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
    <header className="sticky top-0 z-10 bg-background/80 px-3 pt-3 pb-1 backdrop-blur-md sm:px-5">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center gap-3 rounded-2xl border border-foreground/10 bg-card/95 px-3 py-2.5 sm:px-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="rounded-xl" />
          </TooltipTrigger>
          <TooltipContent side="bottom">Show or hide the menu</TooltipContent>
        </Tooltip>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-lg font-bold tracking-tight md:text-xl">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="relative hidden w-60 lg:block">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search lessons…" aria-label="Search lessons" className="h-10 rounded-xl pl-9" />
        </div>
        {action}
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-6 md:py-8">{children}</div>;
}
