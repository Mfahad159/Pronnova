-- Read-only security check (npm run db:verify). Expected: rls_on_tables = total_tables,
-- browser_grants = 0, policies = 0, server_can_write = true, bucket_public = false,
-- browser_can_call_create_material = false (covers all 0004 material/assignment functions),
-- browser_can_call_complete_attempt = false.
select
  (select count(*) from pg_tables where schemaname = 'public' and rowsecurity) as rls_on_tables,
  (select count(*) from pg_tables where schemaname = 'public') as total_tables,
  (select count(*) from information_schema.role_table_grants
     where table_schema = 'public' and grantee in ('anon', 'authenticated')) as browser_grants,
  (select count(*) from pg_policies where schemaname = 'public') as policies,
  has_table_privilege('service_role', 'public.attempts', 'insert') as server_can_write,
  (select public from storage.buckets where id = 'recordings') as bucket_public,
  -- 0004 material/assignment functions: none may be callable from the browser.
  (select bool_or(has_function_privilege(r, f, 'execute'))
     from unnest(array['anon', 'authenticated']) r,
          unnest(array[
            'public.create_material(uuid, text, text, text, jsonb)',
            'public.update_material(uuid, text, text, text, jsonb)',
            'public.duplicate_material(uuid, uuid)',
            'public.create_assignment(uuid, date, uuid[], uuid[])',
            'public.create_material_and_assign(uuid, text, text, text, jsonb, date, uuid[], uuid[])'
          ]) f)
    as browser_can_call_create_material,
  (has_function_privilege('anon', 'public.complete_attempt(uuid, text, numeric, text, text, text, jsonb, jsonb, jsonb)', 'execute')
   or has_function_privilege('authenticated', 'public.complete_attempt(uuid, text, numeric, text, text, text, jsonb, jsonb, jsonb)', 'execute'))
    as browser_can_call_complete_attempt
