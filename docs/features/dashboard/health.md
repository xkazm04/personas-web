# System Health Panel
> Runtime / services / resources / integrations status, a disk-usage gauge, and demo install/configure actions · **Route:** `/dashboard/health` · **Nav label:** "Health" · **Status:** Demo-only (mocks)

## What it does
Health is the fleet's system-status board: four cards of health checks, each item with a status dot, so you can see at a glance whether the runtime, backing services, host resources, and external integrations are nominal.

- **Runtime** — Node.js, the Claude Code CLI, the orchestrator daemon, GPU acceleration.
- **Services** — local API, WebSocket bridge, scheduler, vector store.
- **Resources** — CPU, memory, network, plus a **disk-usage bar** (used / free).
- **Integrations** — GitHub, Slack, Google Calendar, OpenAI, Stripe, Gemini — with **Install / Configure** actions on items that aren't set up (demo no-ops that fire a toast).

Each card's header dot reflects the worst item status. Like the rest of `/dashboard/*`, all data is **mock** — there's no real host to probe in this repo.

## How it works
The page (`src/app/dashboard/health/page.tsx`) is a `"use client"` component in a `staggerContainer`/`fadeUp` tree. It loads via `useSystemHealth` (SWR over a standalone mock fetcher) and renders the four sections in a 2-column grid of `HealthSectionCard`s; the Resources card receives a `DiskUsageBar` as its footer. A demo action sets a `toast` state that renders a reused `ExecuteToast`.

Key behaviors:
- **Demo-only fetch** — `getSystemHealth` is a *standalone* export in `mockApi.ts` (not part of the `ApiClient` interface — no real/supabase client changes); the hook calls it via SWR for a brief loading state. Returns the four sections + the disk-usage gauge.
- **Worst-status header dot** — `worstStatus(items)` ranks error > warn > info > ok; the section header dot + icon take that status's tint.
- **Demo actions** — items with an `action` (`install` | `configure`) render a button; clicking calls `onAction`, which composes a localized toast message (`{name} {verb}`) and shows `ExecuteToast`. Toast `key` increments per action so the dismiss timer restarts.
- **Nav badge** — `MOCK_HEALTH_ALERTS` (count of `error` items) drives the sidebar badge.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/health/page.tsx` | Page shell: load, 2-col section grid, disk-bar footer on Resources, action toast |
| `src/app/dashboard/health/health-page/healthFormat.ts` | Status → dot/text/icon maps, section icon/accent maps, `worstStatus` |
| `src/app/dashboard/health/health-page/useSystemHealth.ts` | SWR over the standalone `getSystemHealth` mock fetcher |
| `src/app/dashboard/health/health-page/HealthSectionCard.tsx` | One section card: header status dot + item rows + optional footer + action buttons |
| `src/app/dashboard/health/health-page/DiskUsageBar.tsx` | Disk-usage gauge (fill-tinted bar + used/free readouts) |

## Data & state
- **Source:** Demo-only. `MOCK_HEALTH_CHECKS` (4 sections), `MOCK_DISK_USAGE`, `HEALTH_SECTION_ORDER`, `MOCK_HEALTH_ALERTS` in `src/lib/mock-dashboard-data.ts`; `getSystemHealth()` standalone fetcher in `src/lib/mockApi.ts`.
- **Types:** `HealthCheckSection`, `HealthCheckItem`, `HealthCheckStatus`, `HealthSectionKey`, `HealthActionKind` (`mock-dashboard-data.ts`).
- **Stores:** none — SWR + local `toast` state only.
- **API routes:** none — direct mock fetcher.

## Integration points
- **Dashboard shell** — nav entry in `src/components/dashboard/DashboardNavigation.tsx` (`navItemDefs`, `HeartPulse` icon) with a `MOCK_HEALTH_ALERTS` badge in `getBadge`. Not in `SCOPED_ROUTE_PREFIXES` (no persona scoping).
- **Shared primitives** — `GlowCard`, `GradientText`, `SkeletonCard`, and `ExecuteToast` (reused from the agents surface for the demo-action toast). Status ramp matches the dashboard standard (emerald/amber/rose/cyan).
- **i18n** — nav label `t.dashboard.health` + the `t.healthPage` namespace (`src/i18n/en.ts`), hand-translated into all 13 non-en locales.

## Conventions & gotchas
- **Demo-only:** all checks are mock fixtures; `getSystemHealth` never probes a real host. Install/Configure actions are no-ops that only show a toast.
- **i18n 14-locale lockstep:** new keys under `t.dashboard` / `t.healthPage` propagate to all 13 locales in the same commit (non-Latin as `\uXXXX` escapes to dodge the mojibake-on-disk hazard). Item names + details + version metadata are **verbatim demo data** (technical identifiers / proper nouns) — not translated.
- **React 19 purity:** no impure calls in render — the toast id increments via a functional `setState` updater; the disk-bar width is a deterministic `style.width` percentage.
- **Animation gating:** no rAF/looping motion here; `ExecuteToast` gates its own entrance motion. The disk bar is static.
- **Toast reuse:** `ExecuteToast` is imported cross-folder from the agents surface — it's a self-contained presentational toast (status/message/onDismiss), so the reuse is intentional and dependency-free.

## Related docs
- [Observability](observability.md) — metrics/cost charts + the health *issues* list (distinct from this system-status board)
- [Incidents](incidents.md) — audit-log incident queue (sibling oversight surface)
- [Settings](settings.md) — the desktop alternative home for this panel (a Settings tab)
- [Feature index](../INDEX.md)
