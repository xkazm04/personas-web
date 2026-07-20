# Fix Wave 15 — Medium/Low tail: loading-state, dead-code, duplicated-source-of-truth

> 3 commits, 14 findings closed (12 Medium + 2 Low).
> Baseline preserved: tsc 0 → 0 · vitest 71/71 · 0 regressions. Branch `vibeman/medlow-tail`.
> Executed by 3 parallel edit-only subagents (disjoint files); orchestrator gated + committed centrally.

## Commits

| # | Commit | Findings | Theme |
|---|---|---|---|
| 1 | `2d7edce` | dashboard-shell-chrome #4, observability-charts-sla #4, messages-settings #4, leaderboard-rankings #5 | honest loading/error/empty states |
| 2 | `f1139f6` | section-preview-demo #2 + #4, waitlist #5 + #3, feature-voting #3 | error paths + a real bug + dead-code |
| 3 | `fefbeb9` | dashboard-shell-chrome #5, self-healing #5, shared-ui #3, shared-types #4, how-it-works-changelog #4 | duplicated-source-of-truth (pure refactors) |

## Highlights

- **Real bugs fixed**: the `DashboardErrorBoundary` retry-cap guard was `> MAX` (unreachable) → `>= MAX`; the `WaitlistModal.fetchCount` catch was inverted (swallowed real errors, only handled aborts) → flipped.
- **Swallowed-failure → error state**: `useSparklines` now returns `error`/`retry` and its consumer renders `DashboardErrorBanner` instead of empty charts.
- **Missing states**: messages pagination gated behind real data; leaderboard gets a zero-personas empty state; the `/demo` entry gets a try/catch fallback (was an eternal spinner) with `role=alert` / `role=status`.
- **Dead code + PII surface removed**: the votes API's `email` / `email_saved` branches were unreachable (the client never sends an email) — removed across the Supabase and FS paths; `added`/`removed` contract unchanged, `postVoteToggle` return type narrowed to match. Body-scroll lock added to WaitlistModal.
- **Single-source refactors (output unchanged)**: `SCOPED_ROUTE_PREFIXES` derived from the nav registry; healing-circuit status colors → one map; PricingIllustration figures → one `TIERS` constant; `highlight-match` → one exhaustive `MatchType` switch; changelog change-type metadata unified.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 71/71 | 71/71 |

## Cumulative Medium/Low progress

Waves 14–15 closed **29 Medium/Low** (a11y 15 + this 14). Of the original 146, ~117 remain — dominated by: context-map-drift (~6, needs a Vibeman rescan not code), magic-number/clarity (~19, "document this"), i18n-hardcoded (~16, needs the 15-locale harness), and a long diverse-singleton tail. Recommend cherry-picking by user-visible impact from here rather than exhaustive grind.
