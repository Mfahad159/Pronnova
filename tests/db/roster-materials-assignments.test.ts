import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { POST as createClassApi } from "@/app/api/classes/route";
import { POST as createStudentApi } from "@/app/api/students/route";
import { GET as getStudentApi } from "@/app/api/students/[studentId]/route";
import { POST as archiveApi } from "@/app/api/students/[studentId]/archive/route";
import { POST as unarchiveApi } from "@/app/api/students/[studentId]/unarchive/route";
import { POST as createMaterialApi } from "@/app/api/materials/route";
import { GET as getMaterialApi, PATCH as patchMaterialApi } from "@/app/api/materials/[materialId]/route";
import { POST as duplicateApi } from "@/app/api/materials/[materialId]/duplicate/route";
import { POST as assignApi } from "@/app/api/assignments/route";
import { todayInPakistan } from "@/lib/materials";
import { getStudentLearning } from "@/server/db/queries/learning";

// Real DB checks for migration 0004 (run: npm run test:db). Everything created here is tagged and
// removed in afterAll. Students are only hard-deleted here, as test cleanup.

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error("tests/db needs SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
const sb = createClient(url, key, { auth: { persistSession: false } });

const TAG = `zz-test-${Date.now()}`;
const today = todayInPakistan();
const inDays = (n: number) => {
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const made = { classes: [] as string[], students: [] as string[], materials: [] as string[] };

const req = (method: string, body?: unknown) =>
  new Request("http://test/api", {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = <K extends string>(params: Record<K, string>) => ({ params: Promise.resolve(params) }) as never;

async function newClass(name: string) {
  const res = await createClassApi(req("POST", { name }));
  expect(res.status).toBe(201);
  const { class: c } = await res.json();
  made.classes.push(c.id);
  return c.id as string;
}
async function newStudent(fullName: string, rollNo: string, classId: string) {
  const res = await createStudentApi(req("POST", { fullName, rollNo, classId }));
  expect(res.status).toBe(201);
  const { student } = await res.json();
  made.students.push(student.id);
  return student as { id: string; classId: string };
}
async function newMaterial(title: string, items: string[], level = "basic", assign?: unknown) {
  const res = await createMaterialApi(req("POST", { title: `${TAG} ${title}`, level, items, assign }));
  const body = await res.json();
  expect(res.status, JSON.stringify(body)).toBe(201);
  made.materials.push(body.id);
  return body as { id: string; warnings: { item?: number; message: string }[] };
}
const materialTitles = async (title: string) =>
  ((await sb.from("lessons").select("id").eq("title", `${TAG} ${title}`)).data ?? []).length;
const homeworkIds = async (s: { id: string; classId: string }) =>
  (await getStudentLearning(s)).homework.map((h) => ({ id: h.lessonId, due: h.deadline }));

let C1: string, C2: string;
let s1: { id: string; classId: string }, s2: { id: string; classId: string }, other: { id: string; classId: string };

beforeAll(async () => {
  C1 = await newClass(`${TAG} A`);
  C2 = await newClass(`${TAG} B`);
  s1 = await newStudent("Test Aamir", "1", C1);
  s2 = await newStudent("Test Bushra", "2", C1);
  other = await newStudent("Test Danish", "1", C2);
});

afterAll(async () => {
  const lessonIds = [...made.materials];
  const extra = (await sb.from("lessons").select("id").like("title", `${TAG}%`)).data ?? [];
  lessonIds.push(...extra.map((l) => l.id));
  if (lessonIds.length) {
    const items = (await sb.from("lesson_items").select("id").in("lesson_id", lessonIds)).data ?? [];
    if (items.length) await sb.from("attempts").delete().in("item_id", items.map((i) => i.id));
    await sb.from("assignments").delete().in("lesson_id", lessonIds);
    await sb.from("lessons").delete().in("id", lessonIds);
  }
  if (made.students.length) await sb.from("profiles").delete().in("id", made.students);
  if (made.classes.length) await sb.from("classes").delete().in("id", made.classes);
});

describe("migration 0004 on existing data", () => {
  it("every student has a class and a roll number; enrollments is gone; every assignment has a target", async () => {
    const missing = await sb.from("profiles").select("id").eq("role", "student").or("class_id.is.null,roll_no.is.null");
    expect(missing.error).toBeNull();
    expect(missing.data).toEqual([]);
    const enrol = await sb.from("enrollments").select("*").limit(1);
    expect(enrol.error).not.toBeNull(); // table dropped
    const assignments = (await sb.from("assignments").select("id, assignment_targets(id)")).data ?? [];
    expect(assignments.every((a) => (a.assignment_targets as unknown[]).length >= 1)).toBe(true);
  });
});

describe("roster", () => {
  it("class names are unique (case-insensitive) and a class with students can't be deleted", async () => {
    const dup = await createClassApi(req("POST", { name: `  ${TAG} a ` }));
    expect(dup.status).toBe(409);
    const del = await sb.from("classes").delete().eq("id", C1);
    expect(del.error?.code).toBe("23503");
  });
  it("roll number is unique per class", async () => {
    const res = await createStudentApi(req("POST", { fullName: "Test Dup", rollNo: "1", classId: C1 }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("That roll number is already used in this class.");
  });
});

describe("materials", () => {
  it("level-fit warnings are returned but never block saving", async () => {
    const m = await newMaterial("warn", ["cat", "dog"], "advanced");
    expect(m.warnings.filter((w) => w.item !== undefined)).toHaveLength(2);
    expect(m.warnings.some((w) => w.item === undefined)).toBe(true); // fewer than 3 items
  });

  it("atomic save: a bad item rolls back the whole material", async () => {
    const r = await sb.rpc("create_material", {
      p_teacher_id: "00000000-0000-4000-8000-000000000001",
      p_title: `${TAG} rollback`,
      p_level: "basic",
      p_instructions: "",
      p_items: [{ text: "cat", item_type: "word" }, { text: words(26), item_type: "paragraph" }],
    });
    expect(r.error?.code).toBe("23514"); // 25-word CHECK, the DB's last line of defence
    expect(await materialTitles("rollback")).toBe(0);
  });

  it("atomic save + assign: a bad assignment rolls back the material too", async () => {
    const r = await sb.rpc("create_material_and_assign", {
      p_teacher_id: "00000000-0000-4000-8000-000000000001",
      p_title: `${TAG} rollback2`,
      p_level: "basic",
      p_instructions: "",
      p_items: [{ text: "cat", item_type: "word" }],
      p_due_date: inDays(-1),
      p_class_ids: [C1],
      p_student_ids: [],
    });
    expect(r.error?.code).toBe("PN422");
    expect(await materialTitles("rollback2")).toBe(0);
  });

  it("lock rule: after an attempt, items can't change (409) but title/instructions can", async () => {
    const m = await newMaterial("lock", ["cat", "dog", "cow"]);
    const edit = await patchMaterialApi(req("PATCH", { items: ["cat", "dog", "hen"] }), ctx({ materialId: m.id }));
    expect(edit.status).toBe(200); // unlocked: fine

    const items = (await sb.from("lesson_items").select("id").eq("lesson_id", m.id)).data!;
    const att = await sb.from("attempts").insert({ student_id: s1.id, item_id: items[0].id, status: "failed" });
    expect(att.error).toBeNull();
    const got = await (await getMaterialApi(req("GET"), ctx({ materialId: m.id }))).json();
    expect(got.material.locked).toBe(true);

    for (const items2 of [["cat", "dog"], ["cat", "dog", "hen", "pig"], ["dog", "cat", "hen"], ["cat", "dog", "pen"]]) {
      const res = await patchMaterialApi(req("PATCH", { items: items2 }), ctx({ materialId: m.id }));
      expect(res.status).toBe(409);
      expect((await res.json()).error).toBe("This material has student attempts. Use Duplicate & edit.");
    }
    const ok = await patchMaterialApi(req("PATCH", { title: `${TAG} lock renamed`, instructions: "Say it twice." }), ctx({ materialId: m.id }));
    expect(ok.status).toBe(200);
    expect((await ok.json()).material.title).toBe(`${TAG} lock renamed`);
    const same = await patchMaterialApi(req("PATCH", { items: ["cat", "dog", "hen"] }), ctx({ materialId: m.id }));
    expect(same.status).toBe(200); // unchanged items aren't a change

    // DB function enforces it too (in case two requests race).
    const direct = await sb.rpc("update_material", {
      p_material_id: m.id,
      p_title: "x",
      p_level: "basic",
      p_instructions: "",
      p_items: [{ text: "pig", item_type: "word" }],
    });
    expect(direct.error?.code).toBe("PN409");
  });

  it("duplicate: '<title> (copy)', same items, no assignments, unlocked", async () => {
    const m = await newMaterial("dup", ["cat", "dog", "cow"], "basic", { dueDate: inDays(3), classIds: [C1] });
    const items = (await sb.from("lesson_items").select("id").eq("lesson_id", m.id)).data!;
    await sb.from("attempts").insert({ student_id: s1.id, item_id: items[0].id, status: "failed" });

    const res = await duplicateApi(req("POST"), ctx({ materialId: m.id }));
    expect(res.status).toBe(201);
    const { id } = await res.json();
    made.materials.push(id);
    const copy = (await (await getMaterialApi(req("GET"), ctx({ materialId: id }))).json()).material;
    expect(copy.title).toBe(`${TAG} dup (copy)`);
    expect(copy.items.map((i: { text: string }) => i.text)).toEqual(["cat", "dog", "cow"]);
    expect(copy.assignmentCount).toBe(0);
    expect(copy.locked).toBe(false);
  });
});

describe("assignments", () => {
  let M: string;
  beforeAll(async () => {
    M = (await newMaterial("assign", ["cat", "dog", "cow"])).id;
  });

  it("CHECK: a target is exactly one of class or student", async () => {
    const { data: a } = await sb.rpc("create_assignment", { p_material_id: M, p_due_date: inDays(2), p_class_ids: [C1], p_student_ids: [] });
    const both = await sb.from("assignment_targets").insert({ assignment_id: a, class_id: C1, student_id: s1.id });
    expect(both.error?.code).toBe("23514");
    const neither = await sb.from("assignment_targets").insert({ assignment_id: a });
    expect(neither.error?.code).toBe("23514");
  });

  it("duplicate targets are rejected and nothing is saved", async () => {
    const before = (await sb.from("assignments").select("id").eq("lesson_id", M)).data!.length;
    const r = await sb.rpc("create_assignment", { p_material_id: M, p_due_date: inDays(2), p_class_ids: [C1, C1], p_student_ids: [] });
    expect(r.error?.code).toBe("23505");
    expect((await sb.from("assignments").select("id").eq("lesson_id", M)).data!.length).toBe(before);
    const api = await assignApi(req("POST", { materialId: M, dueDate: inDays(2), studentIds: [s1.id, s1.id] }));
    expect(api.status).toBe(422);
  });

  it("past due date is rejected (API and DB)", async () => {
    const api = await assignApi(req("POST", { materialId: M, dueDate: inDays(-1), classIds: [C1] }));
    expect(api.status).toBe(422);
    const r = await sb.rpc("create_assignment", { p_material_id: M, p_due_date: inDays(-1), p_class_ids: [C1], p_student_ids: [] });
    expect(r.error?.code).toBe("PN422");
  });

  it("archived students can't be targeted, and the student API hides them", async () => {
    const gone = await newStudent("Test Archived", "9", C1);
    expect((await archiveApi(req("POST"), ctx({ studentId: gone.id }))).status).toBe(200);
    const api = await assignApi(req("POST", { materialId: M, dueDate: inDays(2), studentIds: [gone.id] }));
    expect(api.status).toBe(422);
    expect((await api.json()).error).toBe("Archived students can't be given work.");
    expect((await getStudentApi(req("GET"), ctx({ studentId: gone.id }))).status).toBe(404);
    expect((await getStudentApi(new Request("http://test/api?includeArchived=true"), ctx({ studentId: gone.id }))).status).toBe(200);
    expect((await unarchiveApi(req("POST"), ctx({ studentId: gone.id }))).status).toBe(200);
    expect((await getStudentApi(req("GET"), ctx({ studentId: gone.id }))).status).toBe(200);
  });

  it("unknown class or student ids are rejected", async () => {
    const ghost = "00000000-0000-4000-8000-0000000fffff";
    const api = await assignApi(req("POST", { materialId: M, dueDate: inDays(2), classIds: [ghost] }));
    expect(api.status).toBe(422);
  });
});

describe("student visibility", () => {
  it("union of class + individual targets, deduplicated, nearest upcoming due date", async () => {
    const V = (await newMaterial("visible", ["cat", "dog", "cow"])).id;
    expect((await assignApi(req("POST", { materialId: V, dueDate: inDays(10), classIds: [C1] }))).status).toBe(201);
    expect((await assignApi(req("POST", { materialId: V, dueDate: inDays(3), studentIds: [s1.id, other.id] }))).status).toBe(201);

    const forS1 = (await homeworkIds(s1)).filter((h) => h.id === V);
    expect(forS1).toEqual([{ id: V, due: inDays(3) }]); // once, nearest date
    expect((await homeworkIds(s2)).filter((h) => h.id === V)).toEqual([{ id: V, due: inDays(10) }]); // via class only
    expect((await homeworkIds(other)).filter((h) => h.id === V)).toEqual([{ id: V, due: inDays(3) }]); // individually, other class

    const stranger = await newStudent("Test Stranger", "2", C2);
    expect((await homeworkIds(stranger)).some((h) => h.id === V)).toBe(false);
  });

  it("a class assignment reaches a student added to the class later", async () => {
    const L = (await newMaterial("later", ["cat", "dog", "cow"])).id;
    expect((await assignApi(req("POST", { materialId: L, dueDate: inDays(4), classIds: [C2] }))).status).toBe(201);
    const late = await newStudent("Test Latecomer", "7", C2);
    expect((await homeworkIds(late)).some((h) => h.id === L)).toBe(true);
  });

  it("assigned material items are open for practice, others stay hidden", async () => {
    const H = (await newMaterial("hidden", ["cat", "dog", "cow"])).id;
    await assignApi(req("POST", { materialId: H, dueDate: inDays(4), studentIds: [s1.id] }));
    const item = (await sb.from("lesson_items").select("id").eq("lesson_id", H).limit(1)).data![0].id;
    const { itemAccess } = await import("@/lib/progress");
    expect(itemAccess((await getStudentLearning(s1)).view, item)).toBe("open");
    expect(itemAccess((await getStudentLearning(s2)).view, item)).toBe("hidden");
  });
});
