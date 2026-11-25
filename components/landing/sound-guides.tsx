import Image from "next/image";
import Link from "next/link";
import { PillLink } from "./pill-link";

// "Articles, tips and tools" (reference layout): centred title, one big featured card
// (image left, meta + title + text + pill), then a row of small cards. Each guide opens the
// chapter where you can practise that sound.
const TRICKY = "/student/chapters/10000000-0000-4000-8000-000000000002";

const featured = {
  tag: "Tricky sounds",
  chapter: "Chapter 2",
  title: "How To Say “TH” — The Sound in Three, Thin and Weather",
  body: "Many of us say “tree” for “three”. Put your tongue lightly between your teeth and let the air out. Practise it with the TH sounds lesson.",
  image: "/objects/img3.jpg",
  alt: "A student pointing at letters on a board",
};

const small = [
  { tag: "Tricky sounds", chapter: "Chapter 2", title: "V or W? Very, Van, Wet and West", image: "/objects/img1.jpg", href: TRICKY },
  { tag: "Tricky sounds", chapter: "Chapter 2", title: "P or F? Fresh Fruit and Four Friends", image: "/objects/img2.jpg", href: TRICKY },
  { tag: "Getting started", chapter: "Chapter 1", title: "How To Get a Great Recording", image: "/objects/img4.jpg", href: "/student/chapters" },
];

function Meta({ tag, chapter }: { tag: string; chapter: string }) {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      {tag} <span aria-hidden className="h-px w-8 bg-foreground/30" /> {chapter}
    </p>
  );
}

export function SoundGuides() {
  return (
    <section id="guides" aria-labelledby="guides-title" className="scroll-mt-24 py-12 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <h2 id="guides-title" className="text-center font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Sound Guides, Tips and Tools
        </h2>

        <article className="mt-10 grid items-center gap-6 rounded-[2rem] border bg-card p-4 md:grid-cols-2 md:p-5">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem]">
            <Image src={featured.image} alt={featured.alt} fill sizes="(min-width: 768px) 540px, 100vw" className="object-cover" />
          </div>
          <div className="p-2 md:p-4">
            <Meta tag={featured.tag} chapter={featured.chapter} />
            <h3 className="mt-3 font-heading text-2xl font-semibold text-balance">{featured.title}</h3>
            <p className="mt-3 text-sm text-muted-foreground">{featured.body}</p>
            <PillLink href={TRICKY} size="sm" className="mt-6">
              Practise Now
            </PillLink>
          </div>
        </article>

        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {small.map((g) => (
            <li key={g.title}>
              <Link
                href={g.href}
                className="flex h-full flex-col gap-4 rounded-[1.5rem] border bg-card p-4 outline-none transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="relative size-14 overflow-hidden rounded-xl">
                  <Image src={g.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <Meta tag={g.tag} chapter={g.chapter} />
                <span className="font-heading font-semibold text-balance">{g.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
