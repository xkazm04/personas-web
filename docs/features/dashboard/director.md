# Director Coaching
> A coaching command center: a portfolio scorecard (value-delivered rate, average 0–5 verdict, cost per value, scope size), momentum buckets, a value-breakdown bar, a score-distribution histogram, a per-agent verdict-history table with attention triage, and a recent coaching-verdict feed. · **Route:** `/dashboard/director` · **Nav label:** "Director" · **Status:** Demo-only (mocks)

## What it does

The Director is the desktop app's coaching meta-persona: it scores every starred agent's latest run on a **0–5 verdict scale** (5 = excellent, 0 = broken) and tracks whether coaching moves the needle. This page is the web demo's mirror of that surface — the answer to *"is my fleet actually earning its keep, and which agent needs my attention next?"*

Top to bottom:

1. **Portfolio scorecard** — four KPI tiles: **Value delivered** (share of assessed runs that delivered value, color-banded ≥60% green / ≥30% amber / else rose), **Avg verdict** (mean latest 0–5 score across reviewed agents, tinted by score tier), **Cost / value** (spend per value-delivered run), and **In scope** (agents under coaching, with a "N reviewed · M pending" caption).
2. **Momentum strip** — improving / flat / declining chips counting verdict-trend direction per agent (last score vs. previous). Each chip filters the coaching table; when nothing moves either way it collapses to a single "holding steady" line.
3. **Value breakdown** — a stacked proportion bar over the period's assessed runs: Delivered / Partial / Blocked / No input / Unassessed, with a counted legend.
4. **Score distribution** — a six-band (0–5) Recharts histogram of latest verdicts, bars tinted by score tier (≥4 emerald, ≥2 amber, else rose), with an "avg N.N" pill in the header. Clicking a band filters the table to that score.
5. **Recent coaching verdicts** — the Director's latest prose coaching notes (fixture text), each with a severity accent bar (error rose / warning amber / info cyan) and a category chip (Prompt / Health / Triggers / Credentials / Memory / Usefulness).
6. **Coaching scope table** — one row per agent: avatar + run count, latest score chip with a review-over-review delta arrow, an SVG trend sparkline anchored to the fixed 0–5 range, a value-delivered mini bar + percent, attention-flag chips, and last-review recency ("Never" for unreviewed). The header carries the **attention triage bar** — counted chips for **New** (never scored), **Low** (≤2), **Declining** (score dropped), **Stale** (>14 days since review) — or an all-healthy line.

**Cross-filtering:** one facet is active at a time (momentum chip, score band, or attention flag); activating another replaces it, re-clicking clears it, and an ✕ clear-chip naming the facet appears in the table header.

The demo story: ResearchAgent and CodeReviewer are improving, DataProcessor is flat and stale, NotifyBot is declining into low scores, and ReportGen has never been reviewed.

## How it works

**Data hook — `useDirectorData()`** (`src/app/dashboard/director/useDirectorData.ts`). SWR over the standalone mock fetcher `getDirectorSnapshot()` (`src/lib/mockApi.ts`) — the same demo-only pattern as `useActivityMetrics`: `revalidateOnFocus: false`, 60s dedupe, `retry` = `mutate`. There is no real-mode branch; the Director has no synced source in this repo.

**Mock fixtures** (`src/lib/mock-dashboard-data.ts`, "Director" section): `MOCK_DIRECTOR_PORTFOLIO` (period, total cost, assessed-run breakdown, six score bands, five-agent roster, scope counters, avg score) and `MOCK_DIRECTOR_VERDICTS` (six coaching notes across severities/categories). Roster timestamps are `Date.now()` offsets at module load. Verdict titles and persona names are fixture data shown verbatim (same convention as `MOCK_HEALTH_CHECKS` details).

**Pure derivations — `director-page/directorMeta.ts`.** Everything beyond the two fixtures is computed client-side, mirroring the desktop's `directorScore.ts` / `momentum.ts` / `attention.ts`:
- `scoreTone(score)` — ≥4 emerald / ≥2 amber / else rose (text, chip, and chart-series forms).
- `scoreDelta` / `momentumOf` / `momentumCounts` — trend delta = last score − previous; >0 improving, <0 declining, else flat.
- `attentionFlags(entry, now)` — `["needsReview"]` exclusively when never scored; otherwise `low` (≤2), `declining` (delta <0), `stale` (>`STALE_MS` = 14 days) can stack. `ATTENTION_ORDER` ranks them; `FLAG_TONE` maps chip classes.
- `RosterFacet` + `matchesFacet` — the single-facet filter union (`flag` | `score` | `momentum`).
- `sparklinePoints` — polyline geometry anchored to the fixed 0–5 range so a "4" sits at the same height in every row.

**Page composition — `page.tsx`.** Standard dashboard shell (staggerContainer + fadeUp, `GradientText` header with a violet `Clapperboard` tile, `StalenessIndicator`). Facet state (`useState<RosterFacet | null>`) lives here and is shared by MomentumStrip, ScoreDistributionCard, and CoachingTable. `now` is snapshotted once in a lazy `useState(() => Date.now())` initializer (React 19 purity) and passed to the attention/staleness math. Loading renders KPI/chart/table skeletons (`aria-busy`); a failed fetch renders `DashboardErrorBanner` with retry.

**Components** (`director-page/`):
- `DirectorKpiGrid.tsx` — four `GlowCard` KPI tiles; derives value rate and cost-per-value from the breakdown (cost/value is `null`→em-dash when nothing delivered value).
- `MomentumStrip.tsx` — counted filter chips in `MOMENTUM_ORDER`, zero-count buckets hidden, "holding steady" collapse.
- `ValueBreakdownCard.tsx` — hand-rolled stacked bar (`aria-hidden`; the counted legend is the semantic content), bands emerald/amber/rose/cyan/muted.
- `ScoreDistributionCard.tsx` — Recharts `BarChart` themed via `chart-theme` (`AXIS_TICK`, `GRID_STROKE`, `CHART_CURSOR_FILL`, `useChartAnimation`), per-band `Cell` fills from `scoreTone(...).series`, click-to-filter via the Bar `onClick` payload, non-selected bands dimmed while a score facet is active.
- `CoachingTable.tsx` — sort = flagged first (by `ATTENTION_ORDER` of the primary flag), then ascending latest score (unscored = 99), then name; a `min-w-[640px]` grid inside `overflow-x-auto`. Renders `AttentionTriageBar` and the `scoreVisuals` pieces.
- `AttentionTriageBar.tsx` — the flag chips + facet clear-chip + all-healthy line.
- `scoreVisuals.tsx` — `ScoreSparkline` (inline SVG polyline + trailing dot) and `ScoreDelta` (signed arrow, hidden at zero).
- `VerdictFeedCard.tsx` — severity accent bar + category chip per verdict, `relativeTime` timestamps.

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/director/page.tsx` | Page shell, facet state, `now` snapshot, skeleton/error handling |
| `src/app/dashboard/director/useDirectorData.ts` | SWR hook over the mock fetcher |
| `src/app/dashboard/director/director-page/directorMeta.ts` | Pure score/momentum/attention/facet/sparkline derivations |
| `src/app/dashboard/director/director-page/DirectorKpiGrid.tsx` | Portfolio scorecard (4 KPI tiles) |
| `src/app/dashboard/director/director-page/MomentumStrip.tsx` | Improving/flat/declining filter chips |
| `src/app/dashboard/director/director-page/ValueBreakdownCard.tsx` | Stacked value-outcome bar + legend |
| `src/app/dashboard/director/director-page/ScoreDistributionCard.tsx` | 0–5 verdict histogram (Recharts, click-to-filter) |
| `src/app/dashboard/director/director-page/CoachingTable.tsx` | Per-agent verdict-history table |
| `src/app/dashboard/director/director-page/AttentionTriageBar.tsx` | Attention flag chips + clear-chip |
| `src/app/dashboard/director/director-page/scoreVisuals.tsx` | Score sparkline + delta arrow |
| `src/app/dashboard/director/director-page/VerdictFeedCard.tsx` | Recent coaching-verdict feed |
| `src/lib/mockApi.ts` | `getDirectorSnapshot()` standalone demo fetcher |
| `src/lib/mock-dashboard-data.ts` | Director types + `MOCK_DIRECTOR_PORTFOLIO` / `MOCK_DIRECTOR_VERDICTS` |

## Data & state

- **Source:** 100% mock — `getDirectorSnapshot()` returns deep copies of the two fixtures after a 300ms simulated latency. No orchestrator, no Supabase.
- **Stores:** none; page-local `useState` for the facet. SWR key `"director-snapshot"`.
- **Types:** `DirectorPortfolio`, `DirectorRosterEntry`, `DirectorScoreBand`, `DirectorValueBreakdown`, `DirectorVerdict`, `DirectorMomentum`, `DirectorSeverity`, `DirectorCategory` (all in `mock-dashboard-data.ts`).

## Integration points

- **i18n:** `directorPage` namespace in `src/i18n/en.ts` (title/subtitle/period, `kpi.*`, `momentum.*`, `breakdown.*`, `distribution.*`, `coaching.*` incl. `flags`/`flagHints`, `verdictFeed.*`) plus the `dashboard.director` nav label — translated in all 14 locales. Interpolation via literal `{n}` / `{count}` / `{reviewed}` / `{unreviewed}` tokens + `String.replace`.
- **Nav:** one entry in `navItemDefs` (`src/components/dashboard/DashboardNavigation.tsx`), `scoped: false` — the page has its own period window and ignores the persona/date-range scope bar. Sits after Leaderboard, so it lands in the mobile "More" menu.
- **Shared chrome:** `GlowCard`, `PersonaAvatar`, `StalenessIndicator`, `SkeletonCard`/`SkeletonChart`, `DashboardErrorBanner`, `GradientText`.
- **Charting/animation:** Recharts via `src/lib/chart-theme.tsx`; `useChartAnimation()` gates the histogram, framer-motion `fadeUp`/`staggerContainer` gate the page reveal.

## Conventions & gotchas

- **Desktop parity, trimmed:** the desktop Director tab also has period pills (7d/30d/90d), model-efficiency and issues-by-category panels, review actions ("Review all in scope", stale sweep), an add-to-scope modal, per-agent detail modals with full coaching history, Obsidian long-term memory, and the Director's Lab / campaign report. The web demo deliberately renders the read-only scorecard story only; the period label is static ("Last 30 days" from the fixture).
- **Verdict titles are English fixtures** — data, not UI strings; the same convention as other mock detail text. All labels/hints are i18n.
- The roster's `lastReviewedAt` offsets are computed at module load, so DataProcessor's 16-day-old review always trips the 14-day stale rule regardless of when the demo runs.
- `attentionFlags` returns `needsReview` *exclusively* — a never-scored agent can't also be stale/low (desktop parity).
- One facet at a time; there is intentionally no multi-select filtering.

## Related docs

- [Leaderboard](leaderboard.md) — sibling ranking surface
- [Observability](observability.md) — Activity tab hosts the fleet-level Athena/value cards
- [Home / Mission Control](home-overview.md)
- [Feature index](../INDEX.md)
