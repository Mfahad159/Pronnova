import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";

// In-page sections on the landing page (prefixed with "/" so they also work from /onboarding).
const links = [
  { href: "/#practise", label: "Practise" },
  { href: "/#journey", label: "How it works" },
  { href: "/#feedback", label: "Feedback" },
  { href: "/#guides", label: "Sound guides" },
  { href: "/#faq", label: "FAQ" },
];

/**
 * Landing navbar (reference layout): logo left, links centred, outlined pill button right.
 * Sticky with a light frosted background so it stays reachable while scrolling.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto grid h-[4.5rem] w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
        <div>
          <BrandLogo />
        </div>
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="col-start-3 flex items-center justify-end gap-2">
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
