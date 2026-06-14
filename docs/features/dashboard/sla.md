# SLA & Breach Tracking
> Service-level objective tracking and a breach/incident log for the persona fleet — per-persona SLA targets, live compliance, and an expandable history of breaches. **Route:** `/dashboard/sla` · **Nav label:** "SLA" (aka Incidents) · **Status:** Demo-only (mocks)

## What it does

The SLA surface answers two operational questions for the agent fleet: *Are we meeting our promises?* and *When did we break them?*

It renders three stacked sections:

1. **Summary grid** — three headline tiles: overall **Compliance** (mean time-in-SLA across all objectives, as a %), **Active breaches** (count of targets currently in breach), and **Objectives** (total number of SLA targets tracked).
2. **Target grid** — one card per SLA objective. Each card shows the persona, the metric type (Availability / Latency p95 / Success rate), the target vs. current value, a "time in SLA" compliance bar, and a healthy/at-risk icon. Status **filter pills** (All / At risk / Healthy) narrow the grid; the "At risk" pill pulses when any target is breaching.
3. **Breach log** (the "incidents" log) — a chronological list of breaches/incidents. Each row is a collapsed summary (severity pill, title, persona · metric · relative start time, duration, ongoing/resolved badge). **Severity filter pills** (All / Critical / Major / Minor) narrow the list. Clicking a row expands an inline **detail panel** with the full summary, absolute start/resolve timestamps, a duration bar scaled against the longest breach in view, and — the "same-persona context" — a note when the same persona has *other* breaches in the current view.

**What a "target" means here:** an SLA objective for one persona on one metric — e.g. *ResearchAgent availability ≥ 99.9%* or *ReportGen latency p95 ≤ 30s*. Each target carries a `direction` (higher-is-better vs. lower-is-better), a `current` value, a `timeInSLA` ratio (0–1, the fraction of the window spent within objective), and an `activeBreach` flag.

**What a "breach" (incident) means here:** a recorded period during which a persona fell out of objective. It has a `severity` (minor/major/critical), a `startedAt`, an optional `resolvedAt` (`null` = ongoing), a `durationMinutes`, and a human-readable `summary` (e.g. "Slack webhook circuit-broken; 3 retries exhausted").

## How it works

**Data hook — `useSlaData()`** (`src/app/dashboard/sla/useSlaData.ts`). Returns `{ targets, breaches, loading, error }`. The mode is decided once per session from `authStore.isDemo`:
- **Demo mode** (this repo's default): `useState` initializers seed the static fixtures `MOCK_SLA_TARGETS` / `MOCK_SLA_BREACHES`, `loading` starts `false`, and the effect early-returns (`if (useMock) return;`) — no fetch runs (`useSlaData.ts:44`).
- **Real/Supabase mode**: the effect calls `getSyncedSla()` (`src/lib/supabaseApi.ts:831`), which derives default objectives from the `synced_leaderboard` per-persona aggregates (no desktop-side SLA config exists). Errors are captured to Sentry with `tags: { scope: "useSlaData" }` and surfaced via `error`.

**Page composition — `page.tsx`.** `SLAPage` calls `useSlaData()`, then derives the two summary numbers in a `useMemo` (`page.tsx:24`): `overallCompliance` = mean of `target.timeInSLA`, `activeBreachCount` = count of `target.activeBreach`. `fetchedAt` is captured once in a lazy `useState(() => Date.now())` initializer (React 19 purity rule) and fed to `StalenessIndicator`. While `loading`, it renders `SkeletonCard`s; `error` renders a `DashboardErrorBanner` above content. The whole page is a `staggerContainer` with `fadeUp` children (framer-motion).

**Summary grid — `SLASummaryGrid.tsx`.** Three glass tiles. The compliance number's color comes from `complianceBand()`; active-breach count is rose when > 0, else emerald.

**Target grid — `SLATargetGrid.tsx`.** Local `filter` state (`"all" | "atRisk" | "healthy"`). Counts are memoized off `targets`; "at risk" = `activeBreach === true`. The visible set is filtered, then mapped to cards inside `<AnimatePresence>` with `layout` animation (gated by `useReducedMotion`). Each card's compliance bar width is `timeInSLA * 100`% and its color band is `complianceBand(target.timeInSLA)`. Target/current values are formatted by `formatTarget` / `formatValue`. The persona dot uses the raw `personaColor` (inline `style`, not a token, since it's data-driven).

**Breach log — `SLABreachLog.tsx`.** Local `filter` state (`"all" | SLASeverity`) and a single `openId` (only one row expanded at a time). Severity counts are tallied in a memo. `maxDuration` is the max `durationMinutes` *of the currently filtered set* — this is what the detail duration bar scales against, so the bar is relative to what's visible. For each row it computes `samePersonaCount` = other breaches by the same persona in the filtered set, and passes `reduce`/`pulse` down. `SEVERITY_ORDER` is `["critical", "major", "minor"]`.

**Breach row — `SLABreachRow.tsx`.** A `<button>` with `aria-expanded`, a `grid-cols-[auto_1fr_auto_auto_auto]` layout: severity pill (`severityPill[breach.severity]`), summary + meta line (`persona - metric - relativeTime(startedAt)`), duration label (`labels.duration.replace("{n}", …)`), an ongoing/resolved badge (ongoing shows a pulsing rose dot + "Ongoing"; resolved shows `relativeTime(resolvedAt)`), and a `ChevronDown` that rotates 180° when open. The expand/collapse is a height-auto `<motion.div>` inside `<AnimatePresence>`.

**Breach detail — `SLABreachDetail.tsx`.** Shows the full (untruncated) `summary`, absolute `formatAbsolute(startedAt)` / `formatAbsolute(resolvedAt)` timestamps, an elapsed/time-to-resolve bar at `max(4, durationMinutes / maxDuration * 100)`% (rose if ongoing, amber if resolved), and the same-persona line: `otherBreaches.replace("{persona}", …).replace("{n}", …)` when `samePersonaCount > 0`.

**Formatting helpers — `slaFormat.ts`.**
- `complianceBand(value)` → `{ text, bar, pill }` Tailwind classes by threshold: ≥ 0.995 emerald, ≥ 0.98 cyan, ≥ 0.95 amber, else rose.
- `severityPill` → per-severity pill classes (minor cyan, major amber, critical rose).
- `formatValue` / `formatTarget` → unit-aware: `ms` values ≥ 1000 render as seconds, `%` values render with 1–2 decimals.
- `metricKey(metric)` → identity helper that narrows `SLAMetricType` to index the i18n `metricType` record.
- `formatAbsolute(iso)` → deterministic `toLocaleString("en-US", …)`; returns `"-"` for invalid dates. Deliberately render-safe because it depends only on a fixed ISO string (no `Date.now()` call), so it's pure inside render.

**Link to system health.** This page does *not* read `systemStore` directly — overall live system health (connected/disconnected, the global health check) is a separate concern surfaced by the dashboard shell. The SLA surface is about per-persona objective compliance, not the orchestrator connection state.

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/sla/page.tsx` | Route page; composes sections, derives compliance/active-breach summary, loading/error states |
| `src/app/dashboard/sla/useSlaData.ts` | Data hook; demo mocks vs. `getSyncedSla()`; returns `{ targets, breaches, loading, error }` |
| `src/app/dashboard/sla/sla-page/SLASummaryGrid.tsx` | Three headline tiles (compliance / active breaches / objectives) |
| `src/app/dashboard/sla/sla-page/SLATargetGrid.tsx` | Per-objective cards + All/At risk/Healthy status filter pills |
| `src/app/dashboard/sla/sla-page/SLABreachLog.tsx` | Breach/incident list, severity filter, single-open expansion state, `maxDuration` + same-persona tally |
| `src/app/dashboard/sla/sla-page/SLABreachRow.tsx` | Collapsed breach row (button, severity pill, ongoing/resolved badge, chevron) |
| `src/app/dashboard/sla/sla-page/SLABreachDetail.tsx` | Expanded detail: full summary, absolute timestamps, duration bar, same-persona context |
| `src/app/dashboard/sla/sla-page/slaFormat.ts` | `complianceBand`, `severityPill`, `formatValue`/`formatTarget`, `metricKey`, `formatAbsolute` |
| `src/lib/mock-dashboard-data.ts` | `SLATarget`/`SLABreach` types + `MOCK_SLA_TARGETS`/`MOCK_SLA_BREACHES` fixtures (~line 608) |
| `src/components/dashboard/FilterBar.tsx` | Shared filter-pill bar used for both status and severity filters |

## Data & state
- **Source:** `MOCK_SLA_TARGETS` (5 objectives) and `MOCK_SLA_BREACHES` (4 incidents) in `src/lib/mock-dashboard-data.ts`. Breach `startedAt`/`resolvedAt` are generated relative to `Date.now()` at module load so relative times stay fresh. In real mode, `getSyncedSla()` derives both from the `synced_leaderboard` Supabase view.
- **Stores:** No Zustand store for SLA data itself — all state is local (`useSlaData`'s `useState` + component-local `filter`/`openId`). `authStore.isDemo` selects mock vs. live mode. `systemStore` (global health) is *not* consumed by this surface.
- **API routes:** None. Data is either in-process mocks (demo) or a direct Supabase query via `getSyncedSla` (live).
- **Types:** `SLATarget`, `SLABreach`, `SLAMetricType` (`"availability" | "latency" | "successRate"`), `SLASeverity` (`"minor" | "major" | "critical"`) — all exported from `src/lib/mock-dashboard-data.ts`. `SlaData` is the hook's return shape.

## Integration points
- **Dashboard shell & nav.** Registered in `navItemDefs` (`src/components/dashboard/DashboardNavigation.tsx:34`) with `labelKey: "sla"`, `Shield` icon, `href: "/dashboard/sla"`. Renders inside the shared dashboard layout (sidebar / mobile bottom nav).
- **Shared dashboard primitives.** Uses `FilterBar` (status + severity pills, with the animated sliding pill), `SkeletonCard`, `DashboardErrorBanner`, `StalenessIndicator`, and `GradientText`. Note: it does **not** use `StatusBadge` or `MetricCard` — SLA has its own bespoke tiles (`SLASummaryGrid`) and badges (`severityPill`, ongoing/resolved badge) because its status vocabulary (severity, breach, time-in-SLA) differs from the execution-status vocabulary those primitives encode.
- **Formatting utilities.** `relativeTime` from `src/lib/format.ts` (Sentry-breadcrumbed clock-skew fallback) for the collapsed row; `formatAbsolute` (local helper) for the detail panel.
- **i18n.** Nav label at `t.dashboard.sla`. All page copy under `t.slaPage.*` — including `t.slaPage.timeInSla`, `t.slaPage.targetFilter.{all,atRisk,healthy}`, `t.slaPage.metricType.{availability,latency,successRate}`, `t.slaPage.severity.{minor,major,critical}`, and `t.slaPage.breachLog.*` (title, empty, all, ongoing, duration with `{n}`, started, resolved, otherBreaches with `{persona}`/`{n}`, timeToResolve, elapsed). The interface is at `src/i18n/en.ts:525`, the en values at `:1687`.
- **Observability relationship.** In `context-map.json` this lives under the **"Observability Charts & SLA"** context, but the latency/cost/usage charts are documented separately — see [Observability charts](observability.md). SLA owns only objective tracking + the breach log.

## Conventions & gotchas
- **i18n 14-locale lockstep.** Every string is a `t.slaPage.*` / `t.dashboard.sla` key; no hardcoded English in JSX or `aria` attributes. Adding a label means adding it to `en.ts` (source of truth) and hand-translating into all 13 other locales in the same commit. Interpolation uses literal `{n}` / `{persona}` placeholders replaced via `String.replace` at the call site (see `SLABreachRow`/`SLABreachDetail`).
- **Semantic Tailwind tokens.** Cards use `border-glass`, `bg-white/[0.02]`, `text-foreground`, `text-muted-dark`. The one intentional exception is `personaColor`, applied via inline `style` because it's per-persona data, not a design token.
- **Animation gating (React 19 + framer).** `SLATargetGrid`, `SLABreachLog`, `SLABreachRow` all call `useReducedMotion()` and short-circuit `layout`/transition durations (`reduce ? 0 : …`) and the ongoing-dot pulse (`pulse = reduce ? "" : "animate-pulse"`). `FilterBar` does the same for its sliding pill. Keep this when adding motion.
- **React 19 purity.** `fetchedAt` is seeded with a lazy `useState(() => Date.now())` — never call `Date.now()`/`new Date()` directly in render or a `useMemo` factory. `formatAbsolute` is safe to call in render only because it takes a fixed ISO string and never reads the clock; the relative-time meta line uses `relativeTime` (which *does* read the clock) but only for display, not derived state.
- **Single-open accordion.** The breach log tracks one `openId`; opening a row collapses any other. If you need multi-open, switch to a `Set<string>`.
- **`maxDuration` is filter-relative.** The detail duration bar scales against the longest breach *in the current filtered view*, so the same breach's bar width changes when you switch severity filters. This is intentional (relative emphasis), not a bug.
- **Demo-only caveat.** In this repo `isDemo` is effectively always true, so the live `getSyncedSla` branch and the `error`/`loading` paths render only against real Supabase data — exercise them with mock toggles, not by editing the page.
- **Where to extend.** New metric types → extend `SLAMetricType` + `t.slaPage.metricType` (all locales) + `formatValue`/`formatTarget` unit handling. New severities → extend `SLASeverity`, `severityPill`, `SEVERITY_ORDER`, and `t.slaPage.severity`. New summary tiles → `SLASummaryGrid` + a derived value in `page.tsx`'s `useMemo`.

## Related docs
- [Observability charts](observability.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
