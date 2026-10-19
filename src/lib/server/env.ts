import "server-only";

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function hasSupabaseEnv(): boolean {
  return !!(
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL") &&
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

/**
 * True when `getSupabaseAdmin()` can hand back a client that actually bypasses
 * RLS — i.e. the service-role key is configured.
 *
 * `hasSupabaseEnv()` only proves the *public* pair is set. On a deployment
 * hardened with `scripts/harden-voting-rls.sql` the anon role has no grants on
 * the PII-bearing tables (`revoke all on public.waitlist_entries from anon`),
 * so a URL+anon-only config produces a client whose every write fails. Routes
 * that write those tables must gate on this, not on `hasSupabaseEnv()`.
 *
 * Server-only: the service-role key is never read in client code (this module
 * is `import "server-only"`).
 */
export function hasSupabaseServiceRole(): boolean {
  return !!(
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL") &&
    getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

/**
 * True on a production deployment. On Vercel that is `VERCEL_ENV=production`
 * only: a preview deployment also runs with `NODE_ENV=production`, and keeps
 * the dev-time fallbacks. Elsewhere it is `NODE_ENV=production`.
 */
export function isProductionDeploy(): boolean {
  const vercel = getOptionalEnv("VERCEL_ENV");
  if (vercel) return vercel === "production";
  return process.env.NODE_ENV === "production";
}
