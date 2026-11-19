"use client";

import { ArrowLeftRight, BarChart3, BookOpen, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { SiteHeader, type SiteNavItem } from "./SiteHeader";

const STUDENT_NAV_ITEMS: readonly SiteNavItem[] = [
  { href: "/student", label: "Home", icon: Home, exact: true },
  { href: "/student/chapters", label: "Chapters", icon: BookOpen, exact: false },
  { href: "/student/progress", label: "Progress", icon: BarChart3, exact: false },
];

function isNavItemActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader homeHref="/student" nav={STUDENT_NAV_ITEMS} showMobileMenu={false}>
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
      </SiteHeader>

      <main className="flex-1 flex flex-col">
        <Container className="flex-1 pb-24 pt-6 md:pb-12 md:pt-8">
          {children}
        </Container>
      </main>

      <nav
        aria-label="Student mobile navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-input bg-card/95 px-3 py-2 shadow-nav backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isNavItemActive(pathname, href, Boolean(exact));
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
                  {Icon && (
                    <Icon
                      className="size-5"
                      strokeWidth={active ? 2.4 : 2}
                      aria-hidden="true"
                    />
                  )}
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
