/**
 * Server database client boundary.
 *
 * In accordance with ADR-001 (Supabase approved) and ADR-003 (No auth in FYP-1):
 * - Database access runs strictly server-side using the service role key.
 * - Browser code is never granted direct database connection credentials.
 * - In FYP-1 development mode, repositories read from validated curriculum seeds.
 */

export interface DatabaseConfig {
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  isConfigured: boolean;
}

export function getServerDatabaseConfig(): DatabaseConfig {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    supabaseUrl: url,
    supabaseServiceKey: key,
    isConfigured: Boolean(url && key),
  };
}
