-- ============================================================================
-- Harden feature-voting RLS + add the waitlist table
--
-- Companion to scripts/setup-voting-db.sql. Apply this AFTER setting
-- SUPABASE_SERVICE_ROLE_KEY in the deployment env, because it removes the
-- anon role's ability to read PII and mutate votes directly — server routes
-- now use the service-role client (src/lib/supabase-admin.ts), which bypasses
-- RLS, so the API keeps working while direct anon REST access is closed.
--
-- Fixes:
--   docs/harness/ambiguity-ui-scan-2026-07-16/supabase-client.md #1 (PII/RLS)
--   docs/harness/ambiguity-ui-scan-2026-07-16/supabase-client.md #2 (waitlist)
-- ============================================================================

-- ── 1. feature_votes: stop leaking voter emails, stop anon mutation ─────────
-- Drop the permissive anon policies. The service-role client used by the API
-- is not subject to RLS, so read counts / voting still work through the route.
drop policy if exists "anon read feature_votes"   on public.feature_votes;
drop policy if exists "anon insert feature_votes" on public.feature_votes;
drop policy if exists "anon update feature_votes" on public.feature_votes;
drop policy if exists "anon delete feature_votes" on public.feature_votes;

-- Expose ONLY aggregate counts to the public (no email, no voter_id) via a view.
-- The roadmap/voting UI can read this directly if it ever needs client-side counts.
create or replace view public.feature_vote_counts
  with (security_invoker = true) as
  select feature_id, count(*)::int as votes
  from public.feature_votes
  group by feature_id;

grant select on public.feature_vote_counts to anon;

-- If any client code still needs anon SELECT on the base table, restrict it to
-- non-PII columns via column privileges instead of a row policy. By default we
-- grant nothing on the base table to anon (server uses service-role):
revoke all on public.feature_votes from anon;

-- ── 2. feature_comments / feature_boosts: drop anon insert (server-only) ────
-- Comments/boosts are written by the API with the service-role client now.
drop policy if exists "anon insert feature_comments" on public.feature_comments;
drop policy if exists "anon insert feature_boosts"   on public.feature_boosts;
-- Keep anon SELECT on comments (they're public, non-PII) if the UI reads them
-- directly; otherwise revoke as above. Left in place here intentionally.

-- ── 3. waitlist_entries: create the table the API expects ───────────────────
create table if not exists public.waitlist_entries (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  platform    text not null,
  early_beta  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (email, platform)
);

alter table public.waitlist_entries enable row level security;
-- No anon policies: only the service-role client (API) may read/write. Emails
-- are PII and must never be readable via the public anon key.
revoke all on public.waitlist_entries from anon;
