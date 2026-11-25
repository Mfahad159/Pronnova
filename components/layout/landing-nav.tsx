"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

// In-page sections on the landing page (prefixed with "/" so they also work from /onboarding).
const links = [
  { href: "/#practise", label: "Practise" },
  { href: "/#journey", label: "How it works" },
  { href: "/#feedback", label: "Feedback" },
  { href: "/#guides", label: "Sound guides" },
  { href: "/#faq", label: "FAQ" },
];

// Scroll position as an external store (no setState-in-effect; server render = "at the top").
function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const isScrolled = () => window.scrollY > 24;

/**
 * Landing navbar.
 * At the top of the page: full-width bar — logo left, links centred, outlined pill right.
 * After scrolling: a floating rounded pill about as wide as its content, with space on every side.
 * The change is a smooth max-width + colour transition (no jump in height, so no flicker).
 */
export function LandingNav() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);

  return (
    // Same header height in both states (no layout shift → no flicker). Only colours, max-width and
    // padding animate, which the browser can transition smoothly.
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[4.5rem] flex-col px-3 transition-colors duration-500 ease-out motion-reduce:transition-none",
        scrolled ? "bg-transparent" : "bg-background/85 backdrop-blur-md",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex w-full items-center justify-between gap-2 rounded-full border transition-[max-width,height,margin,padding,background-color,border-color] duration-500 ease-out motion-reduce:transition-none sm:gap-4",
          scrolled
            ? // pill: shrinks to roughly its content width (links only show from lg up)
              "mt-2 h-14 max-w-[21rem] border-foreground/10 bg-background/85 pr-2 pl-4 backdrop-blur-md lg:max-w-[48rem]"
            : "mt-0 h-[4.5rem] max-w-6xl border-transparent bg-transparent px-1 md:px-3",
        )}
      >
        <BrandLogo />
        <ul className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center rounded-full border border-foreground px-4 text-sm font-medium outline-none transition-colors hover:bg-foreground hover:text-background focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Get started
          </Link>

          {/* Phone and tablet: links move into a slide-in menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="rounded-full lg:hidden" aria-label="Open menu">
                <Menu />
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
