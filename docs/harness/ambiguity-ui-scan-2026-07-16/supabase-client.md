# Supabase Client — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 1, Medium: 2, Low: 1)

Scope note (drift): the dispatch listed `src/lib/supabase-admin.ts`, which does not exist. The actual pair (matching `context-map.json`) is `src/lib/supabase.ts` + `src/lib/supabaseApi.ts`. There is no service-role/admin client anywhere in the repo — that absence is itself the root of finding 1.

## 1. Anon-key-only architecture exposes voter emails and allows vote wipe directly against Supabase
- **Severity**: Critical
- **Agent**: ambiguity_guardian
- **Category**: anon-key-rls-pii-exposure
- **File**: `src/lib/supabase.ts:8` (policies: `scripts/setup-voting-db.sql:94-101`; bypassed guard: `src/app/api/votes/route.ts:34-37`)
- **Scenario**: `getSupabase()` is the ONLY client and it uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` — a key intentionally shipped in the browser bundle. The votes API writes/deletes/updates `feature_votes` (which stores optional `email`) with this same anon role, so `setup-voting-db.sql` grants anon `select/insert/update/delete ... using (true)` on `feature_votes`. Anyone can lift the URL+anon key from the page source and call Supabase REST directly: `select email, voter_id from feature_votes` or `delete from feature_votes`.
- **Root cause**: No server-only service-role client exists (the expected `supabase-admin.ts` was never built), so server routes had to reuse the public anon client, which forced wide-open RLS policies. The route's careful "email is deliberately NOT selected... write-only" comment (`votes/route.ts:34-36`) documents an intent the data layer cannot enforce — the protection only holds for requests that politely go through the API.
- **Impact**: Full disclosure of every voter's email (PII) to any visitor, plus unauthenticated bulk deletion/overwrite of all votes and emails (data loss / integrity). The PII policy header in the route is factually violated at the database layer.
- **Fix sketch**: Add `src/lib/supabase-admin.ts` creating a `server-only` client from `SUPABASE_SERVICE_ROLE_KEY` (with `auth: { persistSession: false }`); switch `votes/storage.ts:getSupabaseClient` (and feature-comments/boosts routes) to it; then tighten RLS to anon `select` on non-PII columns only (or a `feature_vote_counts` view) and drop anon insert/update/delete.

## 2. Waitlist signups silently lost in production despite Supabase being available
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: documented-but-unresolved-data-loss
- **File**: `src/app/api/waitlist/route.ts:1-14`
- **Scenario**: The route's own header states "DEVELOPMENT ONLY... On serverless platforms the filesystem is ephemeral. Data will be LOST on every cold start or redeploy" and "DATABASE REQUIRED... Supabase is the recommended path". Yet the handler only ever writes `.data/waitlist.json` — there is no `hasSupabase()` branch like the votes route has, even though the helper and client already exist.
- **Root cause**: The known limitation was recorded as a comment instead of a guard or an implementation; nothing fails loudly when the route runs in an environment where writes won't persist.
- **Impact**: On the deployed marketing site, users get "Added to waitlist" confirmations while their emails evaporate on the next cold start — the worst failure mode for a marketing site's primary conversion funnel, and invisible until someone asks where the signups went.
- **Fix sketch**: Mirror the votes pattern: `if (hasSupabase())` insert into a `waitlist_entries` table (unique on `(email, platform)`, served by the service-role client per finding 1); keep FS as the local-dev fallback, and log a startup warning (or 503 the POST) when neither persistent backend is configured in production.

## 3. One shared singleton client serves both the authed browser dashboard and anonymous server routes
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-shared-client-assumption
- **File**: `src/lib/supabase.ts:3-14`
- **Scenario**: The module-level `_client` is imported by browser code that signs users in on it (`src/stores/authStore.ts:91,200` — `supabaseApi.ts` explicitly relies on "the shared Supabase client carries the signed-in user's session" for RLS row isolation) AND by server API routes (`src/app/api/votes/storage.ts:48-51`, `src/app/api/roadmap/route.ts:11`) where the singleton persists across requests within a warm serverless instance.
- **Root cause**: Nothing in the file records the load-bearing assumption that server-side usage must remain session-less forever. `createClient` is called with default browser options (`persistSession: true`, `autoRefreshToken: true`), which are wrong for a server context; and the moment any server code authenticates this client, the session would leak across all users sharing the warm instance.
- **Impact**: Latent cross-user session-bleed hazard, GoTrue "no storage" warnings server-side, and an unguarded invariant that a future contributor (e.g., adding an authed server route) can break without any signal. Also the thrown error "Supabase env vars not configured" (`supabase.ts:10`) doesn't name which of the two vars is missing.
- **Fix sketch**: Split into `getBrowserSupabase()` (current behavior) and a per-request/session-less `getServerSupabase()` with `auth: { persistSession: false, autoRefreshToken: false }`; add a one-line comment stating the anon-only server invariant; name the missing var in the error.

## 4. `executePersona` queues commands to devices that may be long offline — the "online" cutoff exists but isn't applied
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: happy-path-device-targeting
- **File**: `src/lib/supabaseApi.ts:367-398`
- **Scenario**: A dashboard "run" picks the device with the newest `last_seen_at` and inserts a `pending_commands` row with `status: "pending"`. `getHealth`/`getStatus` define online-ness as `last_seen_at` within `5 * 60_000` ms (duplicated magic number at `supabaseApi.ts:442` and `458`), but `executePersona` never applies that cutoff — a device last seen days ago is still a valid target.
- **Root cause**: The 5-minute liveness threshold is an unnamed, duplicated literal rather than a shared constant, so the third place that needed it didn't use it; and no expiry/TTL semantics were decided for `pending_commands`.
- **Impact**: The user sees `status: "queued"` and waits for a run that will never start until that machine reopens the desktop app — and the stale command may then fire unexpectedly hours or days later (an approval-gated but surprising execution). No feedback distinguishes "awaiting approval" from "target offline".
- **Fix sketch**: Hoist `const DEVICE_ONLINE_WINDOW_MS = 5 * 60_000` (documenting its relation to the desktop heartbeat), filter candidate devices by it in `executePersona` (reuse the existing 409 message when none qualify), and record a decision on command TTL (e.g., desktop ignores `pending_commands` older than N minutes).

## 5. Persona fallback color `#888888` duplicated as raw literals beside its named constant
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: hardcoded-color-drift
- **File**: `src/lib/supabaseApi.ts:501` (also `:625`; constant at `:744`)
- **Scenario**: `FALLBACK_PERSONA_COLOR = "#888888"` is defined once but `getObservabilityPersonaSpend` and `getUsageAnalytics` inline the literal `"#888888"` instead, because the constant is declared 240 lines below its first would-be use.
- **Root cause**: Constant added later for the leaderboard/messages helpers without sweeping the two earlier call sites; no shared design-token source for chart/persona accent fallbacks.
- **Impact**: If the fallback is ever tuned (e.g., for dark-theme contrast — a fixed mid-gray is near-invisible on some chart backgrounds), spend and usage charts will silently disagree with leaderboard/messages/triggers, breaking cross-view persona color consistency.
- **Fix sketch**: Move `FALLBACK_PERSONA_COLOR` to the top of the file (or a shared tokens module) and replace both literals; consider deriving the fallback from the theme palette rather than a hex constant.
