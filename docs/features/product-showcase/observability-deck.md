# Observability Deck
> "On the record": observability as an audit trail. Six agents feed one printer by cable; every run prints a line on a rising paper tape, failures and sign-offs are stamped on, and the day's statement keeps the totals · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Renders the `OBSERVE` deep-dive on `/features` under the heading **"See everything,
miss nothing"**. On the left, six agents (PR Reviewer, Email Triage, Slack Digest,
Deploy Monitor, Doc Indexer, Meeting Notes) are buttons, each wired by a coloured
cable into a printer. Out of the printer rises a paper tape: one line per run with the
time, the real tool it touched (GitHub, Gmail, Vercel, Slack, Sentry, Notion, Calendar,
Drive, Linear), what it did and what it cost. Failures, retries, approvals and
"needs you" moments are stamped onto their line as it comes out. On the right, **the
day's statement** keeps live totals as lines print: total spend, runs, failures caught,
sign-offs, and spend per agent.

Clicking an agent (or "All agents") isolates that agent's lines on the tape and
statement; the rest dim. Everything is stylised and simulated (a "Stylised" tag says so):
no live data, no API calls.

## How it works
`observe-record/index.tsx` (`ObservabilityDeck`) is a `SectionWrapper(fit="fill",
id="observe")` with `Intro` (heading from `observeSection`, lede `v3.lede`) and an
`ArtBox` (`shared/Stage.tsx`: `data-stage-slot` > `data-stage-art` with `--art-ar` =
1200/600 and `data-tour-diagram="observe"`, an inline-size container). Children are
positioned in viewBox units via `frame()`'s `place()`/`fs()`. Selection is
`useState<number | null>` (agent index) in `index.tsx`; the three layers get
`clock` and `agent`.

**One monotonic clock.** `useClock(ref, REST_S)` (`shared/motion.ts`) is a framer
`MotionValue` of seconds that runs (a linear 3600 s tween) only while
`useLoopGate(ref)` allows (in view, tab foregrounded, motion allowed); pausing keeps the
time; under reduced motion it rests at `REST_S` = 12.98 steps (13 lines printed, stamps
in view). Everything else is derived from it in `log.ts`: `paperPos` (paper advance, a
line prints in `PRINT` = 35% of a `STEP_S` = 1.7 s step), `printed` (lines out so far),
`stepOf`, `sumLines` (totals over the endless looping log), `lineTime` (09:02 + 6 min per
line).

- `FleetCables.tsx`: the printer SVG, a cable per agent with a light running down the
  cable of the agent whose line prints next, the agent buttons (`aria-pressed`, glow while
  their line is printing) and the "All agents" button.
- `Tape.tsx`: two copies of the 16 `LINES` stacked so the loop is seamless, moved by
  `paperPos`; `STAMP` colours per stamp kind with a scale-in "slam"; a mask fades the top.
- `Statement.tsx`: count-up stat tiles and per-agent spend bars from `BASE` offsets
  (196 runs, 2 failures, 3 approvals) plus `sumLines` of printed lines and each agent's
  `baseSpend`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/observe-record/index.tsx` | Section shell, clock + agent selection, layer composition |
| `observe-record/log.ts` | Geometry (`W/H`, `FLEET`, `TAPE`, `PRINTER`, `STATEMENT`), `AGENTS`, the 16-line `LINES` log, clock arithmetic |
| `observe-record/FleetCables.tsx` | Agent buttons, cables, printer, "All agents" |
| `observe-record/Tape.tsx` | Rising paper tape with lines and stamps |
| `observe-record/Statement.tsx` | Day's statement: totals and per-agent spend |
| `observe-record/shared/Stage.tsx` | `Intro`, `ArtBox` (tour anchor), `frame()`, `StylisedTag`, `ToolMark` (masked `/tools/*.svg`) |
| `observe-record/shared/motion.ts` | `useClock`, `usePlay`, `beat`, `seeded` (some unused here) |
| `src/hooks/useLoopGate.ts` | Run/tick gate (visibility, tab, reduced motion) used by `useClock` |
| `src/components/feature-sections/observability-deck/types.ts` | Only survivor of the old deck folder: `AgentId` type imported by `log.ts` |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyObservabilityDeck` imports the folder (`:35-39`) |

## Data & state
- **Source:** static. Geometry, agents and the stylised log in `log.ts`. Words:
  `observeSection.heading|headingGradient` and `observeSection.agents.*` (older namespace,
  reused) plus `featuresSections.observe` (`stylised`, `v3.lede|artLabel|allAgents|printer`,
  `v3.statement.*`, `v3.stamps.*`, `v3.lines.*`) in `src/i18n/en.ts`. Tool names are file
  names under `public/tools`, not copy.
- **State:** the `clock` MotionValue and the selected agent index; no Zustand, no fetch, no
  API routes.

## Integration points
- `LazyObservabilityDeck` (`ssr: false`) in `<StageSection id="observe" glow="emerald">` +
  `<LazyMount stage minHeight={820} label="Observe">` (`src/app/features/page.tsx:96-100`);
  scroll-map `OBSERVE` -> `#observe` (`page.tsx:49`).
- Guided tour step `id: "observe"` (`src/lib/tour-script.ts:253`) scrolls to `#observe` and
  spotlights `[data-tour-diagram="observe"]` (the `ArtBox`).
- Mirrors the desktop/dashboard activity, executions and analytics surfaces conceptually.

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous
  implementation (`observability-deck/` pulse-grid deck: `PulseGridDeck`, `AgentLane`,
  `ModuleTag`, `AnimatedMetric`, `data.ts`) is in git history. Only `types.ts` remains in
  that folder, and `ActivityRow`/`OverviewModule` in it are dead; `AgentId` is the one live
  export. Moving it next to `log.ts` would let the folder go.
- **i18n - English-only for now.** `observeSection` and `featuresSections` are in
  `src/i18n/pending/` (PLAN M22); the other 13 locales fall back to English. Unread leftovers:
  `observeSection.description|modules.*`, `featuresSections.observe.v1|v2`.
- **Motion gating.** The printer clock is an ambient loop gated by `useLoopGate` (off-screen,
  hidden tab, reduced motion all stop it). Reduced motion rests on `REST_S`, a full tape with
  stamps visible; DOM shape is constant. Per-frame text (times, totals) is written through
  `MotionValue`s, so React does not re-render on each tick.
- **Seamless loop.** `Tape` renders two stacked copies of `LINES` (`copy` -1 and 0) with
  absolute line numbers derived from the clock, so times keep increasing across laps; keep
  `LINES.length` (`N`) and `LH` consistent with `TAPE.h`.
- **Colour.** Agent colours are `BRAND_VAR` tokens; no raw hex. The "Stylised" tag marks the
  data as illustrative, not a screenshot.
- **Accessibility.** The printer SVG is `role="img"` with `v3.artLabel`; agent and "All
  agents" buttons expose `aria-pressed`; tape text keeps >= `/70` opacity.

## Related docs
- [Security Vault](security-vault.md)
- [Feature index](../INDEX.md)
