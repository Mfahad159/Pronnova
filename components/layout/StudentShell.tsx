"use client";

import { cn } from "cn";
import { ArrowLeftRight, BarChart3, BookOpen, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./BrandLogo";

const STUDENT_NAV_ITEMS = [
  { href: "/student", label: "Home", icon: Home, exact: true },
  { href: "/student/chapters", label: "Chapters", icon: BookOpen, exact: false },
  { href: "/student/progress", label: "Progress", icon: BarChart3, exact: false },
] as const;

function isNavItemActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-input bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo href="/student" size="sm" />

          <nav
            aria-label="Student primary navigation"
            className="hidden items-center gap-1.5 md:flex"
          >
            {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isNavItemActive(pathname, href, exact);
              return (
                <Button
                  key={href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(active && "text-brand-orange")}
                >
                  <Link href={href} aria-current={active ? "page" : undefined}>
                    <Icon data-icon="inline-start" aria-hidden="true" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 py-1 pl-1.5 pr-3 sm:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-brand-orange-soft text-[11px] font-bold text-white">
                  AK
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground">Amina</span>
            </div>

            <Button asChild variant="outline" size="xs">
              <Link href="/">
                <ArrowLeftRight data-icon="inline-start" aria-hidden="true" />
                Switch Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-12 md:pt-8 lg:px-8">
        {children}
      </main>

      <nav
        aria-label="Student mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-input bg-card/95 px-3 py-2 shadow-nav backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isNavItemActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-[16px] py-1.5 text-[11px] font-semibold transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon
                    className="size-5"
                    strokeWidth={active ? 2.4 : 2}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
