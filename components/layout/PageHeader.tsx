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
      <header className="mx-auto flex max-w-2xl flex-col items-center gap-2.5 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}{" "}
          {accentTitle ? (
            <span className="text-accent-pink">{accentTitle}</span>
          ) : null}
        </h1>
        {description ? (
          <p className="font-body text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}{" "}
          {accentTitle ? (
            <span className="text-accent-pink">{accentTitle}</span>
          ) : null}
        </h1>
        {description ? (
          <p className="max-w-2xl font-body text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
