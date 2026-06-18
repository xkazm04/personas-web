# Blended Bug-Hunter + Test-Mastery Scan — personas-web, 2026-06-19

> Blended runtime-failure + test-coverage audit across **33 logic-bearing contexts** of the personas-web
> Next.js 16 / React 19 / TS 6 marketing site + demo dashboard + API routes.
> Each context scanned by ONE subagent applying BOTH lenses, returning the 5 highest-value items overall.
> 33 subagent runs, batched in 5 waves of ≤8. Scope per user: logic-bearing contexts only
> (skipped pure-i18n/locale/translation, theme tokens, static marketing/legal/blog, animation-motion, SEO metadata).

---

## Totals

| | Critical | High | Medium | Low | **Total** |
|---|---:|---:|---:|---:|---:|
| Across 33 contexts | 3 | 73 | 81 | 9 | **166** |
| Share | 1.8% | 44.0% | 48.8% | 5.4% | 100% |

**Verification (two ways)**: header-sum (`^> Total:`) = **166** across 33 files; severity-bullet count (`^- **Severity**:`) = **166**. Numbers match.
**Lens split**: bug-hunter **113**, test-mastery **53**.
**Health baseline (pre-scan)**: `tsc --noEmit` = **0 errors**. Test runner = **Playwright e2e only — no unit runner (no vitest/jest)**. (This absence is itself the dominant test-mastery theme below.)
**Triage adjustments**: 1 of the 3 raw Criticals is a **verified false positive** (see Critical #3); 2 are genuine. One pair of findings is a **cross-context duplicate** (successRate, found by 2 agents).

---

## Per-context breakdown

Sorted by Critical desc, then total desc.

| # | Context | C | H | M | L | Total | Report |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Orchestrator API Client & Mock Data | 1 | 2 | 2 |  | 5 | [orchestrator-api-client-mock-data.md](orchestrator-api-client-mock-data.md) |
| 2 | Server-Side Vote Persistence | 1 | 2 | 1 | 1 | 5 | [server-side-vote-persistence.md](server-side-vote-persistence.md) |
| 3 | Layout, Navigation & Page Shell | 1 | 1 | 3 |  | 5 | [layout-navigation-page-shell.md](layout-navigation-page-shell.md) |
| 4 | Supabase Client |  | 2 | 3 | 1 | 6 | [supabase-client.md](supabase-client.md) |
| 5 | Dashboard Shell, Chrome & Realtime |  | 4 | 1 |  | 5 | [dashboard-shell-chrome-realtime.md](dashboard-shell-chrome-realtime.md) |
| 6 | Agent Execution Timeline Race |  | 3 | 2 |  | 5 | [agent-execution-timeline-race.md](agent-execution-timeline-race.md) |
| 7 | Build Config & E2E Tests |  | 3 | 2 |  | 5 | [build-config-e2e-tests.md](build-config-e2e-tests.md) |
| 8 | Error Monitoring & Analytics |  | 3 | 2 |  | 5 | [error-monitoring-analytics.md](error-monitoring-analytics.md) |
| 9 | Event Bus & Stream Monitoring |  | 3 | 2 |  | 5 | [event-bus-stream-monitoring.md](event-bus-stream-monitoring.md) |
| 10 | Execution History & Streaming |  | 3 | 2 |  | 5 | [execution-history-streaming.md](execution-history-streaming.md) |
| 11 | Manual Review Queue |  | 3 | 1 | 1 | 5 | [manual-review-queue.md](manual-review-queue.md) |
| 12 | Messages & Settings |  | 3 | 2 |  | 5 | [messages-settings.md](messages-settings.md) |
| 13 | Observability Charts & SLA |  | 3 | 2 |  | 5 | [observability-charts-sla.md](observability-charts-sla.md) |
| 14 | Shared Types, Utilities & Hooks |  | 3 | 2 |  | 5 | [shared-types-utilities-hooks.md](shared-types-utilities-hooks.md) |
| 15 | Agent Playground & Multi-Agent Chat |  | 2 | 2 | 1 | 5 | [agent-playground-multi-agent-chat.md](agent-playground-multi-agent-chat.md) |
| 16 | Agents (Personas) Management |  | 2 | 3 |  | 5 | [agents-personas-management.md](agents-personas-management.md) |
| 17 | Authentication & User Session |  | 2 | 3 |  | 5 | [authentication-user-session.md](authentication-user-session.md) |
| 18 | Connector Detail Modal |  | 2 | 2 | 1 | 5 | [connector-detail-modal.md](connector-detail-modal.md) |
| 19 | Connectors Catalog |  | 2 | 2 | 1 | 5 | [connectors-catalog.md](connectors-catalog.md) |
| 20 | Dashboard Home Overview |  | 2 | 3 |  | 5 | [dashboard-home-overview.md](dashboard-home-overview.md) |
| 21 | Feature Voting & Comments |  | 2 | 3 |  | 5 | [feature-voting-comments.md](feature-voting-comments.md) |
| 22 | Guide Data, Content & Search Index |  | 2 | 3 |  | 5 | [guide-data-content-search-index.md](guide-data-content-search-index.md) |
| 23 | Guided Product Tour |  | 2 | 3 |  | 5 | [guided-product-tour.md](guided-product-tour.md) |
| 24 | Knowledge Base |  | 2 | 3 |  | 5 | [knowledge-base.md](knowledge-base.md) |
| 25 | Leaderboard & Rankings |  | 2 | 3 |  | 5 | [leaderboard-rankings.md](leaderboard-rankings.md) |
| 26 | Orchestration & Platform Visualizers |  | 2 | 3 |  | 5 | [orchestration-platform-visualizers.md](orchestration-platform-visualizers.md) |
| 27 | Public Roadmap |  | 2 | 3 |  | 5 | [public-roadmap.md](public-roadmap.md) |
| 28 | Split & Pipeline Playground |  | 2 | 2 | 1 | 5 | [split-pipeline-playground.md](split-pipeline-playground.md) |
| 29 | Templates Gallery & Detail |  | 2 | 3 |  | 5 | [templates-gallery-detail.md](templates-gallery-detail.md) |
| 30 | Visual Flow Composer & Playground Page |  | 2 | 3 |  | 5 | [visual-flow-composer-playground-page.md](visual-flow-composer-playground-page.md) |
| 31 | Section Preview & Demo Harness |  | 1 | 2 | 2 | 5 | [section-preview-demo-harness.md](section-preview-demo-harness.md) |
| 32 | Shared UI Primitives & Illustrations |  | 1 | 4 |  | 5 | [shared-ui-primitives-illustrations.md](shared-ui-primitives-illustrations.md) |
| 33 | Waitlist & App Download |  | 1 | 4 |  | 5 | [waitlist-app-download.md](waitlist-app-download.md) |

---

## The 3 critical findings (one verified false-positive)

1. **Server-Side Vote Persistence — corrupt/unreadable store silently wipes ALL prior data on next write.** `readJsonFile` wraps `readFile`+`JSON.parse` in a bare `catch {}` that returns `{entries:[]}` for *every* failure, so a truncated/corrupt/transient-EACCES `votes.json` is indistinguishable from "not created yet". The next vote/boost/comment RMW writes the empty fallback over the real file and returns `{action:"added"}` (success theater). Irrecoverable loss of all community votes/boosts/comments on the no-DB path. `src/lib/server/json-file-store.ts:13-43`, `src/app/api/votes/route.ts:180-205`. **GENUINE.**
2. **Orchestrator / Observability — `supabaseApi` returns `successRate`/`successTrend` as fractions (0–1) while the mock and UI treat them as percentages (0–100).** In real cloud-sync mode an 89.4% fleet renders as "0.9%" on the success ring + metric tiles; the demo (mock) path looks perfect, so the bug is invisible in the only mode QA exercises. `src/lib/supabaseApi.ts:524-532` vs `src/lib/mockData.ts:578-586`, consumed `PerformanceMetricsGrid.tsx:28`. **GENUINE — independently found by two agents** (rated Critical by the orchestrator scan, High by the observability scan; deduped here to one Critical).
3. ~~**Layout/Analytics — `Sentry.metrics` is non-existent → crashes on every event once consent="all".**~~ **VERIFIED FALSE POSITIVE.** `@sentry/nextjs` v10.52.0 *does* export `metrics` (runtime check: `metrics.count` is a function), and `tsc` passes at 0 with `Sentry.metrics.count(...)` called in client code — the type exists in the isomorphic surface, so it does not throw. The scanning agent grepped `@sentry/browser`'s `.d.ts` and missed the re-export. **Demoted to Low**: `metrics.count` may be a deprecated no-op in v10, so analytics events could silently not record — worth confirming, but it is not a crash. `src/lib/analytics.ts:18,32`.

**Net: 2 genuine criticals.**

---

## Triage themes (the fix-wave map)

| Theme | Approx count | Why it's a wave, not isolated fixes |
|---|---:|---|
| **A. No unit runner → untested pure logic** (test-mastery) | ~30 H | Every context flagged "zero unit harness." Validators, scoring, date/aggregation, PII scrubber, vote integrity, search ranking — all unguarded. One infra move (add vitest) + targeted batches closes the whole theme. |
| **B. Success-theater & lying UI** | ~10 (H/M) | Controls/indicators that report state they don't enforce: timeline "Pause" doesn't pause; connection dot blind to transport; SLA breaches fabricate `startedAt=now`/`duration=0`; settings toggles don't persist; "Retry All" discards result; e2e asserts text the page never renders. |
| **C. State corruption / optimistic divergence** | ~7 H | boost re-boost inflates; persona CAS referential-equality; knowledge reject==accept; manual-review single-key bypasses undo guard + counter double-count; messages pagination `page≠clampedPage`. |
| **D. mock/real contract divergence (data correctness)** | ~5 (1C/H) | successRate fraction (critical); mock `getExecution` ignores offset (infinite "running"); `mapStatus` blind-cast; cohort-relative radar forces 0; demo output viewer shared global offset. |
| **E. Security / trust-boundary** | ~6 H | `getClientIp` trusts `x-vercel-forwarded-for` before `TRUST_PROXY` (spoofable off-Vercel); `AuthGuard` authorizes on `isAuthenticated` alone; PII scrubber leaks past depth 6; download allowlist + stats-purge auth untested; `decodeFlow` skips wire validation. |
| **F. Lifecycle / resource leaks** | ~7 (H/M) | AudioContext never closed (tour); terminal sequence runaway timers off-screen; particle backlog off-screen; dashboard error boundary never resets on route; stale "connected" after tab switch; pipeline-timeline no bg-tab abort; `useSearchParamState` read-once. |
| **G. Time/timezone & numeric edge cases** | ~5 (H/M) | heatmap DST desync; `areaOverall`/`progressPercent` empty-set NaN; `format-date` emits literal "Invalid Date"; fixed-window rate-limit 2× burst. |
| **H. Durability / data-loss (server)** | 3 (1C/H) | vote corrupt-wipe (critical); orphaned `.tmp` files on failed rename; settings non-persistence. |
| **I. Consent / compliance** | ~3 (H/M) | cookie consent no cross-tab sync + no revoke; `error.tsx` sends unscrubbed errors while `global-error.tsx` scrubs. |
| **J. Dead code / context drift** | ~6 | `SetupCTA`/`CopyButton` dead; persona optimistic engine zero callers; SSE route dead (modal offset-polls); `dashboardFilterStore` wired to nothing; missing files (`/todo`, `NavbarMobileMenu`, `AgentDetailDrawer` only in worktrees). |

---

## Suggested fix-wave plan

Sized to ~5–7 fixes per wave, single mental model each, highest value first.

- **Wave 1 — Data correctness & durability (criticals + theme D/H).** Vote corrupt-wipe guard; successRate fraction→percent + a contract assert; mock `getExecution` offset; `mapStatus`/`mapEvent` safe-cast; orphaned `.tmp` cleanup; SLA fabricated-breach-meta. *Highest value, mostly contained server/lib edits.*
- **Wave 2 — Success-theater & state corruption (theme B/C).** timeline Pause actually pauses; knowledge reject≠accept; manual-review single-key honors undo guard + counter fix; boost re-boost reconcile; messages pagination clamp; settings persistence; connection-status truth.
- **Wave 3 — Security & compliance (theme E/I).** `getClientIp` trust-proxy ordering; PII scrubber depth; `decodeFlow` wire validation; cookie-consent revoke + cross-tab; `error.tsx` scrub parity. *(AuthGuard hardening flagged for approval — see gate.)*
- **Wave 4 — Lifecycle / leaks & time math (theme F/G).** AudioContext close; terminal/particle off-screen suspension; dashboard error-boundary reset-on-nav; pipeline-timeline bg-tab abort; heatmap DST; NaN guards; `format-date` guard.
- **Wave 5 — Test infrastructure (theme A, the big one).** Add **vitest** + `test:unit` + a calibrated new-code coverage gate; seed highest-ROI batches: `validation`, `format-date`/`url`/`format`, `leaderboardSort`/SLA math, `guide-search`, vote/boost/comment validators, PII scrubber, `event-bus-demo`. Also fix the broken/dead e2e assertions (roadmap, templates, guide topic id) and un-skip or delete the connector-modal skipped tests.
- **Cleanup (theme J)** can fold into whichever wave touches each file.

---

## How this scan was run

- **Scanners**: blended `bug_hunter` + `test_mastery` (Vibeman prompt registry `src/lib/prompts/registry/agents/`), one subagent per context returning the 5 highest-value items across both lenses.
- **Date**: 2026-06-19. **Scope**: 33 of 53 contexts (logic-bearing; user-selected). **Method**: 5 waves of ≤8 `general-purpose` subagents, each READ-ONLY against `C:\Users\kazda\kiro\personas-web`, writing one report; orchestrator read only terse replies during scanning.
- **Files read by subagents**: ~600+ cumulative (33 contexts, 549 in-scope files plus follow-imports).
- **Verification**: counts confirmed two ways (header-sum = bullet-count = 166); 1 critical verified false-positive by direct runtime check of the Sentry package.
- **Prior scan**: `bug-hunt-2026-05-10` (178 findings, 9 criticals fixed across 7 waves). Subagents verified against current code; all prior criticals confirmed still-fixed (auth demo-gate, vote integrity, review undo-flush + pollPaused, persona optimistic engine, event replay-lockout, Sentry PII scope). Several prior findings are now stale (roadmap/agents pages were rebuilt).
