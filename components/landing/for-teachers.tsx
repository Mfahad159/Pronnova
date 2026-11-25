import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardList, LineChart, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

// Teacher section (layout idea: the reference's teacher showcase — here it shows what teachers can do).
const points = [
  { icon: Upload, title: "Upload your own material", body: "Type words or sentences from your syllabus, one per line." },
  { icon: CalendarClock, title: "Assign with a due date", body: "Send it to your class; students see it as homework." },
  { icon: ClipboardList, title: "See every attempt", body: "Scores and wrong words for each student, without listening to every recording." },
  { icon: LineChart, title: "Spot class-wide mistakes", body: "Find the words and sounds most of the class gets wrong." },
];

export function ForTeachers() {
  return (
    <Section id="for-teachers" eyebrow="For teachers" title="Every student heard, without the extra hours">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Image
          src="/avatar/avatar_sitting_and_speaking.jpg"
          alt="A teacher sitting with a book, explaining a word"
          width={1200}
          height={896}
          sizes="(min-width: 768px) 540px, 100vw"
          className="aspect-[4/3] w-full rounded-3xl border object-cover"
        />
        <div>
          <ul className="grid gap-5 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" variant="outline" className="group mt-8 h-11 rounded-full px-5">
            <Link href="/onboarding">
              Start as a teacher <ArrowRight className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
