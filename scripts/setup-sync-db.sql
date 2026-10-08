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
  core_profile       text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_personas_user on public.synced_personas (user_id);
create index if not exists idx_synced_personas_user_updated on public.synced_personas (user_id, updated_at desc);
-- Living-agent Core (PersonaCore JSON: dials + identity/voice/principles).
-- Operator-owned, secret-free by design — safe in the read projection.
-- CREATE TABLE IF NOT EXISTS does not alter an already-deployed table, so
-- existing tenants pick the column up via this idempotent ALTER on re-run
-- of `npm run db:migrate:sync`.
alter table public.synced_personas add column if not exists core_profile text;

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
  execution_id       text,
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
-- A council Approval has no execution; the table already deployed with NOT NULL, so relax it in place.
alter table public.synced_manual_reviews alter column execution_id drop not null;
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

-- ── healing issues (overview health panel + home "open alerts") ───────
create table if not exists public.synced_healing_issues (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  persona_id         text not null,
  execution_id       text,
  title              text not null,
  description        text,
  severity           text not null default 'low',
  category           text not null default 'config',
  suggested_fix      text,
  auto_fixed         boolean not null default false,
  is_circuit_breaker boolean not null default false,
  status             text not null default 'open',
  created_at         timestamptz not null default now(),
  resolved_at        timestamptz,
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_healing_user_status on public.synced_healing_issues (user_id, status);
create index if not exists idx_synced_healing_user_created on public.synced_healing_issues (user_id, created_at desc);

-- ── triggers (upcoming routines). config omitted by the writer — webhook
--    configs can hold secret tokens; only schedule timing is projected. ──
create table if not exists public.synced_triggers (
  id                 text primary key,
  user_id            uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id          text,
  persona_id         text not null,
  trigger_type       text not null,
  enabled            boolean not null default true,
  last_triggered_at  timestamptz,
  next_trigger_at    timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  synced_at          timestamptz not null default now()
);
create index if not exists idx_synced_triggers_user on public.synced_triggers (user_id);
create index if not exists idx_synced_triggers_next on public.synced_triggers (user_id, next_trigger_at);

-- ── fleet dispatch queue (the twelfth synced table) ───────────────────
-- Mirrors the desktop writer (personas src-tauri/src/cloud/sync/rows.rs,
-- `SyncedFleetQueueRow`). NOT cursor-synced: each pass upserts the whole
-- queued set stamped with its own `synced_at`, then deletes this device's
-- rows with an older stamp. `synced_at` is therefore written BY THE DESKTOP
-- (never defaulted, never touched by the trigger below) and is the web's
-- staleness signal: an ordering older than ~45s must not be shown as live.
-- Deliberately absent: cwd, spawn args, claude session id, budget columns.
create table if not exists public.synced_fleet_queue (
  user_id        uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  device_id      text        not null,
  session_id     text        not null,
  rank           integer     not null,
  lane           integer,
  reserved_band  integer,
  origin         text        not null,
  state          text        not null,
  label          text        not null,
  persona_id     text,
  goal_id        text,
  queued_at_ms   bigint      not null,
  not_before_ms  bigint,
  synced_at      timestamptz not null,
  primary key (user_id, device_id, session_id)
);
create index if not exists idx_synced_fleet_queue_user_rank on public.synced_fleet_queue (user_id, device_id, rank);

-- =====================================================================
-- PHASE 2 — approval-gated remote operations
-- ---------------------------------------------------------------------
-- The web inserts a request row (status 'pending', target_device_id). The
-- desktop leader POLLS every ~15s (personas src-tauri/src/cloud/remote_commands.rs;
-- not Realtime), raises an approval card, and runs nothing until the
-- operator approves. Approve claims the row with a compare-and-set
-- (pending -> executing, scoped to the device), so a double approval is a
-- no-op. Final states: completed (execution_id for run_persona, result_ref
-- for queue verbs) | failed (error_message) | rejected (operator, or an
-- unknown command_type: 'unsupported_command_type: ...') | expired (the
-- desktop expires rows whose requested_at is older than 1h).
-- Payloads: run_persona uses persona_id + prompt; queue verbs carry
-- camelCase JSON in `prompt` and always name session ids, never ranks:
--   queue_reorder  {"sessionIds":[...]}  head first, at least 2
--   queue_set_lane {"sessionId":"...","lane":n|null}
--   queue_cancel   {"sessionId":"..."}
-- `params` and `expires_at` are reserved; the desktop does not read them.
-- Both sides are the same user, so RLS is the single auth.uid() rule. No
-- execution or credential ever leaves the device.
-- =====================================================================
create table if not exists public.pending_commands (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_device_id text,
  persona_id      text,
  command_type    text not null,   -- allowed set: see the constraint below
  prompt          text,
  params          jsonb,
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected','executing','completed','failed','expired')),
  requested_from  text,            -- 'web' | 'api'
  execution_id    text,            -- set by desktop once it spawns the local run
  result_ref      text,            -- set by desktop when a non-run verb completes
  error_message   text,
  requested_at    timestamptz not null default now(),
  resolved_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_pending_commands_user_status on public.pending_commands (user_id, status);
-- Idempotent upgrades for an already-deployed table: the result column the
-- desktop writes for queue verbs, and the command set it accepts.
alter table public.pending_commands add column if not exists result_ref text;
-- The command set. Widened IN PLACE for command contract v1 (see the next
-- block): a second, narrower re-add earlier in this file would fail
-- validation on a re-run once v1 rows exist.
-- 'chat_send' ships later (M9) but is allowed now so the desktop's refusal
-- path is exercised. 'review_decide' (M20, 2026-10-07): a manual review's
-- verdict from the web, run by the desktop's shared decision chokepoint.
alter table public.pending_commands drop constraint if exists pending_commands_command_type_check;
alter table public.pending_commands add constraint pending_commands_command_type_check
  check (command_type in ('run_persona','cancel_execution','pause_persona','resume_persona','chat_send',
                          'review_decide','queue_reorder','queue_set_lane','queue_cancel'));
create index if not exists idx_pending_commands_device on public.pending_commands (target_device_id, status);

-- =====================================================================
-- PHASE 2 / command contract v1 — trusted controllers
-- (docs/concepts/mobile-revival/PHASE2-SPEC.md sections 2.1, 3.2, 4.1;
-- owner-approved 2026-10-06, PLAN.md M16)
-- ---------------------------------------------------------------------
-- A paired phone (a "controller") holds a non-extractable Ed25519 key. Its
-- commands carry `envelope` (the exact signed JSON text) + `signature`
-- (base64url Ed25519 over the envelope bytes). The desktop verifies the
-- bytes against its OWN local trust list (settings key `cloud_controllers`)
-- and parses the command from the envelope, never from the row's columns:
-- jsonb reorders keys, and every holder of the user's JWT can write a row.
-- The row's other columns stay for filters and display.
-- v1 rows also use the reserved `params` (camelCase, = envelope.params) and
-- `expires_at` (= requested_at + 60 s, = envelope.exp: commands never queue).
-- =====================================================================
alter table public.pending_commands add column if not exists controller_id uuid;
alter table public.pending_commands add column if not exists envelope      text;   -- exact signed bytes (JSON text)
alter table public.pending_commands add column if not exists signature     text;   -- base64url Ed25519 over envelope
alter table public.pending_commands add column if not exists result        jsonb;  -- verb-specific outcome
create index if not exists idx_pending_commands_user_requested on public.pending_commands (user_id, requested_at desc);

-- Hardening (not a loosening): a client may only CREATE pending rows. Every
-- later state is written by the desktop (or, for 'expired', by the web on a
-- row still pending 15 s past expires_at) through an UPDATE.
create or replace function public.pending_commands_insert_guard() returns trigger language plpgsql as $$
begin
  if new.status <> 'pending' then raise exception 'pending_commands: insert must be status=pending'; end if;
  return new;
end $$;
drop trigger if exists trg_pending_commands_insert_guard on public.pending_commands;
create trigger trg_pending_commands_insert_guard before insert on public.pending_commands
  for each row execute function public.pending_commands_insert_guard();

-- Replay guard (security scan 5e21d618, finding 1 residual). RLS is one
-- owner_all rule, so any holder of the user's JWT may UPDATE a row: a finished
-- signed command could be set back to 'pending' and, inside its envelope
-- window, run again after a desktop restart (the desktop's replay ledger is
-- process memory). A command never returns to pending and a finished one is
-- final. Same-state writes (result, updated_at ...) pass. Legit writers: the
-- desktop claims pending -> executing and resolves pending|executing ->
-- completed|failed|rejected|expired; the web expires pending -> expired;
-- 'approved' stays for the legacy flow. None of them is refused.
create or replace function public.pending_commands_update_guard() returns trigger language plpgsql as $$
begin
  if new.status = old.status then return new; end if;
  if new.status = 'pending' then
    raise exception 'pending_commands: a command never returns to pending';
  end if;
  if old.status in ('completed','failed','rejected','expired') then
    raise exception 'pending_commands: a % command is final', old.status;
  end if;
  return new;
end $$;
drop trigger if exists trg_pending_commands_update_guard on public.pending_commands;
create trigger trg_pending_commands_update_guard before update on public.pending_commands
  for each row execute function public.pending_commands_update_guard();

-- ── command_controllers: phones paired to a desktop ──────────────────
-- Pairing ceremony: the desktop shows a QR of
-- /dashboard/settings#pair=<pairing_id>.<secret>; the phone generates its key
-- and inserts a 'pending' row whose `proof` =
-- base64url(HMAC-SHA256(secret, pairing_id|controller_id|public_key)); the
-- desktop verifies the proof, adds the controller to its local trust list,
-- and PATCHes the row 'active'. This table is a mailbox, NOT the trust list:
-- the desktop's local list is authoritative, and no secret is stored here.
-- `revoke_requested_at` is the web's "unpair this phone" request; the
-- desktop honours it at its next poll and writes 'revoked'.
create table if not exists public.command_controllers (
  controller_id   uuid primary key,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id       text not null,                 -- the desktop this phone is paired to
  pairing_id      uuid not null unique,
  name            text not null,                 -- "iPhone · Safari", from the UA; user-editable
  public_key      text not null,                 -- base64url, raw 32-byte Ed25519
  proof           text not null,                 -- base64url HMAC-SHA256(secret, pairing_id|controller_id|public_key)
  status          text not null default 'pending' check (status in ('pending','active','refused','revoked')),
  revoke_requested_at timestamptz,
  created_at      timestamptz not null default now(),
  activated_at    timestamptz,
  revoked_at      timestamptz,
  last_command_at timestamptz
);
create index if not exists idx_command_controllers_user on public.command_controllers (user_id);

-- ── Server-stamped heartbeat ─────────────────────────────────────────
-- The web's online gate is `now - synced_devices.last_seen_at <= 120 s`.
-- The desktop stamps last_seen_at with ITS clock; stamping it here instead
-- leaves only the (NTP-synced) phone clock in the comparison.
create or replace function public.stamp_device_seen() returns trigger language plpgsql as $$
begin new.last_seen_at := now(); return new; end $$;
drop trigger if exists trg_stamp_device_seen on public.synced_devices;
create trigger trg_stamp_device_seen before insert or update on public.synced_devices
  for each row execute function public.stamp_device_seen();

-- =====================================================================
-- PHASE 2 / new synced data — notes and chat
-- (docs/concepts/mobile-revival/PHASE2-SPEC.md sections 5.1, 5.2; PLAN.md
-- M16, M18, M19)
-- ---------------------------------------------------------------------
-- These two classes are free text the user typed (and, for chat, replies
-- that may quote what personas read through their connectors). The desktop
-- pushes them ONLY when the matching per-class toggle ("Sync notes", "Sync
-- chats") is on; both default OFF, also for users who already sync. Every
-- text field is masked token by token for secret-looking values and capped
-- (notes body 16 KB, chat content 32 KB, truncated with a marker) BEFORE it
-- leaves the machine. Turning a toggle off deletes this device's rows.
-- =====================================================================

-- ── notes: the Notepad / Quest Log goals (read-only on the phone) ─────
-- Full-set replace, like synced_fleet_queue: each push upserts the whole
-- non-archived set stamped with the desktop's own `synced_at`, then deletes
-- this device's rows with an older stamp (a note delete has no tombstone).
-- `synced_at` is therefore written BY THE DESKTOP, never defaulted, and is
-- NOT re-stamped by touch_synced_at. Archived notes are not synced.
-- Deliberately absent: dev_projects.root_path (a local filesystem path),
-- fleet_session_id, dispatch_key, agent_id, milestone_id, raw result_json,
-- and the comment thread bodies (only two counts ride along).
create table if not exists public.synced_notes (
  id              text primary key,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id       text not null,
  project_name    text,              -- dev_projects.name only; NEVER root_path
  title           text not null,
  body_md         text not null default '',   -- redact_text + cap 16 KB (truncated with a marker)
  status          text not null check (status in ('draft','published','in_progress','completed','scoped','cut','shipped')),
  order_index     integer not null default 0,
  dispatch_target text,              -- 'fleet' | 'athena_goals'
  result_summary  text,              -- the `summary` field of result_json only (no artifact paths)
  open_reviews    integer not null default 0,  -- count(dev_note_comments where verdict='pending')
  unread_comments integer not null default 0,
  published_at timestamptz, started_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null, updated_at timestamptz not null,
  synced_at timestamptz not null     -- desktop-stamped reconcile key (like synced_fleet_queue)
);
create index if not exists idx_synced_notes_user_device on public.synced_notes (user_id, device_id);

-- ── chat: one pair of tables for both kinds of thread ────────────────
-- thread_kind = 'athena'  : Athena's companion conversations (desktop user_db
--                           `companion_session` + its user/assistant episodes).
--                           Ships first (PLAN.md M18).
-- thread_kind = 'persona' : chat with a persona (`chat_session_context` +
--                           `chat_messages`). Ships after the chat turn moves
--                           into the desktop's Rust core.
-- persona_id is NOT NULL for both kinds: an Athena row carries the fixed
-- sentinel 'athena' (desktop persona ids are UUIDs, so it cannot collide),
-- and the CHECK below ties the sentinel to the kind both ways. A sentinel
-- rather than NULL keeps every `persona_id=eq.<x>` filter total (a NULL
-- silently matches nothing), and it is the same value a chat_send command
-- to Athena carries in pending_commands.persona_id and envelope.persona.
--
-- The key is (user_id, device_id, thread_kind, <id>), not the bare id the
-- spec drafted: every desktop has an Athena thread named 'default' (and
-- 'athena-notices'), and Athena message ids are 8-character short ids, so a
-- bare-id primary key would collide across devices and across users (and an
-- upsert onto another user's hidden row fails RLS instead of inserting).
-- Only user and assistant turns are synced: system rows, tool rows, forwarded
-- synthetic prompts and machine correlator records never leave the device.
-- Not synced either: summaries, working memory, prompt hashes,
-- claude_session_id, message metadata, archived threads.
create table if not exists public.synced_chat_sessions (
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id    text not null,
  thread_kind  text not null default 'persona' check (thread_kind in ('persona','athena')),
  session_id   text not null,
  persona_id   text not null,      -- the persona; the sentinel 'athena' for Athena threads
  title        text,
  chat_mode    text,               -- persona chat mode; NULL for Athena
  origin       text,               -- Athena: 'user' | 'forwarded' | 'proactive'; NULL for persona
  pinned       boolean not null default false,
  created_at   timestamptz not null,
  updated_at   timestamptz not null,   -- last activity in the thread
  synced_at    timestamptz not null default now(),
  primary key (user_id, device_id, thread_kind, session_id),
  constraint synced_chat_sessions_athena_sentinel check ((thread_kind = 'athena') = (persona_id = 'athena'))
);
create index if not exists idx_synced_chat_sessions_user_updated
  on public.synced_chat_sessions (user_id, thread_kind, updated_at desc);

create table if not exists public.synced_chat_messages (
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id    text not null,
  thread_kind  text not null default 'persona' check (thread_kind in ('persona','athena')),
  id           text not null,
  persona_id   text not null,      -- = the session's persona_id ('athena' for Athena)
  session_id   text not null,
  role         text not null check (role in ('user','assistant')),   -- system/tool rows are NOT synced
  content      text not null,      -- redact_text + cap 32 KB (truncated with a marker)
  execution_id text,               -- persona chat only; NULL for Athena
  created_at   timestamptz not null,
  synced_at    timestamptz not null default now(),
  primary key (user_id, device_id, thread_kind, id),
  constraint synced_chat_messages_athena_sentinel check ((thread_kind = 'athena') = (persona_id = 'athena'))
);
create index if not exists idx_synced_chat_msgs_session
  on public.synced_chat_messages (user_id, device_id, thread_kind, session_id, created_at);

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
alter table public.synced_healing_issues     enable row level security;
alter table public.synced_triggers           enable row level security;
alter table public.synced_fleet_queue        enable row level security;
alter table public.pending_commands          enable row level security;
alter table public.command_controllers       enable row level security;
alter table public.synced_notes              enable row level security;
alter table public.synced_chat_sessions      enable row level security;
alter table public.synced_chat_messages      enable row level security;

-- One owner-only policy per table covering all verbs. Re-runnable.
do $$
declare
  t text;
  tables text[] := array[
    'synced_devices','synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_messages','synced_metrics_snapshots',
    'synced_tool_usage','synced_memories','synced_knowledge_patterns',
    'synced_healing_issues','synced_triggers','synced_fleet_queue','pending_commands',
    'command_controllers','synced_notes','synced_chat_sessions','synced_chat_messages'
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
    'synced_tool_usage','synced_memories','synced_knowledge_patterns',
    'synced_healing_issues','synced_triggers','synced_fleet_queue','pending_commands',
    'command_controllers','synced_notes','synced_chat_sessions','synced_chat_messages'
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
-- synced_at freshness — the desktop's upserts never send synced_at, so on
-- the cursor tables an update kept the FIRST insert's stamp. This trigger
-- re-stamps every update so `synced_at` means "last written by the
-- desktop". synced_fleet_queue and synced_notes are excluded: their stamp
-- is the desktop's reconcile key and must stay exactly what it sent.
-- =====================================================================
create or replace function public.touch_synced_at() returns trigger
  language plpgsql as $$
begin
  new.synced_at := now();
  return new;
end $$;

do $$
declare
  t text;
  tables text[] := array[
    'synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_messages','synced_metrics_snapshots',
    'synced_tool_usage','synced_memories','synced_knowledge_patterns',
    'synced_healing_issues','synced_triggers',
    'synced_chat_sessions','synced_chat_messages'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists trg_touch_synced_at on public.%I', t);
    execute format(
      'create trigger trg_touch_synced_at before update on public.%I
         for each row execute function public.touch_synced_at()', t);
  end loop;
end $$;

-- =====================================================================
-- Realtime — publish row changes so the web dashboard can subscribe live
-- (useSyncedRealtime) instead of polling: the busiest synced tables, the
-- inbox-style tables, the fleet queue, pending_commands (so the web can
-- follow a command from pending to its outcome), and the notes and chat
-- tables (a chat_send reply arrives as a synced_chat_messages insert).
-- RLS still applies on the Realtime socket: each user only receives changes
-- to their own rows. Idempotent — only adds a table not already published.
-- =====================================================================
do $$
declare
  t text;
  tables text[] := array[
    'synced_personas','synced_executions','synced_events',
    'synced_manual_reviews','synced_devices','synced_messages',
    'synced_healing_issues','synced_fleet_queue','pending_commands',
    'command_controllers','synced_notes','synced_chat_sessions','synced_chat_messages'
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
