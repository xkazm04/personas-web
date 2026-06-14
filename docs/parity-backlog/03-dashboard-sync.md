# Stream 3 — Dashboard Sync with Desktop `overview` (`/dashboard/*`, `/m/*`)

**Goal:** Make the web demo dashboard mirror the desktop app's `overview` feature
(`personas/src/features/overview/**`). Read `README.md` in this folder first. **The web
dashboard stays demo-only** — extend `src/lib/mockApi.ts` + `src/lib/mock-dashboard-data.ts`;
do **not** wire the real orchestrator.

---

## 1. Current state (web demo dashboard)

Routes under `src/app/dashboard/`: `home`, `agents`, `events`, `executions`, `knowledge`,
`leaderboard`, `messages`, `observability`, `reviews`, `sla`, `settings` (+ `dashboard/page.tsx`).
Mobile under `src/app/m/`: `overview`, `alerts`, `messages`, `reviews`.

- **Stack:** Recharts (`AreaChart/LineChart/RadarChart/BarChart/PieChart`) themed via
  `src/lib/chart-theme.ts` + `useChartAnimation()`; framer-motion; Zustand stores;
  custom SVG (event-bus particles, knowledge cluster graph, execution heatmap grid).
- **Reusable kit:** `GlowCard`, `StatBadge`, `DataTable`, `PersonaAvatar`, `StatusBadge`,
  `SkeletonCard`.
- **Mock entities (`mock-dashboard-data.ts`):** Persona, Execution, Event, Subscription,
  Trigger, ManualReviewItem, LeaderboardPersona, SLATarget, SLABreach, KnowledgePattern,
  MemoryItem, MessageThread, HealthIssue, DailyMetric, ToolUsage{Summary,OverTime,ByPersona}.
- **Per-surface highlights:** Home (KPI badges + 7-day heatmap + 14-day traffic/errors +
  recent activity + demo intelligence panels); Observability (Performance: latency P50/95/99 vs
  SLO, cost area, spend pie, health issues, anomaly banner | Usage: top tools, tool-over-time,
  by-persona); Leaderboard (ranked table + 5-axis radar); Events (4 tabs incl. swimlane + SVG
  bus); Reviews (split pane + focus flow); SLA (summary + targets + breach log).

---

## 2. Desktop `overview` surfaces (target)

Authoritative surfaces from `personas/src/features/overview/**`:

1. **Home — Mission Control** (`sub_missionControl/DashboardHomeMissionControl.tsx`): Fleet
   Optimization Card, **Triage Pane** (ranked urgent queue), **Vitals Console** (success-rate
   ring, active agents, alert badge, exec counter, success sparkline), **Activity Stream**,
   **Status Ticker**; below fold: 365-day Execution Heatmap, **Instruments Bay** (Top Performers
   + Traffic/Errors + Analytics Inserts), Memory Actions, Routines & Vault cards. Controls:
   Persona Select, **Customize Popover**, Range Switch.
2. **Executions** — virtualized list, resizable columns, status/model/persona filters, compare
   toggle, day-range, row→detail modal.
3. **Incidents Inbox** — KPI header (open count + severity + source breakdown); filters
   (status/severity/source/persona); **group-by** agent/severity/source/none; row→detail modal.
4. **Activity Metrics** — 4 KPI tiles (executions/cost/success/latency); Metrics Charts;
   **Athena Usage** stacked area (cost by action: invoke/recall/fallback); **Value Rollup**
   (value-delivered rate, cost-per-value); day-range + compare.
5. **Manual Reviews** — layered/keyset list, status counts, detail modal.
6. **Messages** — resizable columns, priority/read/persona filters, **list⇄thread** toggle,
   realtime listener, detail modal.
7. **Events** — keyset paginated, status/source/persona filters, time grouping, JSON-tree
   detail, bookmarks.
8. **Knowledge Hub** — Memories + Patterns (knowledge graph).
9. **System Health Panel** — Runtime / Services / Resources / Integrations cards with status
   dots; crash logs; disk usage; install/configure actions.
10. **Certification Command Center** — Overview (TeamCertCards + standards gates), History
    (RunHistoryView), RunDetail (JudgePanel, DimensionBars, GroundingTable, TrajectoryChart,
    VerdictBadge: PASS/FAIL/MANUAL_REVIEW).
11. **Leaderboard** — rank-dimension tabs (overall/success/speed/cost/reliability), **podium
    top-3**, table, radar detail.
12. **SLA Dashboard**.
13. **Director** (coaching) — portfolio scorecard, coaching table, momentum.
14. **Analytics** — 365-day Execution Heatmap, **Rotation Overview** (credential rotation).

Shared libs to mirror conceptually: `metricIdentity` (how % is computed),
`computeTrends` (period-over-period direction), `anomalySeverity`, `fleetOptimizer`
(recommendation types), `KpiTile` (console/card/card-rich densities), `TrendIndicator`
(polarity inversion for cost/latency), `OverviewFilterContext`.

---

## 3. Gap analysis (desktop surface → web status)

| Desktop surface | Web status | Action |
|---|---|---|
| Home — Mission Control | Simpler home (no Triage/Vitals-ring/Status-ticker/Fleet-Opt/Instruments structure) | **Restructure** (D-B1). |
| Executions | Present, close | Minor parity (compare toggle, model filter, col-resize). |
| **Incidents Inbox** | **Absent** (health issues live inside observability) | **New surface** (D-A2). |
| Activity Metrics — Athena Usage + Value Rollup | Exec metrics yes; **Athena Usage / Value Rollup absent** | **Add widgets** (D-C3). |
| Manual Reviews | Present (split/focus) | Aligned; add status-count header. |
| Messages | Present | Add list⇄thread toggle (D-C5). |
| Events | Present (richer: swimlane + SVG bus) | Aligned / ahead. |
| Knowledge Hub | Present (table/graph/memories) | Aligned. |
| **System Health Panel** | Health *issues* only (no Runtime/Services/Resources/Integrations surface) | **New surface** (D-A3). |
| **Certification Command Center** | **Absent** | **New surface — biggest gap** (D-A1). |
| Leaderboard | Table + radar | Add **podium + rank-dimension tabs** (D-C1). |
| SLA | Present | Aligned. |
| **Director** (coaching) | **Absent** | **New surface** (D-A4). |
| Analytics — 365-day heatmap + Rotation Overview | 7-day heatmap; **no rotation overview** | Enhance heatmap (D-C2) + add rotation widget (D-C4). |
| Global filter / customize / compare | Per-surface filters only | Add `OverviewFilterContext` equivalent + customize popover (D-C6). |
| KpiTile densities / TrendIndicator polarity | Partial (`StatBadge`) | Design-system parity (D-C7). |

> Re-verify before building — the web dashboard is already comprehensively instrumented and the
> first-pass explore may under-credit existing pieces. Check the live route before declaring a gap.

---

## 4. Backlog

### Group A — New surfaces (the real gaps)

Each = new route under `src/app/dashboard/<name>/page.tsx` + components + nav entry in
`src/app/dashboard/layout.tsx` + mock data + i18n (×14). New routes are **additive** (allowed).

- **D-A1 · P0 · Impact High · Effort XL — Certification Command Center.**
  New route `/dashboard/certification`. Mirror `sub_certification`: Overview (TeamCertCards with
  standards gates pass/fail), History table, RunDetail (JudgePanel verdict, DimensionBars 0–100%,
  GroundingTable, TrajectoryChart, VerdictBadge). Recharts for trajectory/dimension bars; new
  mock entities (see D-D). *Acceptance:* three views navigable; verdicts/gates render; motion +
  charts gated; labels in 14 locales.

- **D-A2 · P1 · Impact High · Effort L — Incidents Inbox.**
  New route `/dashboard/incidents` (or a tab on observability). Mirror `sub_incidents`: KPI
  header (open count + severity + source breakdown), filters (status/severity/source/persona),
  **group-by** (agent/severity/source/none) with collapsible sections, row→detail modal. Reuse
  `DataTable`/`GlowCard`. Source from extended `HealthIssue`→`AuditIncident` mock (D-D).
  *Acceptance:* grouping + filters persist (localStorage), detail modal opens.

- **D-A3 · P1 · Impact Med · Effort M — System Health Panel.**
  New route `/dashboard/health` (or Settings tab). Mirror `components/health`: Runtime /
  Services / Resources / Integrations cards with status dots (ok/warn/error/info), disk-usage
  bar, illustrative install/configure actions (demo no-ops). *Acceptance:* four section cards,
  status dots, demo actions wired to toasts.

- **D-A4 · P2 · Impact Med · Effort L — Director coaching.**
  New route `/dashboard/director`. Mirror `sub_director`/Director docs: portfolio scorecard
  (value-delivered rate, avg 0–5 score, cost-per-value), coaching table (score+delta, trend
  sparkline, attention tags, last-review), category verdicts. *Acceptance:* scorecard + roster
  table render from mock; trend polarity correct.

### Group B — Home → Mission Control restructure

- **D-B1 · P0 · Impact High · Effort L — Rebuild `/dashboard/home` as Mission Control.**
  Restructure into: Fleet Optimization Card (single top recommendation via `fleetOptimizer`
  logic) → 3-column cockpit (Triage Pane / Vitals Console with success-ring + sparkline /
  Activity Stream) → Status Ticker → below-fold Instruments Bay (Top Performers + Traffic/Errors
  + Analytics Inserts) + Memory Actions + Routines & Vault. Keep the existing demo intelligence
  panels but reframe within this layout. *Acceptance:* mission-control IA matches desktop; below
  fold deferred (IntersectionObserver/`LazyMount`); reduced-motion safe.

### Group C — Enhance existing surfaces

- **D-C1 · P1 · Impact Med · Effort M — Leaderboard podium + rank-dimension tabs.**
  Add top-3 podium (🥇🥈🥉, score circles) and segmented rank tabs (overall/success/speed/cost/
  reliability) above the existing table+radar. *Acceptance:* tabs re-rank; podium reflects top 3;
  radar still updates on row select.

- **D-C2 · P2 · Impact Low · Effort S — Execution heatmap → 365-day.**
  Extend the home heatmap from 7-day to a GitHub-style 365-day/52-week grid with 5-level
  intensity ramp + insights row (busiest day, trend), click→executions. *Acceptance:* full-year
  grid; intensity legend; gated.

- **D-C3 · P1 · Impact Med · Effort M — Activity Metrics: Athena Usage + Value Rollup.**
  Add to observability (or new Activity Metrics tab): Athena-usage stacked area (cost by action
  invoke/recall/fallback) + Value Rollup card (value-delivered rate, cost-per-value, outcome
  summary). *Acceptance:* both render from new mock fields; compare toggle respected.

- **D-C4 · P2 · Impact Low · Effort S — Rotation Overview widget.**
  Credential-rotation status panel (has-policy / enabled / anomaly / next-rotation) — pairs with
  Settings or observability. *Acceptance:* status badges per credential from mock.

- **D-C5 · P2 · Impact Low · Effort S — Messages list⇄thread toggle.**
  Add the desktop's flat-list vs grouped-thread view toggle to `/dashboard/messages`.
  *Acceptance:* toggle switches view; thread counts shown.

- **D-C6 · P1 · Impact Med · Effort M — Global filter context + customize popover.**
  Add an `OverviewFilterContext`-equivalent (selected persona + day range + custom range) shared
  across dashboard surfaces, plus a Home "Customize" popover toggling section visibility
  (persist via a store, mirror `HomeCustomizePopover`/`HOME_SECTION_IDS`). *Acceptance:* persona
  filter scopes persona-aware panes; customize hides/shows sections, persisted.

- **D-C7 · P2 · Impact Low · Effort S — KPI tile + TrendIndicator parity.**
  Introduce KpiTile densities (console/card/card-rich) and a TrendIndicator with **polarity
  inversion** (down-is-good for cost/latency). Refactor existing `StatBadge` usages where it
  improves consistency. *Acceptance:* cost/latency trends show correct good/bad coloring.

### Group D — Mock data model extensions (enables Groups A–C)

- **D-D1 · P0 · Impact High · Effort M — Extend `mock-dashboard-data.ts` + `mockApi.ts`.**
  Add entities/fields the new surfaces need, keeping the existing demo-data style (deterministic,
  no `Math.random`/`Date.now` in render — seed at module load):
  - **Certification:** `TeamCertStatus` (teamId, certified, standards/gates), `EvalRun`
    (date, verdict, dimension scores, grounding rows, trajectory points).
  - **Incidents:** promote `HealthIssue` → `AuditIncident` (severity, source_table, persona,
    status open/resolved/ignored/escalated).
  - **System Health:** `HealthCheckSection`/`HealthCheckItem` (runtime/services/resources/
    integrations, status, installable, details).
  - **Athena Usage:** cost-by-action daily series. **Value Rollup:** delivered/partial/blocked
    aggregates + cost-per-value. **Fleet recommendation:** type + reason + action.
    **Rotation Overview:** per-credential policy/anomaly/next-rotation. **Director:** per-persona
    0–5 score + delta + trend + attention tags.
  *Acceptance:* `mockApi` exposes fetchers for each; types exported; deterministic.

### Group E — Mobile parity (optional, lower priority)

- **D-E1 · P2 · Impact Low · Effort M — Extend `/m/*` for new surfaces.**
  Compact mobile cards for incidents (already partly in `/m/alerts`), certification summary,
  director summary. *Acceptance:* touch-optimized; reuses desktop components where possible
  (as `/m/reviews` already reuses `ReviewsFocusFlow`).

---

## 5. Suggested sequencing
1. **D-D1** (mock model) — unblocks everything.
2. **D-A1** (Certification) + **D-B1** (Mission Control home) — biggest visible parity.
3. **D-A2** (Incidents) + **D-C3** (Athena/Value) + **D-C6** (global filter).
4. **D-A3** (Health) + **D-A4** (Director).
5. **D-C1/C2/C4/C5/C7** polish; **D-E1** mobile.

## 6. Acceptance gates for the whole stream
- New routes added cleanly to `src/app/dashboard/layout.tsx` nav; **no existing route renamed**.
- All charts/SVG motion import+call `useReducedMotion()` and use `useChartAnimation()`/quality
  tier; chart colors via `chart-theme.ts` (no raw hex).
- All new labels in **14 locales**, hand-translated; demo data deterministic (no impurity in
  render/`useMemo`).
- `npm run typecheck` + `npm run lint` clean; `npm run test:e2e` green (add/adjust specs for new
  surfaces if the suite covers dashboard routes).
- Dashboard remains demo-only: new fetchers live in `mockApi.ts`, never the real orchestrator.
