import { curriculumRepository } from "@/server/database/repositories/curriculumRepository";
import type { Chapter, Exercise } from "@/types";

export class CurriculumService {
  async getChapters(): Promise<Chapter[]> {
    return curriculumRepository.findAllChapters();
  }

  async getChapter(id: string): Promise<Chapter | null> {
    return curriculumRepository.findChapterById(id);
  }

  async getExercises(): Promise<Exercise[]> {
    return curriculumRepository.findAllExercises();
  }

  async getExercise(id: string): Promise<{ chapter: Chapter; exercise: Exercise } | null> {
    return curriculumRepository.findExerciseById(id);
  }
}

export const curriculumService = new CurriculumService();
