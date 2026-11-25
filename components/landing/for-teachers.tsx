import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CalendarDoodle, EarDoodle, IconBlob, TargetDoodle, UploadDoodle } from "@/components/icons/doodle";
import { Marker } from "./doodles";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

// Teacher section (layout idea: the reference's teacher showcase — here it shows what teachers can do).
const points = [
  { icon: UploadDoodle, title: "Upload your own material", body: "Type words or sentences from your syllabus, one per line." },
  { icon: CalendarDoodle, title: "Assign with a due date", body: "Send it to your class; students see it as homework." },
  { icon: EarDoodle, title: "See every attempt", body: "Scores and wrong words for each student, without listening to every recording." },
  { icon: TargetDoodle, title: "Spot class-wide mistakes", body: "Find the words and sounds most of the class gets wrong." },
];

export function ForTeachers() {
  return (
    <Section id="for-teachers" eyebrow="For teachers" title={<>Every student <Marker>heard</Marker>, without the extra hours</>}>
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
                <IconBlob>
                  <Icon className="size-7" />
                </IconBlob>
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
