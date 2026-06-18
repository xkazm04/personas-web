# Supabase Client — blended bug-hunter + test-mastery scan
> Total: 6  (Critical: 0, High: 2, Medium: 3, Low: 1)

Scope: `src/lib/supabase.ts` (anon-key lazy client) + `src/lib/supabaseApi.ts` (the typed read-mirror query helpers consumed by leaderboard, SLA, messages, knowledge, observability, home routines/top-performers). The leaderboard radar + SLA paths are the highest-risk because they perform cohort-relative math whose correctness depends on row-shape and cohort-size invariants that are silently assumed. There is **no unit-test runner** in this project (only Playwright e2e + `tsc`), so none of the row→domain mappers or the env guard have any meaningful coverage.

---

## 1. Single-persona (or uniform) cohort always scores cost = speed = 0 on the leaderboard radar
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: cohort-relative scoring invariant
- **File**: src/lib/supabaseApi.ts:763-796
- **Scenario**: A user with only one synced persona (or a cohort where every persona has identical per-exec cost and identical avg duration) opens the leaderboard. `maxPerExecCost` and `maxDuration` equal that persona's own value, so `cost = (1 - perExecCost[i]/maxPerExecCost)*100 = 0` and `speed = (1 - avgDuration/maxDuration)*100 = 0` for the only/best performer.
- **Root cause**: cost and speed are scored *purely relatively* against the cohort max, with no absolute anchor. A cohort of one (or a tie at the top) makes the relative term collapse to the worst-case 0 even when the persona is performing perfectly. The "worst performer anchors near 0" comment is only true for a multi-member spread.
- **Impact**: UX degradation / misleading data — the radar shows a strong single persona as 0 on two of five axes and a depressed composite, which looks like a real failure to the user. The most common early-adopter state (one persona) is the most broken.
- **Fix sketch**: Detect a degenerate cohort (`r.length < 2` or zero spread) and fall back to an absolute scale (e.g. cost via a fixed reference $/exec, speed via the SLA latency budget) or score the top performer at 100 when there is no spread.

## 2. `mapStatus` / `mapEvent` blind-cast desktop free-text into web enums, corrupting status-derived UI and filters
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: data-shape contract drift (Supabase row → typed contract)
- **File**: src/lib/supabaseApi.ts:65-68, 184-199
- **Scenario**: The desktop writer evolves and syncs a `synced_executions.status` (or `synced_events.status`) value the web enum doesn't model — e.g. `"queued"`, `"cancelled"`, `"timeout"`, `"pending_approval"`. `mapStatus` only rewrites `"incomplete"`→`"failed"`; every other unknown string is cast verbatim with `s as PersonaExecutionStatus`, and `mapEvent` does `r.status as EventStatus` with zero validation.
- **Root cause**: the mapper assumes the desktop status vocabulary is a subset of the web enum minus one known alias. A TypeScript `as` cast performs no runtime check, so any drift flows straight into status badges, success-rate math, and `eq("status", ...)` filters that will silently never match the unmapped value.
- **Impact**: data-shape mismatch / silent UX corruption — an unknown status renders as an unstyled/empty badge or is double-counted, and status filters quietly return nothing. The defect is invisible until the desktop schema moves.
- **Fix sketch**: Validate against an explicit allow-set; map every non-terminal unknown to a defined sentinel (e.g. `"running"` or a new `"unknown"`) and log a dev warning, rather than casting blindly.

## 3. No unit harness for the row→domain mappers and the env guard (highest-value coverage gap)
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: missing test harness / risk-weighted coverage gap
- **File**: src/lib/supabaseApi.ts:100-285,749-913 ; src/lib/supabase.ts:5-14
- **Scenario**: Any of `mapPersona`, `mapExecution`, `mapEvent`, `reviewToEvent`, `mapHealingIssue`, `getSyncedLeaderboard`, `getSyncedSla`, `getSyncedMessageThreads`, or the `getSupabase()` env guard regresses (e.g. a renamed snake_case column, a flipped null-coalesce, a broken composite-rounding contract). With Playwright-only and no vitest/jest, nothing fails — these are pure, deterministic, trivially testable functions that are the entire data boundary for three dashboard surfaces.
- **Root cause**: the project ships no unit runner, so the most LLM-generatable, highest-leverage tests (pure mapping + invariant assertions) cannot exist; e2e cannot exercise these without a live Supabase fixture.
- **Impact**: false-confidence / undetected regression — `tsc` passes while a column-rename or a math change silently breaks roadmap/leaderboard/SLA output shape.
- **Fix sketch**: Add a lightweight vitest config; write table-driven tests asserting real invariants — e.g. every radar axis and `composite` is an integer in `[0,100]`, `clamp100(NaN)===0`, empty cohort → `[]`, single-persona cohort behavior (ties to finding #1), `mapStatus("incomplete")==="failed"`, and `getSupabase()` throws on missing env.

## 4. SLA breach computation has no integer/contract invariant test and trusts unbounded duration
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: untested business-critical math
- **File**: src/lib/supabaseApi.ts:831-913
- **Scenario**: `getSyncedSla` derives breach severity, `current`, and `timeInSLA` from `successful_executions/total` and `avg_duration_ms`. A row where `successful_executions > total_executions` (sync skew / double-count) yields a success rate >100% that silently passes the objective; an absurd `avg_duration_ms` yields a `timeInSLA` clamped but a `current` of e.g. millions. None of this is asserted anywhere.
- **Root cause**: the helper assumes `successful_executions <= total_executions` and bounded durations, and there is no test pinning the `current`/`timeInSLA`/severity contract or the >100% guard.
- **Impact**: false-confidence test gap + latent UX glitch — a sync anomaly can mask a real breach (rate >100%) or show a nonsensical SLA card with no detection.
- **Fix sketch**: Clamp `successRate` to `[0,100]` (`Math.min(100, ...)`) before the breach check; add unit tests covering rate>100%, zero-total skip, and the latency-critical/major thresholds.

## 5. `executePersona` targets the most-recent device without a freshness check — queues a run to an offline device
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale-data / silent no-progress
- **File**: src/lib/supabaseApi.ts:345-376
- **Scenario**: A user clicks "Run" from the dashboard. `executePersona` picks `synced_devices` ordered by `last_seen_at desc` and inserts a `pending_commands` row for it — but never checks that the device was seen recently (the 5-min cutoff used in `getHealth`/`getStatus` is *not* applied here). If the most-recent device went offline an hour ago, the command is queued to a device that will never pick it up.
- **Root cause**: device selection uses recency-ordering as a proxy for liveness but omits the staleness gate that the health/status methods already encode, so "most recent" can still be stale.
- **Impact**: UX degradation / silent stall — the run reports `status: "queued"` and then nothing ever happens; the user has no signal the device is dead.
- **Fix sketch**: Apply the same `last_seen_at > now - 5min` cutoff when selecting the target; if no fresh device exists, throw the same 409 "no synced device available" error instead of queuing into the void.

## 6. Module-level client singleton caches across env changes and is never reset/disposed
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: lifecycle / caching
- **File**: src/lib/supabase.ts:3-14
- **Scenario**: `_client` is a module-scoped cache populated on first successful call. In a long-lived server/runtime where `NEXT_PUBLIC_*` could differ between contexts, or in tests that want to exercise both the configured and unconfigured paths, the first resolution wins permanently — there is no way to reset or re-create the client with a new key, and no test seam.
- **Root cause**: the singleton assumes env is immutable for process lifetime and offers no reset hook, which also makes the env-guard branch (the throw) untestable once the client is created.
- **Impact**: minor — testability friction and a theoretical stale-config risk; not a runtime crash in the common single-config deployment.
- **Fix sketch**: Export a `__resetSupabaseForTests()` (or accept an injectable factory) so both the throw branch and the configured branch can be exercised; optionally key the cache on the resolved url+key.
