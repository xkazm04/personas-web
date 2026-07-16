import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getOptionalEnv } from "@/lib/server/env";

/**
 * Server-only Supabase client for API routes that read/write PII-bearing or
 * mutation-heavy tables (feature votes/comments/boosts, waitlist).
 *
 * Prefers the SERVICE-ROLE key so those tables' RLS can be locked down to
 * anon-read-counts-only (see scripts/harden-voting-rls.sql). When the
 * service-role key is not configured it falls back to the public anon client
 * so existing deployments keep working — but that fallback only holds while
 * the permissive legacy RLS is still in place. NEVER import this from client
 * code (the "server-only" guard will fail the build if you do).
 */
let _admin: SupabaseClient | null = null;
let _warnedFallback = false;

export async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (_admin) return _admin;

  const url = getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = getOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (url && serviceKey) {
    _admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return _admin;
  }

  // Fallback: no service-role key yet. Reuse the anon client so votes/waitlist
  // keep functioning during migration, but warn once so the gap is visible.
  if (!_warnedFallback) {
    _warnedFallback = true;
    console.warn(
      "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY not set — falling back to the " +
        "anon client. Server writes run with the public role, so feature_votes " +
        "RLS must stay permissive and voter emails remain readable by anyone. " +
        "Set SUPABASE_SERVICE_ROLE_KEY and run scripts/harden-voting-rls.sql to close this.",
    );
  }
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}
