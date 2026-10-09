# /m revival, phase 2: the mobile command plane (build spec, 2026-10-06)

This is a contract to build against, not a survey. It sits on [PHASE2-SURVEY.md](PHASE2-SURVEY.md), which maps the
ground, and on the owner decisions below. Every claim about existing code carries an anchor.

**Trees read (read-only):**
- `web:` = `personas-web` `revamp/stage-fit` @ `02a0273`
- `spa:` = the `dashboard/spa` worktree `C:/t/dash-spa` @ `93c322d`
- `desk:` = desktop `C:/Users/kazda/kiro/personas` @ `c4991218e9`. Nothing in the files cited here changed since `340964d1f8`, where reading started.

**Desktop shorthands:** `rc.rs` = `desk:src-tauri/src/cloud/remote_commands.rs`, `sync/mod.rs` and `rows.rs` = `desk:src-tauri/src/cloud/sync/{mod,rows}.rs`, `cdc.rs` = `desk:src-tauri/db/src/cdc.rs`, `sql` = `web:scripts/setup-sync-db.sql`.

## Owner decisions this spec implements

| # | Decision (2026-10-06) | Where it lands |
|---|---|---|
| D1 | A paired device is trusted: its commands run without per-command desktop approval | §3 (**policy-loosening**) |
| D2 | v1 actions: pause/resume persona, cancel a running execution, plus the existing `run_persona`. Sync Notes (goal management) and agent chat | §1, §2, §5 |
| D3 | Production runs on the live Supabase plane | §6.1 |
| D4 | Actions are blocked when the desktop is offline. Nothing is queued | §4 |
| D5 | The mobile dashboard is phone layouts of `/dashboard/*`, not `/m/<view>` | §6 |
| M6/M7 | Agent management is the core. The download CTA shows only when the user cannot sync | §4.3 |

**Items marked SIGN-OFF need the owner's explicit approval:** schema changes, more data leaving the machine, and trust or policy changes.

---

## 1. Desktop ground truth for each v1 capability

### 1.1 Pause / resume a persona

**What exists.** The desktop has no "paused" state for a persona. Pause means `personas.enabled = 0`, through one dedicated command.

| Layer | Anchor | Behaviour |
|---|---|---|
| Tauri command | `desk:src-tauri/src/commands/core/personas.rs:129-146` `set_persona_enabled(persona_id, enabled) -> Persona` | Runs the auth check, then the repo call. On an OFF→ON change it calls `engine::subscription::request_wake`. |
| Repo | `desk:src-tauri/db/src/repos/core/personas.rs:858-883` `set_enabled -> Option<bool>` | One `Immediate` transaction: read, compare, `UPDATE personas SET enabled=?, updated_at=datetime('now')`. It returns `None` when the value didn't change, so the call is **naturally idempotent**. |
| What pause stops | `desk:src-tauri/db/src/repos/resources/triggers/scheduling.rs:135-143` | The due-trigger query joins `p.enabled = 1`, so schedule triggers stop firing. The attention loop's roster uses the same join (the doc comment at `desk:src-tauri/db/src/repos/core/personas.rs:843-848`). |
| What pause does **not** stop | `desk:src-tauri/src/commands/execution/executions.rs:207-243` | A manual run never checks `persona.enabled`, so a paused persona can still be run by hand. **A running execution keeps running**: pause doesn't cancel it (that is §1.2). |
| Project gate | `executions.rs:230-243`, `desk:src/features/fleet/monitor/grid/PersonaTile.tsx:108-120` | When a persona's dev project is switched off, nothing in it runs, and the desktop UI **disables** the Active/Off toggle (`disabled: offProject !== null`). |
| Desktop UI callers | `desk:src/stores/slices/agents/personaSlice.ts:493-504`, `PersonaTile.tsx:117`, `OrchestrationLedger.tsx:147` | All three go through `setPersonaEnabled`. |

**How it reaches the cloud today: it already does.**
- `enabled` is in `PERSONA_COLS` (`rows.rs:482-484`).
- `fetch_personas` uses `updated_at` as its cursor (`rows.rs:572-588`), and `set_enabled` bumps `updated_at`.
- The CDC drain nudges the sync loop for every `personas` mutation (`cdc.rs:380-386`, `"personas" | "persona_executions" | ...`).
- The loop then runs a pass after a 2 s debounce (`sync/mod.rs:600-603`).
- `synced_personas` is Realtime-published (`sql:541-544`), and the web refetches personas on any change (`web:src/hooks/useSyncedRealtime.ts:79-80`).

So the new state is visible on the web about 2-5 s after the desktop applies it.

**Gap.** When the remote handler calls the repo directly, the desktop's own UI learns of the change only through the CDC event `persona-health-changed` (`cdc.rs:228-229`). That event triggers `fetchPersonaSummaries` (`desk:src/lib/eventBridge.ts:898-918`). Verify during M3 that the summaries refresh `enabled`. If they don't, the handler emits a dedicated event.

### 1.2 Cancel a running execution

| Layer | Anchor | Behaviour |
|---|---|---|
| Tauri command | `desk:src-tauri/src/commands/execution/executions.rs:732-756` `cancel_execution(id, caller_persona_id)` | Loads the execution, runs `verify_execution_owner` (`:27-37`, which requires the persona to match), then calls the engine. |
| Engine | `desk:src-tauri/src/engine/execution.rs:1208-1300` `ExecutionEngine::cancel_execution(&id, &pool, Some(persona_id)) -> bool` | A **queued** execution is removed from the queue and written `Cancelled` with "Cancelled while queued". A **running** one goes through four steps: set the cancel flag, write `cancelled` only if still running, kill the child PID, and give the task a 5 s grace before aborting. `false` means it wasn't in the engine; the DB status was updated anyway. |
| Remote today | `rc.rs:105-111`, `:258-282` | `cancel_execution` is in the SQL CHECK (`sql:374-375`) but not in `is_known_command_type`, so the desktop **rejects** it with `unsupported_command_type`. |

**How it reaches the cloud.**
- `status` is in `EXECUTION_COLS` (`rows.rs:486-488`).
- `fetch_executions` uses `created_at` as its cursor, **plus a 24 h re-read window** (`rows.rs:590-606`, `sync/mod.rs:287-291`), so a status change on a row created within 24 h syncs.
- `persona_executions` mutations nudge the sync loop (`cdc.rs:383`).
- `synced_executions` is Realtime-published, and `cancelled` is in its CHECK (`sql:93-94`).

**Known edge:** cancelling an execution that was created more than 24 h ago doesn't sync. That is acceptable for v1, but say so in the UI copy for long runs. Alternatively, M3 adds `updated_at` as the cursor, which needs a desktop column.

### 1.3 `run_persona` (existing)

- **Web insert:** `web:src/lib/supabaseApi.ts:373-404`. It targets the most recently seen device (`:375-381`) and ignores which device owns the persona. That is a multi-device bug; §2.2 fixes it.
- **Desktop:** `rc.rs:455-472` calls `execute_persona_inner(state, app, persona_id, None, cmd.prompt, None, None, None, false)`.
  - The **8th argument is `idempotency_key`, passed as `None`** (`rc.rs:467`).
  - The engine already dedupes on that key (`executions.rs:488-500`, `create_with_idempotency_reporting`).
  - v1 passes the command id there.

### 1.4 The Notes module (goal management)

**What it is.** The desktop "Notes" are the **Notepad**: the footer toggle, labelled "Notes" (`desk:src/i18n/locales/en.json:24312` `tabs_label`). Its overview is the **Quest Log**, where every note is drawn as a *goal*: `QuestZone.goals: DevNote[]` (`desk:src/features/notepad/overview/questlog/questlogModel.ts:13-27`). Module map: `desk:src/features/notepad/CONTEXT.md:1-66`.

**Storage.** Notes live in the main SQLite pool (`state.db`, `desk:src-tauri/src/commands/infrastructure/dev_tools/notepad.rs:55-61`), the same pool the sync engine reads.

| Table | Anchor | Fields |
|---|---|---|
| `dev_notes` | DDL in `desk:src-tauri/db/src/migrations/incremental/e22_dev_notes.rs:41-68`. `e30_dev_notes_milestone.rs` adds `milestone_id` and widens `status`. Model: `desk:src-tauri/core/src/models/dev_tools.rs:2210-2242` | `id, project_id (→dev_projects, SET NULL), milestone_id, title, body_md, status, order_index, dispatch_target ('fleet'\|'athena_goals'), dispatch_key, fleet_session_id, agent_id (always NULL), result_json, published_at, started_at, completed_at, archived_at, created_at, updated_at` |
| `NoteStatus` | `dev_tools.rs:2081-2110` | **Two rails** (CONTEXT.md:79-92). Brainstorm: `draft → published → in_progress → completed`. Plan: `draft → scoped → cut → shipped`. Either rail can go to `archived`. |
| `dev_note_comments` (the per-note thread, with Athena/agent reviews) | `e41_note_comments.rs:44-62` | `note_id, author_kind (operator\|athena\|agent\|system), kind (comment\|review\|system), body_md, ref_kind, ref_id, verdict (pending\|approved\|rejected), created_at, read_at` |
| `dev_projects.name` / `root_path` | `desk:src-tauri/db/src/migrations/schema.rs:1109-1115` | `root_path` is a local filesystem path |

**Cap.** At most 10 notes may occupy a slot (CONTEXT.md:94-100), so the full set is small. Delete is permanent (`desk:src-tauri/db/src/repos/dev/notes.rs:465`), and there is no tombstone.

**Commands** (`notepad.rs:55-470`): list, create, update, set_status, delete, fork, link_milestone, promote, plan summaries, runs, comments, verdicts.

**Reaches the cloud today: no.**
- `dev_notes` isn't in `SYNC_TABLES` (`sync/mod.rs:58-85`).
- It isn't mapped in the CDC router either (`cdc.rs:211-270`). Only `dev_goals`, `dev_milestones`, `dev_milestone_items` and `dev_use_cases` are mapped (`:255-259`), so a note change wakes nothing.

### 1.5 Agent chat conversations

**Two chat systems exist.** v1 targets **persona chat**, the "chat with an agent". Athena is open question Q1.

| | Persona chat (v1 target) | Athena companion (not v1) |
|---|---|---|
| Messages | `chat_messages(id, persona_id → personas CASCADE, session_id, role ∈ user\|assistant\|system\|tool, content, execution_id, metadata, created_at)`: `desk:src-tauri/db/src/migrations/schema.rs:1397-1410` | `companion_turn` ledger, in `user_db`, a separate pool (`desk:src-tauri/db/src/lib.rs:1630-1647`) |
| Threads | `chat_session_context(session_id PK, persona_id, title, summary, system_prompt_hash, working_memory, chat_mode, claude_session_id, created_at, updated_at)`: `schema.rs:1415-1427`, plus `claude_session_id` from `e03_p2p_and_telemetry.rs:462-474`. Sessions are derived from `chat_messages` grouped by `session_id`. | conversations keyed by `conversation_id` |
| Send path | **Orchestrated in the desktop *frontend*, not in Rust.** `desk:src/stores/slices/agents/chatSlice.ts:184-275` runs five steps: (1) `create_chat_message` (user), (2) save the context, (3) build `{_chat:true, latest_message}` with a `SessionResume(claude_session_id)` continuation, or the full transcript on the first turn, (4) `executePersona(...)`, (5) stream via the `execution-output` Tauri events (`:488-500`). Then `finishChatStream` (`:296-360`) writes the **assistant** row only if the run ended `completed`, and stores `claude_session_id`. The Rust commands (`desk:src-tauri/src/commands/core/chat.rs:12-77`) are plain CRUD. | `companion_send_message` is a Rust command end to end (`desk:src-tauri/src/commands/companion/chat.rs:75-90`) |
| Streaming | Yes, token lines over Tauri events, in the desktop process only. The assistant row lands once, at the end. | yes (`companion://stream`) |

**Reaches the cloud today: no.** `chat_messages` isn't in `SYNC_TABLES`, and `table_to_event` doesn't map it (`cdc.rs:211-270`). `synced_messages` (`sql:159-177`) is a different thing: persona *notifications* (`persona_reports`), not chat.


### 1.6 Decide a manual review (M20, added 2026-10-07)

**Ground truth.** The desk's Approve / Reject call the Tauri command `update_manual_review_status(id, status, reviewer_notes)` (`desk:src-tauri/src/commands/design/reviews.rs`). Its body is more than a status write: `manual_repo::update_status` (which also writes the one `learned` memory), then the `MANUAL_REVIEW_RESOLVED` event, `publish_review_decision`, the team-channel bridge, the goal signal, App master probation and ask reactions, and the held-team-step resume loop. **The phone verb must run that whole body**, so it is hoisted into one shared function that the Tauri command and `review_decide` both call; a verb that only wrote the status would leave a held team step blocked and teach the fleet nothing.

**Reaches the cloud today: yes.** `synced_manual_reviews` already mirrors every review with `device_id`, `persona_id`, `status`, `reviewer_notes`, `resolved_at`. The web already reads it (`supabaseApi.ts`, `reviewToEvent`). What was missing is the write: `supabaseApi.updateEvent` is read-only (501), so in live mode a web verdict failed. It now travels as `review_decide` (§2.2).

**Out of v1:** choosing one of the review's `suggested_actions` (the desk's `dispatch_review_action`, which also starts a follow-up run). The phone sends a plain approve or reject.
---

## 2. Command contract v1 (`pending_commands`)

### 2.1 Table changes (Supabase SQL, SIGN-OFF: schema)

These are additive. They are appended to `scripts/setup-sync-db.sql` in the same idempotent style as `:370-376`.

```sql
-- v1 verbs. 'chat_send' ships in M9 but is allowed now so the desktop's refusal path is exercised.
-- 'review_decide' added 2026-10-07 (M20), widened in place in the same statement.
-- 'channel_say' added 2026-10-08 (weekend E): a direction to an App Master persona.
alter table public.pending_commands drop constraint if exists pending_commands_command_type_check;
alter table public.pending_commands add constraint pending_commands_command_type_check
  check (command_type in ('run_persona','cancel_execution','pause_persona','resume_persona','chat_send',
                          'review_decide','channel_say','queue_reorder','queue_set_lane','queue_cancel'));

-- Trust envelope (section 3). The row's other columns stay for filters and display; the envelope is authoritative.
alter table public.pending_commands add column if not exists controller_id uuid;
alter table public.pending_commands add column if not exists envelope      text;   -- exact signed bytes (JSON text)
alter table public.pending_commands add column if not exists signature     text;   -- base64url Ed25519 over envelope
alter table public.pending_commands add column if not exists result        jsonb;  -- verb-specific outcome (2.3)
create index if not exists idx_pending_commands_user_requested on public.pending_commands (user_id, requested_at desc);

-- Hardening (not a loosening): the web may only CREATE pending rows.
create or replace function public.pending_commands_insert_guard() returns trigger language plpgsql as $$
begin
  if new.status <> 'pending' then raise exception 'pending_commands: insert must be status=pending'; end if;
  return new;
end $$;
drop trigger if exists trg_pending_commands_insert_guard on public.pending_commands;
create trigger trg_pending_commands_insert_guard before insert on public.pending_commands
  for each row execute function public.pending_commands_insert_guard();
```

**Reused, not added:**
- `params jsonb` and `expires_at timestamptz` are reserved and unread today (`sql:345,356,365`). v1 starts using them.
- The status CHECK already has every state v1 needs (`sql:357-358`).

### 2.2 Verbs: payload, idempotency, preconditions, result

**Common to every v1 verb:**
- **`id`** is minted **by the web** (`crypto.randomUUID()`) and is the idempotency key. Re-sending the same insert after a network error gets a PK conflict (23505), which the client reads as "already sent".
  - On the desktop, the compare-and-set claim `pending → executing` (`rc.rs:431-447`) makes execution exactly-once.
  - `run_persona` and `chat_send` also pass `id` as `idempotency_key` to `execute_persona_inner` (fixing `rc.rs:467`).
- **`target_device_id` = `synced_personas.device_id` of the persona.** This is the device that owns it, not the most recently seen device (fixes `supabaseApi.ts:375-381`).
- **`expires_at` = `requested_at` + 60 s** (D4: never queue). It is mirrored in the envelope `exp`.
- **`requested_from` = `'web'`**, plus `controller_id`, `envelope` and `signature` (§3).

| Verb | `persona_id` | `params` (camelCase, same as `envelope.params`) | Desktop preconditions (else `failed`/`rejected` + `error_message`) | Desktop call | `result` on `completed` |
|---|---|---|---|---|---|
| `pause_persona` | required | `{}` | persona exists locally → `not_found` | `repo::set_enabled(&db, id, false)` (`personas.rs:858`) | `{"enabled":false,"changed":true\|false}` |
| `resume_persona` | required | `{}` | persona exists; its project is not switched off: `persona_project_disabled` (`desk:src-tauri/db/src/repos/dev/projects.rs:293`) → `project_off: <name>`, same rule as `PersonaTile.tsx:112` | `repo::set_enabled(&db, id, true)`, then on `Some(true)` call `engine::subscription::request_wake` (exactly `personas.rs:142-144`) | `{"enabled":true,"changed":bool}` |
| `cancel_execution` | required | `{"executionId":"<id>"}` | the execution exists and `execution.persona_id == persona_id` (`verify_execution_owner`, `executions.rs:27-37`). If it is already terminal → `completed` with `changed:false` | `state.engine.cancel_execution(&exec_id, &state.db, Some(&persona_id))` (`engine/execution.rs:1214`). This is the same path as the Tauri command at `executions.rs:745-749`. | `{"executionId":"…","changed":bool,"wasQueued":bool}` |
| `run_persona` | required | `{"prompt":"…"}`. The legacy `prompt` column is still filled for older desktops | as today, plus the project gate inside `execute_persona_inner` | `execute_persona_inner(…, input_data=prompt, idempotency_key=Some(id))` | `execution_id` column, as today (`rc.rs:485-487`), and `{"executionId":"…"}` |
| `chat_send` (M9) | required | `{"sessionId":"chat-…"\|null,"message":"…"}` | persona exists; the message is not empty and ≤ 8 KB. **A paused persona is accepted (M21)** | see §5.3 | `{"sessionId":"…","userMessageId":"…","executionId":"…"}`. **It completes when the turn starts**; the reply arrives as data (§5.3) |
| `review_decide` (M20) | required: the review's `persona_id` | `{"reviewId":"…","decision":"approved"\|"rejected","notes":"…"\|null}`; `notes` ≤ 2000 chars. The phone masks the notes with its port `redactText.ts` (`dccf5776`) before signing, so the cloud row never holds a pasted key; the 2000 bound applies to the typed and to the masked notes (`notes_too_long` on the web, counted by code point), and the desk masks again and keeps 500 | the review exists locally AND its `persona_id` equals the envelope's (else `not_found`, never a hint that the id exists elsewhere); `decision` is one of the two (else `invalid_decision`); `reviewId` not a string → `bad_params`, `notes` over 2000 chars → `invalid_notes`. Already decided → `completed` with `changed:false` and the current status, the same rule as an already-terminal cancel | the shared chokepoint behind the desk's `update_manual_review_status` (§1.6): status write + every side effect, then a reviews sync nudge | `{"reviewId":"…","status":"approved"\|"rejected"\|"resolved","changed":bool}` |
| `channel_say` (weekend E, 2026-10-08; personas `7653b0be85`, `channel_say.rs`) | required: the App Master persona, the same id as the envelope's `persona` | `{"message":"…"}`, exactly that one key; the web sends it trimmed. 1 to 2000 characters after the trim, counted by Unicode code point (`chars().count()` on the desk, `Array.from(s).length` on the web) | in order: `message` missing or not a string → `bad_params`; empty after the trim → `empty_message`; over 2000 → `message_too_long` (refused, never cut); the persona exists locally → `not_found`; it is the App Master a headless loop reads (holds a non-retired charter bound to a project and, for at least one such project, is the newest persona named `App Master%` with a charter bound there; `78c5fcd8e6`) → else `not_app_master`; a paired controller that already has 10 or more says written in the last 10 minutes, counted from the database across all personas → `rate_limited` (`2c65f9f0ea`; a say approved at the desk is not capped). Idempotency: the command id is the message row id; a re-delivery of the same id completes with `changed:false` and writes nothing, and an id that already names a different row fails `internal_error` | credential-looking tokens are masked (the phone masks first with its port `redactText.ts`, `dccf5776`, so a pasted key never reaches the cloud row; the desk masks again on arrival; F3 `355b5d643a`, `ddca92792b`, `b0c13da5bf`; shared fixture `fixtures/redact-text-v1.json`, personas `ddae928324`), then ONE `team_channel_messages` row (`author_kind 'user'`, `id` = the command id) is written; a phone's row carries `author_id` = the controller id and `author_label` `phone: <name>`, a desk-approved row neither. Every terminal write clears the cloud row: `params` `{}` and `envelope` null (`693fc11e77`). It starts no run and gets no reply through this surface: the headless App Master reads it at its next wake | `{"messageId":"…","changed":bool}`; `result_ref` = the message id, no `execution_id` |

**`channel_say` targeting.** `target_device_id` = the persona's own device (`synced_personas.device_id`), chosen as the other persona verbs choose it. The refusal tokens a phone can see: `bad_params`, `empty_message`, `message_too_long`, `not_found`, `not_app_master`, `rate_limited`, `internal_error`, plus the plane's own `controller_not_paired`, `controller_revoked` and `expired`. The narrowed `not_app_master` test (`78c5fcd8e6`) and the per-controller cap of 10 says per 10 minutes (`2c65f9f0ea`) are the desk's; the web reads back only `id`, `status`, `result` and `error_message`, never the cleared `params` or `envelope`. The phone masks credential-looking tokens with the desk's rules before signing (F3 `355b5d643a`, `ddca92792b`, `b0c13da5bf`), so a pasted key never reaches the cloud row. The 2000 bound applies to the typed text and again to the masked text, because masking can lengthen a short value. Known miss: the desk's `redact_text` is not idempotent. It re-masks an already masked value, so `DB_PASSWORD=[redacted]` is stored as `DB_PASSWORD=[[redacted]]`. That is 14 of the 62 fixture cases. It is cosmetic, nothing leaks, and the fix belongs to the desk.

**`review_decide` targeting.** `target_device_id` = `synced_manual_reviews.device_id` of the review (the desktop that raised it), falling back to the persona's `device_id` when the review row has none.

**Not touched:** the queue verbs keep their JSON-in-`prompt` payloads (`rc.rs:121-153`) and **keep the per-command approval** in v1. There is no web UI for them yet, and D1 can be extended to them once one exists.

### 2.3 Status lifecycle

The existing vocabulary is kept: the desktop already writes these exact strings. The owner's draft names map onto it as follows.

| State (column `status`) | Draft name | Written by | Columns set |
|---|---|---|---|
| `pending` | pending | web insert (guarded, §2.1) | `requested_at`, `expires_at`, `params`, `controller_id`, `envelope`, `signature` |
| `executing` | running | desktop compare-and-set claim, filtered on `id` + `target_device_id` + `status=eq.pending` (`rc.rs:431-447`) | `updated_at` |
| `completed` | done | desktop (`set_command_status`, `rc.rs:185-195`) | `resolved_at`, `result`, `execution_id` (run) or `result_ref` (others) |
| `failed` | failed | desktop: the precondition or the call failed | `error_message`, `resolved_at` |
| `rejected` | rejected | desktop: unknown verb (`rc.rs:258-282`), **`controller_not_paired`**, **`bad_signature`**, **`controller_revoked`**, `envelope_mismatch` | `error_message`, `resolved_at` |
| `expired` | expired | desktop, when it sees a row past `expires_at` (new; today it waits for the 1 h `requested_at` window, `rc.rs:74-76,231-249`). Also the **web**, if the row is still `pending` 15 s after `expires_at` (PATCH with filter `status=eq.pending`) | `resolved_at`, `error_message='expired: desktop did not pick it up'` |
| `approved` | — | unused (it stays in the CHECK) | — |

### 2.4 How the web observes completion

**Today:** nobody follows a command (`useSyncedRealtime.ts:34-40` watches 5 tables, and `pending_commands` isn't one of them).

**v1 adds `commandStore`** (zustand, `web:src/stores/commandStore.ts`):
- `send(verb, personaId, params) → id` puts the command in an `inflight: Map<id, {verb, personaId, status, result, error, requestedAt, expiresAt}>`.
- **Realtime:** a second handler on the existing channel (`useSyncedRealtime.ts:127-141`) for `pending_commands`. Each `UPDATE` payload's `new.status/result/error_message` is applied to `inflight` **directly**, with no refetch. RLS scopes the socket (`sql:535-536`).
- **Backstop poll:** every 5 s, only while `inflight` is non-empty and the tab is visible, run `select id,status,result,error_message from pending_commands where id in (...)`.
- **Timeout:** at `expiresAt + 15 s`, a row still `pending` is PATCHed `expired` (filter `status=eq.pending`) and shown as "Your computer didn't answer".
- **Effect reconciliation:** a `completed` pause shows "Paused" at once (from `result`). When `synced_personas` arrives through the existing refetch path, it becomes the truth. If it disagrees after 30 s, show "Out of sync — check the desktop".

### 2.5 Desktop handler sketch (`rc.rs`)

```rust
const V1_VERBS: &[&str] = &["pause_persona", "resume_persona", "cancel_execution", "chat_send"];
fn is_known_command_type(t: &str) -> bool { t == "run_persona" || QUEUE_VERBS.contains(&t) || V1_VERBS.contains(&t) }
// SELECT gains: params, controller_id, envelope, signature, expires_at   (rc.rs:155)

// poll_once (rc.rs:230-288), per row, after the existing unknown-verb refusal:
if past(c.expires_at) { reject_or_expire(&client, &c, "expired: desktop did not pick it up"); continue; }   // D4
match trust::check(&pool, &c, &device) {                  // section 3.3
    Trust::Paired(ctrl) if auto_verb(&c.command_type) => {
        tokio::spawn(claim_and_execute(app.clone(), state.clone(), client.clone(), c, Some(ctrl)));
    }
    Trust::Unsigned if c.command_type == "run_persona" => surface_prompt(&app, c),   // legacy: today's approval card
    Trust::Unsigned => reject(&client, &c, "controller_not_paired"),
    Trust::Refused(reason) => reject(&client, &c, reason),   // bad_signature | controller_revoked | envelope_mismatch
}

// claim_and_execute = the body of remote_command_approve from the claim onward (rc.rs:418-504), extracted so that
// approve and auto-run share ONE claim + ONE dispatch (keeps the "one gate" rule of rc.rs:513-515):
match cmd.command_type.as_str() {
    "pause_persona"  => set_enabled_remote(&state, &pid, false),            // repo::set_enabled
    "resume_persona" => { project_gate(&state, &pid)?; set_enabled_remote(&state, &pid, true) /* + request_wake */ }
    "cancel_execution" => { owner_check(&state, &pid, &exec_id)?; state.engine.cancel_execution(&exec_id, &state.db, Some(&pid)).await }
    "run_persona"    => execute_persona_inner(&state, app, pid, None, prompt, None, None, Some(cmd.id.clone()), false).await,
    "chat_send"      => chat_turn::start(&state, app, &pid, params, &cmd.id).await,   // M9, section 5.3
    q                => run_queue_verb(&app, state, q, cmd.prompt.as_deref()).await,
}
```

**Latency.** The poll runs every 15 s (`rc.rs:297`), so the worst-case dispatch latency is 15 s. **Proposed: an adaptive poll.**
- **5 s** while at least one controller is paired and active, and for 2 min after any command is seen.
- **15 s** otherwise.

At 5 s that is 12 PostgREST GETs a minute per desktop. A Realtime client in Rust would remove the poll, but it is a new dependency (the Phoenix protocol), so it is deferred.

**Test pins to update.**
- `the_queue_grant_is_three_verbs_and_no_dispatch` (`rc.rs:637-655`) stays as it is, because queue verbs are unchanged.
- Add `v1_verbs_are_known_and_auto_only_when_paired`.
- The module doc (`rc.rs:1-34`, "NEVER auto-executes", "no auto-approval") must be rewritten to state D1. That rewrite is the diff the owner signs.

---

## 3. Trust (D1): paired controllers

### 3.1 Why the existing pairings don't fit

| Existing | Anchor | Why it doesn't fit |
|---|---|---|
| `personas://pair?origin&scopes&nonce&name` | `desk:src-tauri/engine/src/pairing.rs:1-19,386-413` | It mints a key for the **loopback** management API (`127.0.0.1:9420`), and the token is claimed over loopback. A phone can't reach it, and a phone can't open `personas://` at all. |
| LAN companion QR | `desk:src-tauri/src/commands/fleet/pairing.rs:1-60` | LAN-only. Its model is a **bearer token** whose SHA-256 the desktop stores. A bearer token can't ride in a `pending_commands` row, because every holder of the user's JWT can read that row (RLS is per user, `sql:396-415`). |
| "Same Google account" | `sql:4-16` | It proves the *account*, not the *device*. A stolen web session is indistinguishable from the owner. |

**What to reuse.**
- From the LAN companion: the ceremony shape (the desktop shows a QR, there is a device list with a cap of 8 at `pairing.rs:42`, independent revocation, and the store kept in the settings table).
- From `personas://pair`: the **pending + TTL + nonce** discipline (`pairing.rs:40-45`).

**What to change:** the credential becomes an **Ed25519 key pair** whose private half never leaves the phone. Only signatures travel through the cloud.

### 3.2 The pairing ceremony (desktop-initiated QR)

The tables below are new (SIGN-OFF: schema):

```sql
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
-- + owner_all policy, grants, realtime publication: add 'command_controllers' to the arrays at sql:400-405, 421-426, 541-545
```

1. **Desktop.** In Settings › Cloud sync (`desk:src/features/settings/sub_account/components/CloudSyncCard.tsx`), "Pair a phone" is enabled only when sync is on and the user is signed in.
   - It mints a `pairing_id` (uuid) and a 32-byte `secret`, both held **in memory** with a 5 min TTL.
   - It shows a QR of `https://personas.so/dashboard/settings#pair=<pairing_id>.<secret>`. A fragment never reaches a server.
2. **Phone.** It must be signed in with the same Google account. The settings view (`spa:src/components/dashboard/views/settings`) reads the fragment and immediately runs `history.replaceState`, so the fragment can't land in Sentry breadcrumbs. `sentry-pii` already reduces URLs to the host (web CLAUDE.md rule 5).
   - It generates an Ed25519 key with WebCrypto `generateKey({name:"Ed25519"}, false, ["sign"])`. The key is **non-extractable** and kept in IndexedDB.
   - It inserts a `command_controllers` row with `status='pending'`, `device_id` from the QR (or from `synced_devices`), and `proof`. The HMAC key is imported from `secret` and then dropped.
3. **Desktop.** While the QR is up, it polls `command_controllers?pairing_id=eq.<id>` every 2 s.
   - It verifies `proof` in constant time (the `ct_eq` precedent at `pairing.rs`), using the `hmac 0.12` + `sha2` dependencies (`desk:src-tauri/Cargo.toml:64,382`).
   - It stores `{controller_id, name, public_key, created_at}` in a new settings-table key `cloud_controllers`. This is **the authoritative trust list**, and it holds no secret.
   - It discards `secret` and PATCHes the row to `active`.
   - Because the operator started the ceremony at the desk, no extra click is needed. A desktop toast names the device.
4. **Phone.** It sees `active` over Realtime and stores `controller_id` beside the key.

Holding the secret proves the phone saw the QR, so a thief with a stolen JWT can't insert a pairing that verifies.

**Dependency note.** `ed25519-dalek` is in the tree but **optional, behind the `p2p` feature** (`desk:src-tauri/Cargo.toml:94,269,457`). `desktop-full` ships it (`:265`), but the lite `desktop` build doesn't. Make it a non-optional dependency of the cloud module. Size S.

### 3.3 Signing and the desktop rule

**Envelope.** The web signs the exact UTF-8 bytes of a compact JSON text, which is stored in `pending_commands.envelope`:

```json
{"v":1,"id":"<uuid>","dev":"<target_device_id>","type":"pause_persona","persona":"<id>","params":{},"iat":"2026-10-06T12:00:00.000Z","exp":"2026-10-06T12:01:00.000Z","ctl":"<controller_id>"}
```

`signature` = base64url(Ed25519.sign(envelope bytes)). The desktop **verifies the bytes and parses the command from the envelope**, never from the row's columns. jsonb reorders keys, so it can't be trusted to round-trip the signed form.

**Desktop `trust::check`** (new `desk:src-tauri/src/cloud/trust.rs`) runs these checks in order:
1. **No `controller_id`:** returns `Unsigned`.
2. **Controller not in `cloud_controllers`:** `Refused("controller_not_paired")`.
3. **Controller marked revoked:** `Refused("controller_revoked")`.
4. **Signature fails:** `Refused("bad_signature")`.
5. **Envelope fields disagree with the row or with this desktop**, on any of these: `id`, `dev == own device id` (`desk:src-tauri/src/cloud/sync/cursor.rs:110`), `type`, `persona`, `ctl`. Result: `Refused("envelope_mismatch")`.
6. **Timing fails:** `exp` has passed, or `iat` is more than 5 min old. Result: expired. The desktop clock gets ±30 s skew tolerance.
7. **Otherwise** it returns `Paired(ctrl)`, and the desktop stamps `last_command_at`.

**`auto_verb`.** It covers `run_persona`, `pause_persona`, `resume_persona`, `cancel_execution`, `chat_send` and (M20) `review_decide`. Queue verbs stay prompt-gated (§2.2).

### 3.4 Revocation

- **On the desktop (authoritative).** The settings list has Revoke and "Revoke all", which set the local `revoked` flag right away and PATCH the cloud row to `revoked`. Any not-yet-claimed command from that controller is refused at the next poll (≤ 5-15 s). Claimed commands finish.
- **On the web.** "Unpair this phone" deletes the IndexedDB key and sets `revoke_requested_at`. The desktop honours it at the next poll.
  - Any JWT holder may request a revocation. Revoking only reduces privilege, so the worst abuse is denial of service.
- **Account level.** Supabase "sign out everywhere" (`signOut({scope:'global'})`) kills stolen web sessions. It doesn't affect device keys, so revoke those separately.

### 3.5 Security posture, stated plainly

| Attacker holds | Can do today | Can do after v1 |
|---|---|---|
| A stolen web session (JWT), no device key | read every synced projection; insert `run_persona` requests that the operator must approve | Same reads, **plus notes and chat** if §5 ships. Unsigned commands are rejected for the new verbs and prompt-gated for `run_persona`. They **can't forge** a paired command. They can spoof a command row's `status` in the cloud, which only fools the display: the desktop never reads a status it didn't write. |
| An unlocked paired phone | — | Everything in `auto_verb`, with no approval: pause/resume, cancel, **run a persona (spends money)**, chat. Revocation from the desktop bounds it to ≤ 15 s plus whatever was already claimed. No edits, no credentials, no queue verbs. |
| XSS on the `personas.so` origin while the dashboard is open | read synced data | It can **use** the non-extractable key to sign `auto_verb` commands. It can't export the key. Mitigations: a strict CSP, and a signing module that is the only importer of the key. |

**Policy-loosening flags (SIGN-OFF: trust):**
1. Remote commands **auto-execute** for paired controllers. This reverses the documented rule "NEVER auto-executes / no auto-approval" (`rc.rs:1-34`).
2. **`run_persona` and `chat_send` spend money** on the user's Claude plan without a click at the desk.
3. A paired phone can stop work (cancel) and turn a persona off. That is a real effect on scheduled automation.

Every one of these is bounded by the closed `auto_verb` set, by device-held keys, and by desktop-side revocation.

---

## 4. Online gate (D4)

### 4.1 The predicate

`online(device) := now − synced_devices.last_seen_at ≤ 120 s`, evaluated for **the device that owns the persona** (`synced_personas.device_id`).

**Why 120 s:**
- **Heartbeat.** It is upserted **first in every sync pass** (`sync/mod.rs:322-345`).
- **When passes run:** every 45 s (`:596`), plus a pass 2 s after any change (`:600-603`).
- **Gating.** Passes run only when the device is leader + sync is enabled (`:606`) + there is a JWT (`:550-556`).
- **Same gates as the command poll** (`rc.rs:300`). So a fresh heartbeat really does mean the desktop will see a command within one poll.
- **The margin.** 120 s is 2.7 missed ticks: it tolerates one slow pass and doesn't flap.

**Clock-skew fix (SIGN-OFF: schema, small).** `last_seen_at` is stamped with the **desktop** clock (`rows.rs:325-333`). Add a trigger so the server stamps it:

```sql
create or replace function public.stamp_device_seen() returns trigger language plpgsql as $$
begin new.last_seen_at := now(); return new; end $$;
drop trigger if exists trg_stamp_device_seen on public.synced_devices;
create trigger trg_stamp_device_seen before insert or update on public.synced_devices
  for each row execute function public.stamp_device_seen();
```

Only the phone's clock then matters, and phones are NTP-synced.

**Device name (desktop, S).** `device_row` sends `name: None` (`rows.rs:328`). Send a user-set name from `CloudSyncCard`, falling back to the platform label, so the phone can say "Open Personas on *Studio PC*". Don't send the hostname silently: that would be more data leaving the machine.

### 4.2 Computing it live on the web

`useSyncReachability()` (new, `web:src/hooks/useSyncReachability.ts`):
- **Reads:** `synced_devices(device_id,name,platform,last_seen_at)` once.
- **Realtime:** `synced_devices` is already watched (`useSyncedRealtime.ts:39,87-92`). Route its payload into the hook's store as well, not only to `systemStore`.
- **Re-evaluation tick:** every 10 s. Staleness is the *absence* of events, so no Realtime message ever announces "offline". The tick is gated by `usePageVisibility` (web CLAUDE.md rule 3).
- **Existing code to replace:** `getHealth` / `getStatus` use a **5 min** cutoff (`supabaseApi.ts:444-476`). Switch them to the shared 120 s constant so the header and the gate never disagree.

### 4.3 UI states (tiers; M7 CTA rules)

| Tier | Test | Persona actions | CTA |
|---|---|---|---|
| `demo` | `isDemo` (`web:src/stores/authStore.ts:192-209`) | enabled, simulated (§6.3) | download CTA (anonymous visitors always see it, per M7) |
| `no-account` | not authenticated | — | sign in + download |
| `never-synced` | signed in, supabase plane, 0 `synced_devices` rows | hidden | **download + "turn on sync in Settings"** (M7: cannot sync) |
| `offline` | ≥ 1 device, but the owning device's `last_seen_at` > 120 s ago | **disabled.** Banner: "Personas isn't running on *{device}* (last seen {ago}). Open it to manage agents from here." | **no download CTA** |
| `online-unpaired` | online, but no active `command_controllers` row for this browser's `controller_id` | disabled, with a "Pair this phone" sheet that explains the QR | none |
| `online` | online + paired | enabled | none |

**Per-command chips:**
- `Sending…` for `pending`
- `Working…` for `executing`
- `Done` for `completed`
- `Failed: {reason}` for `failed`
- `Refused: {reason}` for `rejected`
- `Your computer didn't answer` for `expired`

---

## 5. New synced data (SIGN-OFF: more data leaves the machine)

**This is a policy change.** The sync module's contract is a *secret-free read projection* (`sync/mod.rs:1-6`, `sql:9-21`). Note bodies and chat transcripts are free text the user typed. Assistant replies may contain data that personas pulled through their connectors (mail, docs, tickets).

**Recommendation:**
- **Per-class opt-in toggles** ("Sync notes", "Sync chats"), **default off even for users who already sync**, in `CloudSyncCard`.
- Token-level secret masking on every text field. That is a new `redact_text` that applies `value_looks_secret` (`rows.rs:63`) per whitespace-delimited token; `redact_scalar` (`rows.rs:1001-1007`) blanks whole values, which is wrong for prose.
- Hard size caps.

### 5.1 Notes / goals

```sql
create table if not exists public.synced_notes (
  id              text primary key,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id       text not null,
  project_name    text,              -- dev_projects.name only; NEVER root_path
  title           text not null,
  body_md         text not null default '',   -- redact_text + cap 16 KB (truncate with a marker)
  status          text not null check (status in ('draft','published','in_progress','completed','scoped','cut','shipped')),
  order_index     integer not null default 0,
  dispatch_target text,              -- 'fleet' | 'athena_goals'
  result_summary  text,              -- the summary field of result_json only (no artifact paths)
  open_reviews    integer not null default 0,  -- count(dev_note_comments where verdict='pending')
  unread_comments integer not null default 0,
  published_at timestamptz, started_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null, updated_at timestamptz not null,
  synced_at timestamptz not null     -- desktop-stamped reconcile key (like synced_fleet_queue, sql:301-307)
);
-- owner_all + grants + realtime; NOT in the touch_synced_at array (sql:512-528), same reason as the fleet queue
```

**Not synced:** `archived` notes, `fleet_session_id`, `dispatch_key`, `agent_id`, raw `result_json`, `milestone_id`, the thread bodies, and `root_path`.

**Desktop push path:**
- **Full-set replace**, cloned from `sync_fleet_queue` (`sync/mod.rs:387-465`): upsert the non-archived set stamped `synced_at`, then delete this device's rows with an older stamp. It fits notes because notes are few (cap 10 plus shipped and completed) and are deleted with no tombstone (`notes.rs:465`).
- Add `("synced_notes","notes",true,false)` as the 13th `SYNC_TABLES` entry (`sync/mod.rs:58-85`), and update the length test (`:691`).
- Call it after the queue in `collect_pass` (`:371`).
- **CDC:** add `"dev_notes" | "dev_note_comments"` to `table_to_event` (`cdc.rs:211-270`) under a new low-volume event, and add `"dev_notes"` to the cloud-dirty list (`cdc.rs:383`).
- **Note.** The pad saves 500 ms after typing stops (CONTEXT.md:30). Give notes-only dirtiness a **10 s** debounce, or a typing session will trigger a pass every ~2.5 s.

**v1 phone scope:** **read-only**. That covers goals grouped by project, as in the Quest Log zones, plus the status rail, body, run summary and "needs review" count. Writes from the phone (capture a note, approve a review) are open question Q2.

### 5.2 Chat: read sync

```sql
create table if not exists public.synced_chat_sessions (
  session_id  text primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id   text not null,
  persona_id  text not null,
  title       text,
  chat_mode   text not null default 'ops',
  created_at  timestamptz not null, updated_at timestamptz not null,
  synced_at   timestamptz not null default now()
);
create table if not exists public.synced_chat_messages (
  id           text primary key,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  device_id    text not null,
  persona_id   text not null,
  session_id   text not null,
  role         text not null check (role in ('user','assistant')),   -- system/tool rows are NOT synced
  content      text not null,       -- redact_text + cap 32 KB
  execution_id text,
  created_at   timestamptz not null,
  synced_at    timestamptz not null default now()
);
create index if not exists idx_synced_chat_msgs_session on public.synced_chat_messages (user_id, session_id, created_at);
-- owner_all + grants + realtime on both; touch_synced_at on both
```

**Not synced:** `summary`, `working_memory`, `system_prompt_hash`, `claude_session_id`, `metadata`, and system/tool rows.

**Desktop push path:**
- **Messages:** cursor on `created_at`, a 90-day first push, no resync (append-only). These are new `SYNC_TABLES` entries.
- **Sessions:** cursor on `updated_at`.
- **Persona delete:** add both tables to `PERSONA_SCOPED_TABLES` (`sync/mod.rs:469-477`).
- **Session delete** (`desk:src-tauri/db/src/repos/communication/chat.rs:134`): add a local `chat_session_tombstones` table, written by `delete_session`. It mirrors `persona_tombstones` (`e06_teams_and_sync.rs:239`, `rows.rs:1067-1080`) and is processed beside `process_tombstones` (`sync/mod.rs:502-537`).
- **CDC:** map `chat_messages` and `chat_session_context` in `table_to_event`, and add them to the cloud-dirty list. That event also lets the desktop's open chat tab refetch when a phone-sent turn lands.

### 5.3 `chat_send`: a command whose reply comes back as data

Yes, sending from the phone is a command, `chat_send`. The desktop executes it, and the reply syncs back through `synced_chat_messages`.

**The blocker.** The turn is orchestrated in the desktop frontend (`chatSlice.ts:184-360`). Rust has no "send a chat turn" function to call.

**Required (desktop, L): hoist the turn into Rust.** Add `chat_turn::start(state, app, persona_id, {sessionId, message}, cmd_id)` that does the following:
1. Insert the user `chat_messages` row.
2. Load `chat_session_context`.
3. Build the same input JSON (`{_chat:true, latest_message}` plus `Continuation::SessionResume(claude_session_id)`, or the full transcript on the first turn: `chatSlice.ts:207-235`).
4. Call `execute_persona_inner(..., continuation, idempotency_key=Some(cmd_id))`.
5. Register a completion hook. Only on a `completed` terminal state (the rule at `chatSlice.ts:310-322`), it assembles the assistant text from the execution's output, inserts the `assistant` row, and stores `claude_session_id`.

`chatSlice.sendChatMessage` then calls the same Rust command, so there is **one** turn path. A bridge that has the Rust side emit an event for the webview to run the TS path would also work, but it loses the reply if the webview reloads mid-turn and leaves two paths. **Not recommended.**

**Paused personas (M21).** A paused persona still takes a `chat_send`: pause stops its own role (triggers, schedules, event subscriptions), not an explicit ask. `run_persona` already behaved this way; the two are now symmetric.

**Phone UX.** The phone gets no token streaming in v1.
- The user message appears optimistically.
- The command's `result.executionId` lets the phone watch `synced_executions` and show "thinking" while the status is `queued`/`running`.
- The assistant message arrives about 2-5 s after the run ends.
- If the run ends in any other state, the phone shows "No reply — the run {status}" plus Retry, which sends a new `chat_send`.

---

## 6. Web side

### 6.1 Live plane (D3)

The data plane is chosen at **build time**: `NEXT_PUBLIC_DATA_SOURCE === "supabase"` selects `supabaseApi`, and `isDemo` always wins (`web:src/lib/api.ts:347-361`).

**Production work:**
- Set `NEXT_PUBLIC_DATA_SOURCE=supabase`.
- Apply the updated `setup-sync-db.sql` to the prod project, so the desktop and the web share `auth.uid()` (`sql:4-7`).
- Add the variable to `.env.example`.
- Update `docs/features/dashboard/shell-chrome.md:59,73`, which says the live plane is inactive.

### 6.2 Phone layouts per D5, on `dashboard/spa`'s structure

**Build on the `dashboard/spa` branch.** Phase 2 waits for its merge (`PLAN.md:97-99`). Its views live at `spa:src/components/dashboard/views/<view>/` and are registered in `spa:src/components/dashboard/spa/viewRegistry.tsx:24-39`.

**The phone/desktop switch.** Every view is `next/dynamic({ssr:false})` (`viewRegistry.tsx:42`), so a `useIsPhone()` built on `matchMedia` is hydration-safe. Each view picks its composition with it, which keeps the 700 px desktop stage off phones entirely: `spa:src/components/dashboard/views/personas/index.tsx:38`, `min-h-[700px]`.

**Bottom nav.** It already takes the first five rail items (`spa:src/components/dashboard/MobileBottomNav.tsx:21-23`). v1 phone order: Personas · Reviews · Notes · Executions · More.

| View | Phone composition | Data (live / demo through the same `api` proxy, never imported fixtures, `PLAN.md:107`) |
|---|---|---|
| `/dashboard/personas` | A reachability banner (§4.3), then one row per persona: glyph/colour, name, a status chip (**Running** when an execution is `running`; **Paused** when `enabled=false`; Idle; Failed when the last run failed), a primary **Pause/Resume** button (44 px), and an overflow menu with **Run…** (a prompt sheet in `MobileSheet`, which phase 0 kept as shared UI, `PLAN.md:34-35`) and **Cancel run** (only while running). Tapping a row opens a detail sheet with tabs **Activity** (last runs) and **Chat** (§5). | `personaStore` + `executionStore` + the new `commandStore` + `useSyncReachability`. **Not `fleet.json`** (`spa:src/components/dashboard/fleet-monitor/fleet-data.ts:1`), which has no live path (survey §1.2). |
| `/dashboard/reviews` (M20, added 2026-10-07) | A reachability banner (live only), then the pending reviews as cards, most overdue first: persona, severity, due chip, title, the description behind Show more, an optional note, **Approve** / **Reject** (48 px). A verdict opens the 5 s undo window, then is a `review_decide`; the card moves under "Decided here" with its command chip. Enabled only in the `online` tier (and the demo) | `reviewStore` (`api.listEvents` + `api.decideReview`) + `commandStore` + `useSyncReachability` |
| `/dashboard/notes` (**new view id**: SIGN-OFF, route) | Zones by project; cards show title, status rail glyph, and the "needs review" / unread counts; a body sheet; the run summary | `api.listNotes()` → `synced_notes` / `mockApi` |
| Chat (inside the persona sheet; **no new route**) | Session list → transcript → composer. The composer is enabled only in the `online` tier. | `api.listChatSessions/listChatMessages` + `commandStore.send('chat_send')` |

**`ApiClient` additions** (`web:src/lib/api.ts:127-152`):
- `pausePersona(id)` and `resumePersona(id)` return `{commandId}`.
- `cancelExecution(id)` changes meaning on the supabase plane: it becomes a `cancel_execution` command (today it is `readOnly()` 501, `supabaseApi.ts:367`).
- `executePersona` returns `{commandId}` honestly (today it returns the command id disguised as `executionId`, `supabaseApi.ts:401-403`).
- Add `listNotes`, `listChatSessions`, `listChatMessages` and `sendChatMessage`.
- The orchestrator `realApi` keeps its REST mapping.

**Realtime.** Add `pending_commands`, `synced_notes`, `synced_chat_sessions` and `synced_chat_messages` to the channel in `useSyncedRealtime.ts:34-40` (`pending_commands` goes to `commandStore`, the others refetch).

**Copy.** All of it goes in the English-only pending `mobile` namespace (`PLAN.md:16`): the six tiers, seven command states, the pairing sheet and the refusal reasons. It is translated into all 13 locales before launch.

**Budget.** Re-baseline `check:bundle` for `/dashboard/*` (web CLAUDE.md rule 9).

### 6.3 Demo mode: a simulated round trip

The demo stays on mocks. `api` sends `isDemo` to `mockApi` (`api.ts:357-358`).

**Add `web:src/lib/commands/mockCommandPlane.ts`, a scripted desktop:**

| Verb | Simulated sequence | Fixture write-through (precedent: `mockApi.updateEvent` at `mockApi.ts:184-200`) |
|---|---|---|
| pause/resume | `pending` at 0 ms → `executing` at 1.2 s → `completed` at 2.0 s | `MOCK_PERSONAS[i].enabled` flips |
| cancel | same timings | the mock execution becomes `cancelled` |
| run | `completed` at 2 s | a new mock execution goes `queued` → `running` → `completed` over about 8 s (today `mockApi.ts:135-138` adds nothing) |
| chat_send | user message appears at once | a canned assistant reply after 4 s |

**Other demo behaviour:**
- **Notes:** a `MOCK_NOTES` fixture in `web:src/lib/mock-dashboard-data.ts`, served through `mockApi.listNotes`.
- **Reachability:** `demo` behaves as `online`. A demo-only `?desktop=offline|never` query override exists for review and e2e, so the offline and never-synced screens are reachable without a real account.
- **Timers** start only on a user action, and the plane refuses to start while `document.hidden` (the `use-playground-simulation.ts` precedent, web CLAUDE.md rule 3).

---

## 7. Work breakdown

**Order rule:** SQL first (owner-run), then desktop, then web. Each slice is shippable on its own.

| # | Repo | Item | Size | Sign-off |
|---|---|---|---|---|
| M0 | Supabase SQL | §2.1 (CHECK, envelope/result columns, insert guard), §3.2 `command_controllers`, §4.1 server-stamped heartbeat; run `npm run db:migrate:sync` on prod (D3) | S | **schema** |
| M1 | desktop | Device name in the heartbeat (`rows.rs:325-333`) + a field in `CloudSyncCard` | S | — |
| M2 | desktop | `trust.rs` (envelope verify, `cloud_controllers` store, cap 8), the pairing QR + poll, a revocation UI, non-optional `ed25519-dalek` | M | **trust** |
| M3 | desktop | `rc.rs`: v1 verbs, `claim_and_execute` extraction, auto-path, `expires_at` honouring, adaptive poll, `run_persona` idempotency key, module-doc rewrite, tests | M | **trust** (the doc diff) |
| M4 | web | `useSyncReachability`, 120 s constant shared with `getHealth/getStatus`, tier UI | S | — |
| M5 | web | Controller key (WebCrypto Ed25519 + IndexedDB), pairing in the settings view, `commandStore` + Realtime + backstop + expiry | M | — |
| M6 | web | Phone Personas view (list, Pause/Resume, Run sheet, Cancel), `mockCommandPlane`, `mobile` namespace keys | M | — |
| **E2E-1** | all | **First slice: the pause/resume round trip** = M0 + M2 + M3 (pause/resume only) + M4 + M5 + M6 (the Pause button only) | — | — |
| M7 | desktop + web | Cancel execution end to end (handler + Cancel action + chip) | S | — |
| M8 | SQL + desktop + web | Notes sync (§5.1): table, full-set push, CDC, per-class toggle; the `/dashboard/notes` phone view + mocks | M | **data + route** |
| M9 | SQL + desktop + web | Chat read sync (§5.2), then `chat_send` (§5.3) with the Rust turn hoist | L | **data** |
| M10 | web | Launch: translate `mobile` ×13, budget re-baseline, phone e2e in CI | S | — |

**E2E-1 acceptance tests:**

1. **Shared test vector.** `fixtures/command-envelope-v1.json` lives in both repos: a fixed key pair, an envelope, and its signature. Web vitest signs it and must produce the same bytes; desktop `cargo test` must verify them, and must reject a one-byte change.
2. **Desktop unit tests (`rc.rs` / `trust.rs`):**
   - paired + valid → auto-claim → `completed` with `{"enabled":false,"changed":true}`
   - a repeat pause → `changed:false`
   - unknown controller → `rejected controller_not_paired`
   - revoked → `controller_revoked`
   - tampered envelope → `bad_signature`
   - `dev` mismatch → `envelope_mismatch`
   - past `exp` → `expired`, and nothing is executed
   - unsigned `run_persona` → still surfaces the approval card (legacy)
3. **Web vitest:**
   - The reachability tier table: boundaries at 119 s and 121 s; 0 devices; demo; unpaired.
   - The `commandStore` reducer across all six states, plus the web-side expiry.
   - `mockCommandPlane` timings with fake timers.
4. **Playwright `mobile` project (demo):**
   - `/dashboard/personas` on iPhone 13: tap Pause → the chip reads `Sending…` then `Working…` then `Done` within 3 s → the row shows Paused → Resume reverses it.
   - With `?desktop=offline`, the buttons are disabled, the banner is shown, and there is no download CTA.
   - With `?desktop=never`, the download CTA shows.
   - The existing no-horizontal-scroll check stays green.
5. **Manual live run (owner's machine):**
   - Sync on, phone paired.
   - Pause from the phone. The desktop toggle shows Off within ≤ 5 s poll + 2 s sync; `synced_personas.enabled=false`; the command row is `completed`.
   - Quit the desktop app. After 120 s the phone shows the offline banner, and a Pause tap is impossible.
   - Revoke on the desktop. The next phone command is `rejected controller_revoked`.

---

## 8. Open questions (the code can't answer these)

1. **Which chat?** Persona chat (`chat_messages`, assumed here) or Athena's companion threads (`user_db`, Rust-native send, `commands/companion/chat.rs:75`), or both? Athena is cheaper to command remotely, because its send path is already in Rust.
2. **Notes on the phone: read-only for v1, or also capture?** Capture would be a `note_create` verb, and it hits the 10-note cap. Approving or rejecting a note's pending review (`notepad_set_review_verdict`) is another candidate verb.
3. **New data classes:** per-class opt-in, default off (recommended), or ride the existing single sync toggle?
4. **Routes:** add `/dashboard/notes` as a new view id (recommended), and keep chat inside the persona sheet rather than a `/dashboard/chat` route?
5. **Which persona population does the phone show?** Live and demo bind to `personaStore` (5 mock personas), while the desktop-width `/dashboard/personas` stage shows `fleet.json` (99 agents). Accept the mismatch for the demo, or rebuild the demo fleet on `mockApi`?
6. **Trusted verb set:** should `run_persona` and `chat_send` (both spend money) auto-execute for paired phones as D1 reads, or keep a desktop prompt or a daily cap for spending verbs while pause/resume/cancel auto-run?
