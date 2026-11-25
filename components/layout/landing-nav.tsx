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
 * After scrolling: a floating rounded pill, only as wide as its content (w-fit), with space on every side.
 */
export function LandingNav() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-[padding,background-color] duration-300 motion-reduce:transition-none",
        scrolled ? "px-4 pt-3" : "bg-background/85 backdrop-blur-md",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex items-center transition-[height,padding,background-color,border-color] duration-300 motion-reduce:transition-none",
          scrolled
            ? "h-14 w-fit max-w-full gap-2 rounded-full border border-foreground/10 bg-background/85 py-2 pr-2 pl-4 backdrop-blur-md sm:gap-4"
            : "h-[4.5rem] w-full max-w-6xl justify-between gap-4 border border-transparent px-4 md:px-6",
        )}
      >
        <BrandLogo />
        <ul className={cn("hidden items-center gap-1 lg:flex", !scrolled && "flex-1 justify-center")}>
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
