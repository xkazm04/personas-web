# Self-Healing Circuit
> A "run circuit" of one agent run (schedule, agent, Gmail/Slack/Notion, report) in which a different failure breaks a trace each cycle and gets the fix the desktop app really applies; the expired login is stopped and handed to you · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
An auto-playing, also clickable, diagram of the "fixes itself when things break"
story. It draws one agent run as a circuit board: a schedule starts the agent, the
agent works through three real connectors (Gmail, Slack, Notion), and they feed a
report. Each cycle breaks one trace and walks four stages, with a run log beside the
board writing one line per stage: **Detect** (red spark), **Diagnose** (amber scan),
**Fix** (the failure's own remedy) and **Back on track** (green seal).

The four failures are the ones the app genuinely handles differently:
- **Rate limit** (Slack): waits 30 s, then retries.
- **Timeout** (Notion): retries with twice the time limit.
- **Overloaded** (Claude): resumes in 10 min, mid-run, nothing lost.
- **Expired login** (Gmail): no retry; the run stops and "waiting for you" is
  shown, because only a person can renew it. The downstream trace starves and the
  seal is a rose person glyph instead of a green check.

Visitors can pick any failure from the pill buttons in the card header. Retried
cases show "Retry 1 of 3" and a "Logged for the Overseer" note.

## How it works
`healing-run-circuit/index.tsx` (`HealingCircuit`) builds the card: header with the
title, a "Stylised" disclosure and the failure picker (`role="group"`, `aria-pressed`
buttons); the board + `RunLog` grid (`data-tour-diagram="healing"`, `role="img"`,
`index.tsx:94`); and the `Stepper` footer. It is wrapped in `HealingSection`
(`shared/HealingSection.tsx`), a `SectionWrapper(fit="fill", id="healing-circuit")`
with the heading, lede and a `data-stage-slot`. The art is sized in `em` from the
stage slot's height (`stage:[font-size:clamp(14px,min(100cqh/29.5, 100cqw/59),26px)]`),
so it always fits one viewport.

**Loop.** `shared/useStepLoop.ts`: `useLoopGate(ref)` returns `running = !still &&
visible` (`useStillMotion` + `useIsVisible`, threshold 0.25; `useIsVisible` also covers
the backgrounded tab), and `useStepLoop(LOOP, stepMs, running, FINAL_STEP)` re-arms one
`setTimeout` per step. A step is `caseIndex * PHASES + phase`; `PHASES = 5`
(running, detect, diagnose, fix, done) with per-phase durations in `geometry.ts`
(`PHASE_MS` 1.5/1.9/2.1/2.7/3.0 s), `LOOP = V1_CASES.length * PHASES`. Clicking a
case sets the step to that case's detect phase (or its final phase when still).

**Board.** `Board.tsx` draws `TRACES`/`NODES` from `geometry.ts` (760 x 400 viewBox).
`BREAKS[caseId]` names the broken trace, the chip it hurts and the break point.
`phaseColor()` gives the stage colour (rose/amber/cyan/emerald; rose stays for the
escalated login from the fix phase on). `Trace` draws halo + core + data packets
(dashed and still while open), `Chip` draws the chip (real logo from `/tools/*.svg`
via `TOOL_ICON`), and `BreakFx` renders the per-phase effect, with a distinct `Fix`
animation for each case and a `Seal` at the end.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/healing-run-circuit/index.tsx` | Card composition, case picker, step -> case/phase derivation, log lines |
| `healing-run-circuit/shared/cases.ts` | `CaseId`, `CASE_IDS`, `CASE_COLOR`, `isEscalated`, `TOOL_ICON`, `fill()`; header comment cites the app's retry rules (`core/src/healing.rs`) |
| `healing-run-circuit/shared/HealingSection.tsx` | Section frame: `id="healing-circuit"`, heading from `featuresSections.healing`, lede, stage slot |
| `healing-run-circuit/shared/useStepLoop.ts` | `useLoopGate` (still + visibility) and the self-re-arming `useStepLoop` |
| `healing-run-circuit/geometry.ts` | `NODES`, `TRACES`, `V1_CASES`, `BREAKS`, `PHASES`, `stepMs`, `LOOP`, `FINAL_STEP`, `BRAND_LABEL` |
| `healing-run-circuit/Board.tsx` | SVG assembly, `phaseColor`, which trace/chip is hurt |
| `healing-run-circuit/Trace.tsx`, `Chip.tsx`, `BreakFx.tsx` | Trace + packets, chip, per-case fix/seal effects |
| `healing-run-circuit/RunLog.tsx`, `Stepper.tsx` | Log beside the board; Detect/Diagnose/Fix/Done progress strip |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyHealingCircuit` imports the folder (`:17-21`) |

## Data & state
- **Source:** static. Geometry/cases in the files above; every word in
  `featuresSections.healing` (`src/i18n/en.ts`: `heading`, `headingGradient`,
  `stylised`, `overseerNote`, `retry`, `cases.<id>.{name,error,diagnosis,fix,result,note}`,
  `stages`, and `v1.*` = lede, artLabel, title, casesLabel, schedule, agent, report, log,
  healthy). No fetch, no API.
- **State:** a local step counter (`useStepLoop`); `still` / `running` flags. No Zustand.
- **Fidelity to the app (2026-10):** rate limit = `RetryWithBackoff` (30 s doubling,
  max 5 min); timeout = `RetryWithTimeout` (2x limit); overloaded = `RetryAt` +10/20/30 min
  and resumes the session; broken setup = AI healing on Claude Opus; credential = issue,
  never retried; retryable categories escalate to an issue after 3 retries.

## Integration points
- `LazyHealingCircuit` (`feature-lazy.tsx`, `ssr: false`), mounted in
  `<StageSection id="healing-circuit" glow="emerald" fromColor="purple" toColor="rose">`
  + `<LazyMount stage minHeight={760} label="Healing">` (`src/app/features/page.tsx:78-82`).
  Scroll-map entry `HEALING` -> `#healing-circuit` (`page.tsx:46`).
- `data-tour-diagram="healing"` lets the product tour spotlight the board.
- Uses `@/lib/brand-theme` (`BRAND_VAR`, `tint`), `useStillMotion`, `useIsVisible`,
  `SectionWrapper`, `SectionHeading`, `GradientText`.

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous
  implementation (`HealingCircuit.tsx` with its "Current"/"Overnight" switcher,
  `healing-circuit/` circuit board with `useHealingCycle`, `.overnight*` files) is in
  git history.
- **i18n - English-only for now.** Copy is in the pending `featuresSections.healing`
  namespace; other locales fall back to English until it is translated. The namespace
  still holds review-era keys nothing reads (`v2.*`, `v3.*`); `setup` exists in `cases`
  and `CaseId` but is not in `V1_CASES`, so it is never shown.
- **Duplicate anchor id.** `id="healing-circuit"` is set on both the page's
  `StageSection` and the section's `SectionWrapper` (`HealingSection.tsx`), so the
  document has two elements with that id.
- **Motion gating.** Reduced motion (`still`) shows `FINAL_STEP`: the first failure,
  healed - a static frame of recovery rather than an all-green board. Markup is
  constant (only values gate), so SSR and hydration agree; clicking a case in still
  mode jumps to that case's final phase. The loop stops off-screen and with the tab
  hidden. Effects use `transformBox: "view-box"` with pixel origins so they scale with
  the SVG.
- **Colour.** Brand colours go through `BRAND_VAR`/`tint` (theme tokens), not raw hex.
- **Font-size scaling.** Everything inside the card is `em`; do not add `px` sizes or
  the stage fit breaks.
- **Brand names** on the chips (Gmail, Slack, Notion, Claude) are proper nouns in
  `BRAND_LABEL`, not translated copy.
- Retuning cadence: `PHASE_MS` and the `Fix`/`Seal` effect durations in `BreakFx.tsx`
  are independent; change them together.

## Related docs
- [Trigger System](trigger-system.md)
- [Feature index](../INDEX.md)
