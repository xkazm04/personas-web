# Agents (Personas) Management
> The dashboard surface that lists every deployed agent ("persona") as a portrait card, lets you fire a manual execution, and expands each card into recent-execution / subscription / trigger detail. **Route:** `/dashboard/agents` · **Nav label:** "Agents" · **Status:** Demo-only (mocks)

## What it does

The Agents page is the roster of every persona running in your fleet. Each agent is a portrait card showing its generated artwork (or an icon fallback), its name, a live/off status pill, a one-line description, and a row of constraint chips — concurrency, timeout, and (if set) a per-run budget cap. A header above the grid counts how many agents are deployed and — when system health is available — how many workers are currently executing.

You can do two things per card without leaving the page:

- **Execute** — fire a one-off manual run of that agent. The button shows a spinner while the request is in flight, then flashes a brief emerald (queued) or rose (failed) ring, pulses the portrait on success, and raises a bottom-anchored toast naming the agent.
- **Details** — expand the card in place to reveal that agent's recent executions (status, id, duration, relative time), plus subscription and trigger counts. Hovering a card prefetches this detail so the expand feels instant.

The empty state (no agents) and the initial loading skeleton grid are both first-class. Everything here is **demo-only in this repo** — it runs on in-memory mocks, not a live fleet (see Data & state).

## How it works

**Page shell** (`src/app/dashboard/agents/page.tsx`). On mount it calls `fetchPersonas()` (persona store) and `fetchHealth()` (system store) once (`page.tsx:38`). While `personasLoading` is true and the list is still empty it renders `<AgentsLoadingGrid>` (a 3-card shimmer placeholder); otherwise it renders the header + a responsive grid of `<AgentCardImage>`, or `<EmptyState>` when there are zero personas. The grid carries `data-tour-diagram="dashboard-agents"` for the guided tour.

**Per-card local state lives in the page, not the card.** The page owns four pieces of transient state shared across cards (`page.tsx:30-36`):
- `expandedImageId` — which single card is expanded (mutually exclusive; opening one closes the other).
- `executingIds` (a `Set<string>`) — which agents have an in-flight execute call, so each button can independently disable + spin.
- `result` + a 700ms `resultTimerRef` — the transient success/error outcome ring, re-armed on every outcome so rapid re-fires restart the flash (`flashResult`, `page.tsx:57`). The timer is cleared on unmount.
- `toast` + `toastIdRef` — the most recent execute toast; the monotonic id keys `<ExecuteToast>` so a new outcome restarts its auto-dismiss timer.

**Execute flow** (`handleExecute`, `page.tsx:63`). Reads the persona name from `usePersonaStore.getState().personasById[id]` (imperative read, no subscription), adds the id to `executingIds`, awaits `api.executePersona(id, t.agentsPage.manualExecution)`, then on resolve shows a success toast + emerald flash, on reject shows an error toast + rose flash, and always removes the id from `executingIds` in `finally`. Note: this is a **fire-and-forget** call — it does **not** write back to the persona store, so the card itself doesn't change after a successful execute (only the toast/ring/pulse react). There is no optimistic persona mutation on this path.

**Prefetch** (`handlePrefetch`, `page.tsx:87`). `onMouseEnter` on a card calls `prefetchAgentDetail(id)` exactly once per id (guarded by a `Set` ref). That function (`AgentDetail.tsx:16`) loads the detail bundle and seeds SWR's cache (`mutate(dashboardKeys.agentDetail(id), data, { revalidate: false })`) so the in-place expand renders instantly.

**The card** (`AgentCardImage.tsx`). Commented "Variant B — portrait-dominant card". Renders the Leonardo portrait from `imageForPersona(name)` (a name→PNG lookup) or, when none exists, an icon medallion via `<PersonaGlyph>` tinted with `persona.color`. The glow accent is derived from the persona color by `accentFromColor` (`agentAccent.ts`) — a 4-color cyan/purple/emerald/amber map, defaulting to cyan. Below the hero: description, `<AgentMetrics>` chips, the Execute + Details buttons, and an `<AnimatePresence>`-gated height animation wrapping `<AgentDetail>` when expanded.

**Detail bundle** (`AgentDetail.tsx`). `useAgentDetail(persona.id)` (SWR, `dashboard-queries.ts:25`) fetches `{ executions(≤5), subscriptions, triggers }` in parallel via `loadAgentDetail`. Renders an error+retry row, a skeleton (4 rows mirroring the real list), or the data: a recent-executions list (`<StatusBadge>` + truncated id + `formatDuration` + `relativeTime`) and a subscriptions/triggers count line. `dedupingInterval: 60_000`, `keepPreviousData`, `revalidateOnFocus: false`.

**Metrics** (`AgentMetrics.tsx`). A wrap-flow of constraint chips: concurrency (`maxConcurrent`), timeout (`timeoutMs/1000`s), and budget (`$maxBudgetUsd`, only when truthy). Each chip carries a full-sentence `title`/`aria-label` with the value interpolated. Shared verbatim by the card and the (dormant) drawer so both surfaces stay visually identical.

**Sibling surfaces that share these components** (rendered on *other* routes, not `/dashboard/agents`):
- `SubscriptionsPanel.tsx` + its `subscriptions-panel/` parts power the **Subscriptions tab of `/dashboard/events`**, not this page. It lists event→persona subscriptions enriched with persona name/icon/color (joined from the persona store), with a filter toolbar (All/Active/Disabled), a create form, and per-card enable/disable + delete. All its writes go through `useEventStore`, **not** `usePersonaStore`.
- `MemoryActionsPanel.tsx` renders on the **`/dashboard/home`** intelligence panel — a dismissible list of `MOCK_MEMORY_ACTIONS` suggestions (throttle/alert/routing/schedule/config), linking out to `/dashboard/knowledge`. It is fully static mock data with local dismiss state.
- `AgentDetailDrawer.tsx` — a full right-side portal drawer (focus trap, Esc, `<AgentMetrics>` + `<AgentDetail>`) — is **not imported anywhere** in the app (see gotchas).

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/agents/page.tsx` | Page shell: fetches personas + health, owns execute/expand/toast state, renders the card grid |
| `src/app/dashboard/page.tsx` | `/dashboard` root — `redirect("/dashboard/home")`; the agents list lives at `/dashboard/agents` |
| `src/app/dashboard/agents/agents-page/AgentCardImage.tsx` | Portrait-dominant persona card (Variant B): hero image, status pill, metrics, execute/details, inline `<AgentDetail>` |
| `src/app/dashboard/agents/agents-page/AgentsLoadingGrid.tsx` | 3-card shimmer skeleton shown during the first load |
| `src/app/dashboard/agents/agents-page/ExecuteToast.tsx` | Bottom-anchored `role=alert` toast, auto-dismiss (4s ok / 7s error) |
| `src/app/dashboard/agents/agents-page/agentAccent.ts` | `accentFromColor` — persona color → cyan/purple/emerald/amber glow accent |
| `src/app/dashboard/agents/agents-page/personaVisuals.tsx` | `imageForPersona` (name→portrait PNG) + `<PersonaGlyph>` (name→lucide icon fallback) |
| `src/components/dashboard/AgentDetail.tsx` | SWR-backed recent-executions / subs / triggers detail + `prefetchAgentDetail` |
| `src/components/dashboard/AgentMetrics.tsx` | Shared concurrency / timeout / budget constraint chips |
| `src/components/dashboard/PersonaAvatar.tsx` | Color-tinted icon avatar (sm/md/lg, optional breathing-glow `active` ring) |
| `src/components/dashboard/AgentDetailDrawer.tsx` | Right-side portal drawer (focus trap + Esc) — **currently unreferenced / dormant** |
| `src/components/dashboard/SubscriptionsPanel.tsx` | Subscriptions list (used by `/dashboard/events`, not this page) |
| `src/components/dashboard/subscriptions-panel/CreateSubscriptionForm.tsx` | Create-subscription form (persona + event-type selects, optional source filter) |
| `src/components/dashboard/subscriptions-panel/SubscriptionCard.tsx` | Per-subscription card: enable/disable toggle + confirm-delete |
| `src/components/dashboard/subscriptions-panel/SubscriptionsToolbar.tsx` | All/Active/Disabled filter pills + "New subscription" button |
| `src/components/dashboard/subscriptions-panel/subscriptionTypes.ts` | `EnrichedSubscription` / `SubscriptionFilter` types |
| `src/components/dashboard/MemoryActionsPanel.tsx` | Memory-insight suggestion cards (used by `/dashboard/home`) |
| `src/stores/personaStore.ts` | Zustand persona store: keyed list, stale-while-revalidate fetch, optimistic-update helpers |
| `src/lib/dashboard-queries.ts` | `loadAgentDetail` / `useAgentDetail` SWR key + fetcher |

## Data & state

- **Source:** **Demo-only mocks** in this repo. `src/lib/mockApi.ts` (`MOCK_PERSONAS`, `MOCK_EXECUTIONS`, `MOCK_EVENTS` etc. from `src/lib/mock-dashboard-data.ts` / `mockData.ts`) backs every call; `executePersona` just returns `{ executionId: "e-new-…", status: "queued" }` after a 500ms delay. `MemoryActionsPanel` reads `MOCK_MEMORY_ACTIONS` directly. **Live path:** the `api` Proxy (`src/lib/api.ts:361`) dispatches per-call: `isDemo` → `mockApi`; else `realApi` (external orchestrator at `NEXT_PUBLIC_ORCHESTRATOR_URL`) or `supabaseApi`. `isDemo` defaults to `false` (`authStore.ts:70`) but the dashboard is reached through demo sign-in, so in practice these routes run on mocks here.
- **Stores:** `usePersonaStore` (personas: `personas[]`, `personasById`, `personaIds`, loading/fetchedAt, optimistic helpers); `useSystemStore` (`health`, `fetchHealth`); `useEventStore` (subscriptions + events — used by `SubscriptionsPanel`/`CreateSubscriptionForm`/`SubscriptionCard`, **not** the agents page). Detail data is cached in **SWR**, keyed by `dashboardKeys.agentDetail(personaId)`.
- **API routes (via `ApiClient`):** `listPersonas` (`/api/personas`), `executePersona` (`POST /api/execute`), `listExecutions` (`/api/executions?personaId&limit=5`), `listSubscriptions`, `listTriggers`, `getHealth`; subscriptions panel also uses `createSubscription` / `updateSubscription` / `deleteSubscription` through `useEventStore`.
- **Types:** `Persona`, `PersonaExecution`, `PersonaEventSubscription`, `PersonaTrigger`, `HealthResponse`, `PersonaExecutionStatus` (all `src/lib/types.ts`); `AgentDetailData` (`dashboard-queries.ts`); `EnrichedSubscription` / `SubscriptionFilter` (`subscriptionTypes.ts`); `MemoryAction` (`mock-dashboard-data.ts`).

## Integration points

- **Persona store** is the single source for the card list and for the name lookup in `handleExecute`; `usePersona(id)` / `useSortedPersonaIds()` selectors keep single-card subscribers referentially stable across other-id patches.
- **System store** `health.workers` feeds the "N active / M workers" header line (rendered only when health is present).
- **SWR** (`useAgentDetail`) bridges the card to the detail bundle; `prefetchAgentDetail` seeds its cache on hover. The same store/queries feed the dormant `AgentDetailDrawer`.
- **i18n** namespaces consumed: `t.agentsPage.*` (titles, status, execute labels/toasts), `t.dashboardUi.*` (detail/metrics/drawer), `t.dashboard.workers`, `t.eventsPage.*` + `t.common.*` + `t.executionsPage.all` (subscriptions panel), `t.memoriesPage.seeAll` (memory panel).
- **Shared UI:** `GlowCard`, `GradientText`, `EmptyState`, `StatusBadge`, `StalenessIndicator`; animation variants `fadeUp` / `staggerContainer` from `src/lib/animations.ts`; formatting `relativeTime` / `formatDuration`.
- **Guided tour** targets the grid via `data-tour-diagram="dashboard-agents"`.

## Conventions & gotchas

- **Demo-only.** Nothing here mutates a real fleet in this repo. `executePersona` is fire-and-forget and returns a synthetic `queued` result; the card does **not** refetch or update after a successful run — only the toast, the 700ms ring, and the success pulse react. Don't expect the status pill or metrics to change post-execute.
- **`personaStore` optimistic-update helpers are unused by this feature (and the whole app).** `optimisticUpdatePersona`, `rollbackPersona`, and the `commitOptimisticUpdate` wrapper are fully implemented — per-id mutex (`personaMutationInflight`), snapshot capture, and a **CAS rollback** (`patchStillApplied`) that reverts only when the field-set it wrote is still in place, so a later commit/refetch is never clobbered — but **no component in `src/` calls them**. They're dormant infrastructure for an edit/toggle flow that isn't wired on this page (the agents page's execute path never touches the store; the only live optimistic writes in the dashboard are in the reviews queue, which uses its own store). Treat these as the intended pattern for any future per-persona inline mutation, but know they have no current caller.
- **`AgentDetailDrawer.tsx` is dead/dormant code** — a complete, accessible drawer (portal, focus trap, Esc, focus-restore fallback to `<h1>`) that **nothing imports**. The agents page instead expands `<AgentDetail>` *inline* inside the card. If you build a drawer-style detail view, this is the component to revive; until then, edits to it ship nothing.
- **`fetchPersonas` is stale-while-revalidate.** It no-ops when data is fresh (`PERSONA_STALE_MS = 300_000`, 5 min), reuses an `inflight` promise to dedupe concurrent calls, and only sets `personasLoading` when there's no stale data to show. `personaIds` keeps its array reference when order is unchanged (`arraysEqual`) so list iterators don't re-render on field patches. `reset()` (called on auth transitions) wipes the store and the mutex map.
- **State altitude:** execute/expand/result/toast state lives in `page.tsx` and is threaded into `AgentCardImage` as props/labels — the card is presentational. The card reads nothing from the persona store itself; the page passes the `persona` object down.
- **Animation gating:** `AgentDetail` skeleton/spinner and `PersonaAvatar`'s breathing glow respect reduced motion (`useReducedMotion` short-circuits `animate-pulse`/`animate-spin`). Follow this when adding motion here.
- **i18n / interpolation:** execute toasts use manual `.replace("{name}", name)` on `t.agentsPage.executeQueued` / `executeFailed`; metric titles use `.replace("{n}", …)`. New user-facing strings must be added to `en.ts` and hand-translated across all 14 locales — no English placeholders.
- **Persona visuals are name-keyed.** `personaVisuals.tsx` and `agentAccent.ts` map on exact strings (persona names / hex colors from `mockData.ts`). A persona whose name/color isn't in the table silently falls back (icon medallion / cyan accent). `PersonaGlyph` is deliberately a *component* (not `const Icon = lookup()`) to satisfy `react-hooks/static-components`.
- **Subscriptions vs. personas writes:** the subscriptions panel components live under `components/dashboard/` and are co-documented here because they share `PersonaAvatar` and enrich from the persona store, but every mutation they perform routes through `useEventStore` — they never write to `usePersonaStore`. They render on `/dashboard/events`, not `/dashboard/agents`.
- **Semantic Tailwind tokens** are used throughout (`text-foreground`, `text-muted-dark`, `border-glass`, `bg-surface`); note `AgentCardImage` uses a few inline `style={{}}` colors derived from `persona.color` (portrait tint, status-pill border) because the accent is data-driven, not a fixed token.

## Related docs
- [Dashboard shell & chrome](shell-chrome.md)
- [Manual Review Queue](reviews.md)
- [Feature index](../INDEX.md)
