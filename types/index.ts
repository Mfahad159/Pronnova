// Shared types. Names follow the SRS ER diagram (docs/architecture.md → Data model).

export type Role = "student" | "teacher";
export type Level = "basic" | "medium" | "advanced";
export type ItemType = "word" | "phrase" | "sentence" | "paragraph";
export type Classification = "excellent" | "good" | "average";
/** rejected = the audio was too quiet/short/silent (no score; record again). failed = engine problem (Retry). */
export type AttemptStatus = "pending" | "scored" | "failed" | "rejected";

/** Per-sound result from the Pronnova engine (ADR-010). */
export type PhonemeStatus = "ok" | "near" | "sub" | "del";
/** Word colour on the feedback screen: green / amber / red. */
export type WordStatus = "ok" | "near" | "bad";

export interface Profile {
  id: string;
  name: string;
  role: Role;
}

export interface Chapter {
  id: string;
  title: string;
  orderNo: number;
  gradeTag: string;
  /** Card art in public/objects and its tint token. UI-only. */
  image: string;
  tint: "peach" | "sky" | "mint" | "cream";
}

export interface Lesson {
  id: string;
  chapterId: string;
  level: Level;
  orderNo: number;
  title: string;
}

export interface LessonItem {
  id: string;
  lessonId: string;
  itemType: ItemType;
  text: string;
}

export interface WordResult {
  word: string;
  score: number;
  isError: boolean;
  status?: WordStatus;
}

export interface PhonemeResult {
  word: string;
  phoneme: string;
  expected: string;
  detected: string;
  gopScore: number;
  isError: boolean;
  status?: PhonemeStatus;
  wordPosition?: number;
  position?: number;
}

export interface AttemptSummary {
  id: string;
  itemId: string;
  text: string;
  chapterTitle: string;
  level: Level;
  score: number;
  durationSec: number;
  createdAt: string;
  status: AttemptStatus;
  /** A recording file is stored (seed examples have none). */
  hasAudio: boolean;
}

/** What the practice page gets back after submitting or retrying an attempt. */
export interface AttemptResult {
  attemptId: string;
  status: AttemptStatus;
  score: number | null;
  classification: Classification | null;
  recognizedText: string | null;
  error: string | null;
  words: WordResult[];
  phonemes: PhonemeResult[];
}
