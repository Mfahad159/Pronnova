/**
 * Server database schema entities and table contracts.
 * Matches Supabase PostgreSQL schema defined in architecture documentation.
 */

export interface ChapterTable {
  id: string;
  number: number;
  title: string;
  accent_word: string;
  description: string;
  accent_tone: "peach" | "sky" | "mint" | "cream";
  focus_sounds: string[];
  estimated_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExerciseTable {
  id: string;
  chapter_id: string;
  order_index: number;
  title: string;
  prompt_text: string;
  kind: "word" | "phrase" | "sentence";
  level: "basic" | "medium" | "advanced";
  focus_sounds: string[];
  estimated_minutes: number;
  created_at?: string;
}

export interface AttemptTable {
  id: string;
  student_id: string;
  exercise_id: string;
  overall_score: number;
  duration_ms: number;
  audio_storage_path?: string | null;
  created_at: string;
}

export interface WordResultTable {
  id: string;
  attempt_id: string;
  word: string;
  score: number;
  status: "correct" | "review" | "missed";
  phoneme_hint?: string | null;
}
