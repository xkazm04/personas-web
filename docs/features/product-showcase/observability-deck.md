# Observability Deck
> Live "pulse-grid" terminal that streams simulated agent telemetry — per-agent lanes, event pulses, sparklines, and count-up metrics. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Renders the `OBSERVE` deep-dive on `/features` (`StageSection id="observe"`, emerald glow). A terminal-chrome card ("observability-deck", status `streaming`) shows four count-up summary metrics, one lane per agent in `agentPool` (ids `prReviewer`, `emailTriage`, … shown as PR Reviewer, Email Triage, Slack Digest, Deploy Monitor, Doc Indexer, Meeting Notes), and a footer toggling between `Per-agent activity pulse` and a `Show all` filter-clear button. Eight `ModuleTag` buttons flank the grid (4 left, 4 right) — Executions, Messages, Events, Memories / Activity, Health, Analytics, Knowledge. Clicking a tag toggles a `filterPrefix` (e.g. `execution`) that filters the pulse icons shown in every lane; clicking the active tag again, or the footer button, clears it. Everything is mock/simulated — no live data, no API calls.

## How it works
- **Mount:** `ObservabilityDeck.tsx` re-exports `observability-deck/index.tsx`. Loaded via `LazyObservabilityDeck` (`feature-lazy.tsx`, `createLazySection`, `ssr:false`) so the chunk hydrates only when scrolled near.
- **Filter state:** `index.tsx:15` holds `filterPrefix` in `useState`; `handleTagClick` (`index.tsx:17`) toggles it. Passed down to `PulseGridDeck` and reflected in `ModuleTag` `active` styling.
- **Pulse simulation:** `PulseGridDeck.tsx:83` runs a `setInterval` (jittered `900 + Math.random()*700` ms). Each tick picks a random agent/event/duration/cost, builds a `Pulse`, and updates `stats` immutably — capping `pulses` at `MAX_PULSES_PER_AGENT` (6) and `durations` at `MAX_SPARKLINE` (12), accumulating `totalCost`/`pulseCount`. The interval is gated by `useLoopGate(rootRef)` (`PulseGridDeck.tsx:67`): it starts only while `tick` is true — deck on screen, tab visible, motion allowed — so it no longer runs for the life of the page. Under reduced motion `staticSnapshot()` supplies a populated end-state during render (`:76`) and the chrome/footer read "snapshot".
- **Per-lane render:** `AgentLane.tsx` derives, via `useMemo`, the `filterPrefix`-filtered pulse list, a reversed sparkline (`buildSparkline`), and the latest pulse's `EVENT_META` (icon/short/color). It shows a pulsing status dot, a "latest event" pill, an animated row of pulse chips (`AnimatePresence`), a `Sparkline` SVG, and `pulseCount` / `$totalCost`.
- **Metrics:** four `AnimatedMetric` (`PulseGridDeck.tsx:134-137`) count up from 0 via `useTweenedNumber` (rAF + `easeOutCubic`), gated on `useInView({ once:true })` AND `!useReducedMotion()`. Values are hardcoded targets (96.2%, 3.4s, $0.14, 12), not derived from the live `stats`.
- **Sparkline:** pure SVG `polyline` (`Sparkline.tsx`); `<2` points renders a dashed baseline. Its `aria-label` is passed in (`t.observeSection.durationTrend`).
- **Stage fit (desktop):** the section is `SectionWrapper fit="min"`, and the tags + deck grid carries `data-stage-fixed` (`index.tsx:40`) — a fixed-pixel composition that zooms as a whole by viewport-height tier (0.68–1.35, `src/styles/stage.css`) so it fits one screen. The deck panel is an almost-opaque `bg-background/95` (no `backdrop-blur-xl`).

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/ObservabilityDeck.tsx` | One-line re-export of the deck index |
| `src/components/feature-sections/observability-deck/index.tsx` | Section shell (`fit="min"`): `SectionIntro`, `ModuleTag` rails, filter state, `PulseGridDeck`; `data-stage-fixed` grid |
| `src/components/feature-sections/observability-deck/data.ts` | `agentPool` (`AgentId[]`), `eventPool`, `colorPool`, `leftModules`/`rightModules` (icon, `id`, colour, `filterPrefix`), `baseActivity` (dead) |
| `src/components/feature-sections/observability-deck/types.ts` | `AgentId`, `OverviewModule` (both keyed into `observeSection`), `ActivityRow` (dead) |
| `src/components/feature-sections/observability-deck/components/ModuleTag.tsx` | Filter-toggle tag button (icon + title + blurb from `t.observeSection.modules[id]`) |
| `src/components/feature-sections/observability-deck/components/AnimatedMetric.tsx` | In-view, reduced-motion-gated count-up metric |
| `src/components/feature-sections/observability-deck/variants/PulseGridDeck.tsx` | Live deck: terminal chrome, metrics row, lanes, footer, `useLoopGate`-gated pulse interval |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/AgentLane.tsx` | Per-agent lane: status dot, event pill, pulse chips, sparkline, totals |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/Sparkline.tsx` | `buildSparkline` + SVG `polyline` mini-chart |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/pulseEventMeta.ts` | `EVENT_META`: per-event icon / brand color (short label is `t.observeSection.eventShort[type]`) |
| `src/components/feature-sections/observability-deck/variants/pulse-grid-deck/pulseGridTypes.ts` | `EventType`, `Pulse`, `Stats`, `MAX_*` caps |

## Data & state
- **Source:** fully simulated. `agentPool`/`eventPool`/`colorPool` (`data.ts`) seed random pulses generated client-side in `PulseGridDeck`. No real telemetry. Copy (heading, description, module titles/blurbs, agent names, metric labels, status words, event short labels, footer) is the `observeSection` namespace of `src/i18n/en.ts`.
- **Stores:** local React `useState` only — `filterPrefix` in `index.tsx`, `stats: Stats` in `PulseGridDeck`. No Zustand, no Supabase, no context.
- **API routes:** none. (No `NEXT_PUBLIC_ORCHESTRATOR_URL`, no mockApi.)
- **Types:** `Pulse`, `Stats`, `EventType`, `MAX_PULSES_PER_AGENT`, `MAX_SPARKLINE` (`pulseGridTypes.ts`); `AgentId`, `OverviewModule` (`types.ts`). `ActivityRow` is only used by the dead `baseActivity` constant.

## Integration points
- `src/app/features/page.tsx` — `StageSection id="observe"` renders `<LazyObservabilityDeck />` inside `LazyMount minHeight={820}` (`:90-94`); nav anchor `{ label: "OBSERVE", href: "#observe" }` (`:47`).
- `src/components/feature-sections/feature-lazy.tsx` — `LazyObservabilityDeck` (code-split, `ssr:false`).
- `@/components/SectionWrapper`, `@/components/primitives/SectionIntro`, `@/lib/animations` (`staggerContainer`).
- `@/components/TerminalChrome` — chrome bar (title, traffic-light dots, status).
- `@/hooks/useTweenedNumber` — count-up tween for metrics.
- `@/hooks/useLoopGate` — on-screen + tab-visible + motion-allowed gate for the feed interval.
- `@/lib/brand-theme` (`BRAND_VAR`) — all accent colors (emerald/cyan/purple/amber/rose/blue).
- `lucide-react` icons throughout.
- `data-tour-diagram="observe"` on the grid wrapper (`index.tsx:39`) — hook for the guided tour.

## Conventions & gotchas
- **i18n — migrated, English-only for now.** All copy lives in `t.observeSection` (agents and modules are keyed by id; `EVENT_META` keeps only icon/colour). Left in code on purpose: the chrome title `observability-deck`, metric trend strings (`+2.1%`, …) and numbers. `observeSection` is listed in `PENDING_TRANSLATION` in `en.ts`, so the 13 other locales fall back to English until it is translated.
- **Dead code:** `baseActivity` (`data.ts:14`) and `ActivityRow` (`types.ts`) are exported but imported nowhere (the activity-feed hook/component they fed are gone). The live deck is the `PulseGridDeck`/`AgentLane` variant. Candidate for deletion.
- **Lane status dot is reduced-motion-gated but not visibility-gated:** `AgentLane.tsx:40-49` loops an `opacity/scale` pulse (`repeat: Infinity`) whenever the lane has a latest pulse and framer's `useReducedMotion` is false. The feed interval stops off screen (`useLoopGate`), but a lane that already has pulses keeps its dot looping while scrolled away.
- **Raw color literals (token violations):** `Sparkline.tsx:17` `stroke="rgba(255,255,255,0.12)"`; `AgentLane.tsx:58-60` fall back to `"rgba(127,127,127,0.3)"` and `"var(--muted-foreground, #888)"` (raw hex). Color-string concatenation like `${meta.color}28` / `${row.color}cc` assumes `BRAND_VAR` values are hex — they're CSS vars (`var(--brand-*)`), so the appended alpha suffix is invalid CSS and silently no-ops the intended transparency.
- **Low-opacity text:** several `text-foreground/60` usages sit right at the WCAG-AA lint floor; `divide-white/[0.04]` (`PulseGridDeck.tsx:133`) uses raw `white` rather than a semantic token.
- **Impurity in render-adjacent code is OK here:** `Math.random()`/`Date.now()`/`new Date()` live inside `setInterval`/event callbacks, not in render or `useMemo` factories — compliant with the React 19 purity rule.
- **`stats` keyed by display name:** lanes index `stats[agent]` by the human-readable agent string; duplicate names would collide. Fine for the fixed `agentPool`.
- **Metrics are decorative:** the four headline numbers are fixed targets, not aggregates of the streaming `stats` — they won't reconcile with the per-lane `pulseCount`/`$cost` a viewer might tally.

## Related docs
- [Security Vault](security-vault.md)
- [Feature index](../INDEX.md)
