# Design Engine
> A "blueprint" drawing sheet on which one typed sentence becomes the machine an agent runs as, decided across the app's eight real dimensions, then test-run and stamped ready to deploy · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
The Design Engine is the opening section of the `/features` page and carries its
promise, *"One sentence. One matrix."* A sentence ("Triage my Gmail inbox and
draft replies for urgent emails.") is typed at the top of an engineering drawing
sheet. Personas then draws the agent that sentence describes as a machine:
schedule clock, the agent core with its task written inside, Gmail and Slack
plugs, a memory tank, a review gate, a message bubble, an events mast and an
error loop. Each part starts as faint dashed construction lines and is inked in
its dimension's colour at the moment Personas decides it, with a leader line to
an annotation saying what was decided and whether it came from **your words**,
**a question** or **Personas' inference**.

Personas asks only two questions (how often to run, whether to approve drafts
first), shown as real answer buttons; if the visitor does nothing it takes the
suggested answer. When all eight dimensions are decided, one email test-runs the
finished machine (through the review gate, into a message, out as an event) and
the title block is stamped **Ready to deploy**. A **replay** button runs it again.

The drawing follows the answers. **Real-time webhook** swaps the schedule clock
for a hook; **Auto-send** leaves the review gate as construction lines marked *not
needed* and the email goes straight through; **Ask only for urgent** runs two
emails, a routine one that passes and an urgent one that waits while the gate
opens. Once the sheet is stamped, both asked callouts show their options as a
small segmented control: re-answering re-inks only the changed part and replays
only the test run (about 5 s), not the whole 36 s build.
The section also hosts the page's guided-tour launcher.

## How it works
`design-blueprint/index.tsx` (`DesignBlueprint`) is a `SectionWrapper(fit="fill",
id="design")` (`:46`) holding `DesignIntro` (heading, lede, `TourLauncher
tourId="features"` bridging to `/demo?tour=1`) and a `data-stage-slot` around the
art box (`:48-52`). The art box is `data-stage-art` with `--art-ar` = `AR` (a
1000 x 435 drawing, `geometry.ts`) and `containerType: inline-size`, so every size
is in `cqw` (`u(n)` = `n/10 cqw`); on the stage `src/styles/stage.css`
(`[data-stage-art]`, ~`:94`) fits it to the height left under the intro. It
carries `data-tour-diagram="design"` (`:52`).

Layers inside the box: an SVG (`SheetGrid`, `Parts`, and `TestRun`, always mounted and shown once `done`),
`Band` (the brief line, which turns into the question + answer buttons while a
dimension is `asking`), the replay button, the core's task text, connector
`ToolMark` plugs, one `Callout` per non-task dimension (`CALLOUTS` geometry), a
"test run" caption and the `TitleBlock` with the stamp (`Sheet.tsx`).

**Clock.** `shared/useBuildClock.ts` is a `useReducer` stepping through `STEPS`
(`geometry.ts:61`, built by `makeTimeline` in `shared/timeline.ts`): `type` ->
`read` -> per dimension `engage` [-> `ask`] -> `resolve` -> `finale`. `ask` steps
exist only for `ASKED` (`triggers`, `review`); they wait for `answer()` or time
out after 5.6s and keep the suggestion. The clock arms once when the art is 35%
on screen (`ARM_RATIO`) and ticks only while in view and the tab is foregrounded
(`usePageVisibility`). `dimPhase()` derives each dimension's `pending | engaged |
asking | resolved` phase from the step index; `valueOf()` (`shared/copy.ts`)
returns the visitor's answer instead of the default.

**Machine.** `shared/machine.ts` is pure: `machineFor(answers)` returns the origin (`clock` or `webhook`), the gate (`none`,
`hold` or `urgent-only`) and each part's state (`drawn`, `omitted` or `swapped`), and `runScript(machine)` -> the test-run tokens as
named stops (`origin|webhook`, `core`, `gate-hold`, `gate-open`, `messages`, `mast`).
`geometry.ts` maps them onto the sheet: `STOP_AT` (x, y, time per stop),
`runPoints(machine)` -> per-token keyframe `Track`s (two tokens share the finale in
lanes), `gateWindow(tracks)` -> when the door lifts. Option indices live in
`TRIGGER`/`REVIEW` and must stay in step with `designMatrix.questions.*.options`.

`Parts.tsx` + `paths.ts` ink each part (stroke, then soft fill) from the machine:
`ALT_PATHS` holds the webhook hook (`triggers`) and the straight-through pipe
(`review` bypass); both glyph sets are always in the DOM and only their ink moves.
`TestRun.tsx` is the finale (`RUN_MS` 4.2s) driven by `runPoints`: tokens travel the
pipe, the gate door lifts only when a token waits, the memory tank fills a little,
the tokens leave from the mast.

**Revising.** The reducer is `clockReducer(steps)` in `shared/timeline.ts` (node
tests reach it without React). `REVISE` applies only when `at === steps.length`:
it sets the answer, jumps to the `finale` step and bumps `run` (TestRun re-keys on
it); a full Replay also bumps `build`, which is what the typed sentence re-keys on
(`Band run={clock.build}`). `useBuildClock().revise` dispatches `REVISE` with
motion and plain `ANSWER` under reduced motion or while `document.hidden` (a
user-started re-run never starts unseen), so the parts re-ink in place and the
finale shows its end pose. `Callout` renders the control (`role=group`, `aria-pressed`
chips, full option as accessible name) for `triggers`/`review`, always in the DOM;
`offered` (= `stamped`) drives only opacity, pointer-events and `inert`. An
`aria-live` line announces the rebuilt answers.
`shared/Sentence.tsx` types the sentence and highlights the keywords that drove
decisions.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/design-blueprint/index.tsx` | Section shell + art box composition; per-dimension phases; core task text; `data-tour-diagram="design"` |
| `design-blueprint/geometry.ts` | Sheet coordinates (`W`, `H`, `AR`, `CLOCK`, `CORE`, `GATE`, `TANK`, `CALLOUTS`, ...), `u()` cqw helper, `STEPS` pacing, test-run keyframes |
| `design-blueprint/paths.ts`, `Parts.tsx` | SVG paths per part; inking, fill and leader-line animation |
| `design-blueprint/Band.tsx` | Brief line that becomes the question; answer buttons (`aria-label` marks the suggested one) |
| `design-blueprint/Callout.tsx` | Per-dimension annotation (label + source, decision when resolved); `LABEL_SIZE`/`VALUE_SIZE`/`textInk` |
| `design-blueprint/Sheet.tsx` | `SheetGrid` (grid, registration corners) and `TitleBlock` ("Ready to deploy" stamp) |
| `design-blueprint/TestRun.tsx` | Finale: the answers' machine test-run (one email, or routine + urgent) |
| `design-blueprint/shared/machine.ts` | `machineFor`, `partState`, `runScript`: the machine as a pure function of the two answers (tests: `machine.test.ts`) |
| `design-blueprint/shared/dims.ts` | The eight `DIMS` (key, desktop `cell`, theme-token ink, source `said/asked/inferred`, connector marks) and `ASKED` |
| `design-blueprint/shared/timeline.ts`, `useBuildClock.ts` | Step list, phase derivation, `clockReducer` (incl. `REVISE`), view/visibility-gated clock, answers, revise, replay |
| `design-blueprint/shared/copy.ts` | `useDesignCopy()` joins `designMatrix` + `featuresSections.design` into `DimCopy[]`; `valueOf` |
| `design-blueprint/shared/DesignIntro.tsx` | Heading, lede, `TourLauncher` |
| `design-blueprint/shared/Sentence.tsx`, `DecisionText.tsx`, `ToolMark.tsx`, `ReplayButton.tsx` | Typed sentence with keyword highlighting, decision text, masked brand marks (`public/tools/*.svg`), replay button |
| `src/app/features/page.tsx` | Mounts it directly (`:30` import, `:68-70` inside a `StageSection`) |

## Data & state
- **Source:** static. Dimension identities in `shared/dims.ts`, in the desktop app's
  `ALL_CELL_KEYS` order (use-cases, connectors, triggers, human-review, memory,
  error-handling, messages, events; here under the live section's keys, each with
  its desktop `cell`). The order is pinned to `src/lib/product-facts/desktop-facts.json`
  (generated by `scripts/sync-desktop-facts.mjs`) by `desktopFacts.test.ts`; the build
  order (`STEPS` in `geometry.ts`) is a separate pacing choice. Words: `designMatrix`
  (heading, `userPrompt`, `cells.<key>.label/value`, `questions.triggers|review`)
  reused from the older section, plus `featuresSections.design` (`artLabel`,
  `persona`, `yourSentence`, `ready`, `replay`, `asks`, `suggested`, `sources`,
  `keywords`, `v2.lede/sheet/stylised/testRun`, `revise.*`: `change`, `notNeeded`,
  `routine`, `urgent`, `testRunTwo`, `rebuilt`, `short.triggers|review` chip labels). No fetch, no API routes.
- **State:** local only - `useReducer(clockReducer(STEPS))` in `useBuildClock` (`at`,
  `run`, `build`, `answers`, `userPlayed`, `revised`) plus an `inView` flag. No Zustand.
- **Default answers:** `PICKED` in `shared/copy.ts` (`triggers` 0, `review` 1),
  mirrored by `DEFAULT_ANSWERS` in `shared/machine.ts` - change both together.

## Integration points
- First section after the murmuration hero on `/features`; statically imported
  (not lazy) for LCP/SEO.
- `#design` is the first scroll-map target of the page; the id sits on the
  `SectionWrapper` (`index.tsx:46`), keep it there.
- `data-tour-diagram="design"` lets the product tour spotlight the art; the
  `features` `TourLauncher` lives in `DesignIntro` (not in `InfoPageLayout`) so the
  first stage clears the fold.
- Depends on `SectionWrapper`, `SectionHeading`, `GradientText`,
  `fadeUp`/`staggerContainer`, `useStillMotion`, `usePageVisibility`, `fillTemplate`.

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous
  implementation (`DesignEngine.tsx`, the 3x3 persona matrix with `RadiateOverlay`,
  and its `public/imgs/features/matrix/*.png` Leonardo backgrounds, now deleted) is
  in git history.
- **i18n - English-only for now.** `designMatrix` and `featuresSections` are both in
  `src/i18n/pending/` (PLAN M22); the 13 other locales fall back to
  English. `featuresSections.design` still carries review-era keys nothing reads
  (`v3.*`, `reading`, `decided`); only the keys listed above are used.
- **Motion gating.** Under `useStillMotion()` the clock reports the final step, so
  reduced-motion visitors get the finished, stamped sheet with no choreography (the
  IntersectionObserver also skips ARM under the media query). Replay sets
  `userPlayed`, because pressing it is a request for motion. DOM shape is constant
  (opacity/transform only), so SSR and the first client render agree. The clock
  stops off-screen and with the tab hidden. `TestRun` is always mounted (it used to
  mount on `done`, which flipped DOM shape between the server frame and a
  reduced-motion client); `shown`/`running` gate its animate props only.
- **Colour.** Inks are theme tokens (`--brand-*`, `--status-info`, `color-mix`), so
  every site theme recolours the sheet; no raw hex. Small labels use `textInk()` to
  lift contrast.
- **Sizing.** All type is `cqw` with `max(px, cqw)` floors; the drawing is a fixed
  1000 x 435 coordinate space - change `geometry.ts` constants together (parts,
  callouts, leaders, `STOP_AT`).
- **Revision chips are tight.** The segmented control sits inside the 70-unit
  callout box at `max(10px, 1cqw)`; on a narrow art box the `px` floors can push it
  past the box. The short labels (`revise.short`) exist for that reason.
- The title block carries a "stylised drawing" disclosure (`v2.stylised`); keep it,
  the sheet is an illustration, not a screenshot.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Feature index](../INDEX.md)
