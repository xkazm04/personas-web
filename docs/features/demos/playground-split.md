# Split-View Playground
> The "Agent Mind" homepage demo as "Camera": pick a sample prompt in the script, and a camera travels through a lit space of beats (parse, select, tools, execute, verify, result) with subtitles, then pulls back as four outcome cards rise · **Route:** `/` homepage section (anchor `id="playground-split"`, scroll-map/navbar label "Agent Mind"; wrapped in `<div id="playground">`) · **Status:** Live (demo section, fully simulated)

## What it does

On the marketing homepage, the **"The Agent Mind"** section lets a visitor click one of four canned prompts, *Triage my Gmail*, *Review this PR*, *Summarize Slack*, *Optimize my schedule*, and watch the agent "think" across two panes laid out as a film:

- **Left, the script** (`prompt-editor`): the four sample prompts are the scenes. The one being played opens to its full sentence at reading size, with keywords picked out by a highlighter stroke once the agent has read them, the detected intent (e.g. `email_triage + auto_reply`) and the selected tools as chips. The prompts are locked while a run plays; a **Reset** chip appears when it is done.
- **Right, the camera stage** (`agent-mind`): a deep, lit space holding the pipeline laid on its side as a dolly track: **Parse Intent, Select Tools, (per-prompt tool nodes), Execute, Verify, Result**. The camera dollies from beat to beat, framing the one at work at display size and softening the rest (depth of field), with a drifting starfield behind it, a vignette, a mini-map showing the viewfinder, and an elapsed/remaining timer.
- **Lower third:** subtitles say the beat in plain words with the concrete thing it produced. When the run completes, the subtitles give way to **four outcome cards** rising into frame: **Message**, **Human review**, **Event emitted**, **Memory learned**. Each card shows only the dimension **label** at display size; the concrete result for the shown prompt is in screen-reader-only text (owner decision 2026-10-05: no truncated sentences).

The first prompt plays once on its own when the panel is half on screen (never under reduced motion). The whole thing is a scripted simulation: no model is called and nothing is sent anywhere.

## How it works

**Composition (`index.tsx`).** `PlaygroundSplit` calls `useMindRun(panelRef, 1.7)` (the `1.7` is the pace) and renders `SectionWrapper fit="fill" id="playground-split"`, `SectionIntro` from `t.playgroundSection`, and a `data-stage-slot` diagram `div` carrying `data-tour-diagram="agent-mind"`: a 2-col grid (`lg:grid-cols-[minmax(17rem,3fr)_minmax(0,7fr)]`) of `Script` and `CameraStage`. A `sr-only` `role="status"` announces running and done (`copy.srRunning` / `srDone`).

**Simulation (`shared/useMindRun.ts`).** The old timeline re-expressed as one step counter: the same six beats (`BEATS = parse, select, tools, execute, verify, result`), `STEP_DELAYS = [500,700,900,800,600,500]` stretched by `pace` (so beats run at 1.7x), the same active-then-done rhythm (`DONE_RATIO` 0.7), scheduled up front as `setTimeout`s held in `timers`. State: `activeExample`, `step`, `stepDone`, `phase` (`idle|running|done`), `startedAt`. It refuses to start while `document.hidden` or while running, aborts to idle if the tab hides mid-run (`usePageVisibility`), and autoplays example 0 once, 700 ms after `useInView(panelRef, { once: true, amount: 0.5 })`, unless reduced motion. It returns `statusOf(beat)`, `focus` (the running or last finished beat), `example`, `totalMs`, `start`, `reset`, plus `copy` (`t.playgroundSection`) and `lab` (`t.landingSections.agentMind`).

**Script (`Script.tsx`).** Four `aria-pressed` buttons (`disabled` while running, `run.start(i)`) each opening a panel (height animation, `duration: 0` when reduced) with `PromptText`, the intent line and tool chips (dimmed until their beat is reached). `shared/PromptText.tsx` tokenizes the prompt through `tokenizePrompt` from `components/SyntaxPrompt.tsx` (keyword regex over `SYNTAX_KEYWORDS`, longest-first, boundary lookarounds so `#142` matches) and sweeps a CSS `background-size` stroke under each keyword once `lit`.

**Camera (`CameraStage.tsx`, `world.ts`).** `world.ts` lays the plan out in world pixels (`WORLD` 1380 x 560; six columns; tool nodes stacked `TOOL_GAP` apart), with `worldNodes(run)`, `worldEdges`, `edgePath`/`edgePoints` and `cameraFor(run, nodes, w, h)`: the overview frames the whole track; while running, the camera frames the focused beat's nodes close (scale up to 1.2) with neighbours in the wings. `CameraStage` measures itself with a `ResizeObserver`, reserves the lower third (`27%`, or `40%` when done) and a 64px HUD, then animates one world `motion.div` (`x`, `y`, `scale`, 1.1 s ease; `duration: 0` when reduced) plus a far starfield layer at 0.3x for parallax, a key light tinted by the beat's brand, edges that draw in with `pathLength` and (only while `live`) a travelling dot, and a lens vignette. `WorldNode.tsx` is a lit disc with its name; distance from the focused beat sets blur/dim and `Check` on done. `Minimap.tsx` draws the plan in miniature with the camera's viewfinder.

**Lower third (`LowerThird.tsx`, `shared/beats.ts`).** `beats.ts` holds the per-beat brand and icon, tool/example accents, the four `DIMENSIONS` (messages, humanReview, events, memories) and `beatTitle` / `beatDetail` / `beatCaption`. While running the subtitle shows `n / 6 · title`, the caption from `t.landingSections.agentMind.beats[...]` and the detail line; when `done` it renders the four outcome cards (`aria-live="polite"` on the container).

**Run clock (`components/RunClock.tsx`).** `RunTimer` (and `RunProgressBar`) tick on their own 100 ms interval from `startedAt`, so a run re-renders only the timer, not the stage. `CameraStage` uses `RunTimer`.

**Data (`data.ts`, `types.ts`).** `EXAMPLE_BASES` (4 prompts: icons, intent ids, tool ids, emitted event) joined with `t.playgroundSection` by `localizeExamples(copy)` (`data.ts:89`); `SYNTAX_KEYWORDS`.

**Stage fit.** `fit="fill"`; the grid fills the slot height under the intro, the stage has `min-h-[420px]` below the desktop stage, and the world scales to the measured stage size.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/playground-split/index.tsx` | Section shell: intro, `data-tour-diagram="agent-mind"` slot, Script + CameraStage grid, sr-only status |
| `src/components/sections/playground-split/shared/useMindRun.ts` | Simulation: beats, timers, tab-hidden abort, in-view autoplay, `statusOf`, `focus` |
| `src/components/sections/playground-split/shared/beats.ts` | Beat/tool/example brands and icons, `DIMENSIONS`, `beatTitle/Detail/Caption` |
| `src/components/sections/playground-split/shared/PromptText.tsx` | Prompt with keyword highlighter sweep |
| `src/components/sections/playground-split/Script.tsx` | Prompt list (scenes), intent and tool chips, Reset |
| `src/components/sections/playground-split/CameraStage.tsx` | The moving camera, parallax, edges, HUD, timer, mini-map |
| `src/components/sections/playground-split/world.ts` | World layout, edges, `cameraFor` |
| `src/components/sections/playground-split/WorldNode.tsx` | One beat as a lit disc with depth of field |
| `src/components/sections/playground-split/Minimap.tsx` | Plan in miniature with the viewfinder |
| `src/components/sections/playground-split/LowerThird.tsx` | Subtitles, then four outcome cards (label visible, result sr-only) |
| `src/components/sections/playground-split/components/RunClock.tsx` | Self-ticking elapsed clock |
| `src/components/sections/playground-split/components/SyntaxPrompt.tsx` | `tokenizePrompt` keyword splitter (`SyntaxPrompt.test.ts` covers it) |
| `src/components/sections/playground-split/data.ts`, `types.ts` | Sample prompts, `localizeExamples`, `SYNTAX_KEYWORDS`, types |

## Data & state
- **Source:** 100% static. `EXAMPLE_BASES` plus `t.playgroundSection` (labels, prompts, tool names, node labels, results, dimension labels, status chrome) and `t.landingSections.agentMind` (`stylised`, `idleHint`, `illustration`, `beats`, ...). No fetch, no model, no Supabase.
- **State:** none in stores. `useMindRun` holds the run state and `timers`; `CameraStage` holds the measured size; `RunClock` holds its own clock.
- **API routes:** none.

## Integration points
- **Homepage mount.** `LazyPlaygroundSplit` in `src/components/sections/lazy.tsx` (`ssr: false`), third section in `src/app/page.tsx` with `gate: true` (`LazyMount`), inside `<div id="playground">`; the section's own id is `playground-split`.
- **Nav anchor.** `playground-split` is the registered landing-section id in `src/lib/constants.ts` with label "Agent Mind" (scroll-map dot and navbar target); `lib/landing-address.ts` maps it to address `concepts`.
- **Guided tour.** `data-tour-diagram="agent-mind"` is the spotlight hook; the tour clicks the Gmail example by its untranslated id, `[data-example-id="gmail"]` (`src/lib/tour-script.ts`), which `Script` puts on each example button from `ExamplePrompt.id` (kept by `localizeExamples`), so the click survives translating `t.playgroundSection`. Keep the attribute and the `gmail` id. See [guided-tour](../marketing/guided-tour.md).
- **Shared primitives:** `SectionWrapper`, `SectionIntro`, `fadeUp`, `BRAND_VAR`/`tint`, `useStillMotion`, `usePageVisibility`, `useIsVisible`.
- **Sibling demo:** [Pipeline Timeline Playground](playground-timeline.md).

## Conventions & gotchas
- **Replaced on 2026-10-05** by the winner of the landing review ("Camera"). The previous two-panel terminal (`PromptEditorPanel`, `AgentMindPanel` flowchart, `FlowNodeCard`, `ConnectionLine`, `ResultCapabilitiesList`, `use-playground-simulation.ts`) is in git history. `data.ts` still exports `RESULT_DIMENSIONS`, `buildFlowNodes` and `getStatusColor`, now unused.
- **Outcome cards show labels only.** Do not reintroduce the concrete result sentence as visible, truncated text; it stays in the `sr-only` span.
- **i18n, English-only for now:** `playgroundSection` and `landingSections` are in `PENDING_TRANSLATION`; the 13 other locales fall back to English. `SYNTAX_KEYWORDS` are English tokens, so a translated prompt will not highlight until they are localized.
- **Animation gating:** `useStillMotion` (via `useMindRun`'s `reduced`) zeroes the camera move, edge draws, panel and card entrances and disables autoplay; the camera's travelling dot and `WorldNode` loops run only while `live` (`useIsVisible(ref) && !reduced`).
- **Tab-background abort, not pause.** Timers are scheduled up front, so a hidden tab aborts to idle and the visitor re-triggers; `start` also refuses while `document.hidden`.
- **Timers and re-entry.** Every `setTimeout` goes into `timers` and is cleared on unmount, reset and abort; prompts are disabled while running, Reset shows only at `done`.
- **React 19 purity.** `Date.now()` only in callbacks and the clock interval, never in render; `setState` in the hidden-tab effect goes through a `setTimeout(…, 0)`.
- **Semantic tokens.** `border-glass-hover`, `text-foreground`, `text-muted-dark`, brand colours through `tint()` / `BRAND_VAR`; keep text opacities at or above `/60`.

## Related docs
- [Pipeline Timeline Playground](playground-timeline.md)
- [Visual Flow Composer & Playground](flow-composer.md)
- [Feature index](../INDEX.md)
