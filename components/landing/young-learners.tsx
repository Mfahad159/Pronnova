"use client";

import { useState } from "react";
import { BookOpen, Eye, Heart, Sparkle, SpeakerHigh, Stack } from "@phosphor-icons/react/ssr";
import { speakReference } from "@/lib/speech-tts";
import { cn } from "@/lib/utils";
import { AppleIllustration, BookIllustration, CatIllustration, SunIllustration } from "./illustrations";

const principles = [
  {
    title: "Learner-Friendly Pace",
    body: "Designed for Class 1 learners in Pakistan, building spoken English confidence one word at a time.",
    Icon: Sparkle,
  },
  {
    title: "Focused Practice",
    body: "Short words, phrases, and sentences (up to 15 words) keep attention on clear speaking.",
    Icon: BookOpen,
  },
  {
    title: "Clear Pronunciation Examples",
    body: "Learners can listen to how a word sounds before recording their own attempt.",
    Icon: SpeakerHigh,
  },
  {
    title: "Visual Learning Support",
    body: "Friendly 2D flashcards and illustrations make everyday vocabulary easy to remember.",
    Icon: Eye,
  },
  {
    title: "Encouraging Feedback",
    body: "Supportive scoring and tips help students improve without feeling discouraged.",
    Icon: Heart,
  },
  {
    title: "Progressive Difficulty",
    body: "Exercises are organised into Basic, Medium, and Advanced levels inside every chapter.",
    Icon: Stack,
  },
] as const;

const flashcards = [
  { word: "Cat", hint: "Short /æ/ sound: c-a-t.", tone: "bg-tint-peach", Illustration: CatIllustration },
  { word: "Sun", hint: "Crisp /s/ start: s-u-n.", tone: "bg-tint-cream", Illustration: SunIllustration },
  { word: "Book", hint: "Short /ʊ/ vowel: b-oo-k.", tone: "bg-tint-sky", Illustration: BookIllustration },
  { word: "Apple", hint: "Clear opening /æ/ sound: AP-uhl.", tone: "bg-tint-mint", Illustration: AppleIllustration },
] as const;

/**
 * SECTION 09 — BUILT AROUND YOUNG LEARNERS
 * Six educational design principles paired with an interactive sample flashcard gallery.
 */
export function YoungLearners() {
  const [selected, setSelected] = useState<(typeof flashcards)[number]>(flashcards[0]);
  const [speaking, setSpeaking] = useState(false);

  const handleCardClick = (card: (typeof flashcards)[number]) => {
    setSelected(card);
    speakReference(card.word, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <section id="learners" aria-labelledby="learners-title" className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-tint-cream px-3.5 py-1 text-xs font-semibold tracking-wide text-foreground uppercase">
            Educational Principles
          </p>
          <h2 id="learners-title" className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Built Around Young Learners
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Calm, encouraging practice structured for real Pakistani classrooms.
          </p>
        </div>

        {/* 6 design principles */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map(({ title, body, Icon }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="size-5" weight="duotone" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        {/* Interactive sample flashcard gallery */}
        <div className="mt-10 rounded-2xl border-2 border-foreground/10 bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">Interactive Sample Flashcards</h3>
              <p className="text-sm text-muted-foreground">Tap any flashcard to hear its pronunciation.</p>
            </div>
            <p aria-live="polite" className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-primary">
              {speaking ? `Playing “${selected.word}”...` : `${selected.word}: ${selected.hint}`}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {flashcards.map((card) => {
              const active = selected.word === card.word;
              const Illustration = card.Illustration;
              return (
                <button
                  key={card.word}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center rounded-xl border-2 p-5 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    card.tone,
                    active ? "border-primary" : "border-foreground/10 hover:border-primary/40",
                  )}
                >
                  <Illustration className="size-20" />
                  <span className="mt-3 font-heading text-lg font-bold text-foreground">{card.word}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <SpeakerHigh className="size-3.5" weight="duotone" aria-hidden />
                    Tap to listen
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
