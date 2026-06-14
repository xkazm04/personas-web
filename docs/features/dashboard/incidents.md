# Incidents Inbox
> Audit-log incidents across the fleet — KPI header, multi-filter triage, group-by, and a detail modal · **Route:** `/dashboard/incidents` · **Nav label:** "Incidents" · **Status:** Demo-only (mocks)

## What it does
Incidents is the fleet's audit-log inbox: every notable event the orchestrator records — circuit-breaker trips, SLO breaches, missing secrets, repeated tool failures, cron drift, review-SLA escalations — surfaced as a single triage queue.

- **KPI header** — the unresolved count (open + escalated) over the total, a severity breakdown (critical / high / medium / low), and a source breakdown (executions / events / triggers / vault / messages / reviews).
- **Filters** — status, severity, source, and persona pill bars. Pill counts reflect the full set; selections persist across reloads.
- **Group by** — none (flat list), agent, severity, or source, with collapsible sections.
- **Detail modal** — click any incident for the full description, a metadata grid (source / category / agent / detected / resolved), badges (circuit-breaker, auto-fixed), and a recommended remediation.

It mirrors the desktop overview's Incidents Inbox (`sub_incidents`). Like the rest of `/dashboard/*`, all data is **mock** — incidents have no synced source in this repo.

## How it works
The page (`src/app/dashboard/incidents/page.tsx`) is a `"use client"` component in a `staggerContainer`/`fadeUp` tree. It loads incidents via `useAuditIncidents` (SWR over a standalone mock fetcher) and reads filter/group state from the persisted `useIncidentsFilterStore`. A `useMemo` runs `applyIncidentFilters` (status/severity/source/persona → severity-then-recency sort); the result feeds `IncidentList`, which calls `groupIncidents` for the chosen dimension. A `selected` state drives the detail modal.

Key behaviors:
- **Persisted filters** — `useIncidentsFilterStore` mirrors `dashboardFilterStore`: a manual `hydrate()`/`persist()` pair keyed `incidents-filter-state`, type-guarding every field on load and writing after each mutation. Hydration runs once after store creation (SSR-safe).
- **Demo-only fetch** — `getAuditIncidents` is a *standalone* export in `mockApi.ts` (not part of the `ApiClient` interface, so no real/supabase client changes); the hook calls it directly via SWR for a brief loading state.
- **Grouping** — `groupIncidents` buckets by agent (busiest first) / severity (worst first) / source (canonical order) / none (single group); each group keeps the severity-then-recency order. Sections collapse via a local `Set<string>` of collapsed keys.
- **Nav badge** — `MOCK_OPEN_INCIDENTS` (open + escalated) drives the sidebar badge, matching the KPI headline.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/incidents/page.tsx` | Page shell: load, filter memo, KPI/filters/group-by/list/modal layout |
| `src/app/dashboard/incidents/incidents-page/incidentFormat.ts` | Severity/status/source tint + icon maps; `applyIncidentFilters` + `groupIncidents`; filter/group types |
| `src/app/dashboard/incidents/incidents-page/useIncidentsFilterStore.ts` | Zustand store (status/severity/source/persona/groupBy) persisted to localStorage |
| `src/app/dashboard/incidents/incidents-page/useAuditIncidents.ts` | SWR over the standalone `getAuditIncidents` mock fetcher |
| `src/app/dashboard/incidents/incidents-page/IncidentsKpiHeader.tsx` | Open/total headline + severity + source breakdown (from the full set) |
| `src/app/dashboard/incidents/incidents-page/IncidentsFilters.tsx` | Status/severity/source/persona `FilterBar`s + clear button (reads the store) |
| `src/app/dashboard/incidents/incidents-page/IncidentsGroupByTabs.tsx` | Group-by segmented control (roving tabindex, mirrors `EventsPageTabs`) |
| `src/app/dashboard/incidents/incidents-page/IncidentRow.tsx` | One incident row: severity rail + meta + status badge → opens modal |
| `src/app/dashboard/incidents/incidents-page/IncidentList.tsx` | Flat or collapsible-grouped rendering of the filtered incidents |
| `src/app/dashboard/incidents/incidents-page/IncidentDetailModal.tsx` | Row→detail modal (description, meta grid, recommendation) on shared `Modal` |

## Data & state
- **Source:** Demo-only. `MOCK_AUDIT_INCIDENTS` (16 deterministic incidents, dates stamped at module load) + `INCIDENT_SEVERITIES` / `INCIDENT_STATUSES` / `INCIDENT_SOURCES` / `MOCK_OPEN_INCIDENTS` live in `src/lib/mock-dashboard-data.ts`. `getAuditIncidents()` is a standalone fetcher in `src/lib/mockApi.ts`.
- **Types:** `AuditIncident`, `IncidentSeverity`, `IncidentStatus`, `IncidentSource` (`mock-dashboard-data.ts`); `IncidentFilters`, `StatusFilter`, `SeverityFilter`, `SourceFilter`, `GroupByKey`, `IncidentGroup` (`incidentFormat.ts`).
- **Stores:** `useIncidentsFilterStore` (persisted filters/group). No other store dependency. Modal open state is local `useState`.
- **API routes:** none — direct mock fetcher only.

## Integration points
- **Dashboard shell** — new nav entry in `src/components/dashboard/DashboardNavigation.tsx` (`navItemDefs`, `Siren` icon) with a `MOCK_OPEN_INCIDENTS` badge in `getBadge`. Route is **not** in `SCOPED_ROUTE_PREFIXES` (it owns a persona filter, so the global scope bar is intentionally hidden).
- **Shared primitives** — `GlowCard`, `GradientText`, `FilterBar` (pills with count/pulse), `Modal`, `PersonaAvatar`, `EmptyState`, `SkeletonCard`; severity palette mirrors the observability health-issue rows (red/orange/amber/blue).
- **i18n** — nav label `t.dashboard.incidents` + the `t.incidentsPage` namespace (`src/i18n/en.ts`), hand-translated into all 13 non-en locales.
- **Format/util** — `relativeTime` from `src/lib/format.ts`.

## Conventions & gotchas
- **Demo-only:** all incidents are mock fixtures; `getAuditIncidents` never touches the real orchestrator. The fetcher is deliberately standalone (off the `ApiClient` proxy) so the surface works in both demo and real mode without a real source.
- **i18n 14-locale lockstep:** new keys under `t.dashboard` / `t.incidentsPage` must be added to `en.ts` and hand-translated into all 13 locales in the same commit. Non-Latin values may be written as `\uXXXX` escapes to sidestep the locale files' mojibake-on-disk hazard. Incident titles, descriptions, categories, recommendations, and persona names are **verbatim demo data** (English) — not translated, consistent with other mock-sourced surfaces.
- **Persisted filters:** `useIncidentsFilterStore` type-guards every persisted field on hydrate; a corrupt/stale payload falls back to defaults rather than landing an out-of-range filter.
- **React 19 purity:** filtering/grouping run in `useMemo` (deterministic — no `Date.now`/`Math.random`); incident dates are stamped once at module load in the mock fixture. The collapsed-set uses a lazy `useState(() => new Set())` initializer.
- **Animation gating:** `IncidentList`'s collapse uses `AnimatePresence` height/opacity gated by `useReducedMotion`; `FilterBar`/`Modal` already gate their own motion. No raw rAF.
- **HTML nesting:** detail-modal metadata values render in a `<div>` (not `<p>`) because the agent value embeds a `PersonaAvatar` (`<div>`) — a `<div>` inside `<p>` is invalid and triggers a hydration error.
- **Open vs. unresolved:** the KPI headline and the nav badge both count **open + escalated** (`MOCK_OPEN_INCIDENTS`); the "Open" status filter pill counts only `status === "open"`.

## Related docs
- [SLA](sla.md) — sibling oversight surface (breach log, severity tints, filter pills)
- [Observability](observability.md) — health-issue rows this surface's severity palette mirrors
- [Dashboard home overview](home-overview.md) — the Triage pane aggregates a slice of these incidents
- [Feature index](../INDEX.md)
