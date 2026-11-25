import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#levels", label: "Levels" },
      { href: "/student/chapters", label: "Chapters" },
    ],
  },
  {
    title: "Use Pronnova",
    links: [
      { href: "/onboarding", label: "Get started" },
      { href: "/student", label: "Student area" },
      { href: "/teacher", label: "Teacher area" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/#faq", label: "Questions" },
      { href: "/#for-teachers", label: "For teachers" },
    ],
  },
];

/** Dark footer (layout idea from the reference), using our ink colour and brand mark. */
export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-lg font-bold">
            <Image src="/icons/pronnova-mark-on-dark.svg" alt="" width={32} height={32} />
            Pronnova
          </Link>
          <p className="mt-3 max-w-xs text-sm text-background/70">
            English pronunciation practice with word-by-word feedback, for students and their teachers.
          </p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-background/70">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="rounded outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-ring">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-background/10">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-background/60 md:px-6">
          Pronnova — Final Year Project, Department of Computer Science, FAST-NUCES Chiniot · Demo version
        </p>
      </div>
    </footer>
  );
}
