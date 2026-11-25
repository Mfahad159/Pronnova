import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/layout/brand-logo";

const links = [
  { href: "/student/chapters", label: "Chapters" },
  { href: "/student", label: "For students" },
  { href: "/teacher", label: "For teachers" },
];

/**
 * Floating, centred navbar for the public landing page: only as wide as its content (w-fit),
 * with space on every side, frosted so the hero photo shows through.
 */
export function LandingNav() {
  return (
    <header className="sticky top-4 z-30 mx-4 mt-4 flex justify-center">
      <nav
        aria-label="Main"
        className="flex h-14 w-fit max-w-full items-center gap-2 rounded-full border border-white/70 bg-background/75 py-2 pr-2 pl-4 backdrop-blur-md sm:gap-4"
      >
        <BrandLogo />
        <ul className="hidden items-center gap-1 md:flex">
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
        <Button asChild size="lg" className="h-10 rounded-full px-4">
          <Link href="/onboarding">Get started</Link>
        </Button>

        {/* Phone: links move into a slide-in menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="rounded-full md:hidden" aria-label="Open menu">
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
      </nav>
    </header>
  );
}
