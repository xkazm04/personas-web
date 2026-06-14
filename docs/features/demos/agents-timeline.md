# Agent Execution Timeline Race
> An animated head-to-head that races a rigid Workflow against an intelligent Agent through the same scenario, step by step · **Route:** `/how` (first stage section) · **Status:** Live

## What it does
Pits two approaches against each other on the same real-world problem and lets you watch them run side by side. The top track ("Workflow") represents a rigid rule-based system; the bottom track ("Agent") represents an intelligent agent. Each track fills in its steps left-to-right behind a moving time cursor, with a live per-track race timer counting up in seconds. The Workflow reliably hits a step it has no rule for and dies with a red ✗ ("FAILED"); the Agent reasons through and finishes with a green ✓ ("RESOLVED"). When both finish, a result card under each track and a comparison summary appear, showing both total times and how much faster the Agent resolved (e.g. "40% faster"). Five scenarios — ambiguous email, split-payment refund, staging setup, batch error recovery, VIP legacy discount — auto-cycle every 6s; you can click a scenario chip, scrub via the progress-bar pills, replay, or pause. The takeaway, set by the heading "The Race Is Already Over", is that agents handle the messy edge cases workflows can't.

## How it works
The container `index.tsx` owns all timing and four pieces of `useState`: `activeIndex` (current scenario), `isPlaying`, `showResults`, and `paused`. Two `setTimeout` handles live in refs — `resultTimerRef` (the per-race animation clock) and `cycleTimerRef` (the auto-advance clock). `startAnimation` (`index.tsx:26`) flips `isPlaying` on, clears results, and schedules `showResults = true` / `isPlaying = false` after `ANIMATION_DURATION_MS` (4000ms). A `useEffect` keyed on `activeIndex` re-runs `startAnimation` on every scenario change, wrapped in `queueMicrotask` to keep the `setState` out of the effect body (React 19 rule). A second `useEffect` (`index.tsx:45`) schedules `advanceScenario` after `CYCLE_MS` (6000ms) — but bails entirely when `paused || prefersReduced`, so reduced-motion users never auto-cycle. A third effect clears both timers on unmount.

`TimelineRaceBody` renders two `RaceTrack`s (Workflow with `GitBranch`, Agent with `Sparkles`), a divider with a `Zap` node, and the `ComparisonSummary`. Each `RaceTrack` wraps `Track` in an `AnimatePresence mode="wait"` keyed on `wf-${id}`/`ag-${id}` so switching scenarios cross-fades the whole track. Inside `Track`, three things animate off `isActive` (`= isPlaying`): a `TimeCursor` (a vertical gradient line sweeping `left: 0%→100%` over `totalMs`), a progress bar growing `width: 0%→100%`, and the row of `StepBlock`s. Each `StepBlock` fades/slides in on a stagger (`delay = index * 0.35s`); error steps add a small shake (`rotate: [0,-1,1,-0.5,0]`) and workflow error steps draw an SVG jagged "broken" path. A terminal-style `RaceTimer` runs its own `requestAnimationFrame` loop measuring `performance.now()` elapsed against `durationMs`, rendering `Time: X.Xs`. Once `showResults` is true, each track's `ResultCard` and the two-column `ComparisonSummary` spring into view; the summary computes the "% faster" inline from `workflow.totalMs` vs `agent.totalMs`.

Note: the animation duration (4s) and per-track `totalMs` values (~1.6–3s) are independent constants — the timers and cursors run on `totalMs`, while the results gate fires on the fixed `ANIMATION_DURATION_MS`.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/agents-timeline/index.tsx` | Container: scenario state, race/cycle timers, reduced-motion gating, chips + controls layout |
| `src/components/sections/agents-timeline/data.ts` | The 5 scenarios + `CYCLE_MS` (6000) / `ANIMATION_DURATION_MS` (4000) constants |
| `src/components/sections/agents-timeline/types.ts` | `Scenario` and `TrackStep` interfaces |
| `src/components/sections/agents-timeline/components/TimelineRaceBody.tsx` | Lays out both tracks + divider + summary; wraps each `Track` in keyed `AnimatePresence` |
| `src/components/sections/agents-timeline/components/Track.tsx` | One track: time cursor, progress bar, step row, terminal-style finish marker, result card |
| `src/components/sections/agents-timeline/components/StepBlock.tsx` | A single step pill: status color/icon, staggered entrance, error shake + broken-path SVG |
| `src/components/sections/agents-timeline/components/RaceTimer.tsx` | rAF-driven elapsed-seconds counter per track |
| `src/components/sections/agents-timeline/components/ResultCard.tsx` | Per-track FAILED/RESOLVED outcome card (gated by `showResults`) |
| `src/components/sections/agents-timeline/components/ComparisonSummary.tsx` | Two-column totals + "Agent resolved N% faster" |
| `src/components/sections/agents-timeline/components/ScenarioTrigger.tsx` | Cross-fading "Scenario trigger" prompt card above the race |
| `src/components/sections/agents-timeline/components/TimelineControls.tsx` | Progress-pill scrubber + Replay / Pause-Resume buttons |
| `src/components/sections/how-lazy.tsx` | `LazyAgentsTimeline` dynamic import (`ssr: false`) |
| `src/app/how/page.tsx` | Mounts `<LazyAgentsTimeline/>` inside the first `StageSection` |

## Data & state
- **Source:** fully static, in-repo `scenarios` array in `data.ts` — no fetch, no orchestrator call, no mock-API call. **Stores:** none; all state is local `useState`/`useRef` in `index.tsx` (`activeIndex`, `isPlaying`, `showResults`, `paused` + two timer refs). Child `RaceTimer` holds its own `elapsed` state and rAF ref. **API routes:** none. **Types:** `Scenario` (`id`, `name`, `trigger`, and `workflow`/`agent` each `{ steps, totalMs, result }`) and `TrackStep` (`label`, `durationMs`, `status: "ok"|"warn"|"error"`) in `types.ts`.

## Integration points
- Wrapped by `SectionWrapper` (anchor `id="agents-timeline"`, the `AGENTS: TIMELINE` scroll-map target on `/how`) and `SectionIntro` for the heading/description. Uses `TerminalChrome` for the `agents-vs-workflows.race` window header (status `racing`/`complete`/`ready`) and `ThemedChip` for the scenario selector chips.
- Mounted only on `/how` via `LazyAgentsTimeline` in `how-lazy.tsx` (dynamic `import()` with `ssr: false`, `SectionSkeleton` fallback), placed in the first `StageSection` (`glow="cyan"`) in `src/app/how/page.tsx`. Far below the fold, so it client-hydrates lazily.
- Animations use `fadeUp` from `src/lib/animations.ts` and `framer-motion`; icons are `lucide-react`. Hover over the race panel sets `paused` (`index.tsx:103-104`).

## Conventions & gotchas
- **Copy is hardcoded English, not i18n.** The `SectionIntro` heading/gradient/description (`index.tsx:69-72`), the `aria-label` (`index.tsx:66`), the `TerminalChrome` title/status, the "Scenario trigger" / FAILED / RESOLVED / "Agent resolved N% faster" / "Race N of M" labels, and every `scenario.name`/`trigger`/step `label`/`result` string in `data.ts` are inline literals. None route through `useTranslation()` / `t.*`. This violates the repo's hard i18n rule (CLAUDE.md §1) — a localization pass must lift all of it into `src/i18n/en.ts` and the 13 other locales.
- **Does not use the shared `useAutoCycle` hook.** `index.tsx` hand-rolls its own `setTimeout`-based auto-advance (`index.tsx:45-54`) even though `src/hooks/useAutoCycle.ts` exists and its docstring explicitly names `AgentsTimeline` as one of the call sites it was meant to replace. The bespoke loop works but duplicates pause/reduced-motion logic the hook already centralizes; consider migrating.
- **Reduced-motion gating is partial.** The auto-cycle effect short-circuits on `prefersReduced` (`index.tsx:46`), `TimeCursor` returns `null` for reduced-motion users (`Track.tsx:18-19`), `StepBlock` drops its entrance to ~0.1s and skips the error shake/broken-path SVG (`StepBlock.tsx:51,57,73`), and `RaceTimer` jumps straight to `durationMs` instead of running the rAF loop (`RaceTimer.tsx:29-31`). **But** the per-track progress bar (`Track.tsx:88-99`), the finish marker spring (`Track.tsx:113`), `ResultCard`, `ComparisonSummary`, `ScenarioTrigger`, and the track cross-fade in `TimelineRaceBody` are **not** gated and still animate. `RaceTimer` correctly imports/uses `useReducedMotion` so the `custom-animation/require-animation-gating` lint rule (the only file here using `requestAnimationFrame`) is satisfied.
- **The "race" is choreographed, not measured.** Both tracks reveal on the same step stagger and the results gate fires after a fixed 4s regardless of each track's `totalMs`. The Agent always wins because the data says so — `workflow` always ends in `error` steps, `agent` always in `ok` steps. The displayed timer seconds (`totalMs/1000`) and the "% faster" figure are computed from the static data, not from real execution.
- **Two race chip UIs coexist.** The `ThemedChip` row at the top (`index.tsx:80-93`) and the progress-pill scrubber in `TimelineControls` both select scenarios and both set `paused = true` on click; the pills also show an auto-cycle progress fill. Keep their `onSelect` behavior in sync if you touch one.
- **`queueMicrotask` around `setState` is deliberate** (`index.tsx:42`, `RaceTimer.tsx:25,30`) — it keeps synchronous `setState` out of `useEffect` bodies per React 19 rules (CLAUDE.md §4). Don't "simplify" it back into a direct call.

## Related docs
- [Multi-Agent Chat](agents-chat.md)
- [Feature index](../INDEX.md)
