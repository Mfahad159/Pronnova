import "server-only";
import { toDbItems } from "@/lib/materials";
import type { ItemType, Level } from "@/types";
import { check, getDb } from "../client";

// Teacher material library (migration 0004): a material is a `lessons` row with
// visibility = 'assigned'; its items are `lesson_items`. Writes go through DB functions so they
// are atomic. Locked = some student has attempted one of its items (then items can't change).

export interface MaterialSummary {
  id: string;
  title: string;
  level: Level;
  instructions: string | null;
  itemCount: number;
  assignmentCount: number;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialItem {
  id: string;
  position: number;
  text: string;
  itemType: ItemType;
}

export interface MaterialTarget {
  classId: string | null;
  className: string | null;
  studentId: string | null;
  studentName: string | null;
}

export interface MaterialDetail extends MaterialSummary {
  items: MaterialItem[];
  assignments: { id: string; dueDate: string; createdAt: string; targets: MaterialTarget[] }[];
}

interface Row {
  id: string;
  title: string;
  level: Level;
  instructions: string | null;
  created_at: string;
  updated_at: string;
  lesson_items: { id: string }[];
  assignments: { id: string }[];
}

/** Item ids (of the given materials) that already have at least one attempt. */
async function attemptedItemIds(itemIds: string[]): Promise<Set<string>> {
  if (itemIds.length === 0) return new Set();
  const rows = check(
    await (await getDb()).from("attempts").select("item_id").in("item_id", itemIds),
    "check material locks",
  ) as { item_id: string }[];
  return new Set(rows.map((r) => r.item_id));
}

/** All materials, newest first, with item count, assignment count and the lock flag. */
export async function listMaterials(): Promise<MaterialSummary[]> {
  const rows = check(
    await (await getDb())
      .from("lessons")
      .select("id, title, level, instructions, created_at, updated_at, lesson_items(id), assignments(id)")
      .eq("visibility", "assigned")
      .order("created_at", { ascending: false }),
    "list materials",
  ) as unknown as Row[];
  const attempted = await attemptedItemIds(rows.flatMap((r) => r.lesson_items.map((i) => i.id)));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    level: r.level,
    instructions: r.instructions,
    itemCount: r.lesson_items.length,
    assignmentCount: r.assignments.length,
    locked: r.lesson_items.some((i) => attempted.has(i.id)),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function getMaterial(id: string): Promise<MaterialDetail | null> {
  const row = check(
    await (await getDb())
      .from("lessons")
      .select(
        "id, title, level, instructions, created_at, updated_at, lesson_items(id, order_no, text, item_type), assignments(id, due_date, created_at, assignment_targets(class_id, student_id, classes(name), profiles(name)))",
      )
      .eq("id", id)
      .eq("visibility", "assigned")
      .maybeSingle(),
    "get material",
  ) as unknown as
    | (Omit<Row, "lesson_items" | "assignments"> & {
        lesson_items: { id: string; order_no: number; text: string; item_type: ItemType }[];
        assignments: {
          id: string;
          due_date: string;
          created_at: string;
          assignment_targets: {
            class_id: string | null;
            student_id: string | null;
            classes: { name: string } | null;
            profiles: { name: string } | null;
          }[];
        }[];
      })
    | null;
  if (!row) return null;
  const items = [...row.lesson_items].sort((a, b) => a.order_no - b.order_no);
  const attempted = await attemptedItemIds(items.map((i) => i.id));
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    instructions: row.instructions,
    itemCount: items.length,
    assignmentCount: row.assignments.length,
    locked: items.some((i) => attempted.has(i.id)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((i) => ({ id: i.id, position: i.order_no, text: i.text, itemType: i.item_type })),
    assignments: row.assignments
      .map((a) => ({
        id: a.id,
        dueDate: a.due_date,
        createdAt: a.created_at,
        targets: a.assignment_targets.map((t) => ({
          classId: t.class_id,
          className: t.classes?.name ?? null,
          studentId: t.student_id,
          studentName: t.profiles?.name ?? null,
        })),
      }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  };
}

export interface MaterialWrite {
  title: string;
  level: Level;
  instructions: string;
  items: string[];
}

/** Material + items in one transaction (create_material). */
export async function createMaterial(teacherId: string, m: MaterialWrite): Promise<string> {
  return check(
    await (await getDb()).rpc("create_material", {
      p_teacher_id: teacherId,
      p_title: m.title,
      p_level: m.level,
      p_instructions: m.instructions,
      p_items: toDbItems(m.items),
    }),
    "create material",
  ) as string;
}

/** Material + items + assignment in one transaction (UC-10 "assign now"). */
export async function createMaterialAndAssign(
  teacherId: string,
  m: MaterialWrite,
  a: { dueDate: string; classIds: string[]; studentIds: string[] },
): Promise<string> {
  return check(
    await (await getDb()).rpc("create_material_and_assign", {
      p_teacher_id: teacherId,
      p_title: m.title,
      p_level: m.level,
      p_instructions: m.instructions,
      p_items: toDbItems(m.items),
      p_due_date: a.dueDate,
      p_class_ids: a.classIds,
      p_student_ids: a.studentIds,
    }),
    "create material and assign",
  ) as string;
}

/** `items: null` keeps the items as they are (always allowed, even when locked). */
export async function updateMaterial(id: string, m: Omit<MaterialWrite, "items"> & { items: string[] | null }): Promise<void> {
  check(
    await (await getDb()).rpc("update_material", {
      p_material_id: id,
      p_title: m.title,
      p_level: m.level,
      p_instructions: m.instructions,
      p_items: m.items ? toDbItems(m.items) : null,
    }),
    "update material",
  );
}

export async function duplicateMaterial(id: string, teacherId: string): Promise<string> {
  return check(
    await (await getDb()).rpc("duplicate_material", { p_material_id: id, p_teacher_id: teacherId }),
    "duplicate material",
  ) as string;
}
