import type { DifficultyLevel } from "./curriculum";

export interface RecentAttemptSummary {
  id: string;
  exerciseId: string;
  chapterId: string;
  chapterTitle: string;
  exerciseTitle: string;
  promptText: string;
  level: DifficultyLevel;
  score: number;
  practicedAtLabel: string;
  flaggedWords: string[];
}

export interface StudentProgressOverview {
  studentName: string;
  totalAttempts: number;
  completedExercises: number;
  totalExercises: number;
  averageAccuracy: number;
  focusSoundsToPractice: string[];
}
