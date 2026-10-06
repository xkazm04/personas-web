# /m revival, phase 2: agent management on the phone (survey, read-only, 2026-10-06)

Trees read:
- `personas-web` `revamp/stage-fit` @ `eedeab5`. `/m` and `src/proxy.ts` are already deleted (phase 0); `next.config.ts:96-100` holds the temporary `/m*` redirects.
- `dashboard/spa` worktree `C:/t/dash-spa` @ `93c322d` (`cee0ab7` SPA + Personas main view, `93c322d` Mission Control wall). Its merge-base with `revamp/stage-fit` is `23514a5` (HEAD~2); stage-fit is 61 commits ahead since then.
- Desktop `C:/Users/kazda/kiro/personas`. Desktop paths below are relative to that repo; `rc.rs` = `src-tauri/src/cloud/remote_commands.rs`, `rows.rs` / `mod.rs` = `src-tauri/src/cloud/sync/{rows,mod}.rs`.

Owner direction (PLAN M6, M7): agent management is the core of the mobile dashboard; the download CTA appears only when the user cannot sync. M7 defers the definition of "can sync" to this file (section 2.5).

---

## 1. Agent management on the web today

### 1.1 This tree (`revamp/stage-fit`): `/dashboard/agents`

**Reads**

| What | Anchor | Source |
|---|---|---|
| Persona grid: name, description (2 lines), color tint, portrait/glyph by name, Live/Off from `enabled` | `src/app/dashboard/agents/agents-page/AgentCardImage.tsx:40-113` | `usePersonaStore.fetchPersonas` → `api.listPersonas` |
| Header: persona count, `workers.executing / workers.total` | `src/app/dashboard/agents/page.tsx:117-130` | `useSystemStore.fetchHealth` → `api.getHealth` |
| Expandable detail: last 5 executions (status, id, duration, age), subscription count, trigger count | `src/components/dashboard/AgentDetail.tsx:108-153` | `loadAgentDetail` = `api.listExecutions({personaId, limit:5})` + `listSubscriptions` + `listTriggers` (`src/lib/dashboard-queries.ts:15-19`) |

Not shown anywhere on the agents page: instructions/prompt, `core_profile`, budget, model, team, health score, cost, memory, schedule times.

**Actions**

| Action | Anchor | Demo (`mockApi`) | Live, Supabase mirror (`supabaseApi`) | Live, orchestrator (`realApi`) |
|---|---|---|---|---|
| Execute (fixed prompt `t.agentsPage.manualExecution`) | `agents/page.tsx:65-87` | `mockApi.ts:135-138` returns a fake `queued` id after 500 ms; nothing is added to the executions fixture | **Real request**: inserts a `pending_commands` `run_persona` row aimed at the most recently seen device (`src/lib/supabaseApi.ts:373-404`); 409 if no device | `POST /api/execute` (`api.ts:192-199`) |
| Cancel execution (Executions page, not agents) | `src/app/dashboard/executions/page.tsx:83` | returns `cancelled`, no fixture write (`mockApi.ts:130-133`) | `readOnly()` → 501 (`supabaseApi.ts:367`) | `POST /api/executions/:id/cancel` |
| Approve / reject review (Reviews page) | `src/stores/reviewStore.ts:235-238` (`writeVerdict` → `api.updateEvent`) | written through to `MOCK_EVENTS` (`mockApi.ts:184-200`) | `readOnly()` → 501 (`supabaseApi.ts:434`); failures land in `failedIds` | `PUT /api/events/:id` |
| Create / toggle / delete event subscription (Events page) | `subscriptions-panel/CreateSubscriptionForm.tsx:33`, `SubscriptionCard.tsx:21-22` | mock | `readOnly()` 501 (`supabaseApi.ts:439-441`) | orchestrator |
| Delete persona | `ApiClient.deletePersona` (`api.ts:130`), no UI caller found | mock | 501 (`supabaseApi.ts:329`) | orchestrator |
| Edit persona / toggle enabled | **no UI**. `personaStore.optimisticUpdatePersona` / `commitOptimisticUpdate` exist with zero callers (`src/stores/personaStore.ts:25-49`, comment "KEPT capability") | n/a | no API method | no API method |
| Triggers | read count only. `supabaseApi.listTriggers` returns `[]` (`:442`) although `synced_triggers` exists; the standalone `getSyncedTriggers` (`:1072-1101`) feeds only home "upcoming routines" (`app/dashboard/home/home-page/useUpcomingRoutines.ts:99`) | mock | `[]` in agent detail | orchestrator |
| Memory | Knowledge page reads `getSyncedMemories` (`app/dashboard/knowledge/useKnowledgeData.ts:138`); `MemoryActionsPanel` only has a local dismiss (`MemoryActionsPanel.tsx:142`) | local | read only | n/a |

`ApiClient` (`src/lib/api.ts:127-152`) has no method for: update persona, enable/disable, edit instructions, change trigger/schedule, resolve review (other than `updateEvent`), queue verbs, or Athena.

### 1.2 `dashboard/spa`: the Personas main view

- Route: `src/app/dashboard/[view]/page.tsx:5-18` renders `null`; `spa/views.ts:33` `DEFAULT_DASHBOARD_VIEW="personas"`; `navRegistry.ts:69` first rail item. `/dashboard/agents` and `/dashboard/playground` 307 to `/dashboard/personas`; `AgentDetail.tsx`, `AgentMetrics.tsx` and the agents page are **deleted**.
- **Data: none of the real planes.** `components/dashboard/fleet-monitor/fleet-data.ts:1` imports a static `fleet.json` (99 agents, 9 teams). No import from `@/stores` or `@/lib` under `fleet-monitor/`. Doc: "Demo-only (synthetic demo fleet) ... No API" (`docs/features/dashboard/personas.md:2`).
- `FleetAgent` fields (`fleet-data.ts:51-75`): `id, callsign, name (role), team, hue, enabled, state (running|failed|input_required|draft_ready|queued|attention|idle), runningSinceMs, task, progress, runsToday, successRate, health (healthy|degraded|critical), recentStatuses, costTodayUsd, liveToolCalls, spark24h, reviews[], unreadMessages[]`. No prompt, Core, triggers, memory, model or icon (icon = procedural `Emblem`).
- **Reads:** TopStrip "N need you" + needs/working/resting/off pile + usage windows (`board/TopStrip.tsx:72-103`); tiles by size tier (`board/Tile.tsx`); HoverCard (`board/HoverCard.tsx:47-73`); NeedsYouRail (`NeedsYouRail.tsx:55`); TeamScene cards (`board/TeamScene.tsx:56-118`); AgentScene three columns (`board/AgentScene.tsx:185`) with RunCard (task, progress ring, facts, stylised trace, last-12 beads, 24h bars; `board/RunCard.tsx:67-118`) and AgentSide (runs today, success %, cost today, pending reviews, unread; `board/AgentSide.tsx:145-197`).
- **Actions, all simulated** (pure reducer `board/sim.ts:182-222`, local toast, reset on reload, seed `sim.ts:50`): Approve / Send back a review (`AgentSide.tsx:172-177`), Retry a failed run (`RunCard.tsx:107`), Answer an input_required agent (one button, no text; `RunCard.tsx:108`), Mark read (`AgentSide.tsx:186-190`). Night shift is showcase-only.
- **Absent:** run with a prompt, pause/enable, edit settings or instructions, per-agent run history, memory, triggers, links to `/dashboard/reviews` or executions. Reviews here are `fleet.json` reviews, not `reviewStore`.
- **Desktop-only:** `views/personas/index.tsx:39` `min-h-[700px]`; AgentScene columns need ~480px for the sides alone; no `useIsMobile`/`matchMedia` under `components/dashboard`. `MobileBottomNav` first 5 become Personas, Mission Control, Reviews, Executions, Events (`MobileBottomNav.tsx:21-23`).
- **Mission Control** (`views/home/mission/*`): 8 cells (outcomes, agents, queue, recovery, spend, autonomy, vault, instruments; `readings.ts`). Live-capable cells read through the same `api` proxy (observability daily, health issues, `reviewStore`) plus `getSyncedTriggers`; `agents` and `vault` are `"unmeasured"` for a real tenant (`useMissionReadings.ts:141-179`). "In sync with the desktop app" in `93c322d` means **design parity** with the desktop's annunciator wall, not a new data sync.
- `lib/api.ts`, `supabaseApi.ts`, `mockApi.ts`, `personaStore`, `reviewStore` are **untouched** on the branch.

---

## 2. What "sync to his app" means technically

### 2.1 The mirror (`scripts/setup-sync-db.sql`)

- Same Supabase project for desktop and web, so one Google account = one `auth.uid()` (`:4-7`). Anon key + user JWT on both sides; isolation is RLS only (`:9-16`), one `owner_all` policy per table (`:396-415`).
- Phase-1 read projections: `synced_devices` (`:37-45`), `synced_personas` (`:49-81`), `synced_executions` (`:86-113`), `synced_events` (`:116-134`), `synced_manual_reviews` (`:137-156`), `synced_messages` (`:159-177`), `synced_metrics_snapshots` (`:180-202`), `synced_tool_usage` (`:205-217`), `synced_memories` (`:220-236`), `synced_knowledge_patterns` (`:239-259`), `synced_healing_issues` (`:262-281`), `synced_triggers` (`:285-299`, **no `config`**), `synced_fleet_queue` (`:309-326`, desktop-stamped `synced_at`, "older than ~45s must not be shown as live").
- Views: `synced_observability_daily`, `synced_persona_spend`, `synced_leaderboard` (`:440-496`).
- Realtime publication (`:538-557`): personas, executions, events, manual_reviews, devices, messages, healing_issues, fleet_queue, **pending_commands**.
- RLS grants `insert/update/delete` on every `synced_*` table (`:418-431`), but a web write there is not a command: the desktop never reads those tables back and its next upsert overwrites them.

### 2.2 `pending_commands` (`:328-376`) vs the desktop handler

- Contract: web inserts `status='pending'` + `target_device_id`; desktop leader **polls ~15s (not Realtime)**, raises an approval card, runs **nothing** until the operator approves, claims with compare-and-set `pending → executing`; final `completed` (`execution_id` or `result_ref`) | `failed` | `rejected` | `expired` (1h) (`:329-347`). `params`, `expires_at` reserved and unread.
- SQL CHECK allows: `run_persona, cancel_execution, queue_reorder, queue_set_lane, queue_cancel` (`:374-375`).
- **Desktop executes:** `run_persona` + `queue_reorder`, `queue_set_lane`, `queue_cancel` only (`rc.rs:105-111`, `is_known_command_type`). A test pins this set (`rc.rs:637-655`).
  - Poll: 12s delay, then every 15s, only if leader **and** sync enabled (`rc.rs:294-302`); `GET ... status=eq.pending&target_device_id=eq.{device}` (`:224-227`).
  - Surfaces a Tauri event `remote-command-pending` → `src/features/cloud/RemoteApprovalPrompt.tsx:54`, mounted at `src/App.tsx:486`. No auto-approve / trusted-device option exists.
  - Approve (`rc.rs:355-505`): UUID check, device-scoped fetch, refuse unknown, CAS claim, then `run_persona` → `execute_persona_inner(..., cmd.prompt as input_data, ...)` (`:455-472`); queue verbs parse JSON from `prompt` (`:130-153`, `:516-574`). Reject: `rc.rs:577-614`. Both need the `cloud` tier (`rc.rs:356,578`).
  - **`cancel_execution` has no handler**: the desktop rejects it with `unsupported_command_type: this desktop does not implement ...` (`rc.rs:258-282`, `:391-416`). Moonshots 8.1A and 5.6A assume the desktop already accepts it; it does not.
- Web side: the only writer is `supabaseApi.executePersona` (`:373-404`). It returns the command id disguised as an `executionId` with status `queued` and nobody follows it: `useSyncedRealtime` watches 5 tables, not `pending_commands` (`src/hooks/useSyncedRealtime.ts:34-40`). `synced_fleet_queue` has no web reader on this tree.

### 2.3 Auth

- Web: Google OAuth only, `signInWithOAuth({provider:"google", redirectTo: origin + "/dashboard"})` (`src/stores/authStore.ts:211-237`); optimistic localStorage session (`:101-127`); `isDemo` is an in-memory flag set by `signInAsDemo` / `enterDemo` (`:192-209`), lost on hard navigation. `SignInPrompt` offers Google + Try Demo only (`src/components/dashboard/SignInPrompt.tsx:79-129`). There is **no download CTA anywhere in the dashboard today**.
- Data plane is chosen at **build time**: `NEXT_PUBLIC_DATA_SOURCE === "supabase"` → `supabaseApi`, else orchestrator `realApi`; `isDemo` always wins (`src/lib/api.ts:347-361`). The variable is not in `.env.example`; `docs/features/dashboard/shell-chrome.md:59,73` says the live plane "is not active in this repo".
- Desktop: Google OAuth only via in-app popup redirecting to `personas://auth/callback` (`src-tauri/src/commands/infrastructure/auth.rs:390-514`, CSRF check `:889-901`; OS deep link `boot/deep_link.rs:19`).
- Desktop sync is **off by default**: opt-in toggle `cloud_sync_set_enabled` (`commands/infrastructure/cloud_sync.rs:14-21`; `cursor.rs:11-18` true only for `"true"`), UI `src/features/settings/sub_account/components/CloudSyncCard.tsx:81-94`. A pass also needs a JWT (`mod.rs:550-556`).

### 2.4 Pairing

- No cloud pairing table and no web code (`grep personas://` in web `src/` finds only a "no deep link" comment at `app/templates/[id]/TemplateDetail.tsx:82`). The account link is simply "same Google account on both".
- Desktop has three unrelated pairings, none cloud:
  1. `personas://pair?origin&scopes&nonce&name` → local management API key on `127.0.0.1:9420` (`src-tauri/engine/src/pairing.rs:386-413`, approve `commands/credentials/external_api_keys.rs:147-225`). Loopback only, so useless to a phone.
  2. **LAN phone companion**: QR `http://<lan-ip>:<port>/m/#t=<token>` (`commands/fleet/pairing.rs:22-23`), server on `0.0.0.0:17500+` LAN peers only (`commands/fleet/companion_api.rs:1-33`), serves its **own installable `/m` PWA** from `src-tauri/resources/mobile/` (`index.html`, `app.js`, `sw.js`, `manifest.webmanifest`). `/api/act` allows exactly approve/reject an Athena fleet proposal, reply to an `awaiting_input` session, wake, kill (`companion_api.rs:18-21`). This is prior art for phone agent management, LAN-only.
  3. Desktop-to-desktop p2p (`engine/src/p2p/device_pairing.rs`, `owned_devices` table).

### 2.5 The "can sync" signal

`synced_devices` is a real heartbeat: the desktop upserts it **first in every sync pass** (`mod.rs:318-345`) with `device_id, platform, app_version, last_seen_at=now` and `name = None` (`rows.rs:146-153`). Passes run every 45s plus wake-on-change (`mod.rs:590-628`), only when leader + sync enabled + signed in. The remote-command poll has the **same gates** (`rc.rs:300`), so a fresh heartbeat means "a command inserted now will be seen within ~15s".

Proposed tiers, all computable from existing tables with existing RLS:

| Tier | Test | Meaning | CTA (M7) |
|---|---|---|---|
| `demo` | `isDemo` | visitor on mocks | show download CTA |
| `no-account` | not authenticated | anonymous | sign-in + download CTA |
| `never-synced` | authenticated, data source is supabase, `synced_devices` has 0 rows | app not installed, or sync never turned on, or a different Google account | download + "turn on sync" CTA |
| `offline` | ≥1 device row, newest `last_seen_at` older than ~2 min (3 missed 45s passes) | app closed, signed out, or sync toggled off | **no download CTA**; "open Personas on your computer" state; commands would queue and expire at 1h |
| `online` | newest `last_seen_at` within ~2 min | can sync and can receive commands | none |

Existing web code already counts devices online with a **5-minute** cutoff (`supabaseApi.ts:444-476`, `getHealth` / `getStatus`), and `executePersona` targets the most recently seen device without checking freshness (`:375-381`). The ~2 min threshold is a recommendation, not existing code.

**Exists vs needs building**

| | Exists | Needs building |
|---|---|---|
| Web | heartbeat reads, Realtime on `synced_devices` (refetches system store), `run_persona` insert | a `useSyncReachability()` hook returning the tier above; a build where `NEXT_PUBLIC_DATA_SOURCE=supabase`; following command rows (`pending_commands` in `WATCHED_TABLES`); a device picker if >1 device |
| Desktop | heartbeat, opt-in toggle, 4 verbs, approval prompt | push a device `name` (always `None` today, so the web cannot say "approve on Michal's laptop"); any new verb; optionally a trusted-phone auto-approve policy |

---

## 3. Mobile agent actions: what works today

| Desired action | Status | Detail |
|---|---|---|
| Run now (with a prompt) | **Works via `pending_commands` today** | Web insert exists (`supabaseApi.ts:373-404`), desktop handler exists (`rc.rs:455-472`). Caveats: someone must click **Approve on the desktop**; ≥15s latency; the web never follows the row to its `execution_id`. |
| Cancel a queued fleet session | Works on desktop (`queue_cancel`), **no web caller** | Needs a reader for `synced_fleet_queue` + insert. |
| Reorder queue / set lane | Works on desktop (`queue_reorder`, `queue_set_lane`), no web caller | Payload JSON in `prompt`, by session id (`sql:340-345`). |
| Cancel a running execution | **Allowed in SQL, no desktop handler** | Desktop rejects as `unsupported_command_type`. Web is 501. Desktop has the local command `cancel_execution` (`commands/execution/executions.rs:734`) to wire. |
| Approve / reject a review | **Not modelled** | No verb in the CHECK; web `updateEvent` is 501. Desktop local command: `update_manual_review_status` (`commands/design/reviews.rs:1242`). Note the irony: approving a remote review would itself need a desktop approval unless a trusted-phone policy exists. |
| Pause / resume an agent | **Not modelled** | Desktop: `set_persona_enabled` (`commands/core/personas.rs:130`). `enabled` is mirrored, so state is visible. |
| Pause a trigger / change a schedule | **Not modelled**, and not even readable | Cron/interval live in trigger `config`, deliberately not synced (`rows.rs:305-319`); web sees only `trigger_type, enabled, last/next_trigger_at`. Desktop: `update_trigger` (`commands/tools/triggers.rs:123`), trigger `status` active/paused not synced. |
| Edit instructions | **Not modelled** | `system_prompt`, `structured_prompt`, `core_profile` are mirrored read-only. Desktop: `update_persona` (`commands/core/personas.rs:217`). |
| Answer an agent waiting for input | Not modelled in cloud | LAN companion only (`companion_api.rs` reply). |
| Talk to Athena | **Not modelled** | No cloud path. Local `companion_send_message` (`commands/companion/chat.rs:75`); LAN-only p2p `send_remote_instruction` (`commands/network/remote_jobs.rs:69`). |
| Mark a message read | Not a command | `synced_messages.is_read` is writable by RLS but the desktop re-pushes the last 24h and overwrites it. |

Every new verb needs three changes: widen the SQL CHECK (owner-run migration; Supabase schema is out of scope without the owner), a desktop handler in `rc.rs`, and the web insert.

---

## 4. The desktop's persona, and what the mirror carries

Rust `Persona`: `src-tauri/core/src/models/persona.rs:719-827` (TS binding `src/lib/bindings/Persona.ts`).

| Field / area | In `synced_personas`? | Web maps it? (`supabaseApi.ts:102-143`) |
|---|---|---|
| `name`, `description`, `icon`, `color` | yes | yes |
| `enabled` | yes | yes |
| `system_prompt`, `structured_prompt` | yes | yes |
| `core_profile` (PersonaCore: dials, identity, voice, principles) | yes (`sql:69,81`) | **no** |
| `home_team_id`, `template_category` | yes | **no** (`groupId` hardcoded `null`) |
| `max_budget_usd`, `max_turns`, `max_concurrent`, `timeout_ms` | yes | yes |
| `design_context` (use cases, connector pipeline, credential links, memory strategy...) | yes, as JSON text | yes, as raw string |
| `model_profile` (model, provider) | **no**, whole column skipped as encrypted (`rows.rs:3-11`); the SQL column exists but stays null | mapped, always null |
| `lifecycle` (draft/active/archived), `setup_status`, `starred`, `sensitive`, `headless`, trust, `parameters` | no | n/a |
| Tools, credentials, connectors | no (`persona_tools`, `persona_credentials` never synced) | n/a; connector names only inside `design_context` |
| Event subscriptions | no (`supabaseApi.listSubscriptions` returns `[]`) | n/a |
| Triggers | partly: type, enabled, last/next fire (`synced_triggers`) | standalone `getSyncedTriggers` only |
| Health | computed on desktop (`PersonaHealth`, `persona.rs:1000-1021`), not synced | derivable from `synced_executions` / `synced_leaderboard` |
| Cost | per execution `cost_usd`, daily `synced_metrics_snapshots`, `synced_persona_spend` view | yes |
| Memory | `synced_memories` (title, content, category, importance, tags) | yes (Knowledge page) |
| Reviews | `synced_manual_reviews` | yes (`listEvents` adapter, `supabaseApi.ts:409-420`) |
| Version history | no (desktop `list_persona_change_log`, `personas.rs:246`) | n/a |

Desktop trigger types: `manual, schedule, polling, webhook, chain, event_listener, file_watcher, clipboard, app_focus, composite` (`core/src/models/trigger.rs:79-88`). There is no "paused persona" state; pause exists on triggers (`trigger.rs:559-562`) and as `enabled=false` on the persona.

---

## 5. Moonshot cards

| Card | Proposes | Substrate for mobile agent management? |
|---|---|---|
| **8.1A** (`8-platform-i18n.md:16`) | `/m` as the desktop's remote control: typed command outbox over `pending_commands`, realtime receipts, demo outbox | **Yes, the core.** Its premise that the desktop already accepts `cancel_execution` is wrong (section 2.2). |
| **8.1B** (`:75`) | Installable `/m` + Web Push for pending reviews, notification Approve via 8.1A | Yes for "needs you" alerts; blocked on a resolvable review verb and on reversing the `public/sw.js` tombstone. |
| **7.6A** (`7-observability.md:457`) | Web command plane: `commandStore` on Realtime `pending_commands`, fleet queue reader, 5 verbs, lifecycle chip, scripted demo approver | **Yes**: the shared store the mobile views should sit on. Same `cancel_execution` overcount. |
| **5.6A** (`5-roadmap-infra.md:456`) | Every `readOnly()` verb becomes an approval-gated command with a live result; `PendingCommandChip` | Yes, same plane seen from the API layer; its own falsifier ("check the desktop handler first") fails for cancel. |
| **5.10A** (`5-roadmap-infra.md:801`) | Pairing as sign-in: web shows code/QR, desktop approves, server mints the session; proxy-level check | Partial: it would make "can sync" provable and onboarding one-tap; not required for management (same-Google-account already links). Note `src/proxy.ts` is now deleted. |
| **6.4A** (`6-dashboard-ops.md:480`) | One `PersonaSpec` (identity + Core + operating spec + revisions) for all four persona populations; dormant optimistic path becomes the edit path | Yes for **what to show** (Core, team, readiness) and for a coherent demo roster; edits still need desktop verbs. |

---

## 6. Constraints

- **Demo must keep working on mocks.** `api` proxy routes `isDemo` to `mockApi` (`api.ts:357-358`); demo is in-memory and lost on hard navigation (`authStore.ts:201-209`). Sources with no live counterpart go through `useDemoOnlySWR` (`src/hooks/useDemoOnlySWR.ts:15-31`, honest `liveUnavailable` for real tenants). A mobile command plane needs a demo implementation (scripted approver) so the demo shows management, not a 501. PLAN phase 2 forbids directly imported fixtures.
- **The Personas view's fleet is a third persona population.** `fleet.json` (99 agents) is not `mockApi`'s `MOCK_PERSONAS` (5) nor synced personas; mobile agent views built on it would have no live path.
- **i18n.** PLAN M4: new copy in an English-only `mobile` namespace, all 13 locales translated before launch (CLAUDE.md rule 1). Command states (7) and any notification copy add keys.
- **`dashboard/spa` merge.** Phase 2 waits on it (PLAN). The branch still carries the old `/m` tree (it edits `src/app/m/reviews/page.tsx`); keep the stage-fit delete. Expect rename conflicts for views stage-fit changed since `23514a5` (director, health, incidents, observability, settings, home ticker; `reviewStore` +31, `supabaseApi` +12).
- **Routes.** `src/app/` path changes need owner confirmation. `/m`, `/m/overview`, `/m/reviews`, `/m/messages`, `/m/alerts` are currently redirects (`next.config.ts:96-100`); `/m` and `/m2` are being taken by the phase-1 landing (M5), so dashboard views need distinct paths (e.g. `/m/...` sub-routes behind auth, or responsive `/dashboard/[view]`). `src/proxy.ts` is gone; any phone redirect must be re-created. The desktop LAN companion also serves a path called `/m` on its own host (no collision, but naming overlap in docs and support).
- **Desktop-only views.** Personas (`min-h-[700px]`) and the AgentScene layout cannot be reused at 390px; mobile needs its own composition.
- **Supabase schema and RLS live outside this repo** (CLAUDE.md "Out of scope"); widening the CHECK is an owner-run `npm run db:migrate:sync` plus a desktop PR.
- **Bundle budget and verification:** new routes need `check:bundle -- --update`; phone checks only via the Playwright `mobile` project (PLAN phase 0).

---

## Facts that should shape the phase 2 design

1. **Only one agent action works end to end today: run a persona**, and it needs a human to click Approve on the desktop within 1h. Mobile "management" is today "request, then the desk approves", unless a trusted-phone auto-approve policy is built on the desktop.
2. **The desktop executes 4 verbs** (`run_persona`, `queue_reorder`, `queue_set_lane`, `queue_cancel`); `cancel_execution` is allowed in SQL but rejected by the desktop. Pause, review approval, trigger/schedule edits, instruction edits and Athena chat are not modelled anywhere in the cloud plane.
3. **"Can sync" is measurable today** from `synced_devices.last_seen_at` (45s heartbeat, same gates as the command poll). The tiers in 2.5 separate "never synced" (show download CTA) from "synced but offline" (show "open the app", not a download).
4. **The web never follows a command.** `pending_commands` is Realtime-published but unwatched; a mobile UI must add it to `WATCHED_TABLES` (or a command store) and render pending/executing/completed/rejected/expired honestly.
5. **The live plane is a build-time switch** (`NEXT_PUBLIC_DATA_SOURCE=supabase`), reportedly off in this deployment; without it there is no "can sync" signal and no commands, only orchestrator calls.
6. **The mirror carries enough to show an agent well**: name, icon, color, enabled, prompt, `core_profile`, team, budget, executions/cost, memories, reviews, next trigger. Not the model, tools/connectors, cron expressions or a health score. The web drops `core_profile` and `home_team_id` on read.
7. **The spa Personas view is a simulation over `fleet.json`** with no store or API wiring and a 700px floor. Mobile agent views must bind to `personaStore` / synced tables, not to `fleet.json`, or they inherit no live path.
8. **The desktop already ships a LAN-only phone PWA** with approve/reject (Athena proposals), reply, wake, kill. It is a ready reference for the verb set a phone needs and for the trusted-device token model.
9. **Device names are not pushed** (`name = None`), so "awaiting approval on <device>" and multi-device choice need a desktop change.
10. **Demo must simulate the command loop** (scripted approver with ~15s latency) so the demo phone shows management, consistent with 7.6A / 8.1A.

## Open questions for the owner

1. **Approval model:** should phone commands keep the per-command desktop approval, or should the desktop get a "trusted phone" policy (per verb, e.g. auto-approve run/cancel/pause, keep approval for edits)? This decides whether mobile management is real-time or deferred.
2. **Verb scope for v1:** which new verbs do we commit desktop work to: `cancel_execution` (handler only), `review_resolve`, `set_persona_enabled`, `trigger_set_enabled`, `companion_message`? Each needs a CHECK change plus a desktop PR.
3. **Live plane:** will production be built with `NEXT_PUBLIC_DATA_SOURCE=supabase` (and the sync SQL applied to the prod project)? Without it the "can sync" tiers collapse to demo/no-account and the CTA is always shown.
4. **Offline tier UX:** when a device exists but is stale, should the phone still allow queuing commands (they expire in 1h), or block actions and say "open Personas on your computer"?
5. **Routes:** mobile dashboard as `/m/<view>` sub-routes (behind auth, distinct from the public `/m` landing) or as phone layouts of `/dashboard/[view]` after the spa merge?
