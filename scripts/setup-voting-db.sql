-- =====================================================================
-- Personas — feature voting tables
-- ---------------------------------------------------------------------
-- Run once in the Supabase SQL editor for the project that backs
-- NEXT_PUBLIC_SUPABASE_URL. The /api/votes, /api/feature-comments, and
-- /api/feature-boosts routes read & write these tables with the anon
-- key, so the RLS policies below permit anonymous read + insert.
-- =====================================================================

-- ── feature_votes (one row per voter per feature) ─────────────────────
create table if not exists public.feature_votes (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null,
  voter_id text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (feature_id, voter_id)
);

create index if not exists idx_feature_votes_feature_id
  on public.feature_votes (feature_id);

-- ── feature_comments (threaded — parent_id links to a top-level row) ──
create table if not exists public.feature_comments (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null,
  parent_id uuid references public.feature_comments(id) on delete cascade,
  author text not null check (char_length(author) between 1 and 64),
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_feature_comments_feature_id
  on public.feature_comments (feature_id, created_at);

-- ── feature_boosts (Ko-fi tier weight, one row per voter per feature) ──
-- The UNIQUE constraint is what stops a single voter_id from stacking a
-- feature's boost total without limit: the route upserts on it, so a
-- re-boost replaces the prior tier instead of appending a new row.
create table if not exists public.feature_boosts (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null,
  voter_id text not null,
  weight integer not null check (weight > 0 and weight <= 1000),
  tier_value integer not null check (tier_value > 0 and tier_value <= 1000),
  created_at timestamptz not null default now(),
  constraint feature_boosts_feature_voter_key unique (feature_id, voter_id)
);

create index if not exists idx_feature_boosts_feature_id
  on public.feature_boosts (feature_id);

-- Backfill for installs created before the uniqueness rule (the table used to
-- be append-only): collapse any duplicate (feature_id, voter_id) boosts down
-- to the highest-weight row, then add the constraint. Safe to re-run.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'feature_boosts_feature_voter_key'
      and conrelid = 'public.feature_boosts'::regclass
  ) then
    delete from public.feature_boosts a
      using public.feature_boosts b
      where a.feature_id = b.feature_id
        and a.voter_id = b.voter_id
        and (a.weight < b.weight or (a.weight = b.weight and a.id < b.id));
    alter table public.feature_boosts
      add constraint feature_boosts_feature_voter_key unique (feature_id, voter_id);
  end if;
end $$;

-- ── shipped_features (referenced by /api/votes GET) ───────────────────
create table if not exists public.shipped_features (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null unique,
  changelog text,
  link text,
  shipped_at timestamptz not null default now()
);

-- ── RLS — anon role gets read + insert; updates/deletes go through the
--    API and are scoped by voter_id at the application layer. ─────────
alter table public.feature_votes enable row level security;
alter table public.feature_comments enable row level security;
alter table public.feature_boosts enable row level security;
alter table public.shipped_features enable row level security;

-- feature_votes — anon can read + insert + delete + update (API gates by voter_id).
drop policy if exists "anon read feature_votes" on public.feature_votes;
drop policy if exists "anon insert feature_votes" on public.feature_votes;
drop policy if exists "anon update feature_votes" on public.feature_votes;
drop policy if exists "anon delete feature_votes" on public.feature_votes;
create policy "anon read feature_votes" on public.feature_votes
  for select using (true);
create policy "anon insert feature_votes" on public.feature_votes
  for insert with check (true);
create policy "anon update feature_votes" on public.feature_votes
  for update using (true) with check (true);
create policy "anon delete feature_votes" on public.feature_votes
  for delete using (true);

-- feature_comments — anon can read + insert (no deletes from public).
drop policy if exists "anon read feature_comments" on public.feature_comments;
drop policy if exists "anon insert feature_comments" on public.feature_comments;
create policy "anon read feature_comments" on public.feature_comments
  for select using (true);
create policy "anon insert feature_comments" on public.feature_comments
  for insert with check (true);

-- feature_boosts — anon can read + insert + update. The update policy is
-- required for the route's upsert: on conflict it UPDATEs the voter's existing
-- row (replacing the tier); without it the on-conflict path is denied by RLS.
drop policy if exists "anon read feature_boosts" on public.feature_boosts;
drop policy if exists "anon insert feature_boosts" on public.feature_boosts;
drop policy if exists "anon update feature_boosts" on public.feature_boosts;
create policy "anon read feature_boosts" on public.feature_boosts
  for select using (true);
create policy "anon insert feature_boosts" on public.feature_boosts
  for insert with check (true);
create policy "anon update feature_boosts" on public.feature_boosts
  for update using (true) with check (true);

-- shipped_features — read-only from the public site.
drop policy if exists "anon read shipped_features" on public.shipped_features;
create policy "anon read shipped_features" on public.shipped_features
  for select using (true);
