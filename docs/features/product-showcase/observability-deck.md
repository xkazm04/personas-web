# Observability Deck
> Live "pulse-grid" terminal that streams simulated agent telemetry — per-agent lanes, event pulses, sparklines, and count-up metrics. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Renders the `OBSERVE` deep-dive on `/features` (`StageSection id="observe"`, emerald glow). A terminal-chrome card ("observability-deck", status `streaming`) shows four count-up summary metrics, one lane per agent in `agentPool` (PR Reviewer, Email Triage, Slack Digest, Deploy Monitor, Doc Indexer, Meeting Notes), and a footer toggling between `Per-agent activity pulse` and a `Show all` filter-clear button. Eight `ModuleTag` buttons flank the grid (4 left, 4 right) — Executions, Messages, Events, Memories / Activity, Health, Analytics, Knowledge. Clicking a tag toggles a `filterPrefix` (e.g. `execution`) that filters the pulse icons shown in every lane; clicking the active tag again, or the footer button, clears it. Everything is mock/simulated — no live data, no API calls.

## How it works
- **Mount:** `ObservabilityDeck.tsx` re-exports `observability-deck/index.tsx`. Loaded via `LazyObservabilityDeck` (`feature-lazy.tsx`, `createLazySection`, `ssr:false`) so the chunk hydrates only when scrolled near.
- **Filter state:** `index.tsx:13` holds `filterPrefix` in `useState`; `handleTagClick` (`index.tsx:15`) toggles it. Passed down to `PulseGridDeck` and reflected in `ModuleTag` `active` styling.
- **Pulse simulation:** `PulseGridDeck.tsx:37` runs a `setInterval` (jittered `900 + Math.random()*700` ms). Each tick picks a random agent/event/duration/cost, builds a `Pulse`, and updates `stats` immutably — capping `pulses` at `MAX_PULSES_PER_AGENT` (6) and `durations` at `MAX_SPARKLINE` (12), accumulating `totalCost`/`pulseCount`. The interval is gated: `if (reduced) return;` (`PulseGridDeck.tsx:38`).
- **Per-lane render:** `AgentLane.tsx` derives, via `useMemo`, the `filterPrefix`-filtered pulse list, a reversed sparkline (`buildSparkline`), and the latest pulse's `EVENT_META` (icon/short/color). It shows a pulsing status dot, a "latest event" pill, an animated row of pulse chips (`AnimatePresence`), a `Sparkline` SVG, and `pulseCount` / `$totalCost`.
- **Metrics:** four `AnimatedMetric` (`PulseGridDeck.tsx:90`) count up from 0 via `useTweenedNumber` (rAF + `easeOutCubic`), gated on `useInView({ once:true })` AND `!useReducedMotion()`. Values are hardcoded targets (96.2%, 3.4s, $0.14, 12), not derived from the live `stats`.
- **Sparkline:** pure SVG `polyline` (`Sparkline.tsx`); `<2` points renders a dashed baseline.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/ObservabilityDeck.tsx` | One-line re-export of the deck index |
| `src/components/feature-sections/observability-deck/index.tsx` | Section shell: `SectionIntro`, `ModuleTag` rails, filter state, `PulseGridDeck` |
| `src/components/feature-sections/observability-deck/data.ts` | `agentPool`, `eventPool`, `colorPool`, `leftModules`/`rightModules`, `baseActivity` (dead) |
| `src/components/feature-sections/observability-deck/types.ts` | `ActivityRow` (dead-feed only), `OverviewModule` |
| `src/components/feature-sections/observability-deck/components/ModuleTag.tsx` | Filter-toggle tag button (icon + title + blurb) |
| `src/components/feature-sections/observability-deck/components/AnimatedMetric.tsx` | In-view, reduced-motion-gated count-up metric |
| `src/components/feature-sections/observability-deck/variants/PulseGridDeck.tsx` | Live deck: terminal chrome, metrics row, lanes, footer, pulse interval |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/AgentLane.tsx` | Per-agent lane: status dot, event pill, pulse chips, sparkline, totals |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/Sparkline.tsx` | `buildSparkline` + SVG `polyline` mini-chart |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/pulseEventMeta.ts` | `EVENT_META`: per-event icon / short label / brand color |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/pulseGridTypes.ts` | `EventType`, `Pulse`, `Stats`, `MAX_*` caps |
| `src/components/feature-sections/observability-deck/useActivityFeed.ts` | **Dead** — orphaned activity-feed hook, never imported |
| `src/components/feature-sections/observability-deck/components/ActivityFeed.tsx` | **Dead** — orphaned feed component, never imported |

## Data & state
- **Source:** fully simulated. `agentPool`/`eventPool`/`colorPool` (`data.ts`) seed random pulses generated client-side in `PulseGridDeck`. No real telemetry.
- **Stores:** local React `useState` only — `filterPrefix` in `index.tsx`, `stats: Stats` in `PulseGridDeck`. No Zustand, no Supabase, no context.
- **API routes:** none. (No `NEXT_PUBLIC_ORCHESTRATOR_URL`, no mockApi.)
- **Types:** `Pulse`, `Stats`, `EventType`, `MAX_PULSES_PER_AGENT`, `MAX_SPARKLINE` (`pulseGridTypes.ts`); `OverviewModule` (`types.ts`). `ActivityRow` exists but only feeds the dead `ActivityFeed`/`useActivityFeed` path.

## Integration points
- `src/app/features/page.tsx` — `StageSection id="observe"` renders `<LazyObservabilityDeck />`; nav anchor `{ label: "OBSERVE", href: "#observe" }`.
- `src/components/feature-sections/feature-lazy.tsx` — `LazyObservabilityDeck` (code-split, `ssr:false`).
- `@/components/SectionWrapper`, `@/components/primitives/SectionIntro`, `@/lib/animations` (`staggerContainer`).
- `@/components/TerminalChrome` — chrome bar; auto-shows a pause toggle if a `SectionPauseProvider` is in scope (none here, so hidden).
- `@/hooks/useTweenedNumber` — count-up tween for metrics.
- `@/lib/brand-theme` (`BRAND_VAR`) — all accent colors (emerald/cyan/purple/amber/rose/blue).
- `lucide-react` icons throughout.
- `data-tour-diagram="observe"` on the grid wrapper — hook for the guided tour.
- **Shared but NOT used here:** `CinematicBg.tsx` and `ContextHint.tsx` are imported by *other* feature sections; this deck references neither.

## Conventions & gotchas
- **Hardcoded English / i18n violation (the big one):** this section does NOT use `useTranslation()`. Every user-facing string is a literal — heading "See everything," + "miss nothing", the description, all `ModuleTag` titles/blurbs (`data.ts`), metric `label`/`trend` (`PulseGridDeck.tsx:90-93`), footer "Show all" / "Per-agent activity pulse" / "auto-refreshing", `TerminalChrome` title/status/info, the `short` event labels and `"idle"` fallback (`AgentLane.tsx:61`), and the Sparkline `aria-label="Duration trend"`. Breaks the mandatory 14-locale rule — none of this ships translated.
- **Dead code:** `useActivityFeed.ts` and `components/ActivityFeed.tsx` are never imported anywhere (only self-references); `baseActivity` (`data.ts:14`) and `ActivityRow` (`types.ts`) exist solely for that orphaned path. The live deck is the `PulseGridDeck`/`AgentLane` variant. Candidate for deletion.
- **Ungated infinite animation:** `AgentLane.tsx:40` runs a perpetual `opacity/scale` pulse with `repeat: Infinity` and no `useReducedMotion` short-circuit. `PulseGridDeck` gates its data interval and `AnimatedMetric`/`useTweenedNumber` self-gate, but the lane's looping dot keeps animating under `prefers-reduced-motion`. AgentLane imports no `useReducedMotion`.
- **Raw color literals (token violations):** `Sparkline.tsx:18` `stroke="rgba(255,255,255,0.12)"`; `AgentLane.tsx:56-57` fall back to `"rgba(127,127,127,0.3)"` and `"var(--muted-foreground, #888)"` (raw hex). Color-string concatenation like `${meta.color}28` / `${row.color}cc` assumes `BRAND_VAR` values are hex — they're CSS vars (`var(--brand-*)`), so the appended alpha suffix is invalid CSS and silently no-ops the intended transparency.
- **Low-opacity text:** several `text-foreground/60` usages sit right at the WCAG-AA lint floor; `divide-white/[0.04]` (`PulseGridDeck.tsx:89`) uses raw `white` rather than a semantic token.
- **Impurity in render-adjacent code is OK here:** `Math.random()`/`Date.now()`/`new Date()` live inside `setInterval`/event callbacks, not in render or `useMemo` factories — compliant with the React 19 purity rule.
- **`stats` keyed by display name:** lanes index `stats[agent]` by the human-readable agent string; duplicate names would collide. Fine for the fixed `agentPool`.
- **Metrics are decorative:** the four headline numbers are fixed targets, not aggregates of the streaming `stats` — they won't reconcile with the per-lane `pulseCount`/`$cost` a viewer might tally.

## Related docs
- [Security Vault](security-vault.md)
- [Feature index](../INDEX.md)
