// Phase 5 check 9: data integrity on the real database (read-only).
//   node --env-file=.env.local scripts/qa/integrity.mjs
// 1. error_stats (words) = recount from word_results of SCORED attempts, per student + word
//    (unit = lower-case letters/apostrophes only, same as lib/audio.ts wordUnit)
// 2. error_rate = round(errors / attempts × 100, 1)
// 3. every scored attempt has a score + class, and the class matches the score (85 / 70 cut-offs)
// 4. no failed/pending attempt has results; no results without an attempt; every attempt's item exists
// 5. every student has a class and a roll number; every assignment has ≥ 1 target
import { createRequire } from "node:module";
const require = createRequire(`${process.cwd()}/package.json`);
const { Client } = require("pg");

const c = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const q = async (sql) => (await c.query(sql)).rows;
const checks = [];
const check = (name, rows, detail = (r) => JSON.stringify(r.slice(0, 3))) =>
  checks.push({ check: name, result: rows.length === 0 ? "PASS" : "FAIL", problems: rows.length, sample: rows.length ? detail(rows) : "" });

check(
  "error_stats (words) match a recount of word_results",
  await q(`
    with recount as (
      select a.student_id, lower(regexp_replace(w.word, '[^[:alpha:]'']', '', 'g')) as unit,
             count(*)::int as attempts, count(*) filter (where w.is_error)::int as errors
      from public.word_results w join public.attempts a on a.id = w.attempt_id
      where a.status = 'scored'
      group by 1, 2)
    select coalesce(r.student_id, e.student_id) as student_id, coalesce(r.unit, e.unit) as unit,
           r.attempts as recount_attempts, e.attempts as stored_attempts, r.errors as recount_errors, e.errors as stored_errors
    from recount r full join (select * from public.error_stats where unit_type = 'word') e
      on e.student_id = r.student_id and e.unit = r.unit
    where r.attempts is distinct from e.attempts or r.errors is distinct from e.errors`),
);
check(
  "error_rate = errors / attempts × 100 (1 decimal)",
  await q(`select student_id, unit, attempts, errors, error_rate from public.error_stats
           where error_rate <> case when attempts = 0 then 0 else round(errors * 100.0 / attempts, 1) end`),
);
check(
  "scored attempts have a score and the right class (≥85 excellent, ≥70 good, else average)",
  await q(`select id, score, classification from public.attempts where status = 'scored' and (
             score is null or classification is distinct from
             case when score >= 85 then 'excellent' when score >= 70 then 'good' else 'average' end)`),
);
check(
  "failed / pending attempts have no word or sound results",
  await q(`select a.id, a.status from public.attempts a
           where a.status <> 'scored' and (exists (select 1 from public.word_results w where w.attempt_id = a.id)
                                         or exists (select 1 from public.phoneme_results p where p.attempt_id = a.id))`),
);
check("no orphan word results", await q(`select w.id from public.word_results w left join public.attempts a on a.id = w.attempt_id where a.id is null`));
check("every attempt points at an existing item and student", await q(`select a.id from public.attempts a left join public.lesson_items i on i.id = a.item_id left join public.profiles p on p.id = a.student_id where i.id is null or p.id is null`));
check("every student has a class and a roll number", await q(`select id, name from public.profiles where role = 'student' and (class_id is null or roll_no is null)`));
check("every assignment has at least one target", await q(`select a.id from public.assignments a where not exists (select 1 from public.assignment_targets t where t.assignment_id = a.id)`));

const totals = (await q(`select (select count(*) from public.attempts)::int attempts,
  (select count(*) from public.attempts where status='scored')::int scored,
  (select count(*) from public.attempts where status='failed')::int failed,
  (select count(*) from public.error_stats)::int error_stats`))[0];
await c.end();
console.log("Data checked:", totals);
console.table(checks);
process.exit(checks.every((x) => x.result === "PASS") ? 0 : 1);
