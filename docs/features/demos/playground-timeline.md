# Pipeline Timeline Playground
> An example selector drives a staged orchestration pipeline that plays out left-to-right along a timeline track — stage cards light up active→done while a progress bar, elapsed/remaining clock, and stage counter track the run. · **Route:** `/preview/playground-timeline` (dev-only; not mounted on the public site) · **Status:** Live (demo section)

## What it does

A self-contained "watch an agent think" demo. The user picks one of four example prompts (Triage my Gmail, Review this PR, Summarize Slack, Optimize my schedule); the component then **simulates** that request flowing through a seven-stage pipeline — Input → Parse → Plan → Tool 1 → Tool 2 → Synthesize → Output. Each stage is a card laid out horizontally on a scrollable timeline track, joined by connector segments. As the simulation plays, the active stage glows cyan with a spinner and shimmer, completed stages turn emerald with a check, and not-yet-reached stages stay locked. A thin progress bar with a glowing comet head runs across the top of the panel, the connector between stages fills cyan→purple, and the panel footer counts elapsed time, an estimated remaining time, and `N/M stages`. The track auto-scrolls to keep the active card centered. A `1x`/`2x` speed toggle, plus `Reset` and (when finished) `Replay` controls, let the user re-run it. Everything is mock/scripted — no network calls.

## How it works

**Shell** (`index.tsx`). `PlaygroundTimeline` (default export) calls `usePipelineSimulation()` for all state and handlers, then composes a `SectionWrapper` → `SectionIntro` ("Execution / Pipeline") → `ExampleSelector` → a `TerminalPanel` whose header is a `TerminalChrome` (title `execution-pipeline`, status mapped from `phase`: `executing`/`complete`/`ready`, info = truncated active prompt), body = `PipelineProgressBar` + `TimelineTrack`, and footer = `PipelinePanelFooter` (`index.tsx:62-118`). Derived per-render values: `totalStages`, `doneCount` (count of `"done"` statuses), `progressPercent` (`elapsedMs/totalDurationMs`, clamped 0–100), `remainingMs` (`index.tsx:36-43`).

**Simulation** (`use-pipeline-simulation.ts`). The hook owns nine pieces of state: `activeExample` (index | null), `activeStageIdx`, `stageStatuses: StageStatus[]`, `phase`, `isRunning`, `speed` (`1 | 2`), `elapsedMs`, `totalDurationMs`. `runSimulation(exampleIdx, playbackSpeed)` validates the index (Sentry-reports once via `captureExceptionScrubbed` + a module-level `invalidIdxReported` latch if out of range, `:42-50`), clears any pending timers, fills all statuses to `"locked"`, sets `phase="running"`, then schedules **two `setTimeout`s per stage**: one at the cumulative delay to mark the stage `"active"` (and set `activeStageIdx`), one at `delay + duration` to mark it `"done"` — the last stage's done-timeout flips `isRunning=false`, `phase="done"`, and pins `elapsedMs` to total (`:81-115`). All timeout handles are pushed to `timeoutsRef`. A separate `setInterval` (50ms) updates `elapsedMs = min(now - start, total)` for the live clock and progress bar (`:75-77`). Speed is applied as `speedMultiplier = 1/playbackSpeed` against every delay/duration; `totalDurationMs` is the summed raw durations × multiplier (`:69-72`). `handleExampleClick` ignores clicks while running; `handleReplay` re-runs the current example; `handleReset` clears everything back to `idle`; `toggleSpeed` flips 1↔2 (note: it does **not** re-time a run already in progress — see gotchas). Cleanup runs `clearAll` on unmount (`:31`).

**Selector** (`ExampleSelector.tsx`). Maps `examples` to `ThemedChip`s (active = current index, disabled while running, brand-colored lucide icon per example). Trailing controls: a `Gauge` speed button showing `{speed}x`, a `Replay` button shown only when `phase === "done"`, and a `Reset` button shown whenever `phase !== "idle"` (disabled while running).

**Track** (`TimelineTrack.tsx`). When `phase === "idle"` it renders an empty-state placeholder (six dimmed stage icons + "Pick an example to watch the execution pipeline"). Otherwise it maps `activeExampleData.stages` to per-stage rows inside a horizontally-scrolling flex container (held via `scrollRef`). Each card mounts through an `AnimatePresence` with a spring entrance staggered by `idx * 0.06`; between cards a 2px connector animates its fill width to `100%`/`50%`/`0%` for done/active/locked.

**Stage card** (`StageCard.tsx`). A `motion.div` (with `layout`) that restyles by status: active → wider, cyan border/glow, looping radial-pulse + shimmer sweep; done → emerald (the final "output" card gets two expanding ring pulses on completion); locked → muted with a `Lock` icon. The status icon is `CheckCircle2` (done) / spinning `Loader2` (active) / `Lock` (locked) / the stage's own icon. The description paragraph animates open only for active/done stages.

**Progress bar** (`PipelineProgressBar.tsx`). Returns `null` while idle; otherwise a 1px track with a cyan→purple→emerald fill at `progressPercent` and, while running, a pulsing glowing comet dot at the fill head. **Has `role="progressbar"` + `aria-valuenow/min/max`** (`:17`).

**Footer** (`PipelinePanelFooter.tsx`). "Pipeline View" label + (running) `Stage X of N`, an elapsed clock and `~remaining` estimate (running), a `doneCount/totalStages` counter, and a `pipeline complete` badge when done.

**Reduced motion.** `reduced = useReducedMotion() ?? false` is computed once in the shell and threaded into `TimelineTrack`, `StageCard`, and `PipelineProgressBar`. It zeroes entrance/connector/description durations, suppresses the active-card shimmer/pulse and output ring-pulses and the comet dot, and switches the auto-scroll + track `scroll-behavior` from `"smooth"` to `"auto"` (`index.tsx:50-53`, `TimelineTrack.tsx:53`).

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/playground-timeline/index.tsx` | Section shell; composes selector + terminal panel (progress bar, track, footer); derives progress/counts; owns auto-scroll-to-active effect |
| `src/components/sections/playground-timeline/use-pipeline-simulation.ts` | All simulation state + `setTimeout`/`setInterval` scheduling, speed multiplier, Sentry-scrubbed index guard, reset/replay/toggle handlers |
| `src/components/sections/playground-timeline/data.ts` | `examples: ExamplePrompt[]` — four prompts, each with seven scripted stages (label, icon, description, timing string, duration ms) |
| `src/components/sections/playground-timeline/types.ts` | `TimelineStage`, `ExamplePrompt`, `StageStatus` (`locked`/`active`/`done`), `TimelinePhase` (`idle`/`running`/`done`) |
| `src/components/sections/playground-timeline/components/ExampleSelector.tsx` | Example chips + speed/replay/reset controls |
| `src/components/sections/playground-timeline/components/TimelineTrack.tsx` | Idle empty state; horizontal stage rows with staggered card entrance and animated connectors |
| `src/components/sections/playground-timeline/components/StageCard.tsx` | Per-stage card; status-driven styling, glow/shimmer/ring animations, status icon |
| `src/components/sections/playground-timeline/components/PipelineProgressBar.tsx` | Top progress fill + glowing comet head; `role="progressbar"` |
| `src/components/sections/playground-timeline/components/PipelinePanelFooter.tsx` | Stage counter, elapsed/remaining clock, "pipeline complete" badge |
| `src/app/preview/registry.ts:32` | Registers the `playground-timeline` slug for the dev-only `/preview/[section]` harness |

## Data & state
- **Source:** `data.ts` `examples` array (four `ExamplePrompt`s × seven hardcoded `TimelineStage`s; durations 400–900ms; `timing` strings like `+1.5s` are display-only labels, not used by the timer). **Stores:** none — all state is local to `usePipelineSimulation` (`useState`/`useRef`); no Zustand, no context. **API routes:** none — fully mocked/scripted; no fetch. **Types:** `TimelineStage`, `ExamplePrompt`, `StageStatus`, `TimelinePhase` (`types.ts`).

## Integration points

- **Render surface:** only the dev-only preview harness at `/preview/playground-timeline` (via `PREVIEW_REGISTRY`, `src/app/preview/registry.ts:32`), which `notFound()`s in production (`src/app/preview/[section]/page.tsx:15-17`). It is **not** in the public homepage `sections[]` — the homepage `#playground` slot mounts `LazyPlaygroundSplit`, the split-view variant, instead (`src/app/page.tsx:51`).
- **Shared primitives:** `SectionWrapper`, `SectionIntro`, `TerminalPanel`, `TerminalChrome`, `ThemedChip`, and `fadeUp` from `@/lib/animations`.
- **Sentry:** `captureExceptionScrubbed` from `src/lib/sentry-pii.ts` guards an out-of-range example index (defensive; unreachable from the UI since chips pass valid indices).
- **Icons:** `lucide-react` plus the local `Github` brand icon (`@/components/icons/brand-icons`).

## Conventions & gotchas

- **Not on the live site.** Despite "Live" status, `<PlaygroundTimeline/>` has no importer outside the preview registry; the homepage ships the *split* variant. Treat this as the timeline-flavored sibling reachable only at `/preview/playground-timeline` in dev. (A prior harness audit, `docs/harness/dev-experience-2026-05-02/FIXES-WAVE-2.md:19`, flagged this component as having "no importers at all.")
- **Hardcoded English strings.** The heading/description in `SectionIntro`, the empty-state copy "Pick an example to watch the execution pipeline" (`TimelineTrack.tsx:40`), all `data.ts` labels/descriptions/prompts, button labels ("Replay", "Reset"), and footer/chrome text are **not** routed through `useTranslation()` / `en.ts`. This violates the repo's i18n convention (every user-facing string in `src/i18n/en.ts`). Likely tolerated because the surface is dev-only — but if this is ever promoted to the public site, all of it must be extracted and hand-translated into 14 locales.
- **`toggleSpeed` doesn't retime a live run.** Changing `1x`↔`2x` only stores `speed`; it takes effect on the *next* `runSimulation` (the next example click or replay). The chip is disabled while running anyway, but the speed button is not, so toggling mid-run looks inert until the next run.
- **`elapsedMs` uses `Date.now()` deltas, not the scheduled total.** The 50ms interval clock and the stage timeouts are independent timers, so under tab-throttling/background-throttling they can drift apart (progress bar vs. which card is active). The final done-timeout hard-pins `elapsedMs = totalAdjusted` to resync at the end (`:105`).
- **Module-level `invalidIdxReported` latch.** The "report once" flag for the invalid-index Sentry call lives at module scope (`:8`), so it's shared across all mounts for the process lifetime — intentional (avoid spamming) but worth knowing it won't reset between component remounts.
- **Animation gating present and correct.** `index.tsx` imports `useReducedMotion` and threads `reduced` everywhere motion runs (satisfies `custom-animation/require-animation-gating`). No `requestAnimationFrame` is used — all motion is framer-motion or CSS/JS timers.
- **Accessibility is partial.** The progress bar is properly `role="progressbar"` with aria values, but stage status (active/done/locked) is conveyed via color + icon only; there is no `aria-live` region announcing stage transitions, so screen-reader users get no narration of the simulated progress.
- **`StageCard` ignores its `index` prop.** The prop is declared and passed but unused inside the card (`StageCard.tsx:7-18`); ordering/stagger is handled by the parent `TimelineTrack`.

## Related docs
- [Split-View Playground](playground-split.md)
- [Feature index](../INDEX.md)
