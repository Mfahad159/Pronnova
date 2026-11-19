import {
  getAllChapters as getMockChapters,
  getAllExercises as getMockExercises,
  getChapterById as getMockChapterById,
  getExerciseById as getMockExerciseById,
} from "@/lib/mock-data/curriculum";
import type { Chapter, Exercise } from "@/types";

export interface CurriculumRepository {
  findAllChapters(): Promise<Chapter[]>;
  findChapterById(id: string): Promise<Chapter | null>;
  findAllExercises(): Promise<Exercise[]>;
  findExerciseById(id: string): Promise<{ chapter: Chapter; exercise: Exercise } | null>;
}

export class DefaultCurriculumRepository implements CurriculumRepository {
  async findAllChapters(): Promise<Chapter[]> {
    return getMockChapters();
  }

  async findChapterById(id: string): Promise<Chapter | null> {
    return getMockChapterById(id) ?? null;
  }

  async findAllExercises(): Promise<Exercise[]> {
    return getMockExercises();
  }

  async findExerciseById(id: string): Promise<{ chapter: Chapter; exercise: Exercise } | null> {
    return getMockExerciseById(id) ?? null;
  }
}

export const curriculumRepository = new DefaultCurriculumRepository();
