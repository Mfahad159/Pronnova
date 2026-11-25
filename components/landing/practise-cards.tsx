import Image from "next/image";
import Link from "next/link";

// "Our services" (reference layout): heading left, short paragraph right, then three tall photo
// cards with the title written on the photo. Here: the three things students read aloud.
const kinds = [
  { title: "Words", note: "Basic · window, kitchen, van", src: "/photos/boy-in-classroom-pakistan.jpg", alt: "A boy laughing at his desk in class" },
  { title: "Phrases", note: "Medium · a sharp pencil", src: "/photos/girls-reading-together.jpg", alt: "Three girls reading one book together" },
  { title: "Sentences", note: "Advanced · up to 15 words", src: "/photos/student-reading-library.jpg", alt: "A student reading in a library corner" },
];

export function PractiseCards() {
  return (
    <section id="practise" aria-labelledby="practise-title" className="scroll-mt-24 py-10 md:py-14">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="practise-title" className="font-heading text-3xl font-semibold tracking-tight md:text-5xl">
            What You Can Practise
          </h2>
          <p className="max-w-md text-muted-foreground">
            Every chapter follows the English curriculum and grows in three levels — from single words to full
            sentences.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {kinds.map((k) => (
            <li key={k.title}>
              <Link
                href="/onboarding"
                className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Image
                  src={k.src}
                  alt={k.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="font-heading text-2xl font-semibold">{k.title}</h3>
                  <p className="mt-1 text-sm text-white/85">{k.note}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
