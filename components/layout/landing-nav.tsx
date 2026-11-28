"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";
import { KiddyButton } from "@/components/brand/kiddy-button";
import {
  Highlight,
  HighlightItem,
} from "@animate-ui/react/primitives/effects/highlight";

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
 * and a primary "Get started" KiddyButton (to role selection; hidden on that page).
 */
export function LandingNav({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-30 bg-transparent px-3 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-card/95 pr-3 pl-4 backdrop-blur-md sm:h-[4.25rem] sm:pr-4 sm:pl-6"
      >
        <BrandLogo />

        <div className="flex items-center gap-2 lg:gap-4">
          {/* Animate UI Highlight: one soft pill glides between links on hover (ADR-007 colours). */}
          <Highlight
            controlledItems
            hover
            click={false}
            exitDelay={120}
            className="inset-0 rounded-xl bg-secondary"
          >
            <ul className="hidden items-center gap-0.5 lg:flex">
              {links.map((l) => (
                <HighlightItem
                  key={l.href}
                  as="li"
                  value={l.href}
                  className="group/nav rounded-xl"
                >
                  <Link
                    href={l.href}
                    className="block rounded-xl px-2.5 py-2 text-sm font-medium whitespace-nowrap text-foreground/80 outline-none transition-colors group-data-[active=true]/nav:text-primary focus-visible:ring-3 focus-visible:ring-ring"
                  >
                    {l.label}
                  </Link>
                </HighlightItem>
              ))}
            </ul>
          </Highlight>

          {showCta ? (
            <KiddyButton
              href="/onboarding"
              size="sm"
              className="shrink-0 whitespace-nowrap"
            >
              Get started
            </KiddyButton>
          ) : null}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="rounded-xl lg:hidden"
                aria-label="Open menu"
              >
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
                      <Link
                        href={l.href}
                        className="block rounded-lg px-3 py-3 font-medium outline-none hover:bg-muted focus-visible:bg-muted"
                      >
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
