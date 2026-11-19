export type VoiceSessionState =
  | "idle"
  | "requesting_permission"
  | "ready"
  | "recording"
  | "processing_audio"
  | "uploading"
  | "evaluating"
  | "completed"
  | "error"
  | "cancelled"
  | "permission_denied";

export type AudioErrorCode =
  | "NOT_ALLOWED"
  | "NOT_FOUND"
  | "EMPTY_AUDIO"
  | "UPLOAD_FAILED"
  | "EVAL_FAILED"
  | "TIMEOUT";

export interface AudioError {
  code: AudioErrorCode;
  message: string;
  recoverable: boolean;
}

export interface WordResult {
  word: string;
  score: number; // 0-100
  status: "correct" | "review" | "missed";
  phonemeHint?: string;
}

export interface AssessmentResult {
  attemptId: string;
  overallScore: number; // 0-100
  words: WordResult[];
  durationMs: number;
}
