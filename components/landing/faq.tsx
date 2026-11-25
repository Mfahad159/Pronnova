import { ChevronDown } from "lucide-react";
import { Marker } from "./doodles";
import { Section } from "./section";

// FAQ as native <details> (keyboard + screen-reader friendly, no JavaScript). Answers follow the SRS.
const faqs = [
  {
    q: "Who is Pronnova for?",
    a: "Students in Class 6 to 10 in Pakistan who can read English but want to pronounce it better, and their English teachers.",
  },
  {
    q: "Is this a test or an exam?",
    a: "No. It's a practice tool. Scores help you see your progress; they are not used for exams or certificates.",
  },
  {
    q: "Do I have to sound British or American?",
    a: "Either is fine. Both British and American pronunciation count as correct. Pronnova doesn't judge your accent — only whether each word and sound is clear.",
  },
  {
    q: "What do I need?",
    a: "A phone, tablet or computer with a microphone, a recent browser (Chrome, Edge, Firefox or Safari) and an internet connection.",
  },
  {
    q: "Who can hear my recordings?",
    a: "Only you and your teacher. Recordings are stored privately and are never public.",
  },
  {
    q: "How is my score worked out?",
    a: "Each word gets a score out of 100. Your overall score is shown with a rating: Excellent (85 and above), Good (70–84) or Average (below 70).",
  },
];

export function Faq() {
  return (
    <Section id="faq" eyebrow="Questions" title={<>Good to <Marker>know</Marker></>} className="bg-card">
      <div className="mx-auto max-w-3xl divide-y rounded-3xl border bg-background">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-1 md:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="pb-5 text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
