# Territory dossier - src/components/dashboard,src/app/dashboard

Commit: 23b2b07530 - written 2026-10-15

## Why this area

personas-web is the public web companion to **Personas**, a desktop app for building and
orchestrating multi-agent AI fleets (README.md:1-4). The site cannot hand a visitor the
desktop app itself; the **demo dashboard** (`/dashboard/*`, entered from `/demo`) is the only
place on the web where a visitor *operates* the product rather than reads about it. It is the
largest feature mass in the repo: 14 context-map contexts across the "Agent Operations
Dashboard" and "Observability & Event Monitoring" groups, 879 commits and 404 hot files in the
last 180 days (tiger hunt with context-map `filePaths`, 2026-10-15). `src/components/dashboard`
alone is 23% of the repo's code bytes and 386 files (tiger hunt directory table; agent file
count). It also had the most recent feature investment (124 commits in 90 days, see history).
The operator chose this area over the landing funnel and the product guide on 2026-10-15.

## Who uses it, for what

- **The evaluating visitor** (developer or ops lead considering Personas), arriving from the
  landing (`/features` links `/demo?tour=1`,
  `src/components/feature-sections/design-blueprint/shared/DesignIntro.tsx:41`) or a shared
  link. Job: *"show me what running an agent fleet with this feels like, convincingly, in a few
  minutes, without installing anything."* Done well = they leave believing the product is
  real, deep and trustworthy, and know what it would do for *their* work.
- **The existing desktop user on a phone or another machine** (phase-2 mobile revival,
  `docs/concepts/mobile-revival/PHASE2-SPEC.md:14-22`): the same `/dashboard/*` routes in phone
  layouts are the remote surface for a paired desktop (approve reviews, pause/resume, chat).
  In this repo that path is demo/mock plus an optional `NEXT_PUBLIC_DATA_SOURCE` plane.
- **The owner** uses it as the showcase that has to stay true to the desktop app (truth-sourcing
  is an explicit value, see "does unusually well").

## What it does today

**Entry and shell.** `/demo` calls `enterDemo()` then replaces the URL with
`/dashboard/personas` (`src/app/demo/page.tsx:33-38`; `?tour=1` goes to `/dashboard/home`).
`/dashboard` without demo shows `SignInPrompt` (Google sign-in or "Try Demo",
`src/components/dashboard/SignInPrompt.tsx:122-129`). Layout stacks AuthProvider, AuthGuard,
TourProvider, SyncedRealtimeProvider, nav and `ViewOutlet` (`src/app/dashboard/layout.tsx:29-51`).
It is a single-page app: 15 view ids with traits in `src/components/dashboard/spa/views.ts:13-62`,
`history.pushState` navigation (`spa/navigate.tsx:10-16`), each view a lazy `ssr:false` chunk
prefetched on nav hover and idle-warmed after 1.5 s (`spa/viewRegistry.tsx:21-102`).
`ViewOutlet` keeps the last 4 views alive in React `<Activity>` boundaries, so effects pause
but state survives (`spa/ViewOutlet.tsx:12-63`).

**The 15 views** (`src/components/dashboard/views/<id>/index.tsx`): personas (default; fleet
Board and Night-shift city, 10/30/99 scale, command palette, triage, bulk bar,
`personas/index.tsx:54-120`), home (Mission Control 8-cell annunciator wall, `?dim=`, keys 1-8,
`home/index.tsx:37-140`), reviews (approve/reject/skip queue, split pane or focus flow, decision
ledger, batch undo), executions (run table + live output modal), events (bus topology,
swimlanes, lifecycle FSM, dead-letter triage), observability (performance/usage/activity),
leaderboard (windowed standings, radar), sla, incidents (audit-log inbox derived from
signals), health (checks, integration blast radius), knowledge (pattern table, cluster graph,
learning time-lapse, evidence links), messages, director (coaching scorecard 0-5), notes
(goal board from desktop Notepad), settings.

**Data plane.** `api` is a Proxy: `useAuthStore.isDemo` -> `mockApi`, else
`NEXT_PUBLIC_DATA_SOURCE` picks supabase / desktop / orchestrator (`src/lib/api.ts:428-447`;
"demo is always an explicit user choice, never auto-on"). `mockApi` adds 300 ms latency
(`src/lib/mockApi.ts:78-80`) and replays the desktop's auto-retry sweep so `failed` events
spend an attempt and become `dead_letter` (`mockApi.ts:113-128`, citing desktop
`events.rs:1309-1350`). Fixtures: `src/lib/mockData.ts` (seeded 5-persona roster),
`src/lib/mock-dashboard-data.ts` (2546 lines, projects the demo fleet from `MOCK_PERSONAS`,
`:36-40`). The Personas board runs a **different** fleet: `fleet-monitor/fleet.json`, 99 agents
in 9 teams (`fleet-monitor/fleet-data.ts:3-10`). Zustand stores in `src/stores/*`.

**Simulations.** Board: pure seeded reducer (mulberry32) stepped by a 1 s interval that stops on
hidden tab / offline (`fleet-monitor/board/sim.ts:12-50`, `board/useBoardRuntime.ts:13-19`).
Demo realtime: `src/lib/demoRealtime.ts` is a seeded scripted channel with the Supabase
channel's `on(...)` surface; first review arrives 20 s in (`:18`), `?seed=` (`:42-45`), wired at
`src/hooks/useSyncedRealtime.ts:141`, with a voice announcer
(`src/components/dashboard/SyncedRealtimeProvider.tsx:15-18`). Mock command plane: commands go
pending -> executing (1.2 s) -> completed (2 s), runs complete at 8 s, started only by a user
action (`src/lib/commands/mockCommandPlane.ts:1-28`). `src/lib/run-script` (virtual-clock run
engine) exists but is used only by the landing playground
(`src/components/sections/playground-split/shared/useMindRun.ts`), not the dashboard.

**Guided tour.** `DASHBOARD_TOUR_STEPS` (`src/lib/tour-script.ts:295-338`): 4 narrated steps
(home 48 s with a timed spotlight sequence, executions, events, reviews), mp3 per step under
`public/tour/`, cue timing driven by audio `currentTime` (`src/lib/tour-cue-clock.ts:1-16`),
launcher in the Mission Control header (`views/home/index.tsx:73`). The tour ends on reviews
with no bridge onward.

**What it does unusually well** (the strengths to evolve):
1. **Fidelity to the real desktop app.** Desktop invariants are copied and pinned:
   `eventStatusFsm.desktopParity.test.ts:5-20` holds the desktop `can_transition_to` matrix;
   `desktopRows.ts:1-25` maps desktop `synced_*` rows; 15 files cite the desktop repo. The demo
   behaves like the product, not like a mock-up.
2. **Honesty of state.** Owner decisions 2026-10-07 (`docs/decisions/`): unserved reads say
   "not served" / "not measured", never empty; unsupported verbs are blocked before the click.
   23 files carry these markers (e.g. `views/reviews/index.tsx:42`).
3. **Causal cross-linking.** Blast radius for a failing integration (agents, calls, SLA breaches,
   `src/lib/blastRadius.ts:3-12`); incidents derived from signals (`src/lib/incidentCorrelate.ts`);
   `?focus=` deep links across SLA / Observability / Health (`RelatedIncidentLinks.tsx:9-15`);
   knowledge patterns link to the execution that taught them (`KnowledgeEvidenceChip.tsx:11`).
4. **A deterministic, living demo.** Seeded PRNGs, `?seed=`, fixed "now" (`fleet-data.ts:8-9`),
   cross-page fixture agreement enforced by `src/lib/mockFleetConsistency.test.ts:10-20`.
5. **Load choreography.** Four-tier loading standard (`docs/features/dashboard/loading-orchestration.md`,
   `arrival/scheduler.ts:1-22`, `arrival/Deferred.tsx:50,82`): frame and chrome paint at once,
   deep content mounts one slot per 90 ms in idle time, fetch early / mount late.
6. **Operator ergonomics** in the fleet board: command palette, grouped triage, verb rulebook,
   bulk table with batch undo, activity log (fleet-w1..w10, Oct 8-12).

## Measured state

- Unit tests: `npx vitest run src/components/dashboard src/lib` at 23b2b075 -> 98 files,
  1065 tests, all pass (re-run 2026-10-15). 24 test files live in `src/components/dashboard`.
- e2e: `e2e/dashboard-demo.spec.ts`, `dashboard-notes.spec.ts`, `fleet-board.spec.ts`,
  `review-undo.spec.ts`, `tour.spec.ts`, `smoke.spec.ts`, `e2e/mobile/dashboard-*.spec.ts` (not
  re-run for this dossier).
- Bundle: `bundle-budget.json` (generated 2026-10-10) ceilings `/dashboard` and
  `/dashboard/[view]` at 1413 KB first-load JS, the highest in the file (next: `/demo` 1270).
  Not re-measured (needs a production build).
- Registry map (`.ai/registry-map.json`, generated 2026-10-14): across 20 dashboard/observability
  contexts, 12 `deviation`, 3 `conformant`, 129 `unknown`. Current deviations include: execution
  table Failed chip describes a fixed 50-row window (`src/stores/executionStore.ts:96`);
  PerformanceView has no failed-spend series or drill-down
  (`views/observability/PerformanceView.tsx:51`); EventSwimlane treats an import-time fixture as
  a fetch (`EventSwimlane.tsx:18`); grouped sidebar badge is an aria-hidden dot only
  (`DesktopSidebar.tsx:58`); leaderboard tiebreak on display name / no aria-sort. Several
  deviations are stale (evaluated before later fixes).
- Usage, conversion, time-on-demo, tour completion: **not measured** (no analytics readout in repo).
- In-code TODO/FIXME in the area: 0. eslint-disable: 2.

## Recent history

Last 90 days (`git log --since=90.days -- src/components/dashboard src/app/dashboard src/lib/mock*`):
124 commits, no reverts. Arc: a11y/i18n/honest loading (Jul) -> dashboard-home perfect round
"one fleet, one truth" + Director (Aug) -> deferred charts, SSR reduced-motion sweep (late Aug)
-> event-bus dead-letter lane that actually drains (Sep 5) -> reviews decision ledger,
`?focus=` links, demo-data truth (Sep 23) -> SPA rebuild, two-level menu, Mission Control wall,
Board/Night-shift prototypes ported from a contest (Oct 5) -> phone layouts, desktop-plane
"not served" gating (Oct 6-7) -> fleet w1..w10 operator tooling, loading-tier standard
(Oct 8) -> lifecycle FSM, verb rulebook, batch undo, leaderboard windows, knowledge
time-lapse, health blast radius, event-bus redraw from the log (Oct 9-12).

**Rejected or decided - do not re-propose:**
- **Wiring the web dashboard to the real orchestrator** - it stays demo-only
  (`docs/parity-backlog/03-dashboard-sync.md:4-6`).
- **A download / sign-up CTA inside the demo**: "the demo never shows it (owner, 2026-10-06):
  the demo is a tour of the dashboard, not a sign-up funnel" (`src/lib/sync/reachability.ts:160-166`).
- **New backend features**: the owner "rejects new-surface/backend features even when flagged
  Recommended; accepts convention-completeness, honesty-of-state, motion gating, dead-code
  excision, i18n retrofits, truth-sourcing"; at most ONE new-surface feature per slate; "plain
  bars / generic cards get rejected" (perfect vault `PerfectWeb/config.md:28-32`).
- The "Office" fleet variant (built, descoped: "added no clarity the Board does not give",
  `docs/features/dashboard/personas.md:115`) and the 10-agent plaza (7fa15e8e).
- Multi-select filtering in Director (`director.md:95`, intentional). Queuing phone actions while
  the desktop is offline (PHASE2-SPEC D4: blocked, nothing queued). A separate `/m/<view>` phone
  dashboard (D5: phone layouts of `/dashboard/*` instead).
- Already done, do not redo: below-fold loading ladders, React 19 purity, reduced-motion gating,
  tab-visibility timer suspension, heatmap a11y/DST bucketing, executionStore sequence guards,
  demo/real gating (`PerfectWeb/contexts/dashboard-home-overview.md:23,29`).

## Known limits and open questions

- **Two fleets, one demo.** The board shows 99 agents in 9 teams (`fleet.json`); every other view
  shows the 5-persona `mockData` roster. Open question Q5 in PHASE2-SPEC §8 (line 625+).
  `mockFleetConsistency.test.ts` enforces agreement only among the mockData-derived pages.
- **Views are islands in time.** The board sim, `demoRealtime`, the mock command plane and the
  static fixtures each run their own clock; a run the visitor starts on the board (8 s) does not
  appear in executions, events, observability or the leaderboard. `run-script`'s virtual clock is
  not used by the dashboard.
- **The tour is stale and ends nowhere.** `dashboardHome.mp3` narrates the old cockpit layout
  (`docs/features/dashboard/home-overview.md:64`; narration text `src/i18n/en.ts:1637`); home
  maps old anchor names onto wall cells (`views/home/index.tsx:29-35`). The tour visits 4 of 15
  views and stops on reviews.
- **Home has no time-window or persona filter**; "no view honours dashboardFilterStore for real"
  (`home-overview.md:65`); "Fixes held" has no web source (`home-overview.md:66`).
- Realtime is a no-op in demo outside `demoRealtime` (`shell-chrome.md`); some framer components
  animate without reduced-motion gating (same doc; see the motion convention).
- `ReachabilityNotice.tsx:89-95` has a `tier === "demo"` branch that cannot run.
- 45 `dashboardUi` keys are English-verbatim in other locales (ship-loop backlog #17); raw palette
  colors in dashboard status configs (#31).
- Unanswered: what a visitor actually does in the demo, how long they stay, which view convinces.

## Constraints

- Stack: Next.js 16 App Router (read `node_modules/next/dist/docs/` before Next APIs, it differs
  from older versions), React 19 with compiler purity rules (no sync setState in effects; no
  `Math.random`/`Date.now` in render), TypeScript 6, Tailwind 4 semantic tokens only, Zustand 5,
  framer-motion.
- **Demo-only:** `/dashboard/*` runs on mocks here; never wire the real orchestrator. No new
  backend services; Supabase table names / RLS are out of scope.
- **i18n:** every user-facing string in `src/i18n/en.ts` + all 13 other locales, hand-translated
  (owner-approved English-only pending copy exists only for landing / `/m` / phone dashboard
  namespaces already pending, `src/i18n/pending/`).
- **Motion:** gate with `useStillMotion`; ambient loops stop on hidden tab (`usePageVisibility`);
  user-started loops refuse to start while `document.hidden`; never let reduced-motion decide markup.
- **Loading tiers** (`docs/features/dashboard/loading-orchestration.md`) apply to every view; deep
  content through `<Deferred>`.
- **Bundle budget:** `/dashboard` ceiling 1413 KB, enforced by `npm run check:bundle`; heavy
  modules via `dynamic(..., { ssr: false })`.
- **Honesty:** never show empty where the truth is "not served"; demo data is labelled DEMO.
- Route paths under `src/app/` must not change (external links).
- Out of scope for this hunt: the landing sections, `/m` Hive landing, the guide, translation
  backfill, generic hygiene.
- Registry subjects that govern this area (software-engineering bundle): demo-data-plane,
  render-mount-pipeline, app-shell, guided-tours, canvas-graph, data-viz, table, async-ui-states,
  status-vocabulary, motion, hitl-approval.
