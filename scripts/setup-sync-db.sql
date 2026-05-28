-- =====================================================================
-- Personas — desktop → cloud sync schema (Phase 1 + Phase 2 scaffold)
-- ---------------------------------------------------------------------
-- Run once in the Supabase SQL editor for the project that backs
-- NEXT_PUBLIC_SUPABASE_URL. The SAME project must back the desktop app's
-- SUPABASE_URL so that a given Google account resolves to the same
-- auth.users row (auth.uid()) on both surfaces.
--
-- SECURITY MODEL (read before changing any policy):
--   * The desktop app and the web dashboard both connect with the PUBLIC
--     anon key + the signed-in user's own Google-OAuth JWT.
--   * No secret is hidden in any client. Isolation is enforced ENTIRELY by
--     Row-Level Security keyed on auth.uid(). A client can only ever read
--     or write rows where user_id = auth.uid().
--   * The service_role key is NEVER shipped in the desktop or web client.
--     Any privileged/cross-user work belongs in an Edge Function.
--   * These tables hold a *read projection* of the user's local data. They
--     deliberately contain NO connector-vault secrets: the desktop sync
--     writer omits every encrypted field (workspace_sync snapshot pattern),
--     so ciphertext has no column to ride on here.
--
-- Column naming mirrors the desktop SQLite schema (snake_case) so the
-- desktop writer is a near 1:1 projection. The web `supabaseApi` maps
-- snake_case → the camelCase shapes in src/lib/types.ts on read.
-- =====================================================================

-- ── Helper: every synced table is user-scoped + device-tagged ─────────
-- user_id defaults to auth.uid() so the desktop writer never sends it;
-- RLS still enforces it. device_id records which desktop produced the row
-- (a user may sync from multiple machines).

-- =====================================================================
-- PHASE 1 — synced read projections
-- =====================================================================

-- ── devices: registry of the user's desktop installs ─────────────────
create table if not exists public.synced_devices (
  device_id     text primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text,
  platform      text,
  app_version   text,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_synced_devices_user on public.synced_devices (user_id);

-- ── personas ─────────────────────────────────────────────────────────
create table if not exists public.synced_personas (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  project_id         text not null default 'default',
  name               text not null,
  description        text,
  system_prompt      text not null default '',
  structured_prompt  text,
  icon               text,
  color              text,
  enabled            boolean not null default true,
  max_concurrent     integer not null default 1,
  timeout_ms         integer not null default 300000,
  model_profile      text,
  max_budget_usd     numeric,
  max_turns          integer,
  design_context     text,
  home_team_id       text,
  template_category  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_personas_user on public.synced_personas (user_id);
create index if not exists idx_synced_personas_user_updated on public.synced_personas (user_id, updated_at desc);

-- ── executions (append-heavy; the dashboard's busiest table) ──────────
-- status allows the desktop's 6-value set incl. 'incomplete'; the web
-- read-mapper coalesces 'incomplete' → 'failed' (web type has 5 values).
create table if not exists public.synced_executions (
  id                     text primary key,
  user_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id              text,
  persona_id             text not null,
  trigger_id             text,
  use_case_id            text,
  status                 text not null default 'queued'
                         check (status in ('queued','running','completed','failed','incomplete','cancelled')),
  input_data             text,
  output_data            text,
  claude_session_id      text,
  model_used             text,
  input_tokens           integer not null default 0,
  output_tokens          integer not null default 0,
  cost_usd               numeric not null default 0,
  error_message          text,
  duration_ms            integer,
  retry_of_execution_id  text,
  retry_count            integer not null default 0,
  started_at             timestamptz,
  completed_at           timestamptz,
  created_at             timestamptz not null default now(),
  synced_at              timestamptz not null default now()
);
create index if not exists idx_synced_executions_user_created on public.synced_executions (user_id, created_at desc);
create index if not exists idx_synced_executions_user_persona on public.synced_executions (user_id, persona_id);
create index if not exists idx_synced_executions_user_status on public.synced_executions (user_id, status);

-- ── events (payload omitted by default — see SECURITY MODEL note 7) ───
create table if not exists public.synced_events (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  project_id         text not null default 'default',
  event_type         text not null,
  source_type        text not null,
  source_id          text,
  target_persona_id  text,
  payload            text,            -- desktop writer pushes NULL or a sanitized subset; never ciphertext
  status             text not null default 'pending',
  error_message      text,
  processed_at       timestamptz,
  use_case_id        text,
  created_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_events_user_created on public.synced_events (user_id, created_at desc);
create index if not exists idx_synced_events_user_type on public.synced_events (user_id, event_type);

-- ── manual reviews (first-class — replaces the web's event-derived hack) ─
create table if not exists public.synced_manual_reviews (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  execution_id       text not null,
  persona_id         text not null,
  title              text not null,
  description        text,
  severity           text not null default 'info',     -- info | warning | critical
  context_data       text,
  suggested_actions  text,
  status             text not null default 'pending',   -- pending | approved | rejected | resolved
  reviewer_notes     text,
  resolved_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_reviews_user_status on public.synced_manual_reviews (user_id, status);
create index if not exists idx_synced_reviews_user_created on public.synced_manual_reviews (user_id, created_at desc);

-- ── messages (outbound persona notifications) ─────────────────────────
create table if not exists public.synced_messages (
  id            text primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id     text,
  persona_id    text not null,
  execution_id  text,
  title         text,
  content       text not null,
  content_type  text not null default 'text',
  priority      text not null default 'normal',
  is_read       boolean not null default false,
  metadata      text,
  thread_id     text,
  created_at    timestamptz not null default now(),
  read_at       timestamptz,
  synced_at     timestamptz not null default now()
);
create index if not exists idx_synced_messages_user_created on public.synced_messages (user_id, created_at desc);
create index if not exists idx_synced_messages_user_thread on public.synced_messages (user_id, thread_id);

-- ── metrics snapshots (pre-aggregated daily rollup, 1 row/persona/day) ─
create table if not exists public.synced_metrics_snapshots (
  id                     text primary key,
  user_id                uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id              text,
  persona_id             text not null,
  -- stored as text (mirrors the desktop's TEXT column) to avoid date-cast
  -- failures if the desktop ever writes a full timestamp rather than YYYY-MM-DD
  snapshot_date          text not null,
  total_executions       integer not null default 0,
  successful_executions  integer not null default 0,
  failed_executions      integer not null default 0,
  total_cost_usd         numeric not null default 0,
  total_input_tokens     integer not null default 0,
  total_output_tokens    integer not null default 0,
  avg_duration_ms        numeric not null default 0,
  events_emitted         integer not null default 0,
  events_consumed        integer not null default 0,
  messages_sent          integer not null default 0,
  created_at             timestamptz not null default now(),
  synced_at              timestamptz not null default now()
);
create index if not exists idx_synced_metrics_user_date on public.synced_metrics_snapshots (user_id, snapshot_date);
create index if not exists idx_synced_metrics_user_persona on public.synced_metrics_snapshots (user_id, persona_id);

-- ── tool usage (powers observability › usage view) ────────────────────
create table if not exists public.synced_tool_usage (
  id                text primary key,
  user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id         text,
  execution_id      text not null,
  persona_id        text not null,
  tool_name         text not null,
  invocation_count  integer not null default 1,
  created_at        timestamptz not null default now(),
  synced_at         timestamptz not null default now()
);
create index if not exists idx_synced_tool_usage_user on public.synced_tool_usage (user_id, created_at desc);
create index if not exists idx_synced_tool_usage_user_tool on public.synced_tool_usage (user_id, tool_name);

-- ── persona memories (knowledge module) ──────────────────────────────
create table if not exists public.synced_memories (
  id                   text primary key,
  user_id              uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id            text,
  persona_id           text not null,
  title                text not null,
  content              text not null,
  category             text,
  source_execution_id  text,
  importance           integer,
  tags                 text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  synced_at            timestamptz not null default now()
);
create index if not exists idx_synced_memories_user_persona on public.synced_memories (user_id, persona_id);
create index if not exists idx_synced_memories_user_updated on public.synced_memories (user_id, updated_at desc);

-- ── learned execution patterns (knowledge clusters) ──────────────────
create table if not exists public.synced_knowledge_patterns (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  persona_id         text not null,
  use_case_id        text,
  knowledge_type     text not null,
  pattern_key        text not null,
  pattern_data       text not null default '{}',
  success_count      integer not null default 0,
  failure_count      integer not null default 0,
  avg_cost_usd       numeric not null default 0,
  avg_duration_ms    numeric not null default 0,
  confidence         numeric not null default 0,
  last_execution_id  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_knowledge_user_persona on public.synced_knowledge_patterns (user_id, persona_id);
create index if not exists idx_synced_knowledge_user_type on public.synced_knowledge_patterns (user_id, knowledge_type);

-- =====================================================================
-- PHASE 2 — approval-gated remote operations (scaffold; not wired yet)
-- ---------------------------------------------------------------------
-- The web writes a request row; the desktop (same user) subscribes via
-- Realtime, materializes a companion-approval card, and only executes
-- LOCALLY after the user explicitly approves. Both sides are the same
-- user, so RLS is the single auth.uid() rule. No execution or credential
-- ever leaves the device.
-- =====================================================================
create table if not exists public.pending_commands (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_device_id text,
  persona_id      text,
  command_type    text not null check (command_type in ('run_persona','cancel_execution')),
  prompt          text,
  params          jsonb,
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected','executing','completed','failed','expired')),
  requested_from  text,            -- 'web' | 'api'
  execution_id    text,            -- set by desktop once it spawns the local run
  error_message   text,
  requested_at    timestamptz not null default now(),
  resolved_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_pending_commands_user_status on public.pending_commands (user_id, status);
create index if not exists idx_pending_commands_device on public.pending_commands (target_device_id, status);

-- =====================================================================
-- Row-Level Security — every table: a user touches only their own rows
-- =====================================================================
alter table public.synced_devices            enable row level security;
alter table public.synced_personas           enable row level security;
alter table public.synced_executions         enable row level security;
alter table public.synced_events             enable row level security;
alter table public.synced_manual_reviews     enable row level security;
alter table public.synced_messages           enable row level security;
alter table public.synced_metrics_snapshots  enable row level security;
alter table public.synced_tool_usage         enable row level security;
alter table public.synced_memories           enable row level security;
alter table public.synced_knowledge_patterns enable row level security;
alter table public.pending_commands          enable row level security;

-- One owner-only policy per table covering all verbs. Re-runnable.
do $$
declare
  t text;
  tables text[] := array[
    'synced_devices','synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_messages','synced_metrics_snapshots',
    'synced_tool_usage','synced_memories','synced_knowledge_patterns','pending_commands'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "owner_all" on public.%I', t);
    execute format(
      'create policy "owner_all" on public.%I
         for all to authenticated
         using (user_id = auth.uid())
         with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- Explicit grants to the authenticated role (RLS still filters rows).
do $$
declare
  t text;
  tables text[] := array[
    'synced_devices','synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_messages','synced_metrics_snapshots',
    'synced_tool_usage','synced_memories','synced_knowledge_patterns','pending_commands'
  ];
begin
  foreach t in array tables loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- =====================================================================
-- Aggregation views (computed dashboard shapes the desktop has no table
-- for). security_invoker = true → the querying user's RLS applies, so
-- each user only ever aggregates their own rows.
-- =====================================================================

-- observability › daily metrics  (→ DailyMetric[])
drop view if exists public.synced_observability_daily;
create view public.synced_observability_daily
  with (security_invoker = true) as
select
  user_id,
  (created_at at time zone 'UTC')::date            as date,
  coalesce(sum(cost_usd), 0)                        as cost,
  count(*)                                          as executions,
  count(*) filter (where status = 'completed')      as successes,
  count(*) filter (where status in ('failed','incomplete','cancelled')) as failures
from public.synced_executions
group by user_id, (created_at at time zone 'UTC')::date;

-- observability › per-persona spend  (→ PersonaSpend[])
drop view if exists public.synced_persona_spend;
create view public.synced_persona_spend
  with (security_invoker = true) as
select
  e.user_id,
  e.persona_id,
  p.name                       as persona_name,
  p.color                      as persona_color,
  coalesce(sum(e.cost_usd), 0) as total_cost,
  count(*)                     as execution_count,
  p.max_budget_usd             as budget_usd
from public.synced_executions e
left join public.synced_personas p
  on p.id = e.persona_id and p.user_id = e.user_id
group by e.user_id, e.persona_id, p.name, p.color, p.max_budget_usd;

-- leaderboard › per-persona aggregate stats  (→ LeaderboardPersona[] + SLA)
-- Powers the Leaderboard radar (reliability / cost / speed / quality / volume)
-- and the SLA module's per-persona success-rate + latency objectives. All
-- derived from synced_executions; the web layer normalizes these raw counts
-- into the 0-100 radar axes and applies app-defined SLA targets on top.
drop view if exists public.synced_leaderboard;
create view public.synced_leaderboard
  with (security_invoker = true) as
select
  e.user_id,
  e.persona_id,
  p.name                                                  as persona_name,
  p.color                                                 as persona_color,
  count(*)                                                as total_executions,
  count(*) filter (where e.status = 'completed')          as successful_executions,
  count(*) filter (where e.status in ('failed','incomplete','cancelled')) as failed_executions,
  coalesce(sum(e.retry_count), 0)                         as total_retries,
  coalesce(sum(e.cost_usd), 0)                            as total_cost_usd,
  coalesce(avg(e.duration_ms), 0)                         as avg_duration_ms
from public.synced_executions e
left join public.synced_personas p
  on p.id = e.persona_id and p.user_id = e.user_id
group by e.user_id, e.persona_id, p.name, p.color;

grant select on public.synced_observability_daily to authenticated;
grant select on public.synced_persona_spend to authenticated;
grant select on public.synced_leaderboard to authenticated;

-- =====================================================================
-- Realtime — publish row changes on the busiest synced tables so the web
-- dashboard can subscribe live (useSyncedRealtime) instead of polling.
-- RLS still applies on the Realtime socket: each user only receives changes
-- to their own rows. Idempotent — only adds a table not already published.
-- =====================================================================
do $$
declare
  t text;
  tables text[] := array[
    'synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_devices'
  ];
begin
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
