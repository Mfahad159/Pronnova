import "server-only";
import type { DraftItem } from "@/lib/materials";
import type { Level } from "@/types";
import { check, getDb } from "../client";

export interface TeacherClass {
  id: string;
  name: string;
}

export async function listTeacherClasses(teacherId: string): Promise<TeacherClass[]> {
  const rows = check(
    await (await getDb()).from("classes").select("id, name").eq("teacher_id", teacherId).order("name"),
    "list classes",
  );
  return rows as TeacherClass[];
}

export interface MaterialSummary {
  id: string;
  title: string;
  level: Level;
  chapterTitle: string;
  itemCount: number;
  createdAt: string;
  assignedTo: { className: string; deadline: string | null }[];
}

/** Materials this teacher uploaded (UC-10), newest first. */
export async function listTeacherMaterials(teacherId: string): Promise<MaterialSummary[]> {
  const rows = check(
    await (await getDb())
      .from("lessons")
      .select("id, title, level, created_at, chapters!inner(title), lesson_items(count), assignments(deadline, classes(name))")
      .eq("created_by", teacherId)
      .eq("visibility", "assigned")
      .order("created_at", { ascending: false }),
    "list materials",
  ) as unknown as {
    id: string;
    title: string;
    level: Level;
    created_at: string;
    chapters: { title: string };
    lesson_items: { count: number }[];
    assignments: { deadline: string | null; classes: { name: string } | null }[];
  }[];

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    level: r.level,
    chapterTitle: r.chapters.title,
    itemCount: r.lesson_items[0]?.count ?? 0,
    createdAt: r.created_at,
    assignedTo: r.assignments.map((a) => ({ className: a.classes?.name ?? "A student", deadline: a.deadline })),
  }));
}

export interface CreateMaterialArgs {
  teacherId: string;
  chapterId: string;
  level: Level;
  title: string;
  instructions: string;
  items: DraftItem[];
  classId: string | null;
  deadline: string | null; // ISO timestamp
}

/** Saves lesson + items (+ assignment) atomically via the create_material() DB function (0002). */
export async function createMaterial(a: CreateMaterialArgs): Promise<string> {
  const { data, error } = await (await getDb()).rpc("create_material", {
    p_teacher_id: a.teacherId,
    p_chapter_id: a.chapterId,
    p_level: a.level,
    p_title: a.title,
    p_instructions: a.instructions,
    p_items: a.items.map((i) => ({ text: i.text, item_type: i.itemType })),
    p_class_id: a.classId,
    p_deadline: a.deadline,
  });
  if (error) throw new Error(`DB create material failed: ${error.message}`);
  return data as string;
}
