export type DifficultyLevel = "basic" | "medium" | "advanced";

export type ExerciseKind = "word" | "phrase" | "sentence";

export type ChapterAccentTone = "peach" | "sky" | "mint" | "cream";

export interface Exercise {
  id: string;
  chapterId: string;
  order: number;
  title: string;
  promptText: string;
  kind: ExerciseKind;
  level: DifficultyLevel;
  focusSounds: string[];
  estimatedMinutes: number;
  completed: boolean;
  bestScore?: number;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  accentWord: string;
  description: string;
  accentTone: ChapterAccentTone;
  focusSounds: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface ChapterProgress {
  chapterId: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
  averageScore: number | null;
  lastPracticedLabel: string | null;
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  basic: "Basic",
  medium: "Medium",
  advanced: "Advanced",
};

export const EXERCISE_KIND_LABELS: Record<ExerciseKind, string> = {
  word: "Word",
  phrase: "Phrase",
  sentence: "Sentence",
};
