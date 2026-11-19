import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  accentTitle?: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}

export function PageHeader({
  title,
  accentTitle,
  description,
  action,
  align = "left",
}: PageHeaderProps) {
  if (align === "center") {
    return (
      <header className="mx-auto flex max-w-xl flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
          {title}{" "}
          {accentTitle ? (
            <span className="text-accent-pink">{accentTitle}</span>
          ) : null}
        </h1>
        {description ? (
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl font-heading">
          {title}{" "}
          {accentTitle ? (
            <span className="text-accent-pink">{accentTitle}</span>
          ) : null}
        </h1>
        {description ? (
          <p className="max-w-xl font-body text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
