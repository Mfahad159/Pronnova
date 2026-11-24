-- 0003_attempt_results.sql — Phase 3 (UC-04 Attempt Pronunciation Exercise, SRS 3.2.4–3.2.6).
-- Why: finishing an attempt touches 4 tables (attempts, word_results, phoneme_results, error_stats).
-- Doing it in one function = one transaction, so results and error counts can never disagree.
-- It also refuses to run twice for the same attempt, so a retry can't double-count errors.

create or replace function public.complete_attempt(
  p_attempt_id      uuid,
  p_recognized_text text,
  p_score           numeric,
  p_classification  text,
  p_model_version   text,
  p_scoring_version text,
  p_raw             jsonb,
  p_words           jsonb,   -- [{"position":0,"word":"Three","unit":"three","score":92,"is_error":false}, ...]
  p_phonemes        jsonb    -- [{"word":"three","phoneme":"θ","expected":"θ","detected":"t","gop_score":41,"is_error":true}, ...]
) returns boolean            -- true = completed now, false = was already scored (nothing changed)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_student uuid;
  v_status  text;
begin
  -- Lock the row so two retries can't complete the same attempt at once.
  select student_id, status into v_student, v_status
  from public.attempts where id = p_attempt_id for update;

  if v_student is null then
    raise exception 'attempt % not found', p_attempt_id using errcode = 'P0002';
  end if;
  if v_status = 'scored' then
    return false;
  end if;

  insert into public.word_results (attempt_id, position, word, score, is_error)
  select p_attempt_id, (w->>'position')::int, w->>'word', (w->>'score')::numeric, (w->>'is_error')::boolean
  from jsonb_array_elements(coalesce(p_words, '[]')) as w;

  insert into public.phoneme_results (attempt_id, word, phoneme, expected, detected, gop_score, is_error)
  select p_attempt_id, p->>'word', p->>'phoneme', p->>'expected', p->>'detected', (p->>'gop_score')::numeric, (p->>'is_error')::boolean
  from jsonb_array_elements(coalesce(p_phonemes, '[]')) as p;

  -- SRS 3.2.6: per student, count attempts and errors per word and per sound.
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
