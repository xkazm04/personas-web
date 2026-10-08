# Moonshot cards - Observability & Event Monitoring (8 contexts, 16 cards)

Scout: moonshot-architect lens, read-only. Baseline: master @ `0a0957b` working tree. Checked against the
ArchitectWeb backlog, the PerfectWeb directions (the five `home-*` directions), the ship-loop backlog, the
2026-09-23 challenge backlog (its two shipped Observability cards are "one daily series" `39dd7a5` and
"incident threads via ?focus=" `c46ecd9`), and the `dashboard/spa` branch (`C:/t/dash-spa`, commit `93c322d`:
the annunciator wall replaces the home cockpit). None of the cards below repeats those.

A finding behind several cards: the sync plane has moved ahead of the web. `scripts/setup-sync-db.sql` now
carries `synced_metrics_snapshots`, `synced_fleet_queue` and a five-verb `pending_commands`, and publishes 9
tables to Realtime. `src/` never reads `synced_metrics_snapshots` or `synced_fleet_queue` (grep finds 0 hits
outside the SQL), and `useSyncedRealtime` watches 5 of the 9 published tables. Separately, `/dashboard/health`,
`/dashboard/incidents` and `/dashboard/director` call their mock fetchers with no `isDemo` gate, so a signed-in
real tenant sees made-up agents, incidents and host checks.

---

## Execution History & Streaming
A filterable runs table with a detail modal whose output viewer polls `string[]` lines by offset. A real SSE proxy exists, but nothing calls it. files=14

### 7.1A · Run tape: one cursor-safe, typed execution log behind poll, SSE and sync
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
Replace "an array of stdout lines plus an offset" with a sequenced run tape: typed frames, folded idempotently. Any transport can feed it (SSE, offset poll, or the sync mirror's full buffer), so the viewer can't duplicate or drop output.

#### Description
Today the viewer appends whatever `api.getExecution(id, offset)` returns and moves the cursor forward by its length (`src/hooks/useExecutionPolling.ts:44-53`). The Supabase plane ignores the offset: `getExecution: async (id)` returns the whole `output_data` split by newline on every call (`src/lib/supabaseApi.ts:343-358`). So while a synced run stays `running`, each 1s poll appends the full buffer again. The feature doc predicted this ("If the orchestrator ever returns a non-incremental full buffer, lines would duplicate"), and the sync plane does exactly that. The real SSE proxy (`src/app/api/executions/[id]/stream/route.ts:9`) has no consumer; the only `new EventSource` in `src/` is `src/hooks/useEventStream.ts:115`. The content is markdown with sections (`src/lib/mockData.ts:761-786`), but it renders as raw `>`-prefixed lines (`ExecutionOutput.tsx:111`).

The moonshot is an `ExecutionFrame { seq, kind: text|tool_call|tool_result|cost|status, at, body }` plus one `useRunTape(id)` hook. The hook folds frames by `seq`, so a replayed or overlapping chunk changes nothing. It has three adapters:
- an SSE adapter that wakes the dormant proxy;
- an offset-poll adapter for the mock and the orchestrator;
- a full-buffer adapter for Supabase that synthesizes `seq` from the line index.

The viewer renders frames: markdown sections through the existing `MarkdownReport`, collapsed tool calls, and a live cost ticker. Home activity, Director evidence and incident investigation can all read the same tape later. It reuses `usePolling`, the proxy's abort and status hardening, and `MarkdownReport`.

**Constraint bent:** real structured frames need the desktop and orchestrator to emit them (a contract change). Until they do, the line adapter keeps today's behaviour and fixes the duplication.

#### Flow
- Pure `foldTape(tape, chunk)` plus a vitest that replays Supabase-shaped full-buffer responses (proves the fix)
- Swap `useExecutionPolling` onto the fold, keeping the same UI
- SSE adapter on `/api/executions/[id]/stream`, with polling as fallback (the `useEventStream` backoff pattern)
- Frame-aware viewer (markdown, tool-call rows, cost ticker)
- Contract proposal for desktop frames, then optionally a `synced_execution_frames` table

#### Expected impact
Operators watching a live synced run see each line once, and see structure instead of a log dump. Measure duplicate lines per run (target 0) and time from first frame to screen. Could break: a frame contract that drifts from the desktop's writer would hide output, so the line adapter must stay the fallback.

#### Evaluation
Claim: resilience - output is exactly-once whatever the transport
Before: Supabase mode, a run seen `running` across k polls shows about k copies of its buffer. Walk: 10 lines; poll 1 appends 10 (offset 10); poll 2 gets all 10 again, so 20 render
After: 10 lines however many polls run; SSE and poll can overlap without duplicates
Method: simulation - (1) the full-buffer walk above; (2) the mock's 3-line incremental chunks (`mockData.ts:800-813`) must render the same as today; (3) an SSE plus poll race delivering seq 4-6 twice. Falsified if the fold needs per-transport special cases beyond the seq source
Result: better
Gate: contract

#### First experiment
Write `foldTape` and the Supabase full-buffer regression test (red today, green after), then wire it into `useExecutionPolling`. Under a day, no UI change.

#### Evidence
- `src/hooks/useExecutionPolling.ts:48-53` - appends `data.output` and adds its length to the offset
- `src/lib/supabaseApi.ts:343-358` - ignores offset, returns the whole `output_data` every call
- `src/lib/api.ts:132` - the interface promises `getExecution(id, offset?)`
- `src/app/api/executions/[id]/stream/route.ts:9-80` - hardened SSE proxy; grep `new EventSource` finds only `useEventStream.ts:115`
- `src/app/dashboard/executions/executions-page/ExecutionOutput.tsx:111` - raw line rendering of markdown output

### 7.1B · Run divergence: "why did this fail when the last one passed?"
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Every failed run opens next to its nearest good sibling (same persona, same trigger or use case, or its retry parent). The modal shows a diff: input size, model, tokens, cost, duration, and the first line where the outputs diverge. Debugging stops being archaeology.

#### Description
The modal shows a KPI strip, the error and the output (`ExecutionDetailModal.tsx:58-101`). Each run already carries lineage: `triggerId`, `useCaseId` (`src/lib/types.ts:30-31`) and `retryOfExecutionId` (`:42`), all synced (`scripts/setup-sync-db.sql:91-92,104`). No UI file reads any of them; grep finds only token fields in the modal. All 12 mock runs have `retryOfExecutionId: null`. An operator can't ask "what changed?" without opening two modals and comparing by eye.

The moonshot is `pickBaseline(run, runs)`, which prefers the retry parent, then the same trigger, then the same use case, then the persona's last completed run. `compareRuns(a, b)` returns deltas (input tokens, model, duration, cost, retries) and `firstDivergence(outA, outB)`. The modal gets a "Compare with last good run" split view, and its top line is a templated hypothesis such as "input was 4.9x larger". Lineage also becomes navigable: retry chains as breadcrumbs, and a trigger's run history as a strip. Registry subject `diff-comparison` governs the split view. It reuses `Modal`, `DataTable`, the enrichment selector, and Card A's tape when present (it works on `outputData` strings without it).

#### Flow
- Pure `pickBaseline` / `compareRuns` / `firstDivergence` with vitest on fixtures
- Seed 2 lineage fixtures (a retry of the failed PR run; a same-trigger pair)
- Split-view "Compare" tab in the modal, with the hypothesis line (i18n x14)
- Lineage breadcrumbs (retry chain), plus a trigger run-strip

#### Expected impact
Operators triaging failures see the cause without leaving the run. Measure clicks or time to the first plausible cause in a guided test, and the share of failed runs with a baseline found. Could break: a bad baseline (different job, same persona) points to a false cause, so the baseline reason must always be shown.

#### Evaluation
Claim: user - a failed run explains itself against a comparable success
Before: 0 lineage links rendered; comparing means two modals and manual reading
After: one tab; for the PR Review failure the delta row reads input tokens 148k vs typical, duration 3.4s vs 28.9s, with the error aligned
Method: simulation - (1) PR Review Agent failed run ("Context window exceeded... 148k tokens", 3,400 ms) against its completed 28,900 ms run (`mockData.ts` p1 rows); (2) Daily Standup Digest's two completed same-trigger runs (`triggerId t1`), which should yield "no divergence"; (3) the cancelled Incident Responder run (1,200 ms), which should pick a baseline but flag "cancelled, not failed". Falsified if more than 1 of 3 picks a misleading baseline
Result: better
Gate: direction

#### First experiment
Pure baseline and divergence functions plus a fixture test over the 12 mock runs, printed as a table of (failed run → baseline → reason). This shows whether the lineage data supports the view before any UI work.

#### Evidence
- `src/lib/types.ts:30-31,42` - triggerId / useCaseId / retryOfExecutionId on every run
- `scripts/setup-sync-db.sql:91-92,104` - the same lineage columns are synced
- `src/app/dashboard/executions/executions-page/ExecutionDetailModal.tsx:58-101` - modal shows only aggregates, error and output
- grep `retryOf|claudeSessionId|modelUsed` in `*.tsx` → 0 reads; `retryOfExecutionId: null` appears 12x in `mockData.ts`

---

## Leaderboard & Rankings
Top-3 podium, dimension tabs, sortable table and benchmark radar. Real mode normalizes an all-time Supabase view, and trend and delta are always flat or 0. files=10

### 7.2A · Standings from snapshots: windowed, task-fair ratings with real movement
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Rebuild the ranking engine on the per-persona daily snapshots the desktop already syncs. Use windowed scores, each persona's speed and cost measured against its own baseline (not the slowest unrelated job), and a real period delta and rank history. One pure module, shared by the demo and the real plane.

#### Description
`getSyncedLeaderboard` reads the all-time `synced_leaderboard` view. It scores speed and cost against the cohort max (`src/lib/supabaseApi.ts:785-797`), so the persona with the longest job is permanently pinned near 0. The comment says trend and delta "cannot be computed... no prior-period snapshot is available" and returns `flat` / `0` (`:818-824`). Yet `synced_metrics_snapshots` (`scripts/setup-sync-db.sql:180-201`) holds exactly that: per persona, per day, executions, successes, cost, tokens and average duration. Grep finds no reader in `src/`. In demo the deltas are hand-set (`MOCK_LEADERBOARD`, `src/lib/mock-dashboard-data.ts:596-641`).

The moonshot is `src/lib/standings.ts`, following the `observabilitySeries.ts` precedent: pure functions any plane can call.
- `windowedAxes(snapshots, window)` gives reliability, cost per run, duration and volume for the current and prior windows.
- `selfRelative(axis)` scores improvement against the persona's own trailing baseline, with absolute floors.
- `standings(...)` returns the composite, the real `delta`, and a `rankHistory[]`, so the podium can show "climbed 2 places this week".

The demo gets a snapshot fixture projected from `MOCK_DAILY_METRICS`, so both planes run one code path and the fixture reconciliation tests extend naturally. Card Director-A supplies a measured quality axis.

#### Flow
- Count snapshot rows in the sync project (is the desktop writing them?)
- Pure `standings.ts` plus vitest (window split, self-relative scoring, rank history)
- Projected demo snapshot fixture, plus reconciliation test against the daily root
- `getSyncedLeaderboard` reads snapshots; the podium shows a rank-movement chip and the table a rank sparkline

#### Expected impact
Real tenants get a leaderboard that moves, and a slow-but-improving agent stops being stuck at the bottom. Measure the share of real rows with non-zero delta, and the rank sparkline coverage. Could break: sparse snapshots (a desktop closed for days) make windows noisy, so a minimum-runs floor must suppress the delta.

#### Evaluation
Claim: quality - rankings reflect change over time and compare like with like
Before: real mode shows 100% of rows `flat / 0`. Customer Feedback Analyzer (runs of 62.3s and 58.4s, the fleet's slowest) scores speed = clamp((1 - 62.3/62.3) x 100) = 0 whatever it does
After: deltas come from two snapshot windows; a 10% duration improvement lifts Feedback Analyzer's speed axis instead of leaving it at 0
Method: simulation - (1) the Feedback Analyzer case; (2) a persona with identical windows, which must give delta 0 honestly; (3) a persona with 2 runs in the window, which must suppress the delta. Falsified if snapshots are not being written (first experiment)
Result: better
Gate: architecture

#### First experiment
A scratch script runs `select persona_id, count(*), min(snapshot_date), max(snapshot_date) from synced_metrics_snapshots group by 1`, plus the pure `standings()` with tests on a projected fixture. Under a day; it settles whether the data exists.

#### Evidence
- `src/lib/supabaseApi.ts:797` - `speed = clamp100((1 - avg / maxDuration) * 100)` (cohort-max normalization)
- `src/lib/supabaseApi.ts:818-824` - trend/delta hard-coded flat / 0, citing missing snapshots
- `scripts/setup-sync-db.sql:180-201` - `synced_metrics_snapshots` per persona per day
- grep `synced_metrics_snapshots` in `src/` → 0 hits

### 7.2B · Champion vs. challenger: replay the leader's real inputs on a rival
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
Turn the leaderboard from a scoreboard into a test bench. Pick a champion and a challenger, replay the champion's last N real inputs on the challenger through approval-gated desktop commands, and watch a head-to-head board fill in per input. Same-input comparison is the only fair one.

#### Description
Comparison today is a read-only overlay. The radar's benchmark is always rank #1 (`src/app/dashboard/leaderboard/page.tsx:41-60`). `LeaderboardTable` accepts a `compareId` it never receives (`LeaderboardTable.tsx:22,28,76`). The axes compare aggregates over different inputs. Meanwhile the remote-run path exists: `executePersona(personaId, prompt)` inserts a `run_persona` row into `pending_commands` targeting the freshest device (`src/lib/supabaseApi.ts:362-398`), and every run keeps its `inputData` (`src/lib/types.ts:33`; `input_data` synced). The desktop approves and records `execution_id` on completion (`scripts/setup-sync-db.sql:328-338`).

In "Bake-off" mode you pick two personas and N inputs from the champion's history. That queues N `run_persona` commands for the challenger, follows them through `pending_commands` Realtime (already published, `setup-sync-db.sql:540-544`), pairs each challenger run with its champion run, and renders a per-input board: winner by success, cost and duration, plus the Director verdict when one exists. The aggregate shows as the radar's second series (wiring `compareId`). Demo mode runs a scripted bake-off over fixture inputs. Registry subject: `eval-harness` (strong match for this context in `.ai/registry-map.json`).

**Constraints bent:** the dashboard leaves demo-only and writes for real tenants (via Supabase, not the orchestrator); runs cost the user money; N approvals on the desktop unless it learns batch approval.

#### Flow
- Demo-only bake-off panel over fixture inputs (proves the board reads well)
- Command lifecycle tracking (shared with Home-A), plus pairing runs by command → `execution_id`
- Real mode behind an explicit cost-estimate confirm (N x champion avg cost)
- Desktop ask: batch approval for a bake-off group

#### Expected impact
Operators can settle "should the new prompt or model replace the old agent?" with evidence instead of a radar of unlike work. Measure bake-offs started and their completion rate, and how often the result leads to a swap. Could break: approval fatigue (N prompts) or a runaway spend; cap N and show the estimate first.

#### Evaluation
Claim: user - a fair, same-input comparison in one flow
Before: 0 same-input comparisons possible on the web; `compareId` unused
After: N paired results per bake-off; the radar compares against a chosen rival, not always #1
Method: simulation - (1) N=5 inputs give 5 commands, and at the desktop's ~15s poll (`setup-sync-db.sql:331-333`) the first result lands in at least 15s plus run time; (2) a challenger that fails 2/5 gets a board showing 3-2 with links to both runs; (3) the desktop is offline, so `executePersona` throws 409 and the UI must say so (`supabaseApi.ts:377-381`). Falsified if `run_persona` with a replayed prompt does not reproduce the champion's context (e.g. trigger payloads not carried in `input_data`)
Result: unmeasurable
Gate: policy-loosen

#### First experiment
A demo-only bake-off panel on `/preview` using five fixture inputs and scripted outcomes, to test whether the per-input board earns trust. In parallel, read the desktop's `remote_commands.rs` to confirm prompt-only replay fidelity.

#### Evidence
- `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardTable.tsx:22,28,76` - `compareId` wired, never passed
- `src/app/dashboard/leaderboard/page.tsx:41-44` - benchmark is always `personas[0]`
- `src/lib/supabaseApi.ts:362-398` - live `run_persona` command insert with arbitrary prompt
- `scripts/setup-sync-db.sql:328-338,374-375` - approval flow, `execution_id` on completion, allowed verbs

---

## Director Coaching
The coaching command center: scorecard, momentum, value breakdown, 0-5 histogram, coaching table and verdict feed. 100% mock, with no real-mode branch. files=11

### 7.3A · One fleet, one judge: a synced verdict ledger that becomes the fleet's quality axis
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Make the Director's 0-5 verdicts real, synced data about the same fleet every other surface shows. Then let them replace the leaderboard's invented quality proxy and join the incident threads. The Director becomes the dashboard's source of judgment.

#### Description
The Director runs a second, fictional fleet. `DIRECTOR_ROSTER` (ResearchAgent, CodeReviewer, DataProcessor, NotifyBot, ReportGen; `src/lib/mock-dashboard-data.ts:1997-2048`) shares no id with `FLEET`, which is projected from `MOCK_PERSONAS` (`:52-59`) and used by leaderboard, SLA, incidents and home. That breaks the shipped "one fleet, one truth" direction. Verdict `dv-1` "Slack webhook retry storm" (`:2070-2079`) describes the slack-circuit-break thread, but on NotifyBot instead of Daily Standup Digest. `useDirectorData` calls the mock fetcher with no `isDemo` gate (`src/lib/mockApi.ts:359`), so real tenants see these five agents. Meanwhile the leaderboard's quality axis is "a PROXY - no explicit quality metric is synced" (`src/lib/supabaseApi.ts:800`).

The moonshot has four parts:
1. Re-cast the Director fixtures onto `FLEET`.
2. Add `synced_director_reviews` (`persona_id`, `execution_id`, `score`, `outcome` delivered/partial/blocked/no_input, `category`, `title`, `created_at`) to `scripts/setup-sync-db.sql`, with RLS and Realtime like its siblings.
3. Add `getSyncedDirector()`, folding rows through the existing pure `directorMeta.ts` (momentum, attention, sparkline geometry are already pure).
4. Change the leaderboard quality axis to the mean of the last k verdicts where scored, labelled "proxy" only for unscored personas.

Verdicts carrying `execution_id` join incident threads and the run tape for free.

**Constraints bent:** a Supabase schema addition (CLAUDE.md fences table and RLS changes; the owner made a comparable additive change in `df30dad`), and a desktop writer contract.

#### Flow
- Re-cast the roster onto `FLEET` and gate the fetcher on `isDemo` (honest empty state for real tenants)
- DDL plus RLS plus Realtime for `synced_director_reviews` in `setup-sync-db.sql`
- `getSyncedDirector()` through `directorMeta` and a real-mode branch in `useDirectorData`
- Leaderboard quality from verdicts; verdict → incident-thread and execution links

#### Expected impact
Real tenants see their own agents judged, and "quality" on the leaderboard means what it says. Measure the share of personas whose quality axis is measured rather than proxy, and Director coverage (reviewed / in scope). Could break: a desktop that doesn't write the table leaves real users with an empty Director, which must read "no reviews synced yet", not an error.

#### Evaluation
Claim: quality - one roster, and quality measured, not synthesized
Before: two rosters (5 + 5 disjoint ids); real tenants see 5 fictional agents; quality axis 100% proxy
After: one roster; real tenants see their own personas or an honest empty state; quality axis measured for every reviewed persona
Method: simulation - (1) the dv-1 Slack verdict re-cast onto Daily Standup Digest must join the slack-circuit-break thread; (2) a persona with verdicts [4,4,3,2] gives quality from the last-k mean, not success x 0.7; (3) an unreviewed persona keeps the proxy with a visible label. Falsified if the desktop's Director stores no per-execution score to sync
Result: better
Gate: contract

#### First experiment
Map the five Director entries onto `FLEET` members, keeping the story (who improves, who declines), and gate `useDirectorData` on `isDemo`. One commit; it shows whether the narrative survives the merge.

#### Evidence
- `src/lib/mock-dashboard-data.ts:1997-2048` vs `:52-59` - two disjoint rosters
- `src/lib/mock-dashboard-data.ts:2070-2079` - Slack retry-storm verdict on a persona outside the fleet
- `src/app/dashboard/director/useDirectorData.ts` → `src/lib/mockApi.ts:359` - no real branch, no demo gate
- `src/lib/supabaseApi.ts:800` - leaderboard quality = `successRate*0.7 + (1-retryRate)*0.3`

### 7.3B · "Grade my agent": the Director as a public, rubric-scored grader on the site
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 7/10  ·  **Gate:** policy-loosen

#### Summary
Let any visitor paste an agent prompt or config, or pick one of the 57 templates, and get a Director verdict: a 0-5 score, per-category coaching notes and the single highest-leverage fix. Only an agent-orchestration company would ship this; it demonstrates the product by doing its job on the visitor's own agent.

#### Description
The Director's judgment model is fully specified in the tree but locked behind the demo login. It has a 0-5 scale with tone bands (`directorMeta.ts:14,24`) and six coaching categories: prompt, health, triggers, credentials, memory, usefulness (`src/lib/mock-dashboard-data.ts:1930-1936`). Visitors already browse 57 agent configs on `/templates` (`src/lib/templates.ts:18-37`). The site makes zero LLM calls today: no provider SDK or endpoint in `src/app/api/*`.

The moonshot adds a marketing surface ("Grade my agent") and a server route that grades input against a fixed Director rubric. The templates serve as calibration anchors: each is graded offline once and stored as JSON, so scores sit on a stable scale and the visitor sees "your agent vs. the Gmail Inbox Triage template". Output renders with the real Director components (`scoreTone` chip, category chips as in `VerdictFeedCard`), and the call to action is "get this coaching on every run → download". Registry subjects: `eval-harness`, `judgment-guardbands`.

**Constraints bent, stated plainly:**
- The first LLM dependency and API key on the site, with per-request cost.
- Abuse control needs a durable rate limiter: today's is in-memory per instance (`src/lib/server/rate-limit.ts`; ship-loop #13, blocked on the deploy target).
- Coaching prose must be generated in the visitor's locale (or ship English-first as an explicit i18n bend).
- A new route (an addition, not a path change) needs metadata to satisfy `sitemapRoutesHaveMetadata.test.ts`.

#### Flow
- Offline: grade 10 templates twice with a rubric prompt; measure stability
- Server route plus durable rate limit plus input caps (size, no secrets echo)
- Page reusing Director visuals plus template comparison; English-first, then i18n x14
- Conversion instrumentation through the existing analytics helpers

#### Expected impact
Visitors get a useful artifact about their own agent in under a minute, and the Director becomes the site's proof point. Measure grader completions, then grader → waitlist/download conversion against the site baseline. Could break: unstable scores (the same input graded 2 then 4) would destroy trust faster than no grader at all.

#### Evaluation
Claim: user - a visitor experiences the product's judgment on their own input
Before: Director reachable only inside the demo dashboard; 0 visitor-supplied inputs anywhere on the site
After: one paste, a verdict in ≤10s, with a template-anchored comparison
Method: simulation - (1) `gmail-inbox-triage` (explicit trigger, steps, labels, tone) should score ≥4; (2) a one-line "be a helpful assistant" should score ≤1 with a "prompt" and "triggers" note; (3) the same input graded 3 times must vary ≤1 point. Falsified by (3) failing in the offline experiment
Result: unmeasurable
Gate: policy-loosen

#### First experiment
An offline script grades 10 template configs plus 3 deliberately weak prompts twice each with one rubric prompt, and reports variance and ordering. No UI, no route; under a day.

#### Evidence
- `src/app/dashboard/director/director-page/directorMeta.ts:14,24` - 0-5 scale, `scoreTone` bands
- `src/lib/mock-dashboard-data.ts:1930-1936` - the six coaching categories
- `src/lib/templates.ts:18-37` - `AgentTemplate.config` for 57 templates (calibration corpus)
- `src/app/api/*` (11 route handlers) - no LLM provider anywhere; `src/lib/server/rate-limit.ts` - in-memory limiter

---

## Observability Charts & SLA
Performance, Usage and Activity tabs, built on one daily series (`observabilitySeries.ts`), plus SLA targets and a breach log. Incident threads link SLA, Observability and Health. files=55

### 7.4A · Error-budget engine: SLOs derived from the run history, not declared
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Replace hand-typed SLA fixtures and the real plane's all-time snapshot with a pure SLO engine. It computes compliance, remaining error budget, burn rate and real breach episodes (start, end, duration) from per-persona daily SLIs. It is the same move `observabilitySeries.ts` made for the charts, applied to promises.

#### Description
In demo, `MOCK_SLA_TARGETS` are typed-in numbers that contradict the daily root. `sla_2` claims PR Review Agent latency is 312 ms against a 500 ms target (`src/lib/mock-dashboard-data.ts:676-686`), while its completed runs take 28,900 ms (`src/lib/mockData.ts` p1 rows). In real mode `getSyncedSla` reads all-time aggregates; `timeInSLA` is "approximated by the success rate itself" (`src/lib/supabaseApi.ts:884`), and every breach is born `startedAt: new Date()` with `durationMinutes: 0` (`:894-896`, `:923-925`). So a real breach is always "started just now, lasted 0 minutes", forever. Objectives are app constants (`:837-838`).

The moonshot is `src/lib/sloEngine.ts`: `sli(snapshots, metric)` → `errorBudget(objective, window)` → `burnRate(1d, 7d)` → `breachEpisodes(series, objective)` → `exhaustionForecast()`. Real mode feeds it `synced_metrics_snapshots` (daily, per persona) plus `synced_executions` for intraday detail. Demo feeds it a projection of `MOCK_DAILY_METRICS`, so SLA reconciles with the charts by construction, and `observabilityFixtures.test.ts` gains SLA cases. The SLA page shows budget bars and episodes; home triage and incident threads consume episodes (`relatedWithinSla` already joins by persona + metric). Objectives stay app defaults, with per-persona overrides as a later contract.

#### Flow
- Pure engine plus vitest: episodes and budget on the demo daily series
- Demo SLA targets and breaches projected from the engine (reconciliation tests)
- `getSyncedSla` on snapshots: real `startedAt` / `resolvedAt` / duration
- Budget-burn forecast tile; episodes feed triage and threads

#### Expected impact
SLA becomes believable: real tenants see when a breach started and how fast budget burns; demo numbers stop contradicting each other. Measure real breaches with non-zero duration (target 100%), and demo targets reconciled against runs (test). Could break: day-granular snapshots blur short incidents; intraday episodes need the executions table.

#### Evaluation
Claim: quality - every SLA figure is derived and mutually consistent
Before: real mode has 100% of breaches at duration 0; demo `sla_2` contradicts run durations by about 90x
After: durations measured from the series; the fleet success budget is computable. Demo: 47 runs at a 95% objective allow 2.35 failures, 5 occurred, so 213% of budget burned
Method: simulation - (1) the fleet budget arithmetic above on `DAILY_EXECUTIONS`/`DAILY_FAILURES` (`mockData.ts:872-873`); (2) a persona that recovers mid-window must yield one closed episode with an end date; (3) `sla_2` re-derived from PR Review runs must breach a 500 ms target or force a realistic objective. Falsified if snapshots are too sparse to give 1 point per day
Result: better
Gate: architecture

#### First experiment
`breachEpisodes()` and `errorBudget()` as pure functions with a vitest on `MOCK_DAILY_METRICS`, printing the fleet budget burn and episode list. Under a day.

#### Evidence
- `src/lib/supabaseApi.ts:884,894-896,923-925` - time-in-SLA approximated; breaches stamped now, duration 0
- `src/lib/mock-dashboard-data.ts:676-686` - PR Review latency 312 ms vs runs of 28.9 s
- `scripts/setup-sync-db.sql:180-201` - daily per-persona snapshots, unread in `src/`
- `src/lib/incidentThreads.ts:82-88` - `relatedWithinSla` already joins by persona + metric

### 7.4B · Click-to-explain: every spike decomposes itself
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Click any day on the cost, execution or latency chart and a drawer explains it. It shows which personas account for the deviation (summing exactly to the excess), the deploys and incidents that sit on that day, and one click to the runs behind it. Observability that answers "why", not just "what".

#### Description
The page already knows a lot it doesn't connect. `detectCostAnomalies` finds day 10 ($0.79, about 3.2σ; `src/lib/observabilitySeries.ts:127-138`, `DAILY_COST` at `src/lib/mockData.ts:877`). "v2.1 deployed" is anchored to the same day (`src/lib/mock-dashboard-data.ts:392-395`). Incident threads know which outages were live. But the anomaly banner is demo-only (`PerformanceView.tsx:105-107`), the charts have no point interaction (`CostChartWithCompare` exposes only `activeDot`), and the Executions page filters by status only, so "who caused day 10" can't be answered. Per-persona daily cost exists for real tenants in `synced_metrics_snapshots.total_cost_usd`. Demo has the same split, because the home heatmap divides each day by agent.

The moonshot is a pure `explainDay(date, perPersonaDaily, annotations, threads)` → `{ excess, contributions[], coincident[], links[] }`, with the invariant Σ contributions = excess. A chart click opens a drawer with a ranked contribution bar, coincident annotations and incident members (via `focusHref`), and a link to runs filtered by day and persona. The narrative is a templated sentence (i18n x14), deterministic, with no LLM, so it is also usable as evidence for Card Incidents-B.

#### Flow
- Pure `explainDay` plus invariant test on demo data
- Recharts click → drawer on the cost chart; then exec and latency
- Real plane: snapshots per persona per day
- Executions page accepts `?day=&persona=` (a query param, not a path change)

#### Expected impact
Operators go from a spike to its cause in one click; anomaly detection works for real tenants, not only in demo. Measure drawer opens and click-through to runs. Could break: attribution on tiny volumes (2-5 runs a day) is noisy, so show absolute counts beside percentages.

#### Evaluation
Claim: user - a chart point answers "who and why" in one interaction
Before: 0 drill paths from any chart; the anomaly is visible only in demo
After: day 10's drawer shows excess $0.446 over the 14-day mean ($0.344), split across personas, with "v2.1 deployed" coincident
Method: simulation - (1) day 10 excess = 0.79 - 4.82/14 = $0.446, and contributions must sum to it; (2) a normal day (≤1σ) should say "within normal range" rather than invent a cause; (3) day 0 (the "Slack outage" annotation) must list the slack-circuit-break thread members. Falsified if per-persona daily data can't be had in either plane
Result: better
Gate: direction

#### First experiment
`explainDay()` plus the sum invariant test over the demo series, printing day 10's attribution. Then a 30-line drawer prototype on `/preview`.

#### Evidence
- `src/lib/observabilitySeries.ts:127-150` - anomaly detection and annotation anchoring already exist
- `src/lib/mock-dashboard-data.ts:392-395` - deploy annotation on the spike day
- `src/app/dashboard/observability/PerformanceView.tsx:105-107` - anomaly banner mounted only in demo
- `scripts/setup-sync-db.sql:180-201` - `total_cost_usd` per persona per day (real decomposition source)

---

## Event Bus & Stream Monitoring
Events list (filters, chains, retry/discard over a real FSM), subscriptions, an animated topology and a swimlane. Only the list reads the event stream. files=33

### 7.5A · The bus draws itself: topology, swimlane and throughput as projections of the event log
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Make the event log the only source for every view on the page. Topology nodes come from the source types actually seen, particles from events actually arriving, the swimlane from real timestamps, and counters from measured rates. The showpiece visualization becomes a live monitor for real tenants.

#### Description
The page holds three unrelated truths:
- **The list** reads `MOCK_EVENTS` through `api`. It has 10 source types: execution x6, github x2, pagerduty x2, scheduler x2, and gitlab, jira, stripe, slack, email, dependabot once each.
- **The topology** draws 6 fixed `SWARM_SOURCES` (`src/lib/mock-dashboard-data.ts:364-371`). "REST API" has zero list events, and gitlab, jira, stripe, pagerduty and dependabot never appear. Particles spawn from `Math.random()` over those fixtures (`useEventBusParticles.ts:39-41`).
- **The swimlane** is 38 seeded fake events with its own `success|failure|processing` vocabulary, not the FSM's `EventStatus` (`mock-dashboard-data.ts:1105-1124`). Its persona ids (`p_research` labelled Incident Responder, `:356-357`) match no real id.

`EventBusStats` counters are a random walk (`EventBusStats.tsx:18-22`). The stream is mounted inside `EventsListPanel` (`:49-51`), so opening the Visualization tab stops the feed.

The moonshot lifts the stream to page scope and adds pure projections: `busTopology(events, window)`, `swimlanes(events, personas, window)` and `throughput(events)`. The particle hook spawns one particle per arriving event id, with a red burst on `dead_letter`, so "Test Flow" publishes a real event through `api.publishEvent`. In Supabase mode `synced_events` is already in `WATCHED_TABLES` (`useSyncedRealtime.ts:34-40`), so real tenants get a live picture with no new plumbing. Reduced-motion and visibility gating are unchanged.

#### Flow
- Pure `busTopology` plus test: node set equals the distinct `sourceType` set in the window
- Lift `useEventStream` to the page; the viz and swimlane read the store
- Event-driven particle spawning; FSM vocabulary in the swimlane
- Measured throughput replaces the random-walk counters

#### Expected impact
Visitors and operators see the actual bus: a gitlab dead letter shows up as a red burst on a gitlab node. Measure the share of rendered nodes and dots backed by an event (target 100%). Could break: a quiet bus renders an empty ring, which needs a designed idle state, not fake traffic.

#### Evaluation
Claim: quality - every mark on the page is an event
Before: 0 of 6 topology nodes computed; 5 of 10 list source types invisible in the topology; counters unsourced; the feed stops off the Events tab
After: nodes = distinct source types (10 in the demo window); each particle corresponds to an event id
Method: simulation - (1) the gitlab dead letter (`mockData.ts:555-566`) must render as a burst on a gitlab node; (2) switching to Visualization must keep the connection status `polling`/`connected`, not stale; (3) the reduced-motion static caption must remain. Falsified if real event volume (dozens per hour) is too sparse to read as "flow", which would argue for a time-compressed replay instead
Result: better
Gate: architecture

#### First experiment
`busTopology()` plus a vitest over `MOCK_EVENTS`, swapped in for `SWARM_SOURCES` behind a local flag. Look at the ring with 10 real sources.

#### Evidence
- `src/lib/mock-dashboard-data.ts:364-371` - fixed 6-source ring incl. "REST API"
- `src/components/dashboard/event-bus-visualization/useEventBusParticles.ts:39-41` - random spawning
- `src/components/dashboard/EventBusStats.tsx:18-22` - random-walk counters
- `src/components/dashboard/EventsListPanel.tsx:49-51` - stream mounted only in the list tab
- `grep -o 'sourceType: "…"' src/lib/mockData.ts | sort | uniq -c` - 10 distinct list sources

### 7.5B · Routing what-if: run the dead letter through today's subscriptions before you retry
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Give the dead-letter queue a router simulator. Each failed event gets a verdict before anyone spends a retry: "would deliver to X now", "no route, create this subscription", or "futile, discard". A subscription editor also shows which of the last hour's events would have routed differently.

#### Description
The dead-letter lane has real verbs: FSM-checked retry and discard, a 3-attempt budget (`MAX_REPLAY_RETRIES`) and a bulk circuit breaker. Nothing tells the operator whether a retry can succeed. The fixtures show what that costs:
- The gitlab `merge_request` from acme/backend was dead-lettered 1 minute ago with "No subscription matched" (`src/lib/mockData.ts:555-566`). But `sub_2` subscribes PR Review Agent to `gitlab_merge_request` with no source filter, created 60 minutes ago (`:731`). Either the error is wrong or the routing is. Nothing in the UI can surface that.
- "Target persona no longer exists" (`:658-669`) can never succeed, yet `dead_letter → processing` is legal and burns budget.

The moonshot is a pure `route(event, subscriptions, personas)` mirroring the desktop's match rule: `eventType`, `sourceFilter`, `enabled`, and whether the persona exists or is paused. It produces per-row verdict chips in the Dead Letter filter. The bulk bar retries only "would deliver" rows and offers "discard futile". In the Subscriptions tab, editing or toggling a subscription previews "+7 events routed to X, -2 to Y over the last hour". Registry subject for this context: `delivery-guarantees` (recorded as a deviation in `.ai/registry-map.json`).

**Constraint bent:** real mode has no synced subscriptions (`listAllSubscriptions` returns `[]`, `src/lib/supabaseApi.ts:432`), so the real version needs a subscriptions sync table, which is a schema addition.

#### Flow
- Pure `route()` plus vitest classifying the 8 dead-letter/failed fixtures
- Verdict chips plus "retry routable only" in the bulk bar (i18n x14)
- Subscription what-if diff over the buffered window
- Real mode: subscription sync (schema plus desktop writer)

#### Expected impact
Operators stop burning the 3-try budget on events that can't succeed, and fixture contradictions like the gitlab one get caught. Measure futile retries (target 0) and dead-letter drain time. Could break: a router that drifts from the desktop's real matching gives confident wrong verdicts, so label it "simulated" and cover the rules in tests.

#### Evaluation
Claim: user - every dead letter states whether a retry can work before one is spent
Before: success known only after attempting; a futile event can consume all 3 attempts
After: 8 of 8 dead/failed fixtures carry a verdict; futile ones are excluded from bulk retry
Method: simulation - (1) the gitlab event must classify "would deliver to PR Review Agent (sub_2)", exposing the fixture contradiction; (2) deleted target → "futile"; (3) paused target ("delivery deferred until it is resumed") → "blocked: resume persona". Falsified if the desktop routes on fields the web doesn't see (e.g. `use_case_id` precedence)
Result: better
Gate: direction

#### First experiment
`route()` plus a vitest table over the 8 fixtures. The gitlab contradiction is the first output.

#### Evidence
- `src/lib/mockData.ts:555-566` - gitlab event dead-lettered 1 minute ago "No subscription matched"
- `src/lib/mockData.ts:731` - `sub_2` matches that event type, created 60 minutes ago
- `src/lib/mockData.ts:658-669` - dead letter whose target persona was deleted
- `src/lib/eventStatusFsm.ts:82-96` - retryable/discardable predicates and retry-budget landing
- `src/lib/supabaseApi.ts:432` - no subscriptions in real mode

---

## Dashboard Home Overview
The cockpit (triage, vitals, activity), fleet sessions plus approved work (demo-only), ticker and instruments bay. Note: the `dashboard/spa` branch replaces this layout with an 8-dimension annunciator wall, so both cards are written to land on whichever home ships. files=23

### 7.6A · Fleet remote: the home drives the desktop through approval-gated commands and shows the round trip
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
Build the web's command plane. Read the live fleet queue, issue the desktop's five remote verbs as approval-gated `pending_commands`, and show every command's lifecycle (pending → approved → executing → completed or failed) in place. The SPA wall reads state; this card writes and follows it.

#### Description
On the home page, "Dispatch" and "Send to Fleet" only add ids to a local set and show a toast (`src/app/dashboard/home/home-page/ApprovedWorkCard.tsx:14-45`). The fleet sessions strip renders demo fixtures. The sync plane is ready for more:
- `synced_fleet_queue` mirrors the desktop queue: rank, lane, state, label, persona (`scripts/setup-sync-db.sql:309-326`).
- `pending_commands` accepts `run_persona`, `cancel_execution`, `queue_reorder`, `queue_set_lane` and `queue_cancel`, with `result_ref` (`:372-375`), and has seven statuses (`:357-358`).
- Both tables are Realtime-published "so the web can follow a command from pending to its outcome" (`:530-544`).

In `src/`, nothing reads `synced_fleet_queue`, `useSyncedRealtime` watches only 5 tables (`src/hooks/useSyncedRealtime.ts:34-40`), and `executePersona` returns the command id dressed up as an `executionId` with status `queued` (`src/lib/supabaseApi.ts:362-398`). So a web-issued run disappears from view the moment it is inserted.

The moonshot is a `commandStore` fed by Realtime on `pending_commands`, a fleet-queue reader, and the five verbs bound to UI: dispatch, drag-to-reorder, lane change and cancel. Each action shows an inline lifecycle chip ("awaiting approval on <device> · 12s") and resolves to the resulting execution through `execution_id` / `result_ref`. Demo mode runs the same store against a scripted approver with realistic latency. Registry subjects: `hitl-approval`, `fleet-orchestration`.

**Constraints bent:** `/dashboard` stops being demo-only for signed-in tenants. Writes go to Supabase, not the orchestrator. The desktop polls about every 15s (`setup-sync-db.sql:331-333`), so round trips take at least 15s.

#### Flow
- Add `pending_commands` to `WATCHED_TABLES` plus a command-status panel for the existing manual run (real session)
- `commandStore` plus lifecycle chip (i18n x14 for 7 states); demo scripted approver
- Fleet sessions from `synced_fleet_queue`; queue verbs wired
- Approved-work dispatch → `run_persona` with the idea as prompt

#### Expected impact
Operators can steer the desktop fleet from any browser and see exactly where each request stands. Measure the share of commands whose final state is shown on the web (target 100%), and insert → completed latency. Could break: a duplicate approval or an expired command shown as "running" would mislead, so the store must trust only DB status.

#### Evaluation
Claim: user - a web-issued action is visible end to end
Before: 0 of 7 command statuses rendered; Dispatch is toast-only; the fleet queue is unread
After: every status rendered within about 1s of the DB change; a completed run links to its execution
Method: simulation - (1) dispatch → `pending` (t=0) → desktop poll (≤15s) → approved/executing → completed with `execution_id` → activity stream shows the run; (2) operator rejects → chip turns "rejected" with reason; (3) desktop offline → command `expired`, surfaced honestly. Falsified if Realtime RLS doesn't deliver `pending_commands` changes to the browser session
Result: unmeasurable
Gate: policy-loosen

#### First experiment
In a signed-in Supabase session, watch `pending_commands` and print status transitions for one manual run from `/dashboard/agents` (which already inserts commands). Measure insert → completed time.

#### Evidence
- `src/app/dashboard/home/home-page/ApprovedWorkCard.tsx:39-45` - dispatch = local set plus toast
- `scripts/setup-sync-db.sql:309-326,357-358,372-375,540-544` - fleet queue, statuses, verbs, Realtime publication
- `src/hooks/useSyncedRealtime.ts:34-40` - 5 watched tables vs 9 published
- `src/lib/supabaseApi.ts:362-398` - command id returned as an `executionId`; grep `synced_fleet_queue` in `src/` → SQL only

### 7.6B · "While you were away": a narrated briefing of everything that changed
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
When an operator returns, the home opens with a five-line briefing of what changed since their last visit: runs and failures, breaches opened and closed, new incidents, verdict swings, approvals waiting. They can read it, or press play and hear it. Every line is a deep link.

#### Description
The tree already remembers the last visit (`useLastVisit.ts:14-31`) but uses it for one line, "Last seen 3h ago" (`DashboardGreetingHeader.tsx:33-40`). Every signal carries a timestamp: breach `startedAt`/`resolvedAt`, incident `detectedAt`, verdict `createdAt`, run `createdAt`. Voice output exists but speaks one fixed phrase; the module says "a later phase can compose a richer sentence" (`src/lib/review-voice.ts:15-18`, `speak` at `:177`). The SPA wall shows the state now. Its branch deletes the greeting header and `useLastVisit` (no hits under `C:/t/dash-spa/src`), so after it merges nothing will answer "what happened while I was gone".

The moonshot is a pure `deltaSince(t, sources)` → ranked `BriefingItem[]` (severity, then recency, the same rule as `useTriageQueue`). Its kinds are: opened and resolved breaches, new incidents, failed runs, Director verdict changes, dead letters, and approvals waiting. It renders as a briefing card above the home or wall, each line through `focusHref`. A "play" button composes localized sentences and hands them to the existing `speak()` (cross-tab de-dupe included). Last-visit stays in localStorage. Persisting it per user in Supabase for cross-device continuity is an optional bend.

#### Flow
- Pure `deltaSince` plus vitest with lastVisit = now - 6h over fixtures
- Briefing card with deep links (i18n x14 templated sentences)
- Voice playback via `speak()`, gated on the existing voice setting
- Restore the last-visit signal on the SPA home

#### Expected impact
Returning users orient in seconds instead of touring six routes. Measure briefing-line click-through and time-to-first-action after return. Could break: a noisy briefing (everything is "new" after a week away) needs a cap and a "+N more" rollup.

#### Evaluation
Claim: user - "what changed" is answered on arrival
Before: one "last seen" line; reconstructing means visiting SLA, Incidents, Executions, Director, Events and Reviews
After: one card. For a 6h absence in demo: `br_1` (45m) and `br_2` (3h) opened, `br_3` opened and resolved while away (started 6h ago, resolved 4h ago), `inc_1`-`inc_3` new, NotifyBot's verdict swing (dv-1, 3h ago)
Method: simulation - (1) the 6h walk above against fixture offsets; (2) a 30-second return (under the 60s `MIN_GAP_MS`) shows no briefing; (3) a 3-day absence must roll up, not list 40 lines. Falsified if fixture timestamps clustered at module-load time made every delta identical (they don't: offsets run 42 minutes to 26 hours)
Result: better
Gate: direction

#### First experiment
`deltaSince()` plus the 6h-absence test, rendered as a plain list on `/preview`. Read it aloud via `speak()` once to judge tone.

#### Evidence
- `src/app/dashboard/home/home-page/useLastVisit.ts:14-31` - last visit stored, used for one line
- `src/app/dashboard/home/home-page/DashboardGreetingHeader.tsx:33-40` - the only consumer
- `src/lib/review-voice.ts:15-18,177` - voice bus with fixed phrase; `speak()` reusable
- `src/lib/mock-dashboard-data.ts:741-790` - breach timestamps spanning 45 minutes to 24 hours

---

## Incidents Inbox
The fleet's audit-log inbox: KPI header, persisted filters, group-by, and a read-only detail modal over 16 authored fixtures. The context map is stale here: `incidentFormat.ts` and the filter store now live at `src/lib/incidentFormat.ts` and `src/stores/incidentsFilterStore.ts`. files=10

### 7.7A · Incidents as a computed ledger: correlate signals instead of authoring incidents
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Stop writing incidents by hand. Correlate the signals the system already produces (SLA episodes, healing issues, dead letters, review-SLA escalations, failing health checks) into incidents by persona, time window and category. The inbox becomes the root that owns each thread.

#### Description
The inbox serves 16 authored `MOCK_AUDIT_INCIDENTS` (`src/lib/mock-dashboard-data.ts:1402-1650`) through a fetcher with no `isDemo` gate (`src/lib/mockApi.ts:334-337`), so real tenants see them too. Two of them duplicate thread members without joining the thread:
- `inc_1` "Slack webhook circuit-broken" (`:1405`) is the same outage as `br_1`, `hi_2` and `in_slack`.
- `inc_2` "P95 latency sustained above SLO" (`:1421`) is the same as `br_2` and `hi_5`.

Neither carries a `causeKey`, and `incidentThreads.ts` spans only SLA, Observability and Health (`src/lib/incidentThreads.ts:31-45`). So the inbox sits outside the incident model, and home triage shows the Slack outage twice.

Real signals exist. `synced_healing_issues` has severity, category, `is_circuit_breaker`, `auto_fixed` and `resolved_at` (`scripts/setup-sync-db.sql:262-281`) and is already read for Observability (`src/lib/supabaseApi.ts:512`). Add dead-letter `synced_events`, review SLA from `synced_manual_reviews`, and SLA episodes from Observability Card A.

**How this differs from the shipped incident threads (`c46ecd9`):** threads join pre-declared fragments for deep links. This card derives the incidents. `causeKey` becomes an output of correlation, not an input typed into fixtures.

The moonshot is a pure `correlate(signals, { windowMs, sameCategory })` → `Incident { id, members[], severity = max, status from members, detectedAt = earliest, resolvedAt = latest }`. The inbox, the Related chips on SLA, Observability and Health, the nav badge and home triage all read its output.

#### Flow
- Pure `correlate()` plus vitest reproducing both declared threads with no `causeKey`
- Inbox on correlated incidents (demo); the authored fixtures shrink to signals
- Real plane: healing issues plus dead letters plus reviews, then SLA episodes
- Threads and badges computed from the same output

#### Expected impact
One incident is one row everywhere, and real tenants see incidents made from their own signals. Measure duplicate rows across surfaces (target 0) and the share of incidents with ≥1 real member. Could break: over-merging two unrelated failures of the same persona; the category guard and window must be tested.

#### Evaluation
Claim: quality - incidents are derived, de-duplicated and real
Before: 16 authored incidents; at least 2 duplicate thread members; real tenants see fictional incidents
After: Slack collapses to one incident (`br_1` 45m, `hi_2`, `in_slack`, `inc_1` 42m); real mode is built from synced signals
Method: simulation - (1) the Slack merge above; (2) `br_3` (Feedback success-rate, 6h ago) vs `inc_3` (Feedback memory, 5h ago) must NOT merge, because the categories differ; (3) `inc_4` (vault rotation, resolved) stays standalone and resolved. Falsified if (2) can't be separated without hand rules per fixture
Result: better
Gate: architecture

#### First experiment
`correlate()` over today's fixtures, asserting it rebuilds the two declared threads and attaches `inc_1`/`inc_2`. Run the over-merge case. Under a day.

#### Evidence
- `src/lib/mock-dashboard-data.ts:1405,1421` - Slack and latency incidents without `causeKey`
- `src/lib/incidentThreads.ts:31-45` - thread kinds cover sla/observability/health only
- `src/lib/mockApi.ts:334-337` - fixtures served in every mode
- `scripts/setup-sync-db.sql:262-281` - a real healing-issue signal with status and resolution

### 7.7B · Hand it to Athena: agent-run investigation with an approval-gated fix
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
Every incident gets an "Investigate" button. Athena (or a chosen persona) works the incident with its evidence attached, posts findings into the modal as a live transcript, and proposes a concrete fix. The fix runs only after human approval, and the incident resolves itself when a verification run passes.

#### Description
The detail modal is a dead end: description, metadata and a static recommendation string (`IncidentDetailModal.tsx:109-111`), with no action. The rest of the product already does agentic triage. Athena's op grammar has `exec_triage`, `msg_triage` and `review_resolution` legs, but no incident leg (`src/lib/mock-dashboard-data.ts:2140-2148`). Fleet sessions carry an "Athena's on it" chip (`FleetSessionsStrip.tsx:75-78`). Prompt-carrying remote runs work today (`src/lib/supabaseApi.ts:362-398`).

The moonshot has four stages:
1. **Investigate** dispatches a `run_persona` with the incident's correlated members as context (Card A).
2. **Live transcript:** the modal becomes a transcript, read from the run tape (Execution-A) when present. Findings link to the exact runs, events and checks.
3. **Proposed fix:** a reviewable change (rotate the webhook reference, cap concurrency, add a subscription) that goes to the desktop as an approval-gated command.
4. **Verification:** a follow-up run checks the fix; on success, every thread member flips resolved.

The demo scripts this for `inc_1`: 3 consecutive 5xx found, webhook rotation proposed, verification send succeeds, and SLA, Observability and Health go green together. Registry subjects: `hitl-approval`, `remediation-handoff`.

**Constraints bent:** real writes; new command types (`investigate`, `apply_fix`) beyond the CHECK constraint (`scripts/setup-sync-db.sql:374-375`), which is a schema change plus a desktop contract; per-investigation model cost.

#### Flow
- Demo-only scripted investigation for `inc_1` inside the modal (format test)
- Investigate = `run_persona` with incident context (no schema change), transcript from the run
- Fix proposals as typed diffs; approval through `pending_commands` (new verbs → contract)
- Verification run → thread-wide resolution

#### Expected impact
Mean time to resolve drops because diagnosis starts the moment the incident lands, and the web becomes the place incidents get closed. Measure investigations started, fixes approved, and median time to resolve vs. baseline. Could break: a confident wrong fix; approval must show the diff and evidence, never a bare "apply".

#### Evaluation
Claim: user - an incident goes from read-only to resolved in two clicks with a human in the loop
Before: 0 actions in the modal; resolution happens off-web
After: Investigate → findings → Approve fix → verified → resolved
Method: simulation - (1) `inc_1` Slack: evidence is the circuit-breaker plus 3x5xx, the fix is a webhook reference, verification is a test send; (2) `inc_5` "Referenced secret missing from vault": the fix is a vault reference, a credential the agent must not read, so the proposal must stop at "operator action"; (3) `inc_2` latency: the fix is the recommendation's concurrency cap. Falsified if fewer than half of fixture categories yield an actionable, safe proposal
Result: unmeasurable
Gate: policy-loosen

#### First experiment
A scripted, demo-only investigation transcript for `inc_1` in the modal, with no backend. Show it to the owner and judge whether it reads as trustworthy.

#### Evidence
- `src/app/dashboard/incidents/incidents-page/IncidentDetailModal.tsx:109-111` - static recommendation, no action
- `src/lib/mock-dashboard-data.ts:2140-2148` - Athena triage legs exist; no incident leg
- `src/app/dashboard/home/home-page/FleetSessionsStrip.tsx:75-78` - "Athena's on it" precedent
- `scripts/setup-sync-db.sql:374-375` - current command verb set (the boundary this card bends)

---

## System Health Panel
Four cards of host and integration checks plus a disk gauge, with demo Install/Configure that settles a row in-session. Served from fixtures in every mode. files=7

### 7.8A · Health of the bridge you can actually see: derive the board from sync signals
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
For real tenants, replace 17 fabricated host checks with checks the web can actually measure. Show each device's presence and app version, per-table sync freshness, the Realtime link, and the remote-command round trip. The Health page becomes the honest status of the desktop-to-web bridge.

#### Description
`useSystemHealth` calls the mock `getSystemHealth` in every mode (`src/app/dashboard/health/health-page/useSystemHealth.ts:19`, `src/lib/mockApi.ts:344-350`). A signed-in tenant sees "Node.js v22.3.0", "GPU not detected" and "12.4 / 16 GB" (`src/lib/mock-dashboard-data.ts:1695-1735`), none of which the web can observe. Real signals are already on hand:
- `synced_devices.last_seen_at` and `app_version` (`scripts/setup-sync-db.sql:37-45`), turned into an online count with a 5-minute cutoff (`src/lib/supabaseApi.ts:438-451`).
- `synced_at`, re-stamped on every update since `df30dad` (`touch_synced_at`, `setup-sync-db.sql:505-528`), so per-table freshness is measurable.
- The Realtime channel state, already mapped to connected or reconnecting (`useSyncedRealtime.ts:145-150`).
- `pending_commands`, with an `expired` status (`setup-sync-db.sql:357-358`).
- The latest desktop release, which `latestRelease()` can find (`src/lib/release.ts:154`).

The moonshot is `syncHealth()` producing the same `HealthCheckSection[]` shape:
- **Devices:** online, last seen, app version vs. latest.
- **Sync freshness:** per synced table, the lag from `max(synced_at)` against the expected cadence.
- **Live link:** channel status, plus watched vs. published tables (today 5 of 9).
- **Remote control:** command p50 round trip and the expired count.

`HealthSectionCard`, `worstStatus` and the focus/Related plumbing render it unchanged. Demo keeps its fixtures. Registry subject: `health-checks`.

#### Flow
- `syncHealth()` reading devices plus `max(synced_at)` per table (maybe a small `security_invoker` view, an additive schema bend)
- Real-mode branch in `useSystemHealth`; demo unchanged
- Live-link and command round-trip sections (shares `commandStore` with Home-A)
- Nav badge from computed errors, not the `MOCK_HEALTH_ALERTS` constant

#### Expected impact
Real tenants learn why the dashboard looks stale (desktop asleep, sync stalled, socket down) instead of reading fiction. Measure the share of checks computed in real mode (target 100%) and support questions about stale data. Could break: the freshness cadence varies by table; a too-tight threshold shows false amber.

#### Evaluation
Claim: quality - every check shown to a real tenant is measured
Before: real mode shows 17 checks, all fabricated (0 computed); the nav badge is a module constant
After: about 4 sections computed from devices, `synced_at`, the channel and commands
Method: simulation - (1) desktop closed 10 minutes: device "offline" (5-minute cutoff) and `synced_executions` freshness turns amber; (2) Realtime `CHANNEL_ERROR`: live link reads "reconnecting", polling backstop noted; (3) desktop 2 versions behind `latestRelease` gives an info row with the update action. Falsified if `max(synced_at)` per table is not cheaply readable under RLS (then a view is needed)
Result: better
Gate: architecture

#### First experiment
A real-session scratch fetcher that prints devices plus `max(synced_at)` for the 9 published tables, then a raw list on `/dashboard/health` in non-demo mode.

#### Evidence
- `src/app/dashboard/health/health-page/useSystemHealth.ts:19` - mock fetcher, no demo gate
- `src/lib/mock-dashboard-data.ts:1695-1735` - host internals the web cannot observe
- `src/lib/supabaseApi.ts:438-451` - device-presence logic already exists
- `scripts/setup-sync-db.sql:505-528` - `synced_at` freshness trigger (`df30dad`)

### 7.8B · Blast radius: every failing check shows what it takes down
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 2/10  ·  **Gate:** direction

#### Summary
A red integration row stops being a dot and becomes an impact statement: "Slack down takes out 4 of 5 agents, 98 deliveries per 14 days, and 1 SLA". It is derived from who actually calls which tools. When the check is fixed, the radius visibly heals.

#### Description
The Slack row reads "Webhook circuit-broken" (`src/lib/mock-dashboard-data.ts:1726`). Its Related chips reach one SLA breach (Daily Standup Digest) and one health issue, so the visible impact is one agent. Configure settles that row only (`health-page/healthActions.ts`), and the nav badge is a module constant (`src/components/dashboard/DashboardNavigation.tsx:96`). Yet tool usage already maps the dependency. `MOCK_TOOL_USAGE_BY_PERSONA` shows `slack_send_message` used by PR Review (24), Incident Responder (38), Standup (22) and Feedback (14) (`src/lib/mockData.ts:973-978`), totalling 98, all of Slack's 98 invocations (`:945`). Real tenants have the same shape in `synced_tool_usage(persona_id, tool_name)` (`scripts/setup-sync-db.sql:205-215`).

The moonshot is a pure `blastRadius(checkId, toolUsageByPersona, integrationPrefixes, routines, slaTargets)` → `{ personas[], invocations, routinesAtRisk[], slaAtRisk[] }`. Each failing or warning check expands into an impact panel with avatars, counts and the next affected routine ETA. The inverse view ("this agent depends on: GitHub, Slack") is ready for the agents page. Configure animates the radius back to healthy (reduced-motion gated) and resolves thread members. It reuses the incident-thread Related chips, `PersonaAvatar` and `focusHref`.

#### Flow
- Pure `blastRadius()` plus vitest on fixtures (prefix map `slack_*` → Slack)
- Impact panel on non-ok integration rows (i18n x14)
- Real plane: `synced_tool_usage` aggregation
- Healing animation on Configure; inverse dependency list for agents

#### Expected impact
Operators prioritize by consequence, not colour: a Slack failure outranks a warning GPU. Measure time-to-action on high-radius checks and the share of failing checks with a computed radius. Could break: tool-name to integration mapping by prefix will miss custom tools, so show "unmapped tools: N" honestly.

#### Evaluation
Claim: user - a failing check states its consequences
Before: Slack's visible impact is 1 persona (via the SLA chip); no counts
After: 4 of 5 personas, 98 invocations per 14 days, 1 SLA at risk (`br_1`)
Method: simulation - (1) Slack: 24+38+22+14 = 98, which must equal the summary row; (2) GitHub (`github_*`: PR Review 142+58) gives 1 persona, 200 invocations; (3) Stripe "Not configured" gives radius 0 and no panel. Falsified if the 8 fixture tool names (pagerduty, datadog, zendesk, linear, email) can't be mapped to Health integration rows, which would show the integrations list itself is incomplete. That is a finding, not a failure, but the panel must handle it
Result: better
Gate: direction

#### First experiment
`blastRadius()` with a prefix map and a vitest over the fixtures, printing the radius for all six integration rows. Under half a day.

#### Evidence
- `src/lib/mock-dashboard-data.ts:1726` - Slack check, `causeKey` slack-circuit-break
- `src/lib/mockData.ts:945,973-978` - `slack_send_message` 98 invocations across 4 personas
- `scripts/setup-sync-db.sql:205-215` - real per-persona tool usage
- `src/components/dashboard/DashboardNavigation.tsx:96` - health badge is a static constant
