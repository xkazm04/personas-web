# System Health Panel
> Runtime / services / resources / integrations status, a disk-usage gauge, and demo install/configure actions · **Route:** `/dashboard/health` · **Nav label:** "Health" · **Status:** Demo-only (mocks)

## What it does
Health is the fleet's system-status board: four cards of health checks, each item with a status dot, so you can see at a glance whether the runtime, backing services, host resources, and external integrations are nominal.

- **Runtime** — Node.js, the Claude Code CLI, the orchestrator daemon, GPU acceleration.
- **Services** — local API, WebSocket bridge, scheduler, vector store.
- **Resources** — CPU, memory, network, plus a **disk-usage bar** (used / free).
- **Integrations** — GitHub, Slack, Google Calendar, OpenAI, Stripe, Gemini — with **Install / Configure** actions on items that aren't set up. Clicking one settles that row for the rest of the visit - its dot turns healthy, the button goes away and the line reads "configured (demo)" / "enabled (demo)" - and fires a toast. Nothing real is installed or configured.

A check that is one fragment of a wider incident (today: Slack's "Webhook circuit-broken") shows **Related** chips that deep-link to the same incident on SLA and Observability, and `/dashboard/health?focus=<check id>` rings that row and scrolls it into view, next to its Configure button.

**Fix the cause once.** Configuring such a check fixes the whole incident for the session, not just the row: the Health badge drops, the Observability issue (`hi_2`) reads resolved, the SLA breach (`br_1`) closes at the fix time with its minutes frozen and its target leaves active breach, the Incidents entry (`inc_1`) and its correlated cluster resolve, and Mission Control's Recovery cell loses the paused breaker - all without a reload. History stays (the breach row, the budget the target consumed, the issue's circuit-breaker flag). The toast offers **Undo fix**, which reopens every one of them; a reload also restores the outage.

Each card's header dot reflects the worst item status. Like the rest of `/dashboard/*`, all data is **mock** — there's no real host to probe in this repo.

## How it works
The page (`src/components/dashboard/views/health/index.tsx`) is a `"use client"` component that loads per the dashboard tier standard (see **Loading tiers** below). It loads via `useSystemHealth` (SWR over a standalone mock fetcher) and renders the four sections in a 2-column grid of `HealthSectionCard`s; the Resources card receives a `DiskUsageBar` as its footer. A demo action records the check in a local `resolutions` map (pure reducer in `health-page/healthActions.ts`) that is projected onto the fetched sections, and sets a `toast` state that renders a reused `ExecuteToast`.

Key behaviors:
- **Demo-only fetch** — `getSystemHealth` is a *standalone* export in `mockApi.ts` (not part of the `ApiClient` interface — no real/supabase client changes); the hook calls it through `useDemoOnlySWR` (`src/hooks/useDemoOnlySWR.ts`), SWR keyed on `isDemo`, for a brief loading state. Returns the four sections + the disk-usage gauge. In a real (non-demo) session the key is `null`, nothing is fetched, and the page renders an `EmptyState` (`t.dashboardUi.liveUnavailableTitle` / `liveUnavailableDescription`) instead of the fixture.
- **Worst-status header dot** — `worstStatus(items)` ranks error > warn > info > ok; the section header dot + icon take that status's tint.
- **Demo actions** — items with an `action` (`install` | `configure`) render a button; clicking calls `onAction`, which (1) `resolveHealthAction(prev, item)` - records `{ [item.id]: item.action }`, same reference when nothing changes - and (2) composes a localized toast message (`{name} {verb}`) for `ExecuteToast`. `applyHealthResolutions(sections, resolutions, detail)` (memoized in the page) turns each resolved check into `status: "ok"`, no `action`, and `detail` = the matching `t.healthPage.toast` string; untouched sections keep their reference, the fixture is never mutated, and because it is keyed by id a resolution survives an SWR refetch. It lasts for the page's lifetime (no persistence). Toast `key` increments per action so the dismiss timer restarts.
- **Focus + related links** — `HealthSectionCard` reads `useFocusParam()` once and passes `focused` to each `HealthCheckRow`, which adds a `ring-brand-cyan/50` class (class only — markup shape never depends on the URL, and the server/hydrating render see `null`) and calls `useScrollIntoViewWhen`. Rows whose id is in an incident thread (`causeKey` on the fixture, `src/lib/incidentThreads.ts`) render `RelatedIncidentLinks` under the detail line; the rest render nothing extra.
- **Thread fixes** — an item with a `causeKey` does not use the local map: `onAction` calls `fixCause(causeKey, action, at)` (`src/lib/demoCauseFix.ts`), which writes `{ at, kind }` into the session slice `useResolvedCausesStore` (`src/stores/resolvedCausesStore.ts`, in memory only) and writes the new value of every thread-member SWR key (`DEMO_THREAD_KEYS`, `src/lib/demoThreads.ts`) straight into the SWR cache, so views kept alive in `<Activity>` and views not yet visited read the settled thread. The pure projector `settleThread` (`src/lib/settleThread.ts`, beside `buildIncidentThreads`) is applied once, inside the mock reads (`mockApi.ts` "Thread-member reads"), and by `useDemoThreads()` for the synchronous readers. The page overlays the fixed causes onto its rows with `withFixedCauses` so the row settles at once with the localized "done" line. The toast's **Undo fix** (`t.healthPage.toast.undo`, via the new optional `action` prop on `ExecuteToast`) calls `undoCauseFix(causeKey)`.
- **Nav badge** — `healthAlertCount` (count of `error` items) over `useDemoThreads()` drives the sidebar badge, so a fixed cause lowers it. Demo-only: a real session's selector never reads the slice.
- **Blast-radius agent chips** — on a non-ok integration row `BlastRadiusPanel` (`health-page/BlastRadiusPanel.tsx`) lists the affected agents; each chip is an `ExecutionLink` to that agent's latest run (`/dashboard/executions?focus=<id>`, from `getBlastRadiusInputs().latestRunByPersona`, accessible name `healthPage.blast.latestRun`); an agent with no run renders a plain chip.

### Loading tiers

Follows [loading-orchestration](loading-orchestration.md).

- **T0** - the header (`data-tour-diagram="dashboard-health"`), plain and never animated (`src/components/dashboard/views/health/index.tsx:60`).
- **T1** - the four section cards (border, icon, title), `arriveAt(index)` in the fixed `HEALTH_SECTION_ORDER` (`src/components/dashboard/views/health/index.tsx:86`). On a cold load they render from that order with no items, keyed by section key both ways, so the same card elements carry on when the data lands.
- **T2** - the check rows, the worst-status dot/tint and the disk gauge. While `pending` (`src/components/dashboard/views/health/index.tsx:46`) each card draws four delayed 52px ghost rows matching `HealthCheckRow` (`health-page/HealthSectionCard.tsx:59`), the header dot makes no claim (`:51`), and the Resources footer holds the gauge's 54px (`src/components/dashboard/views/health/index.tsx:96`). Rows landing after a cold load take `.dash-arrive` once on the persistent list node (`coldStart`, `src/components/dashboard/views/health/index.tsx:45`). Rows are keyed by check id.
- **T3** - none. The gauge is a light bar, and rows must be mounted for a `?focus=<check id>` deep link to ring and scroll them.

## Key files
| File | Role |
| --- | --- |
| `src/components/dashboard/views/health/index.tsx` | Page shell: load, apply demo resolutions, 2-col section grid, disk-bar footer on Resources, action toast |
| `src/components/dashboard/views/health/health-page/healthActions.ts` | Pure demo reducer (`resolveHealthAction`) + projection (`applyHealthResolutions`) + fixed-cause overlay (`withFixedCauses`); pinned by `healthActions.test.ts` |
| `src/lib/settleThread.ts` | `settleThread` projector, `projectDemoThreads`, badge selectors `healthAlertCount` / `openIncidentCount`; pinned by `settleThread.test.ts` |
| `src/lib/demoCauseFix.ts` | `fixCause` / `undoCauseFix`: the session slice + the SWR cache writes; pinned by `demoCauseFix.test.ts` |
| `src/stores/resolvedCausesStore.ts` | Session-only slice of fixed causes, keyed by `causeKey` |
| `src/lib/healthFormat.ts` | Status → dot/text/icon maps, section icon/accent maps, `worstStatus` |
| `src/components/dashboard/views/health/health-page/useSystemHealth.ts` | Demo-gated SWR (`useDemoOnlySWR`) over the standalone `getSystemHealth` mock fetcher |
| `src/components/dashboard/views/health/health-page/HealthSectionCard.tsx` | One section card: header status dot + `HealthCheckRow` items (focus ring, Related chips) + optional footer + action buttons |
| `src/components/dashboard/views/health/health-page/DiskUsageBar.tsx` | Disk-usage gauge (fill-tinted bar + used/free readouts) |

## Data & state
- **Source:** Demo-only. `MOCK_HEALTH_CHECKS` (4 sections), `MOCK_DISK_USAGE`, `HEALTH_SECTION_ORDER` in `src/lib/mock-dashboard-data.ts`, served through the session projection (`settleThread`); `getSystemHealth()` / `getBlastRadiusInputs()` standalone fetchers in `src/lib/mockApi.ts`.
- **Types:** `HealthCheckSection`, `HealthCheckItem`, `HealthCheckStatus`, `HealthSectionKey`, `HealthActionKind` (`mock-dashboard-data.ts`); `ResolvedCauses`, `ThreadFixtures` (`settleThread.ts`).
- **Stores:** `useResolvedCausesStore` (session-only fixed causes); otherwise SWR + local `resolutions` and `toast` state.
- **API routes:** none — direct mock fetcher.

## Integration points
- **Dashboard shell** — nav entry in `src/components/dashboard/DashboardNavigation.tsx` (`navItemDefs`, `HeartPulse` icon) with a `healthAlertCount` badge in `getBadge` (a selector over the session projection). Not in `SCOPED_ROUTE_PREFIXES` (no persona scoping).
- **Shared primitives** — `GlowCard`, `GradientText`, and `ExecuteToast` (reused from the agents surface for the demo-action toast). Status ramp matches the dashboard standard (emerald/amber/rose/cyan).
- **i18n** — nav label `t.dashboard.health` + the `t.healthPage` namespace (`src/i18n/en.ts`), hand-translated into all 13 non-en locales.

## Conventions & gotchas
- **Demo-only:** all checks are mock fixtures; `getSystemHealth` never probes a real host, and a real tenant never sees them (live-unavailable empty state). Install/Configure only change in-session UI state (the row settles to ok, or the whole incident thread settles for a `causeKey` check) and show a toast - no call leaves the page. A fix is session-only: a reload restores the outage. Drills / `?drill=` seeking are not built.
- **i18n 14-locale lockstep:** new keys under `t.dashboard` / `t.healthPage` propagate to all 13 locales in the same commit (non-Latin as `\uXXXX` escapes to dodge the mojibake-on-disk hazard). Item names + details + version metadata are **verbatim demo data** (technical identifiers / proper nouns) — not translated.
- **React 19 purity:** no impure calls in render — the toast id and the resolutions map update via functional `setState` updaters; the disk-bar width is a deterministic `style.width` percentage.
- **Animation gating:** no rAF/looping motion here; `ExecuteToast` gates its own entrance motion. The disk bar is static.
- **Toast reuse:** `ExecuteToast` is imported cross-folder from the agents surface — it's a self-contained presentational toast (status/message/onDismiss), so the reuse is intentional and dependency-free.

## Related docs
- [Observability](observability.md) — metrics/cost charts + the health *issues* list (distinct from this system-status board)
- [Incidents](incidents.md) — audit-log incident queue (sibling oversight surface)
- [Settings](settings.md) — the desktop alternative home for this panel (a Settings tab)
- [Feature index](../INDEX.md)
