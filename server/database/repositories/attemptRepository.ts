import {
  getRecentAttempts as getMockRecentAttempts,
  getStudentProgressOverview as getMockStudentOverview,
} from "@/lib/mock-data/curriculum";
import type { RecentAttemptSummary, StudentProgressOverview } from "@/types";
import type { AssessmentResult } from "@/types/voice";

export interface AttemptRecord {
  id: string;
  exerciseId: string;
  overallScore: number;
  durationMs: number;
  createdAt: string;
  result: AssessmentResult;
}

export interface AttemptRepository {
  saveAttempt(attempt: Omit<AttemptRecord, "id" | "createdAt">): Promise<AttemptRecord>;
  findRecentAttempts(limit?: number): Promise<RecentAttemptSummary[]>;
  getStudentOverview(): Promise<StudentProgressOverview>;
}

// In-memory attempts cache for local execution before Supabase connection (bounded)
const MAX_SAVED_ATTEMPTS = 500;
const savedAttempts: AttemptRecord[] = [];

export class DefaultAttemptRepository implements AttemptRepository {
  async saveAttempt(
    data: Omit<AttemptRecord, "id" | "createdAt">
  ): Promise<AttemptRecord> {
    const record: AttemptRecord = {
      ...data,
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    savedAttempts.unshift(record);
    if (savedAttempts.length > MAX_SAVED_ATTEMPTS) {
      savedAttempts.length = MAX_SAVED_ATTEMPTS;
    }
    return record;
  }

  async findRecentAttempts(limit = 10): Promise<RecentAttemptSummary[]> {
    const mockList = getMockRecentAttempts();
    return mockList.slice(0, limit);
  }

  async getStudentOverview(): Promise<StudentProgressOverview> {
    return getMockStudentOverview();
  }
}

export const attemptRepository = new DefaultAttemptRepository();
