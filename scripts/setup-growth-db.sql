-- =====================================================================
-- Personas — growth tables (shared persona gallery + preset catalog)
-- ---------------------------------------------------------------------
-- Run once in the Supabase SQL editor for the project that backs
-- NEXT_PUBLIC_SUPABASE_URL (or `npm run db:migrate:growth`). The
-- /api/personas/* and /api/presets/* routes read & write these with the
-- anon key, so the RLS policies below permit anonymous read of PUBLIC
-- rows + insert (publish). Mutating a row's install_count goes through a
-- SECURITY DEFINER RPC so anon can't rewrite arbitrary columns.
--
-- Idempotent: safe to re-run.
-- =====================================================================

-- ── shared_personas — a published, shareable persona (the gallery) ────
-- `bundle` is a `.persona.json` export envelope (the same versioned shape
-- the desktop import/export uses), stored verbatim so "Open in Personas"
-- / download round-trips losslessly.
create table if not exists public.shared_personas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  icon text,
  color text,
  category text,
  bundle jsonb not null,
  publisher text check (publisher is null or char_length(publisher) <= 64),
  install_id text,
  install_count integer not null default 0,
  status text not null default 'public'
    check (status in ('public', 'flagged', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shared_personas_status_created
  on public.shared_personas (status, created_at desc);
create index if not exists idx_shared_personas_install_count
  on public.shared_personas (install_count desc);
create index if not exists idx_shared_personas_install_id
  on public.shared_personas (install_id);

-- ── shared_presets — a published team blueprint (the preset catalog) ──
-- `blueprint` is the sanitized team graph (members + roles + connection
-- graph, no credentials), the same shape the desktop preset adoption reads.
create table if not exists public.shared_presets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  icon text,
  color text,
  member_count integer not null default 0,
  blueprint jsonb not null,
  publisher text check (publisher is null or char_length(publisher) <= 64),
  install_id text,
  install_count integer not null default 0,
  status text not null default 'public'
    check (status in ('public', 'flagged', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shared_presets_status_created
  on public.shared_presets (status, created_at desc);
create index if not exists idx_shared_presets_install_count
  on public.shared_presets (install_count desc);

-- ── atomic install counters (SECURITY DEFINER so anon can bump exactly
--    one column without an UPDATE policy that would let it rewrite rows) ─
create or replace function public.increment_shared_persona_installs(p_slug text)
  returns integer
  language sql
  security definer
  set search_path = public
as $$
  update public.shared_personas
     set install_count = install_count + 1, updated_at = now()
   where slug = p_slug and status = 'public'
  returning install_count;
$$;

create or replace function public.increment_shared_preset_installs(p_slug text)
  returns integer
  language sql
  security definer
  set search_path = public
as $$
  update public.shared_presets
     set install_count = install_count + 1, updated_at = now()
   where slug = p_slug and status = 'public'
  returning install_count;
$$;

-- ── RLS — anon reads PUBLIC rows + may insert (publish). No anon UPDATE/
--    DELETE policy: edits are limited to the install RPCs above. ─────────
alter table public.shared_personas enable row level security;
alter table public.shared_presets enable row level security;

drop policy if exists "anon read public shared_personas" on public.shared_personas;
drop policy if exists "anon insert shared_personas" on public.shared_personas;
create policy "anon read public shared_personas" on public.shared_personas
  for select using (status = 'public');
create policy "anon insert shared_personas" on public.shared_personas
  for insert with check (true);

drop policy if exists "anon read public shared_presets" on public.shared_presets;
drop policy if exists "anon insert shared_presets" on public.shared_presets;
create policy "anon read public shared_presets" on public.shared_presets
  for select using (status = 'public');
create policy "anon insert shared_presets" on public.shared_presets
  for insert with check (true);

grant execute on function public.increment_shared_persona_installs(text) to anon;
grant execute on function public.increment_shared_preset_installs(text) to anon;
