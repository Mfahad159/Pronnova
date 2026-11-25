import { Ear, HeartHandshake, Sparkles } from "lucide-react";
import { PillLink } from "./pill-link";

// Three separate value cards (reference layout): icon in a soft circle, title, line, dark pill.
const values = [
  {
    icon: Sparkles,
    title: "Clear & Friendly",
    body: "Feedback anyone can read — green words are right, red words need another try.",
    href: "/#feedback",
  },
  {
    icon: HeartHandshake,
    title: "Patient & Private",
    body: "Practise alone at your own pace. Only you and your teacher hear your recordings.",
    href: "/#journey",
  },
  {
    icon: Ear,
    title: "Exact & Helpful",
    body: "Scores for every word and the sounds behind them, with a tip to fix each one.",
    href: "/#guides",
  },
];

export function ValueCards() {
  return (
    <section aria-label="Why Pronnova" className="py-10 md:py-14">
      <ul className="mx-auto grid w-full max-w-6xl gap-4 px-4 md:grid-cols-3 md:gap-6 md:px-6">
        {values.map(({ icon: Icon, title, body, href }) => (
          <li
            key={title}
            className="flex flex-col items-center rounded-[1.75rem] border bg-card px-6 py-8 text-center md:rounded-[2rem]"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="size-6" aria-hidden />
            </span>
            <h2 className="mt-5 font-heading text-xl font-semibold">{title}</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{body}</p>
            <PillLink href={href} className="mt-6">
              Learn More
            </PillLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
