"use client";

import { useState } from "react";
import { Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./BrandLogo";
import { Container } from "./Container";

export type SiteNavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
};

function isActive(pathname: string, href: string, exact = false) {
  if (href.startsWith("#")) return false;
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  homeHref,
  nav,
  containerClassName,
  showMobileMenu = true,
  children,
}: {
  homeHref: string;
  nav: readonly SiteNavItem[];
  containerClassName?: string;
  showMobileMenu?: boolean;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-input bg-card/90 backdrop-blur-md">
      <Container className={cn("flex h-16 items-center justify-between", containerClassName)}>
        <div className="flex items-center gap-3">
          <BrandLogo href={homeHref} size="sm" />
        </div>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1.5 md:flex">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Button
                key={label}
                asChild
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className={cn(active && "text-primary")}
              >
                <Link href={href} aria-current={active ? "page" : undefined}>
                  {Icon && <Icon data-icon="inline-start" aria-hidden="true" />}
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {children}

          {showMobileMenu && nav.length > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </Container>

      {/* Mobile Drawer/Dropdown Menu */}
      {showMobileMenu && mobileMenuOpen && (
        <div className="border-t border-input bg-card px-4 py-3 md:hidden animate-fade-up">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Button
                  key={label}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("justify-start", active && "text-primary")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={href} aria-current={active ? "page" : undefined}>
                    {Icon && <Icon data-icon="inline-start" aria-hidden="true" />}
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
