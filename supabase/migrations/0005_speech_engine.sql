-- 0005_speech_engine.sql — Pronnova Speech Engine (ADR-010).
-- Why:
-- * The engine returns a status per phoneme (ok / near / sub / del) and per word (ok / near / bad),
--   which the feedback screen colours by. Store them, with positions, so a saved attempt shows the
--   same colours later.
-- * Unclear audio (too quiet, too short, no speech) gets NO score: the attempt is kept as 'rejected'
--   (Retry is pointless; the student records again). 'failed' stays for engine down / timeout (Retry).
-- * A private bucket caches the engine's TTS audio (Node stores it; the engine stays stateless).

-- ── attempts.status: add 'rejected' ─────────────────────────────────────────
alter table public.attempts drop constraint if exists attempts_status_check;
alter table public.attempts
  add constraint attempts_status_check check (status in ('pending', 'scored', 'failed', 'rejected'));

-- ── word / phoneme statuses + positions ─────────────────────────────────────
alter table public.word_results add column if not exists status text
  check (status is null or status in ('ok', 'near', 'bad'));
alter table public.phoneme_results add column if not exists status text
  check (status is null or status in ('ok', 'near', 'sub', 'del'));
alter table public.phoneme_results add column if not exists word_position int check (word_position is null or word_position >= 0);
alter table public.phoneme_results add column if not exists position int check (position is null or position >= 0);
create index if not exists phoneme_results_attempt_pos_idx on public.phoneme_results (attempt_id, word_position, position);

-- complete_attempt: same signature and rules as 0003, now also stores the statuses/positions.
create or replace function public.complete_attempt(
  p_attempt_id      uuid,
  p_recognized_text text,
  p_score           numeric,
  p_classification  text,
  p_model_version   text,
  p_scoring_version text,
  p_raw             jsonb,
  p_words           jsonb,   -- [{"position":0,"word":"Think","unit":"think","score":87.5,"is_error":false,"status":"near"}, ...]
  p_phonemes        jsonb    -- [{"word":"think","word_position":0,"position":0,"phoneme":"θ","expected":"θ","detected":"t","gop_score":50,"is_error":true,"status":"near"}, ...]
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_student uuid;
  v_status  text;
begin
  select student_id, status into v_student, v_status
  from public.attempts where id = p_attempt_id for update;

  if v_student is null then
    raise exception 'attempt % not found', p_attempt_id using errcode = 'P0002';
  end if;
  if v_status = 'scored' then
    return false;
  end if;

  insert into public.word_results (attempt_id, position, word, score, is_error, status)
  select p_attempt_id, (w->>'position')::int, w->>'word', (w->>'score')::numeric, (w->>'is_error')::boolean, w->>'status'
  from jsonb_array_elements(coalesce(p_words, '[]')) as w;

  insert into public.phoneme_results (attempt_id, word, phoneme, expected, detected, gop_score, is_error, status, word_position, position)
  select p_attempt_id, p->>'word', p->>'phoneme', p->>'expected', p->>'detected', (p->>'gop_score')::numeric,
         (p->>'is_error')::boolean, p->>'status', (p->>'word_position')::int, (p->>'position')::int
  from jsonb_array_elements(coalesce(p_phonemes, '[]')) as p;

  -- SRS 3.2.6: per student, count attempts and errors per word and per sound (unchanged from 0003).
  insert into public.error_stats as es (student_id, unit_type, unit, attempts, errors, updated_at)
  select v_student, 'word', u.unit, count(*), count(*) filter (where u.is_error), now()
  from (
    select w->>'unit' as unit, (w->>'is_error')::boolean as is_error
    from jsonb_array_elements(coalesce(p_words, '[]')) as w
    where coalesce(w->>'unit', '') <> ''
  ) u
  group by u.unit
  on conflict (student_id, unit_type, unit) do update
    set attempts = es.attempts + excluded.attempts,
        errors = es.errors + excluded.errors,
        updated_at = now();

  insert into public.error_stats as es (student_id, unit_type, unit, attempts, errors, updated_at)
  select v_student, 'phoneme', u.unit, count(*), count(*) filter (where u.is_error), now()
  from (
    select coalesce(p->>'expected', p->>'phoneme') as unit, (p->>'is_error')::boolean as is_error
    from jsonb_array_elements(coalesce(p_phonemes, '[]')) as p
  ) u
  where coalesce(u.unit, '') <> ''
  group by u.unit
  on conflict (student_id, unit_type, unit) do update
    set attempts = es.attempts + excluded.attempts,
        errors = es.errors + excluded.errors,
        updated_at = now();

  update public.attempts
  set status = 'scored',
      recognized_text = p_recognized_text,
      score = p_score,
      classification = p_classification,
      model_version = p_model_version,
      scoring_version = p_scoring_version,
      raw_result = p_raw,
      error_message = null,
      scored_at = now()
  where id = p_attempt_id;

  return true;
end;
$$;

revoke all on function public.complete_attempt(uuid, text, numeric, text, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.complete_attempt(uuid, text, numeric, text, text, text, jsonb, jsonb, jsonb) to service_role;

-- ── Storage: private bucket for the engine's TTS audio (cache) ──────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tts', 'tts', false, 2097152, array['audio/mpeg', 'audio/wav'])
on conflict (id) do nothing;
