"use client";

import { useState } from "react";
import Link from "next/link";
import { SpeakerHigh } from "@phosphor-icons/react/ssr";
import { LandingSectionHeader } from "@/components/brand/section-heading";
import { speakReference } from "@/lib/speech-tts";
import { cn } from "@/lib/utils";
import { ButterflyIllustration, CatIllustration, ElephantIllustration } from "@/components/brand/illustrations";

interface SampleWord {
  word: string;
  phonetic: string;
  tip: string;
}

interface LevelCard {
  id: "basic" | "medium" | "advanced";
  title: string;
  srsNote: string;
  summary: string;
  featuredWord: string;
  tone: string;
  badge: string;
  Illustration: ({ className }: { className?: string }) => React.ReactNode;
  words: SampleWord[];
}

const levels: LevelCard[] = [
  {
    id: "basic",
    title: "Basic (Easy)",
    srsNote: "Level 1",
    summary: "Familiar words, everyday sounds, and simple vocabulary to build early confidence.",
    featuredWord: "Cat",
    tone: "bg-tint-mint border-score-excellent/25",
    badge: "bg-score-excellent text-white",
    Illustration: CatIllustration,
    words: [
      { word: "Cat", phonetic: "/kæt/", tip: "Keep the short /æ/ vowel crisp and open." },
      { word: "Sun", phonetic: "/sʌn/", tip: "Start cleanly with a soft /s/ hiss." },
      { word: "Book", phonetic: "/bʊk/", tip: "Short /ʊ/ sound, not a long 'oo'." },
    ],
  },
  {
    id: "medium",
    title: "Medium",
    srsNote: "Level 2",
    summary: "Longer everyday vocabulary and trickier consonant pairs like /v/, /w/, and /θ/.",
    featuredWord: "Butterfly",
    tone: "bg-tint-cream border-chart-5/35",
    badge: "bg-chart-5 text-foreground",
    Illustration: ButterflyIllustration,
    words: [
      { word: "Butterfly", phonetic: "/ˈbʌt.ə.flaɪ/", tip: "Stress the first beat: BUT-ter-fly." },
      { word: "Window", phonetic: "/ˈwɪn.dəʊ/", tip: "Round your lips for /w/—no /v/ sound." },
      { word: "Kitchen", phonetic: "/ˈkɪtʃ.ən/", tip: "Clear /tʃ/ ('ch') in the middle." },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    srsNote: "Level 3",
    summary: "Multi-syllable words and fuller phrases for steady, clear reading aloud.",
    featuredWord: "Elephant",
    tone: "bg-tint-sky border-chart-3/35",
    badge: "bg-chart-3 text-foreground",
    Illustration: ElephantIllustration,
    words: [
      { word: "Elephant", phonetic: "/ˈel.ɪ.fənt/", tip: "Make sure the 'ph' sounds like /f/, not /p/." },
      { word: "Vegetable", phonetic: "/ˈvedʒ.tə.bəl/", tip: "Start with /v/ (top teeth on bottom lip)." },
      { word: "Tomorrow", phonetic: "/təˈmɒr.əʊ/", tip: "Put the main stress on the middle beat: to-MOR-row." },
    ],
  },
];

/**
 * SECTION 05 — EXPLORE THE LEARNING JOURNEY
 * Three illustrated difficulty cards (Basic/Easy, Medium, Advanced) matching SRS levels,
 * with interactive sample word selection and real speech playback preview.
 */
export function LearningJourney() {
  const [activeLevel, setActiveLevel] = useState<LevelCard["id"]>("basic");
  const [activeWord, setActiveWord] = useState<SampleWord>(levels[0].words[0]);
  const [speaking, setSpeaking] = useState(false);

  const selectedLevel = levels.find((l) => l.id === activeLevel) ?? levels[0];

  const handleSelectLevel = (lvl: LevelCard) => {
    setActiveLevel(lvl.id);
    setActiveWord(lvl.words[0]);
  };

  const handleSpeak = (word: string) => {
    speakReference(word, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-24 py-12 md:py-18">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <LandingSectionHeader
          id="journey-title"
          lead="Explore the"
          accent="Learning Journey"
          subtitle="Chapters grow across three clear difficulty levels—from short familiar words to longer sentences. Click a level to explore sample words."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {levels.map((lvl) => {
            const isSelected = lvl.id === activeLevel;
            const Illustration = lvl.Illustration;
            return (
              <div
                key={lvl.id}
                className={cn(
                  "flex flex-col rounded-2xl border-2 p-6 transition-colors",
                  isSelected ? lvl.tone : "border-border bg-card hover:border-primary/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-3 py-1 font-heading text-xs font-bold", lvl.badge)}>
                    {lvl.title}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{lvl.srsNote}</span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-card">
                    <Illustration className="size-16" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Example word</p>
                    <p className="font-heading text-2xl font-bold text-foreground">{lvl.featuredWord}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lvl.summary}</p>

                <button
                  type="button"
                  onClick={() => handleSelectLevel(lvl)}
                  aria-expanded={isSelected}
                  className={cn(
                    "mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border font-heading text-xs font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {isSelected ? "Showing sample words below" : `Explore ${lvl.title} words`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive sample words + practice preview */}
        <div className="mt-6 rounded-2xl border-2 border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Illustrative Word Preview · {selectedLevel.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click any sample word to hear how it sounds and preview its tip.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLevel.words.map((w) => (
                <button
                  key={w.word}
                  type="button"
                  onClick={() => setActiveWord(w)}
                  className={cn(
                    "rounded-xl border px-4 py-2 font-heading text-sm font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring",
                    activeWord.word === w.word
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-foreground/15 bg-background text-foreground hover:border-primary/40",
                  )}
                >
                  {w.word}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-baseline gap-3">
                <h3 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{activeWord.word}</h3>
                <span className="font-mono text-sm text-muted-foreground">{activeWord.phonetic}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> {activeWord.tip}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSpeak(activeWord.word)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-foreground/15 bg-secondary/70 px-5 font-heading text-sm font-semibold text-foreground outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring"
              >
                <SpeakerHigh className={cn("size-4 text-primary", speaking && "animate-pulse")} weight="duotone" aria-hidden />
                {speaking ? `Playing “${activeWord.word}”` : `Listen to “${activeWord.word}”`}
              </button>
              <Link
                href="/#demo"
                className="inline-flex h-11 items-center rounded-xl bg-foreground px-5 font-heading text-sm font-semibold text-background outline-none hover:bg-foreground/90 focus-visible:ring-3 focus-visible:ring-ring"
              >
                Try Recording in Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
