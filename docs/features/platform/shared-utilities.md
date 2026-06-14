# Shared Types, Utilities & Hooks
> Cross-cutting lib layer: the dashboard domain model, plus validation / formatting / date / URL helpers, scroll-lock, generic hooks, and server-only env/request utilities · **Route:** n/a (lib) · **Status:** Live

## What it does
This is the toolbox every other feature reaches for. It has no UI of its own. It defines the **domain types** the dashboard renders (personas, executions, events, reviews, observability metrics), the **formatters** that turn raw numbers/timestamps into human strings ("3.2s", "$0.0042", "5m ago", "Mar 15, 2026"), the **validators** that guard API-route boundaries (email, anonymous voter ID), and a handful of **generic hooks** (focus trap for modals, polling, abortable effects, URL-seeded state) plus a **counted body-scroll lock** shared by every overlay. Two small **server-only** modules resolve env vars and the client IP / JSON body for API routes. Users never see these directly — they see their effects: consistent formatting, accessible dialogs, locked background scroll behind modals, and rate-limited endpoints.

## How it works
Mostly independent, single-purpose modules; the only shared theme is "centralize a cross-cutting concern so it isn't reinvented per section."

**Domain types** (`src/lib/types.ts`). A hand-maintained mirror of `personas-cloud/packages/shared/src/types.ts` (`types.ts:2`): `Persona`, `PersonaExecution`, `PersonaEvent`, `PersonaTrigger`, `WorkerInfo`, API responses (`HealthResponse`, `StatusResponse`, `ExecutionDetail`), frontend enrichments (`WithPersonaInfo`, `GlobalExecution`, `ManualReviewItem`), status literal unions (`PersonaExecutionStatus`, `EventStatus`, `ReviewSeverity`/`ReviewStatus`, `BadgeStatus`), escalation policy types, and observability/usage shapes (`ObservabilityMetrics`, `DailyMetric`, `PersonaSpend`, `ToolUsage*`). `ManualReviewItem.parseError` is a fail-loud flag: a malformed event payload is escalated to "critical" rather than silently defaulting to "info" and widening the SLA (`types.ts:161-165`).

**Formatters.** `format.ts` — `formatDuration(ms)` (ms→`ms`/`s`/`m`/`h`, `null`→"-"), `formatCost(usd)` (`$0.0000`, 4dp), `nonBlank` (whitespace→`undefined` so `??` chains skip empty OAuth `full_name`s), and `relativeTime(iso)` ("just now"/"Xm ago"/.../"Xd ago"). `format-date.ts` — `formatDateShort`/`formatDateLong` for content pages. **Both date paths force UTC** (parse as `iso + "T00:00:00Z"`, format with `timeZone: "UTC"`) so SSR (always UTC) and the client produce identical strings — no hydration mismatch and no west-of-UTC user seeing the prior day (`format-date.ts:5-9`).

**Validation** (`src/lib/validation.ts`). `isValidEmail` — a deliberately simple, ReDoS-safe regex blocking special chars and requiring a 2+ char alphabetic TLD, capped at 254 chars (`validation.ts:8-13`). `isValidVoterId` — type-guard for a `[A-Za-z0-9_-]{16,64}` client-minted ID. Its docstring is explicit that it only rejects *obvious garbage*, not vote-stuffing (`validation.ts:15-35`).

**URL safety** (`src/lib/url.ts`). `sanitizeExternalUrl` returns the value only if it parses as an absolute `http(s)` URL, else `"#"` — a trust boundary blocking `javascript:`/`data:`/`vbscript:` schemes before they reach an `href`.

**Highlight** (`src/lib/highlight-match.tsx`). `highlightMatch(text, query, matchType, color)` returns `ReactNode[]` with matched spans wrapped in `<mark>`. Exact matches use a substring split; fuzzy matches run a bounded Levenshtein (≤2 edits, early-exits when length delta >2) per word and merge adjacent hit segments (`highlight-match.tsx:19-63`). Only `exact-title`/`fuzzy-title` highlight; other match types pass through.

**Hooks.** `useFocusTrap` — on `active`, records `document.activeElement`, focuses the primary action (or first focusable), cycles Tab/Shift+Tab inside the panel, and restores focus on close (`useFocusTrap.ts:47-92`). `usePolling(callback, intervalMs, enabled)` — fires immediately then **schedules the next tick only after the previous one resolves** (no overlap), pauses when the tab is hidden via `visibilitychange`, clamps sub-16ms intervals, and warns on non-finite intervals in dev (`usePolling.ts:40-81`). `useAbortableEffect` — `useEffect` wrapper supplying an `AbortSignal`, optional `timeoutMs` auto-abort, tearing down on unmount/re-run. `useSearchParamState`/`useParsedSearchParamState` — **read-once** `useState` seeded from a search param; write-back is intentionally the caller's job (`useSearchParamState.ts:6-11`).

**Scroll lock** (`src/lib/bodyScrollLock.ts`). A **counted** lock: every overlay calls `lockBodyScroll`, body stays `overflow:hidden` until the matching number of `unlockBodyScroll` calls. The original `overflow` is captured on the first lock and restored on the last. State lives on `globalThis` under a `Symbol.for` key so HMR/Fast Refresh re-evaluating the module doesn't reset the count to 0 while the body is still locked (`bodyScrollLock.ts:1-30`).

**Server utilities.** `src/lib/server/env.ts` — `getOptionalEnv`/`getRequiredEnv`/`hasSupabaseEnv`, all `server-only`. `src/lib/server/request.ts` — `getClientIp` (trust-ordered IP resolution), `parseJsonBody<T>` (optional `maxBytes` content-length check → 413, JSON-parse guard → 400), `jsonError`.

**Constants & timings.** `constants.ts` holds the landing-section registry (`LANDING_SECTIONS` + `NAVBAR_SECTIONS`/`SCROLL_MAP_SECTIONS` derived views), localStorage keys, `DISCORD_INVITE_URL`, and a back-compat re-export of `CHART_PALETTE as CHART_COLORS` from `@/lib/chart-theme` (`constants.ts:41`). `timings.ts` holds `CAROUSEL_INTERVAL_MS` (default/fast/slow) — ms-scale UX cadences, distinct from framer-motion second-scale durations in `@/lib/animations`.

## Key files
| File | Role |
| --- | --- |
| `src/lib/types.ts` | Domain model — personas/executions/events/reviews + status unions, API & observability shapes (mirrors cloud `shared`) |
| `src/lib/format.ts` | `formatDuration` / `formatCost` / `nonBlank` / `relativeTime` |
| `src/lib/format-date.ts` | `formatDateShort` / `formatDateLong` — UTC-pinned content-page dates |
| `src/lib/validation.ts` | `isValidEmail` (ReDoS-safe) / `isValidVoterId` (type-guard) |
| `src/lib/url.ts` | `sanitizeExternalUrl` — http(s)-only `href` trust boundary |
| `src/lib/highlight-match.tsx` | `highlightMatch` — exact + bounded-Levenshtein fuzzy search highlighting |
| `src/lib/bodyScrollLock.ts` | Counted, HMR-safe `lockBodyScroll` / `unlockBodyScroll` |
| `src/lib/constants.ts` | Landing-section registry, localStorage keys, Discord URL, `CHART_COLORS` re-export |
| `src/lib/timings.ts` | `CAROUSEL_INTERVAL_MS` UX cadence constants |
| `src/hooks/useFocusTrap.ts` | Modal focus management (ConfirmDialog, BatchReviewModal) |
| `src/hooks/usePolling.ts` | Non-overlapping, visibility-aware generic poller |
| `src/hooks/useAbortableEffect.ts` | `useEffect` + `AbortSignal` (+ optional timeout) |
| `src/hooks/useSearchParamState.ts` | Read-once URL-seeded `useState` (+ parsed variant) |
| `src/lib/server/env.ts` | `server-only` env accessors + `hasSupabaseEnv` |
| `src/lib/server/request.ts` | `getClientIp` / `parseJsonBody` / `jsonError` for API routes |

## Data & state
- **Source:** none of its own — pure helpers over caller-supplied data. **Stores:** module-level / `globalThis` state only — the scroll-lock count (`bodyScrollLock.ts:21-30`) and a once-per-session `skewBreadcrumbReported` flag in `format.ts:29`; no Zustand here. **API routes:** `env.ts`/`request.ts` are consumed by `src/app/api/*` (votes, feature-boosts/comments/requests, waitlist) for IP keys, body parsing, env gating; `validation.ts` guards those same routes and client forms. **Types:** `src/lib/types.ts` is the shared domain model imported across `src/components/dashboard/*`, `src/stores/*`, and `src/hooks/useExecutionPolling.ts`.

## Integration points
- **`usePolling`** is wrapped by `src/hooks/useExecutionPolling.ts` (default 1000ms, auto-stops on terminal status) and used directly by the dashboard executions page and `reviewStore`.
- **`useFocusTrap`** is consumed by `src/components/ConfirmDialog.tsx` and `src/components/dashboard/BatchReviewModal.tsx`.
- **`useSearchParamState`** seeds filter/tab state in `src/app/dashboard/executions/page.tsx`, `src/app/connections/page.tsx`, and the feature-voting section.
- **`lockBodyScroll`/`unlockBodyScroll`** is shared by `navbar/useMobileMenu.ts`, `navbar/DownloadModal.tsx`, `connector-modal`, `MobilePageTOC`, and `MobileTopicTOC` — the counted design is what lets these nest safely.
- **`getClientIp`** feeds the voting/waitlist rate limiters (see [Server-Side Vote Persistence](../community/vote-persistence.md)); **`hasSupabaseEnv`** gates the Supabase-vs-file-store branch.
- **`CHART_COLORS`** is re-exported from `@/lib/chart-theme`; **`relativeTime`** lazily imports `@sentry/nextjs` for its skew breadcrumb.

## Conventions & gotchas
- **Date purity / hydration (handled, don't regress).** `format-date.ts` and the `relativeTime` skew-fallback both pin `timeZone: "UTC"` and parse as UTC midnight specifically to keep SSR and client output identical (`format-date.ts:5-31`). If you add a date formatter, follow the same UTC-pinning or you'll reintroduce hydration mismatches and off-by-one-day dates west of UTC.
- **`relativeTime` is impure by design and is NOT render-safe under React 19 rules.** It calls `Date.now()` (`format.ts:34`), so per CLAUDE.md rule 4 it must **not** be called in render, `useMemo`, or a `useEffect` body that runs synchronously — cache its result in a lazy `useState(() => relativeTime(iso))` initializer or compute it in an event/interval. Same applies to any consumer of `formatDuration`/`relativeTime` that wants a "live" value. Note also the module-level `skewBreadcrumbReported` flag (`format.ts:29`) makes the breadcrumb fire **once per process**, so SSR may consume the single firing before the client ever does.
- **Scroll-lock leak risk — pair every lock with an unlock.** The lock is reference-counted, so a component that `lockBodyScroll()`s on open but fails to `unlockBodyScroll()` on **every** unmount path (early return, error, route change) leaves `lockCount > 0` and the page scroll-frozen until a hard reload. Always unlock in the effect cleanup, not a click handler. The `globalThis` symbol guards HMR but **not** a real leaked counter. Conversely, an unmatched extra `unlock` is safe — it's a no-op when `lockCount === 0` (`bodyScrollLock.ts:45`).
- **`useSearchParamState` does not write back.** It only seeds initial state from the URL once; changing the state does **not** update the query string. Write-back is deliberately left to one caller-owned effect that syncs all params together — per-key write-back would race (`useSearchParamState.ts:6-11`). `useSearchParams()` also forces the consuming component under a Suspense boundary in the App Router.
- **`usePolling` swallows callback errors** (`usePolling.ts:19-25`) — the callback must surface its own errors; a thrown rejection just schedules the next tick silently. It also clamps `<16ms` and disables on non-finite intervals (dev-warns only), so a seconds-vs-ms mixup degrades quietly rather than busy-looping.
- **`getClientIp` is only as trustworthy as the proxy.** `x-forwarded-for`/`x-real-ip` are honored **only** when `TRUST_PROXY=true`; otherwise it returns `"unknown"` and all such clients share one rate-limit bucket. Never persist the IP — it's for rate-limit keys/abuse attribution only.
- **`server-only` modules.** `env.ts` and `request.ts` import `"server-only"`; importing them into a client bundle is a hard build failure. Keep env reads and IP/body parsing server-side.
- **`sanitizeExternalUrl` at every external-URL boundary.** Use it even when today's URL is a hardcoded constant — it's the schema guard for any value that could later come from a CMS/data/user input.
- **i18n:** these helpers emit **non-translated** literals (`"-"`, `"just now"`, `"$"`, `"ms"/"s"/"m"/"h"`, `en-US` month names) and section labels in `constants.ts` are English. They are intentionally locale-agnostic units/symbols today; do not hardcode *new* user-facing prose here — route copy through `src/i18n/en.ts` instead.

## Related docs
- [Animation & Motion System](animation-motion.md)
- [Feature index](../INDEX.md)
