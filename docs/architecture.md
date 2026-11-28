# Architecture

Status: **accepted** (2026-11-24, `decisions/001-stack.md`).

```
Browser (student + teacher pages)
   │  records audio (MediaRecorder), shows results
   ▼
Next.js app  ──────────────► Supabase
 - pages (server-rendered)      - Postgres (all tables)
 - API routes (all secrets)     - Storage (private "recordings" bucket)
   │            │
   │            └──────────► Gemini API (suggestions, FYP-2) — fallback: templates
   ▼
Speech Engine (behind one interface, swappable)
 - mock     : fake scores, for UI work and offline dev
 - azure    : Azure Pronunciation Assessment (word + phoneme scores) — app track
 - python   : own service in engine/ (ASR + forced alignment + GOP) — research track, built in parallel
```

### Two scoring tracks in parallel
- The app is built against `azure` (and `mock`), so features don't wait for the research.
- The Python engine (`engine/`) is a separate module (SRS 3.3.8) with an HTTP endpoint `POST /score` that returns exactly the contract below.
- Compare both on the same recordings (score agreement + latency ≤ 10 s) before switching `SPEECH_ENGINE=python`. Keep a small set of team-recorded test clips with expected wrong words for this.

## Rules
- **Browser never talks to Supabase or AI services directly.** Only server code does (`server/db/`), with the secret key. Every DB read goes through `getDb()`, which calls `connection()` so pages never query at build time.
- **One Speech Engine contract** (below). Pages and API routes never know which engine is behind it. The scorer is the Pronnova engine (`engine/`, ADR-010); `SPEECH_ENGINE=azure` switches to the Azure stub. No mock in the app (test double only).
- **Never lose an attempt.** Save the audio + an `attempts` row with `status = pending` *before* scoring. Engine down / timeout / error → `failed` (Retry re-scores the same audio). Unclear audio → `rejected` (no score, record again).
- Store `model_version` and `scoring_version` on every attempt so results stay comparable when the engine changes.
- Server components by default; `"use client"` only for recording and interactive widgets.

## Saving an attempt (UC-04)
`POST /api/attempts` → `server/services/attempts.ts`: upload audio → insert `pending` → score with the selected engine → `complete_attempt()` (results + error stats, one transaction). Scoring failure → `failed` + audio kept → `POST /api/attempts/[attemptId]/retry`. The browser-made attempt id makes resends idempotent.

## Speech Engine contract
ADR-010 (replaces the shape frozen in ADR-005). Node → `POST {ENGINE_URL}/score` (multipart `audio` + `reference_text`), timeout `ENGINE_TIMEOUT_MS` (10 s):

```json
{
  "overall": 87.5, "class": "Excellent",
  "words": [{ "text": "think", "score": 87.5,
              "phonemes": [{ "expected": "θ", "heard": "t", "status": "near" }] }],
  "tricky_sounds": [{ "phoneme": "θ", "count": 1 }],
  "audio_quality": { "ok": true },
  "heard_phonemes": "t ɪ ŋ k", "engine_version": "pronnova-engine-0.1.0", "timings": { }
}
```
`status`: ok / near / sub / del / ins. Unclear audio → `audio_quality: { ok: false, reason }`, no score. `server/speech/python.ts` maps this to `ScoreResult` (word colour ok/near/bad, phoneme statuses + positions, gop_score = 100/50/0). The app still computes the stored classification from the score (`lib/scoring.ts`, same 85/70 cut-offs). Reference voice: `POST /tts` → MP3, cached by Node (`server/speech/tts.ts`).

## Data model (from SRS ER diagram)
| Table | Key columns | Notes |
|---|---|---|
| profiles | id, name, email, role, status | role = student/teacher. Seeded demo rows in FYP-1 |
| classes | id, teacher_id, name, join_code | |
| enrollments | class_id + student_id, joined_at | |
| chapters | id, title, order_no, grade_tag | |
| lessons | id, chapter_id, level, order_no, created_by | level = basic/medium/advanced |
| lesson_items | id, lesson_id, item_type, text, reference_phonemes, variants | item_type = word/phrase/sentence/paragraph; variants = UK/US |
| assignments | id, lesson_id, class_id?, student_id?, deadline | one of class/student set |
| attempts | id, student_id, item_id, audio_path, status, recognized_text, score, classification, model_version, scoring_version, raw_result | |
| word_results | id, attempt_id, word, score, is_error | |
| phoneme_results | id, attempt_id, word, phoneme, expected, detected, gop_score, is_error | |
| error_stats | student_id + unit, attempts, errors, error_rate, updated_at | unit = a word or a phoneme |
| teacher_evaluations | id, attempt_id, teacher_id, score, comment | |
| suggestions | id, student_id, content, source, created_at | source = gemini/template |
| settings | key, value | thresholds, limits |

Added beyond the ER diagram (needed by the UI or UC-10): `chapters.cover_image`, `chapters.tint`, `lessons.title`, `lessons.instructions`, `lesson_items.order_no`, `attempts.duration_ms/error_message/scored_at`, `word_results.position`, `error_stats.unit_type` (word or phoneme). Access: RLS on every table, no policies, no grants to `anon`/`authenticated`; only `service_role` (the secret key) reads/writes.
