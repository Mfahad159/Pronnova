"use client";

import { cn } from "cn";
import {
  ArrowLeftRight,
  BookOpenCheck,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./BrandLogo";

const TEACHER_NAV_ITEMS = [
  { href: "/teacher", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/teacher/chapters",
    label: "Chapters & Exercises",
    icon: BookOpenCheck,
    exact: false,
  },
  {
    href: "/teacher/students",
    label: "Student Progress",
    icon: Users,
    exact: false,
  },
] as const;

function isNavItemActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-input bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo href="/teacher" size="sm" />
            <Badge variant="green" className="hidden sm:inline-flex">
              Teacher Portal
            </Badge>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 rounded-full border border-success/25 bg-surface-mint/60 py-1 pl-1.5 pr-3 sm:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-success text-[11px] font-bold text-white">
                  MS
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold text-foreground">Ms. Sara</span>
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

      <nav
        aria-label="Teacher mobile navigation"
        className="border-b border-input bg-card px-4 py-2.5 lg:hidden"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          {TEACHER_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isNavItemActive(pathname, href, exact);
            return (
              <Button
                key={href}
                asChild
                variant={active ? "secondary" : "ghost"}
                size="xs"
                className={cn(active && "bg-surface-tint-coral text-primary")}
              >
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon data-icon="inline-start" aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav
            aria-label="Teacher sidebar navigation"
            className="sticky top-24 overflow-hidden rounded-[24px] border border-border bg-card p-2.5 shadow-card"
          >
            <ul className="flex flex-col gap-1">
              {TEACHER_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const active = isNavItemActive(pathname, href, exact);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
