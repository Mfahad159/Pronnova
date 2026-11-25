import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marker, Sparkles } from "./doodles";

// "Real classrooms" collage right after the hero (layout idea: tilted rounded photo tiles around a
// central message). Photos: free Unsplash / Pexels licences, credited below and in docs/design.md.
type Tile = { src: string; alt: string; rotate: string; aspect?: string; position?: string };

const left: Tile[] = [
  { src: "/photos/boy-in-classroom-pakistan.jpg", alt: "A smiling schoolboy at his desk in a classroom in Pakistan", rotate: "-rotate-6" },
  { src: "/photos/smiling-schoolboys-kp.jpg", alt: "Two schoolboys in uniform smiling outdoors", rotate: "rotate-3", position: "object-[center_30%]" },
];
const right: Tile[] = [
  { src: "/photos/girls-studying-hijab.jpg", alt: "Girls studying at their desks in class", rotate: "rotate-6" },
  { src: "/photos/children-walking-to-school.jpg", alt: "Children in school uniform walking to school", rotate: "-rotate-3", position: "object-[center_55%]" },
];

function PhotoTile({ t, className = "" }: { t: Tile; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border-4 border-card bg-muted ${t.rotate} ${className}`}>
      <Image
        src={t.src}
        alt={t.alt}
        width={600}
        height={450}
        sizes="(min-width: 768px) 300px, 45vw"
        className={`aspect-[4/3] w-full object-cover ${t.position ?? ""}`}
      />
    </div>
  );
}

export function PhotoCollage() {
  return (
    <section aria-labelledby="classrooms-title" className="overflow-hidden py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        {/* Phone: message first, then a 2×2 photo grid. Desktop: photos on both sides of the message. */}
        <div className="grid items-center gap-6 md:grid-cols-[1fr_1.15fr_1fr] md:gap-8">
          <div className="order-2 grid grid-cols-2 gap-4 md:order-1 md:grid-cols-1 md:gap-10">
            {left.map((t) => (
              <PhotoTile key={t.src} t={t} />
            ))}
          </div>

          <div className="order-1 flex flex-col items-center gap-6 text-center md:order-2">
            <div className="relative w-full">
              <Sparkles className="absolute -top-6 -right-2 z-10" />
              <PhotoTile
                t={{ src: "/photos/class-listening-to-teacher.jpg", alt: "A class listening to their teacher at the board", rotate: "-rotate-2" }}
              />
            </div>
            <h2 id="classrooms-title" className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Made for <span className="whitespace-nowrap"><Marker>real classrooms</Marker>,</span> practised anywhere
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              For Class 6–10 students and their English teachers in Pakistan. Practise in class, at home, or on the way.
            </p>
          </div>

          <div className="order-3 grid grid-cols-2 gap-4 md:grid-cols-1 md:gap-10">
            {right.map((t) => (
              <PhotoTile key={t.src} t={t} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border bg-card p-6 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
          <p className="font-heading text-lg font-semibold">Try it with your class today — no sign-up needed in the demo.</p>
          <Button asChild size="lg" className="group h-11 shrink-0 rounded-full px-5">
            <Link href="/onboarding">
              Get started <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Photos: Assad Tanoli (Unsplash), Zeeshan Khan, clickbyabbas, Akela Photography and other Pexels contributors.
        </p>
      </div>
    </section>
  );
}
