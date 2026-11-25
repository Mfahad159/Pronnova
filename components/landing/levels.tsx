import { Marker } from "./doodles";
import { Section } from "./section";

// Three level cards (layout idea: the reference's offer/plan cards — here they explain levels, not prices).
const levels = [
  { name: "Basic", what: "Single words", example: "window · kitchen · van", tint: "bg-tint-mint" },
  { name: "Medium", what: "Short phrases", example: "a sharp pencil · thank you very much", tint: "bg-tint-sky" },
  { name: "Advanced", what: "Full sentences", example: "Three thin thieves thought about the weather.", tint: "bg-tint-peach" },
];

export function Levels() {
  return (
    <Section
      id="levels"
      eyebrow="Learn in steps"
      title={<>Chapters that <Marker>grow</Marker> with you</>}
      intro="Each chapter has three levels, made for Class 6 to 10 and the English curriculum. Score 70% or more on every exercise to open the next level."
      className="bg-card"
    >
      <ol className="grid gap-4 md:grid-cols-3">
        {levels.map((l, i) => (
          <li key={l.name} className={`flex flex-col rounded-3xl border p-6 ${l.tint}`}>
            <span className="text-sm font-medium text-muted-foreground">Level {i + 1}</span>
            <h3 className="mt-1 font-heading text-2xl font-bold">{l.name}</h3>
            <p className="mt-1 font-medium">{l.what}</p>
            <p className="mt-6 rounded-2xl border bg-card px-4 py-3 text-muted-foreground">“{l.example}”</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
