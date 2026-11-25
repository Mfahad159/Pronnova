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

/** Top bar for the public landing page. Sits over the hero image with a light frosted background. */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-background/70 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
        <BrandLogo />
        <ul className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="ml-auto h-10 px-4 md:ml-2">
          <Link href="/student">Start practising</Link>
        </Button>

        {/* Phone: links move into a slide-in menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
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
