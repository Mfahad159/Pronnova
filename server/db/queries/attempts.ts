import "server-only";
import type { AttemptSummary, Level } from "@/types";
import { check, getDb } from "../client";

interface AttemptRow {
  id: string;
  item_id: string;
  status: AttemptSummary["status"];
  score: number | string | null;
  duration_ms: number | null;
  audio_path: string | null;
  created_at: string;
  profiles: { name: string } | null;
  lesson_items: { text: string; lessons: { level: Level; chapters: { title: string } } };
}

const SELECT =
  "id, item_id, status, score, duration_ms, audio_path, created_at, profiles!attempts_student_id_fkey(name), lesson_items!inner(text, lessons!inner(level, chapters!inner(title)))";

const toSummary = (r: AttemptRow): AttemptSummary & { studentName: string } => ({
  id: r.id,
  itemId: r.item_id,
  text: r.lesson_items.text,
  chapterTitle: r.lesson_items.lessons.chapters.title,
  level: r.lesson_items.lessons.level,
  score: r.score == null ? 0 : Math.round(Number(r.score)),
  durationSec: Math.max(1, Math.round((r.duration_ms ?? 0) / 1000)),
  createdAt: r.created_at,
  status: r.status,
  hasAudio: !!r.audio_path,
  studentName: r.profiles?.name ?? "",
});

/** A student's latest attempts, newest first. */
export async function listStudentAttempts(studentId: string, limit = 10) {
  const rows = check(
    await (await getDb()).from("attempts").select(SELECT).eq("student_id", studentId).order("created_at", { ascending: false }).limit(limit),
    "list student attempts",
  );
  return (rows as unknown as AttemptRow[]).map(toSummary);
}

/** Latest attempts by students in any of this teacher's classes. */
export async function listClassAttempts(teacherId: string, limit = 10) {
  const studentIds = await classStudentIds(teacherId);
  if (studentIds.length === 0) return [];
  const rows = check(
    await (await getDb()).from("attempts").select(SELECT).in("student_id", studentIds).order("created_at", { ascending: false }).limit(limit),
    "list class attempts",
  );
  return (rows as unknown as AttemptRow[]).map(toSummary);
}

/** True if the student is in one of this teacher's classes (who may hear a recording, UC-12). */
export async function teacherHasStudent(teacherId: string, studentId: string): Promise<boolean> {
  return (await classStudentIds(teacherId)).includes(studentId);
}

async function classStudentIds(teacherId: string): Promise<string[]> {
  const rows = check(
    await (await getDb()).from("enrollments").select("student_id, classes!inner(teacher_id)").eq("classes.teacher_id", teacherId),
    "list class students",
  ) as { student_id: string }[];
  return [...new Set(rows.map((r) => r.student_id))];
}

export interface TeacherStats {
  students: number;
  attemptsThisWeek: number;
  classAverage: number | null;
  mostMissedWord: string | null;
}

/** Headline numbers for the teacher dashboard (UC-12 overview). */
export async function getTeacherStats(teacherId: string): Promise<TeacherStats> {
  const db = await getDb();
  const studentIds = await classStudentIds(teacherId);
  if (studentIds.length === 0) return { students: 0, attemptsThisWeek: 0, classAverage: null, mostMissedWord: null };

  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const [week, scored, missed] = await Promise.all([
    db.from("attempts").select("id", { count: "exact", head: true }).in("student_id", studentIds).gte("created_at", weekAgo),
    db.from("attempts").select("score").in("student_id", studentIds).eq("status", "scored"),
    db
      .from("error_stats")
      .select("unit, errors")
      .in("student_id", studentIds)
      .eq("unit_type", "word")
      .gt("errors", 0)
      .order("errors", { ascending: false })
      .limit(1),
  ]);
  if (week.error) throw new Error(`DB count attempts failed: ${week.error.message}`);
  const scores = (check(scored, "load scores") as { score: number | string }[]).map((r) => Number(r.score));
  const top = check(missed, "load most missed") as { unit: string }[];

  return {
    students: studentIds.length,
    attemptsThisWeek: week.count ?? 0,
    classAverage: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    mostMissedWord: top[0]?.unit ?? null,
  };
}
