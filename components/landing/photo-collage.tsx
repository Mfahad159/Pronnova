import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";
import { PillLink } from "./pill-link";
import { cn } from "@/lib/utils";
import { SoundBars } from "./section";

// Photo collage after the hero (layout idea: tilted, very rounded photo tiles in columns that run
// off both edges, a headline in the middle, and a small card on the right).
// Photos: free Pexels / Unsplash licences, credited at the bottom of the section and in docs/design.md.
// They show real children — keep them as atmosphere only; never imply these children use Pronnova.

interface Tile {
  src: string;
  alt: string;
  shape: "wide" | "tall";
}

const P = "/photos/";
const columns: { tilt: string; offset: string; tiles: Tile[] }[] = [
  {
    tilt: "-rotate-[9deg]",
    offset: "mt-10",
    tiles: [
      { src: P + "smiling-schoolboys-kp.jpg", alt: "Two schoolboys smiling on a mountain path", shape: "tall" },
      { src: P + "boy-in-classroom-pakistan.jpg", alt: "A boy laughing at his desk in class", shape: "wide" },
    ],
  },
  {
    tilt: "-rotate-[6deg]",
    offset: "mt-32",
    tiles: [
      { src: P + "class-listening-to-teacher.jpg", alt: "A class listening to their teacher at the board", shape: "wide" },
      { src: P + "girls-studying-hijab.jpg", alt: "Girls in school scarves reading at their desks", shape: "wide" },
    ],
  },
  {
    tilt: "rotate-0",
    offset: "mt-0",
    tiles: [{ src: P + "girls-reading-together.jpg", alt: "Three girls reading one book together", shape: "wide" }],
  },
  {
    tilt: "rotate-[6deg]",
    offset: "mt-24",
    tiles: [{ src: P + "student-reading-library.jpg", alt: "A student reading in a library corner", shape: "tall" }],
  },
  {
    tilt: "rotate-[9deg]",
    offset: "mt-6",
    tiles: [
      { src: P + "schoolboy-uniform-pakistan.jpg", alt: "A young boy in school uniform outside his school", shape: "tall" },
      { src: P + "children-walking-to-school.jpg", alt: "Children walking to school together", shape: "tall" },
    ],
  },
];

const credits = [
  { who: "Zeeshan Khan", where: "Pexels", href: "https://www.pexels.com/photo/18627614/" },
  { who: "Assad Tanoli", where: "Unsplash", href: "https://unsplash.com/photos/DreH1YbP1js" },
  { who: "Pexels contributor", where: "Pexels", href: "https://www.pexels.com/photo/12714642/" },
  { who: "Akela Photography", where: "Pexels", href: "https://www.pexels.com/photo/448877/" },
  { who: "Fatima Yusuf", where: "Pexels", href: "https://www.pexels.com/photo/14071968/" },
  { who: "Elements Interactive", where: "Pexels", href: "https://www.pexels.com/photo/33992741/" },
  { who: "clickbyabbas", where: "Pexels", href: "https://www.pexels.com/photo/31692715/" },
  { who: "Assad Tanoli", where: "Unsplash", href: "https://unsplash.com/photos/mgP2OdoTHso" },
];

function PhotoTile({ tile, sizes, priority = false }: { tile: Tile; sizes: string; priority?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2.5rem] border-4 border-background bg-muted", tile.shape === "wide" ? "aspect-[4/3]" : "aspect-[3/4]")}>
      <Image src={tile.src} alt={tile.alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}

function NoAppCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[2rem] border bg-card p-6 text-center", className)}>
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MonitorSmartphone className="size-6" aria-hidden />
      </span>
      <p className="mt-3 font-heading text-lg font-bold leading-snug">No app to install</p>
      <p className="mt-1 text-sm text-muted-foreground">Works in the browser on phones, tablets and computers.</p>
    </div>
  );
}

export function PhotoCollage() {
  return (
    <section aria-labelledby="collage-title" className="relative overflow-hidden py-16 md:py-20">
      {/* Top line (where the reference shows ratings — we only state what's true). */}
      <div className="mx-auto mb-10 flex max-w-md flex-col items-center gap-2 px-4 text-center">
        <span className="flex items-center gap-1 text-primary" aria-hidden>
          <SoundBars className="h-5 w-7" />
          <SoundBars className="h-5 w-7" />
          <SoundBars className="h-5 w-7" />
        </span>
        <p className="font-medium text-muted-foreground">Made for Class 6–10 in Pakistan</p>
      </div>

      {/* Desktop: five tilted columns, the outer ones running off the edges. */}
      <div className="hidden lg:block">
        <div className="relative left-1/2 grid w-[118vw] -translate-x-1/2 grid-cols-[0.8fr_1fr_1.05fr_0.85fr_0.75fr] items-start gap-8">
          {columns.map((col, ci) => (
            <div key={ci} className={cn("flex flex-col gap-8", col.offset)}>
              {col.tiles.map((t) => (
                <div key={t.src} className={col.tilt}>
                  <PhotoTile tile={t} sizes="(min-width: 1024px) 26vw, 50vw" />
                </div>
              ))}
              {ci === 2 ? <CenterText /> : null}
              {/* Card sits in the inner right column so it's never cut off by the screen edge. */}
              {ci === 3 ? <NoAppCard className="rotate-[3deg]" /> : null}
            </div>
          ))}
        </div>
      </div>

      {/* Phones and tablets: headline first, then a gently tilted two-column grid. */}
      <div className="px-4 lg:hidden">
        <CenterText />
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-4 sm:gap-6">
          {columns
            .flatMap((c) => c.tiles)
            .slice(0, 6)
            .map((t, i) => (
              <div key={t.src} className={cn(i % 2 === 0 ? "-rotate-[4deg]" : "mt-8 rotate-[4deg]")}>
                <PhotoTile tile={{ ...t, shape: "tall" }} sizes="50vw" />
              </div>
            ))}
        </div>
        <NoAppCard className="mx-auto mt-10 max-w-xs" />
      </div>

      <p className="mx-auto mt-12 max-w-4xl px-4 text-center text-xs text-muted-foreground">
        Photos:{" "}
        {credits.map((c, i) => (
          <span key={c.href}>
            <a href={c.href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {c.who}
            </a>{" "}
            ({c.where}){i < credits.length - 1 ? " · " : ""}
          </span>
        ))}
        . Free licences; these photos are for illustration only.
      </p>
    </section>
  );
}

function CenterText() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h2 id="collage-title" className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
        Every student speaking. Every teacher listening.
      </h2>
      <p className="mt-3 text-muted-foreground">
        Practice that fits a real school day — in class, at home, or on the way.
      </p>
      <PillLink href="/onboarding" className="mx-auto mt-6">
        Get started
      </PillLink>
    </div>
  );
}
