"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";
import { KiddyButton } from "@/components/brand/kiddy-button";

const links = [
  { href: "/#top", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#journey", label: "Student Experience" },
  { href: "/#assessment", label: "Pronunciation" },
  { href: "/#teachers", label: "For Teachers" },
  { href: "/#faq", label: "About" },
];

/**
 * Sticky floating white rounded landing navbar with Pronnova logo, section links,
 * and a primary "Try the Demo" KiddyButton.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 bg-transparent px-3 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-card/95 pr-3 pl-4 backdrop-blur-md sm:h-[4.25rem] sm:pr-4 sm:pl-6"
      >
        <BrandLogo />

        <div className="flex items-center gap-2 lg:gap-4">
          <ul className="hidden items-center gap-0.5 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-xl px-2.5 py-2 text-sm font-medium whitespace-nowrap text-foreground/80 outline-none transition-colors hover:bg-secondary/70 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <KiddyButton href="/#demo" size="sm" className="shrink-0 whitespace-nowrap">
            Try the Demo
          </KiddyButton>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="rounded-xl lg:hidden" aria-label="Open menu">
                <List className="size-5" weight="bold" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <ul className="grid gap-1 px-4">
                {links.map((l) => (
                  <li key={l.href}>
                    <SheetClose asChild>
                      <Link href={l.href} className="block rounded-lg px-3 py-3 font-medium outline-none hover:bg-muted focus-visible:bg-muted">
                        {l.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
