import { CaretDown } from "@phosphor-icons/react/ssr";

// SECTION 10 — FREQUENTLY ASKED QUESTIONS
// Exclusive native <details name="pronnova-faq"> accordion aligned with SRS & FYP-1 scope.
const faqs = [
  {
    q: "What is Pronnova?",
    a: "Pronnova is an English pronunciation practice and assessment web app designed for Pakistani school learners (Class 6–10) and their teachers. Students listen to clear examples, record their voice, and receive word-level scores and feedback.",
  },
  {
    q: "Who is Pronnova designed for?",
    a: "School students learning to pronounce English words, phrases, and sentences clearly (especially Urdu and Punjabi first-language learners), along with English teachers who upload material and monitor progress.",
  },
  {
    q: "How does pronunciation assessment work?",
    a: "Rather than only transcribing speech, Pronnova compares a student's recorded attempt against the expected text to give a 0–100 score (Excellent ≥85, Good 70–84, Average <70) and highlight words needing extra practice.",
  },
  {
    q: "Does a child need a microphone?",
    a: "Yes. Any phone, tablet, or computer with a built-in or headset microphone and a modern browser (Chrome, Edge, Firefox, or Safari) works—no app installation is required.",
  },
  {
    q: "How can teachers monitor student progress?",
    a: "Teachers can view student attempts, overall class scores, and commonly missed words inside the Teacher area, as well as upload custom words or sentences and assign them with due dates.",
  },
  {
    q: "What happens when a child struggles with a word?",
    a: "Pronnova highlights the word, shows a helpful tip, lets the student listen back to their own recording or the reference audio, and allows unlimited retries without losing previous attempts.",
  },
  {
    q: "Does Pronnova support different English accents?",
    a: "Both British and American English pronunciations count as correct. Pronnova focuses on clear, understandable speech rather than forcing a single accent.",
  },
  {
    q: "How are exercises organised by difficulty?",
    a: "Every chapter is structured across three difficulty levels—Basic, Medium, and Advanced—covering single words, short phrases, and sentences up to 15 words.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-card py-16 md:py-22">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            Questions &amp; Answers
          </p>
          <h2 id="faq-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Clear answers for students, teachers, and academic evaluators.
          </p>
        </div>

        <div className="mt-10 divide-y rounded-2xl border border-border bg-background">
          {faqs.map((f) => (
            <details key={f.q} name="pronnova-faq" className="group px-5 py-1 md:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 font-heading font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                {f.q}
                <CaretDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  weight="bold"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
