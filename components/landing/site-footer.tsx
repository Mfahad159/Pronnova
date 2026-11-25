import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Experiences",
    links: [
      { href: "/student", label: "Student Experience" },
      { href: "/teacher", label: "Teacher Experience" },
      { href: "/onboarding", label: "Choose Role" },
    ],
  },
  {
    title: "Guided Tour",
    links: [
      { href: "/#demo", label: "Interactive Demo" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#assessment", label: "Pronunciation Assessment" },
    ],
  },
  {
    title: "About the Project",
    links: [
      { href: "/#learners", label: "For Young Learners" },
      { href: "/#classroom", label: "Classroom Workflow" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

/**
 * SECTION 11B — FOOTER
 * High-contrast dark footer with subtle Pronnova mascot illustration tucked cleanly
 * in the corner so link readability stays effortless.
 */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-6">
        <div>
          <Link href="/#top" className="inline-flex items-center gap-2 font-heading text-lg font-bold">
            <Image src="/icons/pronnova-mark-on-dark.svg" alt="" width={32} height={32} />
            Pronnova
          </Link>
          <p className="mt-3 max-w-xs text-sm text-background/75">
            AI-assisted English pronunciation practice and classroom assessment platform for Pakistani learners and teachers.
          </p>
        </div>

        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="font-heading text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-background/75">
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

      {/* Subtle decorative footer artwork matching header world without hurting text readability */}
      <Image
        src="/hero/pronnova-swing-crew.png"
        alt=""
        aria-hidden
        width={1200}
        height={772}
        sizes="260px"
        className="pointer-events-none absolute right-6 bottom-0 hidden w-64 opacity-15 select-none lg:block"
      />

      <div className="relative z-10 border-t border-background/12">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-background/65 md:px-6">
          Pronnova — Final Year Project (FYP-1), BS Computer Science · FAST-NUCES Chiniot · Demonstration Build
        </p>
      </div>
    </footer>
  );
}
