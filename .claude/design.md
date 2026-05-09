# Dashboard Design System

Reference for anyone (Claude or human) building dashboard surfaces in
`personas-web`. Read this before adding a new route, card, chart, or
interaction. Pair with `.claude/CLAUDE.md` for project-wide rules.

Established during the S.1.x sync pass (desktop-parity round 1); kept
current as the dashboard evolves.

---

## 1. Color system

Semantic Tailwind tokens only. Never raw hex in JSX; never `text-white`
or `bg-black`. The tokens are defined in the root Tailwind config —
just consume them.

**Surface tokens**

| Token | Purpose |
|---|---|
| `bg-background` | Page background |
| `bg-surface` | Elevated surface (rare in dashboard) |
| `text-foreground` | Primary text |
| `text-muted` | Secondary text |
| `text-muted-dark` | Tertiary text, labels, timestamps |
| `border-glass` | Standard card border |
| `border-glass-hover` | Inner dividers, interactive surface borders |
| `border-glass-strong` | Elevated hover state borders |

**Brand tokens** (used for focused emphasis, never as the only signal)

- `text-brand-cyan` `border-brand-cyan/*` — primary action, links
- `text-brand-purple` — intelligence/memory surfaces
- `text-brand-emerald` — success, health
- `text-brand-amber` — warnings

**Opacity scale for glass layers** — the dashboard's full palette:

```
bg-white/[0.01]  — subtle tint (filter-bar inner track)
bg-white/[0.02]  — default card fill
bg-white/[0.03]  — hover, pill-switcher inactive
bg-white/[0.04]  — hover bump on cards
bg-white/[0.06]  — hover bump for pill-switcher items
bg-white/[0.08]  — active pill state
```

**Text opacity floor**: `/60` per WCAG AA. Anything `/55` or below is
warned by `custom-a11y/no-low-text-opacity`. Don't fight the lint rule.

---

## 2. Status & severity palette

Four-way severity is the default language for health, compliance,
predictions, and scoring. Always in this order:

| Signal | Tailwind | Hex | Used for |
|---|---|---|---|
| Healthy / success | `emerald-400/500` | `#34d399` | `score ≥ 80`, resolved, active |
| Info / primary | `cyan-400/500` | `#06b6d4` | `score ≥ 60`, info alerts |
| Warning / degraded | `amber-400/500` | `#fbbf24` | `score ≥ 40`, pending, processing |
| Critical / failing | `rose-400/500` / `red-400` | `#f43f5e` | `score < 40`, breach, failure |

**Score band helper** (repeated across leaderboard, SLA, health —
copy-paste this shape):

```tsx
function band(score: number): { text: string; bar: string; pill: string } {
  if (score >= 80) return { text: "text-emerald-400", bar: "bg-emerald-400/70", pill: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" };
  if (score >= 60) return { text: "text-cyan-400",    bar: "bg-cyan-400/70",    pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300" };
  if (score >= 40) return { text: "text-amber-400",   bar: "bg-amber-400/70",   pill: "border-amber-500/25 bg-amber-500/10 text-amber-300" };
  return                 { text: "text-rose-400",    bar: "bg-rose-400/70",    pill: "border-rose-500/30 bg-rose-500/10 text-rose-300" };
}
```

**Pill/chip recipe** for any severity-keyed badge:

```
border-<color>-500/25 bg-<color>-500/10 text-<color>-300
// rounded-full px-2 py-0.5 text-sm font-medium
```

Use `/30` border and `/15` bg for critical/urgent pills to raise
contrast. This is how `FleetOptimizationCard`, `BatchReviewModal`,
`PredictiveAlertsList`, and `SLA breach log` all style themselves.

---

## 3. Typography

All custom `typo-*` utilities come from the root Tailwind config;
use them instead of raw Tailwind where they exist, but the patterns
below are what's actually in use across dashboard pages.

| Use | Classes |
|---|---|
| Page title | `text-2xl font-bold tracking-tight` wrapped in `<GradientText variant="silver">` |
| Page subtitle | `text-base text-muted-dark` |
| Section h2 | `text-base font-semibold text-foreground` |
| Section subtitle (inline) | `text-sm text-muted-dark` (preceded by ` · `) |
| Body, emphasis | `text-sm font-medium text-foreground` |
| Body | `text-sm text-muted` |
| Secondary | `text-sm text-muted-dark` |
| Labels (uppercase) | `text-sm font-medium uppercase tracking-wider text-muted-dark` |
| Numbers | always add `tabular-nums` |
| Mono (JSON, IDs, code) | `font-mono text-sm leading-relaxed` |

**Page header pattern** (use this exactly on every new route):

```tsx
<motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-<tone>/25 bg-brand-<tone>/10">
    <Icon className="h-5 w-5 text-<tone>-400" />
  </div>
  <div className="flex-1">
    <h1 className="text-2xl font-bold tracking-tight">
      <GradientText variant="silver">{t.somePage.title}</GradientText>
    </h1>
    <p className="mt-1 text-base text-muted-dark">{t.somePage.subtitle}</p>
  </div>
  <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
</motion.div>
```

Icon tone maps to the page's subject:
- memories → purple (Brain)
- health → cyan (Shield) or emerald
- leaderboard → amber (Trophy)
- sla → emerald (Activity)
- messages → rose (Mail)

---

## 4. Card anatomy

Two standard densities. Don't invent new ones.

**Standard card**
```
rounded-2xl border border-glass bg-white/[0.02] p-5
```

**Dense card** (list rows, modal rows, inline items)
```
rounded-xl border border-glass bg-white/[0.02] p-3
// hover: hover:bg-white/[0.04]
// transition: transition-colors
```

**GlowCard** (`src/components/GlowCard.tsx`) — use when a card needs
an accent-colored border + hover glow. Supports `accent` prop with
`cyan | purple | emerald | amber`. Home page uses this for the
intelligence panels.

**Modal / popover surface**
```
rounded-2xl border border-glass bg-[#0a0f1a]/95 shadow-2xl backdrop-blur-xl
```

The `#0a0f1a` is the raw dashboard background — the only place a literal
hex is acceptable, because it's being overlayed at 95% opacity against
glass blur. See `BatchReviewModal.tsx` and `DashboardScopeBar` dropdown
for the two instances.

---

## 5. Layout primitives

| Container | Classes |
|---|---|
| Page main wrapper | from `layout.tsx` — already `max-w-7xl mx-auto`, don't re-wrap |
| 3-col asymmetric grid | `grid gap-6 lg:grid-cols-5` with inner `lg:col-span-3` / `lg:col-span-2` |
| 2-col grid | `grid gap-6 lg:grid-cols-2` |
| 3-col card grid | `grid gap-3 md:grid-cols-2 xl:grid-cols-3` |
| Top strip (stats) | `grid grid-cols-1 gap-3 sm:grid-cols-3` |
| Chip bar | `flex flex-wrap items-center gap-2` |

The dashboard scope bar is the only thing pinned above page content —
added by `src/app/dashboard/layout.tsx` on an allowlist of route
prefixes. Don't add more global chrome at that level without updating
the allowlist.

---

## 6. Interactive states

Four patterns cover ~95% of interaction styling:

**Pill-switcher track** (filters, segmented controls)
```
// track
flex items-center gap-0.5 rounded-lg border border-glass-hover bg-white/[0.02] p-0.5

// inactive pill
rounded-md px-2.5 py-1 text-sm font-medium text-muted-dark
hover:text-muted hover:bg-white/[0.04] transition-all

// active pill
bg-white/[0.08] text-foreground shadow-sm
```

Use existing `FilterBar` (`src/components/dashboard/FilterBar.tsx`)
for this — don't rebuild.

**Secondary button** (cancel, skip, collapse)
```
rounded-lg border border-glass-hover bg-white/[0.03] px-3 py-1.5
text-sm font-medium text-muted
transition-colors
hover:bg-white/[0.06] hover:text-foreground
```

**Primary action** (confirm, apply) — severity-tinted:
```
// cyan primary
rounded-lg border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-1.5
text-sm font-medium text-cyan-300
transition-all
hover:bg-brand-cyan/20

// destructive (reject, reset)
rounded-lg border border-rose-500/30 bg-rose-500/10 ...text-rose-400
hover:bg-rose-500/20

// constructive (approve)
rounded-lg border border-emerald-500/30 bg-emerald-500/10 ...text-emerald-400
hover:bg-emerald-500/20
```

**Icon-only button**
```
flex h-7 w-7 items-center justify-center
rounded-lg text-muted-dark
transition-colors
hover:bg-white/[0.04] hover:text-foreground
```

Always give icon-only buttons an `aria-label`.

---

## 7. Motion & animation

**Framer Motion only.** Never CSS keyframes for complex motion.
Import `fadeUp`, `staggerContainer` from `@/lib/animations`.

**Page entrance** (every dashboard route)
```tsx
<motion.div initial="hidden" animate="visible" variants={staggerContainer}>
  <motion.div variants={fadeUp} className="mb-6">...</motion.div>
  <motion.div variants={fadeUp}>...</motion.div>
</motion.div>
```

**Micro-interactions**
- Tap feedback: `whileTap={{ scale: 0.95 }}` on `motion.button`
- Expand/collapse: `AnimatePresence` + `initial={{ height: 0, opacity: 0 }}` → `animate={{ height: "auto", opacity: 1 }}` (duration 0.15–0.18)
- Modal mount: `initial={{ scale: 0.95, opacity: 0, y: 8 }}` → `animate={{ scale: 1, opacity: 1, y: 0 }}`
- Popover: `initial={{ opacity: 0, y: -4 }}` → `animate={{ opacity: 1, y: 0 }}` (duration 0.12)

**React 19 rules** (from CLAUDE.md — restating because they bite):
1. Any file using `requestAnimationFrame`/`cancelAnimationFrame` or
   canvas work MUST import and call `useReducedMotion` from
   `framer-motion` and gate animation on `!reducedMotion`.
   Enforced by `custom-animation/require-animation-gating` lint rule.
2. Never call `setState` inside a `useEffect` body. Reset-on-prop-change
   uses the prev-state pattern:
   ```tsx
   const [prev, setPrev] = useState(prop);
   if (prop !== prev) { setPrev(prop); setOther(initial); }
   ```
3. Never call `Date.now()` / `Math.random()` / `new Date()` in render
   or inside `useMemo` factories. Lazy init is the escape hatch:
   ```tsx
   const [fetchedAt] = useState(() => Date.now());
   ```

---

## 8. Icons

**Lucide only** (`lucide-react`). Icon sizes by context:

| Class | Use |
|---|---|
| `h-3 w-3` | Inline adornments, chevrons inside small chips |
| `h-3.5 w-3.5` | Default for pill/chip icons, buttons |
| `h-4 w-4` | Card-header icons, StatBadge, action buttons |
| `h-5 w-5` | Page header icon (inside 40x40 badge) |

Icon color matches surrounding text via inherited `text-*` or explicit
tone class like `text-amber-400`. Never style via `fill` or `stroke`.

**Category → icon conventions** (stay consistent so pages feel related):
- Fleet / health: `Shield`, `Heart`, `Activity`
- Predictive / urgent: `AlertTriangle`, `AlertCircle`, `Zap`
- Optimization / suggestion: `Sparkles`, `Lightbulb`
- Memory / learning: `Brain`
- Messages / communications: `Mail`, `MailOpen`
- Leaderboard / trophy: `Trophy`, `Medal`
- Trend: `TrendingUp`, `TrendingDown`, `Minus`
- Time: `Clock`
- Filters: `ChevronDown`, `Check`, `Users`

---

## 9. Charts (recharts)

All analytics charts use `recharts`. Four patterns cover every use:

**Area with gradient** (cost, executions, burn-rate)
```tsx
<defs>
  <linearGradient id="area-cyan" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
  </linearGradient>
</defs>
<Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#area-cyan)" />
```

**Line with P50/P95/P99** (latency) — three lines, shared domain,
optional `ReferenceLine` for target. See `LatencyChart.tsx`.

**Radar** (leaderboard) — `PolarGrid` stroke `rgba(255,255,255,0.08)`,
ticks `rgba(255,255,255,0.55)`, `fillOpacity={0.3}`, `strokeWidth={2}`.

**Projection chart** (burn-rate) — split series into `actual` + `projected`,
second series uses `strokeDasharray="5 4"` and `connectNulls={false}`.

**Shared chart styling** (copy into every chart)
```tsx
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
<XAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
<YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} stroke="rgba(255,255,255,0.1)" />
<Tooltip
  contentStyle={{
    background: "rgba(10,15,26,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    fontSize: 12,
    backdropFilter: "blur(6px)",
  }}
/>
```

**Reference lines** with annotations (web's distinctive recipe — port
this to desktop in round 2):
```tsx
<ReferenceLine
  y={target}
  stroke="#f43f5e"
  strokeDasharray="4 4"
  label={{ value: "Target $400", position: "insideTopRight", fill: "#f43f5e", fontSize: 11 }}
/>
```

Deployment/incident/milestone emoji annotations (🚀 ⚠️ 🎯) live in
`ChartAnnotation.tsx`.

---

## 10. Shared components

Import, don't rebuild. If you need something close-but-different,
extend with an optional prop (augment, never replace).

| Component | Purpose |
|---|---|
| `PersonaAvatar` | Colored avatar with icon/initial. Sizes: `sm/md/lg`, optional `active` pulse |
| `StatBadge` | Clickable stat pill (icon + value + label). Six accents: `cyan/purple/emerald/amber/rose/blue` |
| `MetricCard` | Card with icon, value, trend %, optional sparkline |
| `GlowCard` | Accent-border card with hover glow |
| `StatusBadge` | Execution status pill |
| `SkeletonCard` | Loading placeholder |
| `EmptyState` | No-data fallback |
| `FilterBar` | Pill-switcher for tab-like filters |
| `CompareToggle` | Period-comparison on/off toggle. Accepts `label` for i18n |
| `StalenessIndicator` | "Fetched Xs ago" or error pill. Mandatory on every fetched panel |
| `JsonViewer` | Syntax-highlighted JSON block with copy button |
| `Sparkline` | Inline mini chart for `MetricCard` |
| `ChartAnnotation` | Emoji-labeled reference-line helpers |
| `BatchReviewModal` | Generic accept/reject batch modal. Currently used by memories conflicts |
| `FleetOptimizationCard` | Severity-keyed top-recommendation card |
| `EventSwimlane` | Per-persona horizontal event trace |

Route-specific helpers live under the route directory
(e.g. `src/app/dashboard/reviews/ReviewsSplitPane.tsx`).

---

## 11. Data & state

**Stores** live in `src/stores/*Store.ts`. Plain Zustand `create()`
with no middleware. LocalStorage hydration is inline (see
`dashboardFilterStore.ts` and `reviewStore.ts` for the pattern).

| Store | State |
|---|---|
| `dashboardFilterStore` | personaId, dateRange (24h/7d/30d/90d/custom), compareEnabled |
| `personaStore` | personas list + fetch |
| `executionStore` | executions list + fetch, enriched hook |
| `reviewStore` | reviews list, escalation policy, bulk actions |
| `systemStore` | system health, worker counts |
| `eventStore` | events + subscriptions |
| `authStore` | user session (mock) |

**Never** introduce a new top-level store for a single component's
state — use `useState`. Only promote to Zustand when state spans
routes or survives navigation.

**Mock data** lives in `src/lib/mock-dashboard-data.ts`. Append, don't
fork. All generators use `seededRandom(seed)` for reproducibility.
Consistent persona set across the whole file:

```
ResearchAgent (#06b6d4 cyan)
CodeReviewer  (#34d399 emerald)
DataProcessor (#fbbf24 amber)
ReportGen     (#f43f5e rose)
NotifyBot     (#a855f7 purple)
```

Timestamps are always ISO strings. Cumulative numeric counters pick a
seed distinct from other generators (see the file top for seed index).

---

## 12. i18n contract

Enforced by the `Translations` interface in `src/i18n/en.ts`. All 14
locales must satisfy the same shape or `tsc` fails.

**Adding new keys**:
1. Add to `en.ts` interface
2. Add to `en.ts` export (English copy)
3. Mirror to all 13 non-en locales with **English placeholder** copy
   (enough to compile — real translations come later in a dedicated pass)

**Namespace layout**:
- `dashboard.*` — nav labels + greeting + shared header strings
- `<routeName>Page.*` — per-route copy. Top-level, not nested under `dashboard`.
  Current: `agentsPage`, `executionsPage`, `eventsPage`, `reviewsPage`,
  `memoriesPage`, `healthPage`, `leaderboardPage`, `slaPage`,
  `messagesPage`, `settingsPage`.

**Placeholders** use curly braces and are replaced in render:
```tsx
t.memoriesPage.uses.replace("{n}", String(count))
t.memoriesPage.conflicts.modalTitle.replace("{n}", String(conflicts.length))
t.healthPage.predictive.probability.replace("{n}", String(pct))
```

**Do not** hardcode English in JSX, `aria-label`, `alt`, or `metadata`.
Exception: internal developer-only components (e.g. kbd hints showing
literal key names like `A`/`R`/`S`/`Esc`). Pre-existing hardcoded
strings are a known debt — fix them opportunistically when you touch
the file, never as a bulk pass (CLAUDE.md rule).

---

## 13. Accessibility

Non-negotiable on new work:

- **Icon-only buttons**: `aria-label` required
- **Popovers / dropdowns**: `aria-haspopup`, `aria-expanded`, `role="listbox"` + `role="option"` + `aria-selected`
- **Modals**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="..."`, Escape + click-outside both close
- **Toggle buttons**: `aria-pressed`
- **Transient status** (staleness, toast): `role="status"`
- **SVG viz**: `role="img"` + `aria-label` on the `<svg>`
- **Keyboard shortcuts**: surface them inline via `<kbd>` tags so users discover them (see `ReviewsFocusFlow`, `ReviewsSplitPane`)
- **Focus management**: prefer CSS focus-visible; don't trap tab order unless inside a modal

Text-opacity floor is enforced by lint (`custom-a11y/no-low-text-opacity`) —
don't override it.

---

## 14. Route scaffolding

To add a new dashboard route:

1. **Create** `src/app/dashboard/<name>/page.tsx` — a "use client"
   component following the page-header pattern in §3.
2. **Mock data**: extend `src/lib/mock-dashboard-data.ts` with a new
   section delimited by `// ── name ─────────`. Export types + data.
3. **i18n**: add `<name>Page` namespace to `en.ts` interface, `en.ts`
   export, and all 13 non-en locales (English placeholders).
4. **Scope bar allowlist**: add `/dashboard/<name>` to
   `SCOPED_ROUTE_PREFIXES` in `src/app/dashboard/layout.tsx` if the
   page should consume persona/date-range filters.
5. **Nav registration**: append an entry to `navItemDefs` in
   `DashboardNavigation.tsx` with a lucide icon + `labelKey` pointing
   to a new `dashboard.<name>` label string.
6. **Verify**: `npm run typecheck && npx eslint <touched files>` before
   committing. Lint must be clean on touched files; pre-existing
   noise under `.claude/worktrees/**` is not yours to fix.

---

## 15. Commits & pass IDs

Dashboard sync work follows the `S.1.x/<area>: <what>` prefix. Commit
format per CLAUDE.md:

```
S.1.7/reviews-focus-flow: distraction-free one-at-a-time triage mode

Why: <root cause or user value>
Risk: <low|med|high + rationale>
Verified: tsc+lint

Co-Authored-By: ...
```

One atomic change per commit. Never bundle an unrelated fix.

---

## 16. Augment-never-replace

This is the guiding design principle for any cross-app change. Both
personas-web and the desktop `personas` app have their own visual
identity. Don't rip one out to install the other's.

**Rules**:
1. When a component exists and is close-to-what-you-need, add an
   optional prop. Never rewrite it. Example: `CompareToggle` gained
   an optional `label` prop during S.1.1 instead of being replaced.
2. When a route exists, add a sibling mode rather than restructure.
   Example: `/dashboard/reviews` gained `ReviewsFocusFlow` as a mode
   toggle next to the existing `ReviewsSplitPane`.
3. When both apps have equivalent features with different design
   choices, identify what each does better. Port the asset
   (LatencyChart emoji reference lines → desktop; cascade visualization
   → web) rather than unifying prematurely.
4. Only consider a full merge when the same pattern has been
   independently validated in both codebases — then lift to a shared
   token or package. Score bands (`emerald ≥80 / cyan ≥60 / amber ≥40
   / rose <40`) are a current candidate; both apps now use this.

---

## 17. What's earmarked for round 2 (web ↔ desktop)

Web → desktop port candidates (web's UI quality leads):
- `LatencyChart` P50/P95/P99 with emoji-annotated reference lines
- Glassmorphic recharts tooltip style
- Compare-mode dashed overlay
- `KnowledgeDenseTable` density recipe (monospace numerics,
  alternating stripe, inline sparkline bars, expandable detail)

Desktop → web port candidates (desktop behavior leads):
- `OverviewFilterProvider` vs `useDashboardFilterStore` — consolidate
  into one shared abstraction
- Per-sub-feature virtualization for very large lists (desktop uses
  `useVirtualList`; web uses `content-visibility:auto`)

Shared-library candidates (both apps now have it, lift to package):
- Score band color mapping
- `FleetOptimizationCard`, `BatchReviewModal`, `StalenessIndicator`
  shapes
- Severity taxonomy (info/warning/critical + minor/major/critical)
