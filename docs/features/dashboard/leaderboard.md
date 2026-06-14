# Leaderboard & Rankings
> A top-3 podium with rank-dimension tabs sits above a sortable table and a radar card, ranking the persona/agent fleet by composite score or any single metric. · **Route:** `/dashboard/leaderboard` · **Nav label:** "Leaderboard" · **Status:** Demo-only (mocks)

## What it does

The Leaderboard answers one question for the agent fleet: *which persona is performing best overall, and where does each one win or lose?*

Above the detail panels sits a **podium**: rank-dimension tabs (overall / reliability / speed / cost / quality) re-rank the fleet, and the top 3 render as medal cards (🥇🥈🥉) with an animated **score ring** showing the selected dimension's value; the leader sits slightly raised. Clicking any podium card selects that persona, driving the radar below. The detail table and radar keep their own composite ordering and column sorts.

It then renders two side-by-side panels (a 5-column grid: table spans 3, radar spans 2):

1. **Ranked table** (left, `lg:col-span-3`) — one row per persona, ordered by a sortable column. Each row shows a **rank badge** (gold/silver/bronze medal icons for the top 3, plain number otherwise), a **persona avatar** (colored by the persona's brand color), the persona **name** with a thin **composite bar** beneath it (width = composite score, color banded by score tier), a **composite pill** (the 0–100 score, color-banded), and a **delta** column (trend arrow + signed change vs. last period). Clicking a row selects that persona to drive the radar.
2. **Radar comparison card** (right, `lg:col-span-2`) — a 5-axis radar (Reliability, Cost, Speed, Quality, Volume; all 0–100) of the selected persona. When the selection is *not* the #1 persona, the #1 persona is overlaid faintly as a dashed "benchmark" series so the gap is legible, and a legend appears.

**Rank vs. sort:** rank (the badge number) is *always* the composite ordering and never changes when you re-sort the table — only the row order changes. Sortable columns are **name** (A→Z default), **composite** (high→low default), and **delta** (high→low default); ties always break by name for a deterministic order.

**Composite & metrics:** each persona carries a 5-axis `metrics` profile (`reliability`, `cost`, `speed`, `quality`, `volume`, each 0–100) and a `composite` score = the rounded mean of those five axes. `trend` is `"up" | "down" | "flat"` and `delta` is the signed point change vs. the prior period (drives the arrow icon and color).

## How it works

**Data hook — `useLeaderboardData()`** (`src/app/dashboard/leaderboard/useLeaderboardData.ts`). Returns `{ personas, loading, error }`. Mode is decided once per session from `authStore.isDemo` (`useLeaderboardData.ts:25`):
- **Demo mode** (this repo's default): the `useState` initializer seeds `MOCK_LEADERBOARD`, `loading` starts `false`, and the effect early-returns (`if (useMock) return;` at `useLeaderboardData.ts:38`) — no fetch runs.
- **Real/Supabase mode**: the effect calls `getSyncedLeaderboard()` (`src/lib/supabaseApi.ts:754`), which reads the `synced_leaderboard` view and normalizes per-persona execution stats into the five radar axes + composite. Errors are captured to Sentry with `tags: { scope: "useLeaderboardData" }` (`useLeaderboardData.ts:50`) and surfaced via `error`. A `cancelled` flag guards the async setState on unmount.

**Page composition — `page.tsx`.** `LeaderboardPage` calls `useLeaderboardData()`, then manages selection without a sync effect (`page.tsx:24`): `pickedId` is `string | null` (`null` = "no explicit pick yet"). `selected` is a `useMemo` that resolves `pickedId` to a persona or falls back to `personas[0]` — so the selection stays valid as data loads or changes, with no reset-on-prop effect (React 19 rule). `benchmark` is `personas[0]` (the #1 persona); `isComparing` is true when the selection isn't the benchmark. `fetchedAt` is captured once in a lazy `useState(() => Date.now())` initializer (React 19 purity rule) and fed to `StalenessIndicator`. The `radarData` memo (`page.tsx:41`) zips the five axis keys against `t.leaderboardPage.metrics.*` labels into `{ metric, value, benchmark }[]`. While `loading`, it renders a `SkeletonCard` + `SkeletonChart` (`aria-busy`); `error` renders a `DashboardErrorBanner`. The whole page is a `staggerContainer` with `fadeUp` children (framer-motion).

**Table — `LeaderboardTable.tsx`.** Holds the sort state (`sortField` defaults to `"composite"`, `sortDir` to `"desc"`). Two memos: `rankByComposite(personas)` (the stable rank map, recomputed only on `personas`) and `sortPersonas(personas, sortField, sortDir)` (the display order). `handleSort` toggles direction if you click the active column, else switches column and applies `defaultDirFor(field)`. Each row is a `<motion.button>` with `layout="position"` (gated off when `useReducedMotion()` is true → `layout={false}`) so rows animate when re-sorted. Selected row = cyan border/bg; an optional `compareId` prop highlights a second row in amber (currently unused by the page — `compareId` defaults to `""`). The composite bar width is an inline `style={{ width: \`${persona.composite}%\` }}` and its band classes come from `compositeBand`. The delta color comes from the shared `trendColor(delta, { neutralAtZero: true })` helper.

**Sort header — `LeaderboardSortHeader.tsx`.** A `<button>` per sortable column with an up/down chevron pair; the active direction's chevron turns cyan. `aria-label` is built from `sortByLabel.replace("{field}", label)` (i18n `sortBy: "Sort by {field}"`). Mirrors the canonical `KnowledgeSortHeader` shape.

**Sort logic — `leaderboardSort.ts`** (pure, no React):
- `rankByComposite(personas)` → `Map<id, rank>`, sorted by `composite` desc with name as tiebreaker. This is the source of the badge numbers and is independent of the table sort.
- `defaultDirFor(field)` → `"asc"` for `name`, `"desc"` for numeric columns.
- `sortPersonas(personas, field, dir)` → a sorted copy; `name` compares via `localeCompare`, numeric fields compare numerically with `localeCompare` tiebreak, then multiply by the direction factor.

**Radar card — `LeaderboardRadarCard.tsx`.** Recharts `RadarChart` (`outerRadius="72%"`, 300px tall, inside a `ResponsiveContainer`). The benchmark series is drawn *first* (so it sits behind), as a dashed low-opacity overlay keyed on `dataKey="benchmark"`; the selected series (`dataKey="value"`) is drawn on top at higher fill opacity. Both spread `useChartAnimation()` (`...anim`), which disables Recharts animation and zeroes its duration when reduced motion is requested (`src/lib/chart-theme.tsx:21`). The `Legend` and benchmark series only render when a `benchmark` prop is passed (i.e. when comparing). Series stroke/fill use the persona's data-driven `color` (falls back to `BRAND_VAR.cyan`).

**Style helpers — `leaderboardStyles.tsx`** (JSX-bearing, hence `.tsx`):
- `compositeBand(score)` → `{ text, bar, pill }` Tailwind classes by threshold: ≥ 80 emerald, ≥ 60 cyan, ≥ 40 amber, else rose.
- `medalStyle` → per-rank (1/2/3) color + bg classes for the top-3 badges.
- `TrendIcon({ trend })` → `TrendingUp` (emerald) / `TrendingDown` (rose) / `Minus` (muted) by trend.
- `RankBadge({ rank })` → a `Medal` icon for ranks 1–3 (gold/silver/bronze via `medalStyle`), else the plain rank number.

## Key files

| File | Role |
| --- | --- |
| `src/app/dashboard/leaderboard/page.tsx` | Page shell: selection/benchmark state, `rankDim` state, `radarData`/`top` memos, podium + tabs above the 5-col grid. |
| `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardPodium.tsx` | Top-3 podium cards with medals + animated score ring (reduced-motion gated); click selects → radar. |
| `src/app/dashboard/leaderboard/leaderboard-page/RankDimensionTabs.tsx` | Rank-dimension segmented control (roving tabindex) driving the podium. |
| `src/app/dashboard/leaderboard/leaderboard-page/leaderboardRank.ts` | Pure rank-dimension helpers: `RANK_DIMENSIONS`, `dimensionScore`, `rankByDimension`. |
| `src/app/dashboard/leaderboard/useLeaderboardData.ts` | Data hook: demo mock vs. Supabase `getSyncedLeaderboard`, loading/error state, Sentry capture. |
| `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardTable.tsx` | Sortable ranked table: sort state, rank/order memos, row rendering, selection highlight. |
| `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardSortHeader.tsx` | Per-column sort button with chevron pair + active-cyan state + `aria-label`. |
| `src/app/dashboard/leaderboard/leaderboard-page/leaderboardSort.ts` | Pure sort/rank helpers: `rankByComposite`, `defaultDirFor`, `sortPersonas`. |
| `src/app/dashboard/leaderboard/leaderboard-page/LeaderboardRadarCard.tsx` | Recharts radar with selected-vs-benchmark overlay, reduced-motion-gated animation. |
| `src/app/dashboard/leaderboard/leaderboard-page/leaderboardStyles.tsx` | Visual helpers: `compositeBand`, `medalStyle`, `TrendIcon`, `RankBadge`. |
| `src/lib/mock-dashboard-data.ts` | `LeaderboardPersona` / `LeaderboardTrend` types + `MOCK_LEADERBOARD` fixture (`:536`–`:606`). |
| `src/lib/supabaseApi.ts` | `getSyncedLeaderboard()` real-data normalizer over the `synced_leaderboard` view (`:754`). |

## Data & state
- **Source:** Demo → static `MOCK_LEADERBOARD` (5 personas, pre-sorted by composite) in `src/lib/mock-dashboard-data.ts:560`. Real → `getSyncedLeaderboard()` over the Supabase `synced_leaderboard` view (`src/lib/supabaseApi.ts:754`).
- **Stores:** `authStore` (Zustand) — only `isDemo` is read, to pick the data source. No leaderboard-specific store; selection/sort state is local component state.
- **API routes:** None. Demo runs purely on the in-memory mock; real data goes directly to Supabase (anon key) via `supabaseApi`, not through a Next.js route handler.
- **Types:** `LeaderboardPersona` (`{ id, name, color, metrics: { reliability, cost, speed, quality, volume }, composite, trend, delta }`) and `LeaderboardTrend = "up" | "down" | "flat"` in `src/lib/mock-dashboard-data.ts:536`. `RadarDatum` (`{ metric, value, benchmark? }`) in `LeaderboardRadarCard.tsx:19`. `LeaderboardSortField = "name" | "composite" | "delta"` and `SortDir = "asc" | "desc"` in `leaderboardSort.ts:3`.

## Integration points
- **i18n:** strings under `t.leaderboardPage.*` (`src/i18n/en.ts:1660`): `title`, `subtitle`, `rank`, `composite`, `delta`, `sortBy` (`"Sort by {field}"`), `radarTitle`, `rankBy`, `overall` (podium rank-dimension labels), and `metrics.{reliability,cost,speed,quality,volume}`. The agent column label reuses `t.dashboardUi.agent`. Nav label is `t.dashboard.leaderboard` (`en.ts:1368`).
- **Shared dashboard chrome:** `StalenessIndicator`, `DashboardErrorBanner`, `SkeletonCard` / `SkeletonChart`, `PersonaAvatar` (all under `src/components/dashboard/`), plus the shared `trendColor` helper.
- **Animation/theme:** `fadeUp` / `staggerContainer` from `src/lib/animations`, `useChartAnimation` from `src/lib/chart-theme.tsx`, `BRAND_VAR` from `src/lib/brand-theme`, `GradientText` for the title.
- **Charting:** Recharts (`RadarChart` + polar axes, `Legend`, `Tooltip`).
- **Real-mode coupling:** the radar axes are *derived*, not measured — `getSyncedLeaderboard` normalizes cost/speed/volume relative to the cohort max, so a persona's axis scores are relative to its peers in that fetch.

## Conventions & gotchas
- **`quality` is a documented PROXY in real mode.** The `synced_leaderboard` view has no quality signal, so `getSyncedLeaderboard` synthesizes quality as `successRate * 0.7 + (1 - retryRate) * 0.3` (`supabaseApi.ts:782`). Don't present it as a measured quality metric.
- **`trend`/`delta` are always `"flat"`/`0` in real mode.** No prior-period snapshot exists in the view, so `getSyncedLeaderboard` returns neutral placeholders rather than a fabricated movement (`supabaseApi.ts:800`). Real rows therefore never show a trend arrow with color — only the mock fixture has live deltas.
- **i18n bug — malformed `leaderboardPage.metrics` block.** In `src/i18n/en.ts` the `metrics` object (around `:1670`) contains stray keys that don't belong to it and have inconsistent indentation: `tokens`, `retries`, `skipTo: 'Jump to'`, and `chapterHome: 'Homepage'` are nested *inside* `metrics` between the real axis labels. These look like keys from other namespaces that got merged in. The page only reads `reliability/cost/speed/quality/volume`, so it renders fine, but the extras pollute the `Translations` shape and likely won't match the other 13 locales — worth cleaning up and verifying locale lockstep.
- **Rank is decoupled from sort.** `rankByComposite` is computed independently of the table sort, so re-sorting by name or delta keeps the medal numbers stable. If you add a new sort field, do *not* feed it into the rank map.
- **Selection survives data changes without an effect.** `pickedId` stays `null` until the user clicks; `selected` falls back to `personas[0]`. Avoid adding a `useEffect` that resets selection on `personas` change — that would reintroduce the synchronous-setState-in-effect anti-pattern the code deliberately avoids (`page.tsx:22`).
- **`compareId` is wired but unused.** `LeaderboardTable` accepts a `compareId` prop (amber second-row highlight) that the page never passes (defaults to `""`). It exists for a future two-persona compare mode; the radar already supports the benchmark overlay.
- **Data-driven colors bypass tokens intentionally.** Persona `color` is applied via inline `style` / raw Recharts props (not a semantic Tailwind token) because it's per-persona data; this is the expected exception to the semantic-token rule.
- **Reduced motion is gated in two places:** the table's `layout` animation (`useReducedMotion()` → `layout={false}`) and the radar's Recharts animation (`useChartAnimation()`). Honor both if you touch either.

## Related docs
- [Observability Charts](observability.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
