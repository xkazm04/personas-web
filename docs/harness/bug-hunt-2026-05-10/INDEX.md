# Bug Hunter Scan — personas-web, 2026-05-10

> Latent-failure / race-condition / silent-failure audit across 25 contexts of the personas-web Next.js 16 project (marketing site + demo dashboard + API routes + cross-cutting platform code).
> 25 parallel general-purpose subagent runs executed in **4 waves** of ≤8 (Wave 1: 8, Wave 2: 8, Wave 3: 8, Wave 4: 1).

---

## Totals

| | Critical | High | Medium | Low | **Total** |
|---|---:|---:|---:|---:|---:|
| Across 25 contexts | 9 | 75 | 68 | 26 | **178** |
| Share | 5.1% | 42.1% | 38.2% | 14.6% | 100% |

**Verification**: header-sum = 178 across 25 files; bullet-count (`^- **Severity**:`) = 178 across 25 files. Numbers match.

**Health baseline (pre-scan)**: `tsc --noEmit` = 0 errors. Test runner: Playwright e2e only (no unit tests). ESLint baseline deferred to wave verification.

---

## Per-context breakdown

Sorted by Critical desc, then total desc.

| # | Context | C | H | M | L | Total | Report |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Reviews, Knowledge & Settings | **2** | 3 | 1 | 1 | 7 | [reviews-knowledge-settings.md](reviews-knowledge-settings.md) |
| 2 | Authentication & User Session | **1** | 3 | 3 | 1 | 8 | [authentication-user-session.md](authentication-user-session.md) |
| 3 | Feature Voting & Requests | **1** | 4 | 2 | 1 | 8 | [feature-voting-requests.md](feature-voting-requests.md) |
| 4 | Server Infrastructure & Telemetry | **1** | 4 | 2 | 1 | 8 | [server-infrastructure-telemetry.md](server-infrastructure-telemetry.md) |
| 5 | Agents (Personas) Management | **1** | 4 | 2 | 0 | 7 | [agents-personas-management.md](agents-personas-management.md) |
| 6 | Event Bus & Observability | **1** | 3 | 2 | 1 | 7 | [event-bus-observability.md](event-bus-observability.md) |
| 7 | Execution History & Streaming | **1** | 3 | 2 | 1 | 7 | [execution-history-streaming.md](execution-history-streaming.md) |
| 8 | Shared UI Primitives & Animations | **1** | 3 | 2 | 1 | 7 | [shared-ui-primitives-animations.md](shared-ui-primitives-animations.md) |
| 9 | Internationalization (14 locales) | 0 | 4 | 3 | 1 | 8 | [internationalization.md](internationalization.md) |
| 10 | Waitlist & Download CTA | 0 | 4 | 2 | 1 | 7 | [waitlist-download-cta.md](waitlist-download-cta.md) |
| 11 | Homepage & Hero | 0 | 3 | 3 | 1 | 7 | [homepage-hero.md](homepage-hero.md) |
| 12 | Event Bus & Playground Showcase | 0 | 3 | 3 | 1 | 7 | [event-bus-playground-showcase.md](event-bus-playground-showcase.md) |
| 13 | Platform Architecture Demos | 0 | 3 | 3 | 1 | 7 | [platform-architecture-demos.md](platform-architecture-demos.md) |
| 14 | Agent Interaction Demos | 0 | 3 | 3 | 1 | 7 | [agent-interaction-demos.md](agent-interaction-demos.md) |
| 15 | User Guide | 0 | 3 | 3 | 1 | 7 | [user-guide.md](user-guide.md) |
| 16 | Theme System | 0 | 3 | 3 | 1 | 7 | [theme-system.md](theme-system.md) |
| 17 | Public Roadmap | 0 | 3 | 3 | 1 | 7 | [public-roadmap.md](public-roadmap.md) |
| 18 | Playground & Flow Composer | 0 | 3 | 3 | 1 | 7 | [playground-flow-composer.md](playground-flow-composer.md) |
| 19 | Templates Gallery | 0 | 3 | 3 | 1 | 7 | [templates-gallery.md](templates-gallery.md) |
| 20 | Connectors Catalog | 0 | 3 | 3 | 1 | 7 | [connectors-catalog.md](connectors-catalog.md) |
| 21 | Layout, Navigation & Page Shell | 0 | 3 | 3 | 1 | 7 | [layout-navigation-page-shell.md](layout-navigation-page-shell.md) |
| 22 | Pricing & Feature Comparison | 0 | 2 | 4 | 1 | 7 | [pricing-feature-comparison.md](pricing-feature-comparison.md) |
| 23 | Blog | 0 | 2 | 3 | 2 | 7 | [blog.md](blog.md) |
| 24 | Changelog, Security & Static | 0 | 1 | 4 | 2 | 7 | [changelog-security-static.md](changelog-security-static.md) |
| 25 | Use Cases & Vision | 0 | 2 | 3 | 1 | 6 | [use-cases-vision.md](use-cases-vision.md) |

---

## All 9 critical findings — one-line summary

Sorted into themes to match the wave plan below.

### A. Security / Auth bypass / Voting integrity (3 criticals)
1. **Authentication & User Session — `signInAsDemo` is reachable in production and bypasses real auth.** When `DEVELOPMENT === false`, `SignInPrompt` still renders a "Try Demo" button that writes `isAuthenticated: true` + `mock-token-dev` directly into the auth store; `AuthGuard` only checks `isAuthenticated`, so the entire `/dashboard` shell mounts without a real session. `src/components/dashboard/SignInPrompt.tsx:129-137`, `src/stores/authStore.ts:177-180`, `src/lib/mockAuth.ts:25-27`.
2. **Feature Voting & Requests — Vote-stuffing via attacker-controlled `voterId` and trivial X-Forwarded-For spoofing.** Identity is fully client-asserted (length≥8 only) and rate limiting reads the first XFF hop unconditionally; vote counts are arbitrarily injectable. `src/app/api/votes/route.ts:91-172`, `src/app/api/votes/rate-limit.ts`.
3. **Server Infrastructure & Telemetry — Sentry PII scrubber misses `event.contexts`, `event.extra`, `event.tags`, `event.user.id`.** Persona/execution UUIDs passed via `Sentry.captureException(err, { contexts })` (e.g. `src/lib/api.ts:261`) leak un-redacted, defeating the whole PII module. `src/lib/sentry-pii.ts:65-105`.

### B. State corruption / silent data loss in dashboard ops (3 criticals)
4. **Reviews — Undo-window unmount silently drops bulk approve/reject — server never called.** `useReviewBulkActions` cleanup `clearTimeout`s the pending PATCH without flushing, so 30+ audit decisions vanish on a route change inside the 5s undo window. `src/hooks/useReviewBulkActions.ts:175-203, 250-255`.
5. **Reviews — `pollPaused` flag is dead code; polling clobbers optimistic bulk state mid-undo.** State + setter + JSDoc are scaffolded but never called, so `usePolling(fetchReviews, 15_000)` overwrites optimistic state during the undo window. `src/stores/reviewStore.ts:262-271`, `src/hooks/useReviewBulkActions.ts:175-203`, `src/app/dashboard/reviews/ReviewsSplitPane.tsx:413`.
6. **Agents (Personas) — Concurrent optimistic updates lose state — last rollback wins (stale resurrection).** Overlapping snapshots in `commitOptimisticUpdate`; rollback merges into a state that is neither old nor new — silent UI/server divergence with no per-id mutex and no write-through on success. `src/stores/personaStore.ts:114-149`.

### C. Streaming / retry / event bus reliability (2 criticals)
7. **Event Bus & Observability — `replayEvent` only counts SUCCESSFUL replays toward the retry lockout.** `MAX_REPLAY_RETRIES=3` never engages for actually-broken handlers; "Retry All" can pump poison messages at the bus indefinitely. `src/stores/eventStore.ts:125-161`.
8. **Execution History & Streaming — SSE proxy swallows fetch errors and returns invalid Response statuses.** No try/catch around `fetch`; blindly forwards `upstream.status` to `new Response`, causing 500s with no body, infinite EventSource reconnect storms, and a `RangeError` crash on edge upstream statuses (1xx/0). `src/app/api/executions/[id]/stream/route.ts:30-39`.

### D. Hook lifecycle / observer leak (1 critical)
9. **Shared UI Primitives — `useCanvasCompositor` cleanup re-creates the IntersectionObserver it just nulled.** Cleanup calls `getIntersectionObserver()` which lazily re-creates a brand-new observer that is then leaked when the next cleanup nulls the reference without disconnecting it; observer leaks across HMR/strict-mode/route transitions. `src/hooks/useCanvasCompositor.ts:205-229`.

---

## Triage themes (clustered)

| Theme | Approx count | Why this is a wave, not just individual fixes |
|---|---:|---|
| A. Security / Auth bypass / Rate-limit / Voting integrity | ~12 | Auth bypass + vote stuffing + XFF spoofing + admin-token reuse + PII leak share a "client-trusted-server-input" failure model. Fixing them in one mental model keeps the trust boundary consistent. |
| B. Optimistic-update state corruption + bulk-action data loss | ~10 | All in dashboard stores (`personaStore`, `reviewStore`, `eventStore`); same concurrency primitives missing across the lot (per-id mutex, success write-through, unmount flush). Fix once, apply to three stores. |
| C. SSE / streaming / retry lockout / poll-vs-stream race | ~10 | Both SSE proxies (`/api/events/stream`, `/api/executions/[id]/stream`) lack heartbeat, error-frame, and reconnect-cap; both stream consumers race with their polling fallbacks. |
| D. Animation lifecycle: visibility-pause, observer leak, timer cleanup | ~16 | Pervasive across showcase/demo sections + every cycle/timer hook. Single shared visibility hook + audited cleanup pattern would close most of these. |
| E. SSR / hydration / theme FOUC / i18n flash + parity | ~10 | `<html lang="en">` hardcoded, ThemeInit post-hydration FOUC, locale switch flash, RTL `dir` never set, persisted-locale one-shot detection. Same root: client-only state computed after first paint. |
| F. Data integrity / order / filter / SEO drift | ~14 | Blog/changelog/roadmap/templates/pricing/comparison-table/changelog all assume "data is well-formed" — sort order, slug uniqueness, future-dated entries, JSON-LD inconsistencies, hardcoded literals drifting from registries. |
| G. A11y / focus / scroll lock / modal lifecycle | ~10 | Mobile menu yanks focus on route change, scroll-lock leaks across overlays, AnimatePresence keys broken, modal exit animation desynced from scroll-unlock, missing skip-links. Same primitives, same fixes. |
| H. Edge cases / silent error swallowing | ~12 | Misc: catch-and-ignore patterns, empty array branches, default fallbacks that mask real failures, missing telemetry on swallowed errors. Often paired with one of the themes above. |

(Counts are approximate — many findings legitimately span two themes.)

---

## Suggested next-phase split

A 7-wave plan organized by theme. Each wave should be sessionable (5-7 fixes) and share a mental model so fixes compound.

| Wave | Theme | Target | Headline criticals |
|---:|---|---:|---|
| 1 | **A. Security / Auth / Vote integrity** | 5-6 fixes | Demo signin in prod, vote stuffing + XFF spoof, Sentry PII leak |
| 2 | **B. State corruption (personas/reviews/event-bus stores)** | 5-7 fixes | Reviews undo-on-unmount, pollPaused dead code, persona optimistic snapshot collision, retry-counts-on-success bug |
| 3 | **C. SSE + streaming reliability** | 5-6 fixes | Execution SSE crash storm, no heartbeats, reconnect storms, polling-vs-stream replace bug |
| 4 | **D. Animation lifecycle / observer cleanup / visibility pause** | 6-7 fixes | useCanvasCompositor IO leak, terminal-seq timer leak, simulation drift on tab background, framer infinite tweens, useAutoCycle gating |
| 5 | **E. SSR / hydration / theme + i18n flash** | 4-5 fixes | Theme post-hydration FOUC, `<html lang>` hardcoded, RTL `dir` missing, i18n English flash on switch, locale persistence races |
| 6 | **F. Data integrity / SEO / ordering** | 5-7 fixes | Blog post order, changelog drift, malformed dates, slug uniqueness, roadmap stuck-loader, templates SEO/OG missing |
| 7 | **G. A11y / focus / scroll-lock / modal lifecycle** | 5-6 fixes | Mobile menu focus yank, body-scroll-lock leaks across HMR, AnimatePresence broken keys, dashboard skip-link missing, error boundary retry-loop cap |

**Recommended starting point**: Wave A (Security). It contains 3 criticals and the auth bypass is the highest-impact production-only finding. If the `Try Demo` prod button is shipping, that's a same-day fix.

---

## How this scan was run

- **Scanner**: `bug-hunter` agent prompt (`vibeman/src/lib/prompts/registry/agents/bug-hunter.ts`) — elite systems-failure analyst lens, focused on latent failures / races / edge cases / silent failures.
- **Date**: 2026-05-10
- **Project**: personas-web (Next.js 16 + React 19 + Tailwind 4 + Zustand 5 + Supabase + Sentry).
- **Scope**: full-coverage scan of all 23 production contexts in the project (the 2 `_test`/`_test2` probe contexts were excluded). All 25 audit reports above represent ALL non-test contexts mapped in the Vibeman context registry.
- **Method**: 25 parallel `general-purpose` subagent runs, batched in 4 waves of ≤8 parallel agents per wave (8 + 8 + 8 + 1). Each subagent received the bug-hunter role prompt + context name/description + the context's `filePaths` array, with a findings target of 4-8.
- **Files read**: ≈400 file reads across 25 subagents (averaging 16 files per subagent). Heavy contexts (User Guide 39 files, Event Bus & Observability 31, Shared UI 33, Layout 28) were sampled rather than read exhaustively.
- **Verification**: findings counts cross-checked two ways — `> Total:` header sum (178) and `^- **Severity**:` bullet count (178). Numbers match.
- **Output discipline**: orchestrator (this skill) only read terse subagent reply summaries during dispatch — never the per-context reports — to keep orchestrator context manageable across 25 scans.

---

## Notes for fix waves

- `tsc --noEmit` baseline is **0 errors**; any fix wave must end at 0 errors.
- Test runner is **Playwright e2e only** (no unit tests). Wave verification is type-check + targeted hand-tests of changed paths.
- ESLint baseline was deferred — capture during wave verification on changed files only.
- Each fix should be its own atomic commit with a finding reference (`Refs: docs/harness/bug-hunt-2026-05-10/<slug>.md finding #N`).
- After each wave, write `FIXES-WAVE-<N>.md` summarizing fixes + patterns extracted, alongside the wave's commits.
