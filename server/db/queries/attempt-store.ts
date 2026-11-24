import "server-only";
import type { AttemptResult, Classification } from "@/types";
import { check, getDb } from "../client";

const BUCKET = "recordings";

export interface StoredAttempt {
  id: string;
  studentId: string;
  itemId: string;
  status: "pending" | "scored" | "failed";
  audioPath: string | null;
  createdAt: string;
}

export type { AttemptResult };

export async function getAttempt(id: string): Promise<StoredAttempt | null> {
  const row = check(
    await (await getDb()).from("attempts").select("id, student_id, item_id, status, audio_path, created_at").eq("id", id).maybeSingle(),
    "load attempt",
  ) as { id: string; student_id: string; item_id: string; status: StoredAttempt["status"]; audio_path: string | null; created_at: string } | null;
  return row && { id: row.id, studentId: row.student_id, itemId: row.item_id, status: row.status, audioPath: row.audio_path, createdAt: row.created_at };
}

/** Attempt + its word/sound results, as the practice page shows them. */
export async function getAttemptResult(id: string): Promise<AttemptResult | null> {
  const db = await getDb();
  const row = check(
    await db
      .from("attempts")
      .select("id, status, score, classification, recognized_text, error_message, word_results(position, word, score, is_error), phoneme_results(word, phoneme, expected, detected, gop_score, is_error)")
      .eq("id", id)
      .maybeSingle(),
    "load attempt result",
  ) as {
    id: string;
    status: StoredAttempt["status"];
    score: number | string | null;
    classification: Classification | null;
    recognized_text: string | null;
    error_message: string | null;
    word_results: { position: number; word: string; score: number | string; is_error: boolean }[];
    phoneme_results: { word: string; phoneme: string; expected: string | null; detected: string | null; gop_score: number | string | null; is_error: boolean }[];
  } | null;
  if (!row) return null;
  return {
    attemptId: row.id,
    status: row.status,
    score: row.score == null ? null : Math.round(Number(row.score)),
    classification: row.classification,
    recognizedText: row.recognized_text,
    error: row.error_message,
    words: [...row.word_results].sort((a, b) => a.position - b.position).map((w) => ({ word: w.word, score: Math.round(Number(w.score)), isError: w.is_error })),
    phonemes: row.phoneme_results.map((p) => ({
      word: p.word,
      phoneme: p.phoneme,
      expected: p.expected ?? "",
      detected: p.detected ?? "",
      gopScore: Number(p.gop_score ?? 0),
      isError: p.is_error,
    })),
  };
}

/** Uploads to the private bucket. Path: {studentId}/{attemptId}.{ext}. Never overwrites. */
export async function uploadRecording(path: string, audio: Blob, contentType: string): Promise<void> {
  const { error } = await (await getDb()).storage.from(BUCKET).upload(path, audio, { contentType, upsert: false });
  // "already exists" = an earlier try of the same attempt got this far: fine.
  if (error && !/exists|duplicate/i.test(error.message)) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function downloadRecording(path: string): Promise<Blob> {
  const { data, error } = await (await getDb()).storage.from(BUCKET).download(path);
  if (error || !data) throw new Error(`Storage download failed: ${error?.message ?? "no data"}`);
  return data;
}

export async function insertPendingAttempt(a: { id: string; studentId: string; itemId: string; audioPath: string; durationMs: number }) {
  const { error } = await (await getDb()).from("attempts").insert({
    id: a.id,
    student_id: a.studentId,
    item_id: a.itemId,
    audio_path: a.audioPath,
    duration_ms: Math.round(a.durationMs),
    status: "pending",
  });
  if (error) throw new Error(`DB insert attempt failed: ${error.message}`);
}

export async function markAttemptFailed(id: string, message: string) {
  const { error } = await (await getDb())
    .from("attempts")
    .update({ status: "failed", error_message: message.slice(0, 500) })
    .eq("id", id)
    .neq("status", "scored");
  if (error) throw new Error(`DB mark failed: ${error.message}`);
}

export interface CompleteArgs {
  attemptId: string;
  recognizedText: string;
  score: number;
  classification: Classification;
  modelVersion: string;
  scoringVersion: string;
  raw: unknown;
  words: { position: number; word: string; unit: string; score: number; is_error: boolean }[];
  phonemes: { word: string; phoneme: string; expected: string; detected: string; gop_score: number; is_error: boolean }[];
}

/** Saves results + error stats + marks scored, in one DB transaction (0003 complete_attempt). */
export async function completeAttempt(a: CompleteArgs): Promise<boolean> {
  const { data, error } = await (await getDb()).rpc("complete_attempt", {
    p_attempt_id: a.attemptId,
    p_recognized_text: a.recognizedText,
    p_score: a.score,
    p_classification: a.classification,
    p_model_version: a.modelVersion,
    p_scoring_version: a.scoringVersion,
    p_raw: a.raw ?? null,
    p_words: a.words,
    p_phonemes: a.phonemes,
  });
  if (error) throw new Error(`DB complete attempt failed: ${error.message}`);
  return data as boolean;
}
