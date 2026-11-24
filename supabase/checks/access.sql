-- Read-only security check (npm run db:verify). Expected: rls_on_tables = total_tables,
-- browser_grants = 0, policies = 0, server_can_write = true, bucket_public = false.
select
  (select count(*) from pg_tables where schemaname = 'public' and rowsecurity) as rls_on_tables,
  (select count(*) from pg_tables where schemaname = 'public') as total_tables,
  (select count(*) from information_schema.role_table_grants
     where table_schema = 'public' and grantee in ('anon', 'authenticated')) as browser_grants,
  (select count(*) from pg_policies where schemaname = 'public') as policies,
  has_table_privilege('service_role', 'public.attempts', 'insert') as server_can_write,
  (select public from storage.buckets where id = 'recordings') as bucket_public
