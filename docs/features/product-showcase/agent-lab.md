# Agent Lab
> An interactive tabbed showcase for refining personas — Chat, Arena, Evolution, and Eval — each tab one channel of a single bench instrument. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
"The Lab" is the `/features` section that pitches the four ways Personas helps you improve an agent. A pill-style tab switcher picks one of four channels on one **bench instrument**: every tab is a readout in the same bezel (channel chip, title, live readouts, a phosphor screen, bench keys along the bottom), so switching tabs changes what the instrument measures, never its shape.

- **CH1 · Chat — Signal tuner.** The urgent-flag rate over the last 48 hours is a trace on a scope. Beside it an operator log plays the scripted refinement chat; each applied diff re-sweeps the trace at a lower, tighter level, the pre-refinement reading stays as a dashed ghost, and the 8–12% benchmark band is the calibration window. When the replay is measured (31% → 9.2%, in band) the footer answers "Want me to promote this?" with **Activate v4.3** (or "v4.3 is live") beside **replay**.
- **CH2 · Arena — Dual-channel compare.** Versions A and B (ids from the version ledger) are two traces of their six dimension scores per input. Each of five rounds acquires, then locks: the means appear as cursors, the margin is bracketed and the loser falls back to a ghost. A round register below latches each winner and margin; pressing a cell jumps to that round. The live version carries a **Live** tag.
- **CH3 · Evolution — Fitness strip chart.** A sweep cursor walks generations G0–G5 like a pen recorder: the fitness envelope (weakest to fittest per generation) and the best lineage (amber) are written up to it; other survivors are emerald points, culled versions are struck out. Nodes the ledger names carry their version id. **re-sweep** restarts the pass.
- **CH4 · Eval — Meter bank.** Six analogue meters (Accuracy, Clarity, Tone, Latency, Cost, Safety): each needle is the live version's score, the engraved tick is the reference version's, and the lit arc between them is the delta. Activating another version on the rail swings every needle.

Under the tab panel sits the **version rail** ("Versions & ratings"): one chip per version (v4.2 live, v4.3 experimental), each showing its **Rating**, its **Δ vs baseline**, and **Activate** / **Pin as baseline** actions. Activating a version moves the LIVE beacon to it; activating the previous one is the rollback. It mirrors the desktop Lab's Versions & Ratings table (personas repo `docs/features/personas/README.md` "Lab — the Versions & Ratings table", `LabVersionsTable.tsx` `REGRESSION_DROP = 5`, `lab.rs` `lab_activate_version` demoting the old production version to `experimental`) and claims nothing more: no Breed/Evolve action (descoped from the desktop UI), no model column.

All data is fabricated demo content — nothing fetches. It is a marketing showcase, not the real lab tooling.

## How it works
`Lab.tsx` is a one-line re-export of `./lab/index`. `index.tsx` holds the section's two pieces of state: `active: LabTab` (`useState<LabTab>("chat")`, `index.tsx:17`) and the **version ledger** (`useReducer(ledgerReducer, undefined, initialLedger)`, `index.tsx:21`; lazy initializer, so the first render is pure). It renders `SectionIntro`, the `TabSwitcher` (`index.tsx:50`), the bench inside a `motion.div` keyed by `active` so each switch cross-fades (opacity + y, 0.35s, `index.tsx:56-64`), and the `VersionRail` (`index.tsx:67`). Switcher, bench and rail are wrapped in `data-tour-diagram="lab"` (`index.tsx:46`) so the guided tour spotlights them together (`src/lib/tour-script.ts:309`).

`bench/index.tsx:16-21` routes `active` to one channel: `ChatBench` (gets `ledger` + `dispatch`), `ArenaBench`, `EvolutionBench`, `EvalBench` (ledger only). The props type is `BenchProps` (`bench/types.ts`). The ledger (`ledger.ts`, pure TS) is the single root every version id and rating projects from: Chat's Activate dispatches `{ type: "activate", id: REFINED_VERSION }` from a click (`bench/chat/ChatBench.tsx:84`); Arena reads `arenaContenders(ledger)`; Evolution marks the ledger's nodes and the live one; Eval reads `ledger.liveId`. No channel dispatches from an effect. Ratings are never typed: each rail row's rating is `round(mean)` of its arena side in `ARENA_ROUNDS` (locked by `ledger.test.ts`), and the arena's per-input profiles, the eval scores and the genome fitness all come from one experiment matrix (`experiment.ts`, locked by `experiment.test.ts`).

**Shared parts (`bench/parts/`).** `Frame` is the bezel (channel chip, title, `Readout`s, `Swatch` legend items, `BenchKey` buttons; fills the stage slot via `stage:h-full`). `Screen` is an inset glass pane drawing an SVG in its own measured pixels (`useScreenBox`: a ResizeObserver, with a fixed `FALLBACK_BOX` for server and first paint) under a 10 × 8 graticule. `Trace` draws a phosphor line by path length (bloom + core). `Ticker` is a mono numeral that counts to its value. `useBenchClock` is the step clock: a `setTimeout` re-armed per step while `running`, so a pause leaves the reading on screen and resuming continues from it; `canStart()` refuses a visitor-started replay on a hidden tab.

**Per channel.** Each `*Bench` takes `{ run, still }` from `useLoopGate(ref)` (`src/hooks/useLoopGate.ts`: in view + tab foregrounded + motion allowed) and feeds `run` to its clock:
- **Chat** (`bench/chat/`): `signal.ts` holds the figures the script speaks (`BEFORE_PCT` 31, `AFTER_PCT` 9.2, `TARGET` 8–12), a seeded (mulberry32) zero-mean wiggle so server and client agree, and step timing from the `CHAT_SCRIPT` delays. The clock runs once (`loop: false`); `ChatScope` draws the trace for `diffsApplied(step)`; `ChatLog` lays every entry out (constant DOM) and scrolls its own pane, never the page.
- **Arena** (`bench/arena/`): `arena.ts` gives two beats per round (acquire 1.5s, lock 2.7s), `profile(versionId, round)` from the experiment matrix, and `tally`. `ArenaScope` draws both traces; `RoundStrip` is the clickable round register (`onPick` jumps the clock to that round's lock).
- **Evolution** (`bench/evolution/`): `strip.ts` projects `GENOME_NODES` through `genome.ts` (`bestLineage`, `genomeSummary`) into the lineage, the per-generation envelope and the node → version map; `StripChart` writes up to the cursor; `NodeMark` places each node by transform with its `nodeTone`.
- **Eval** (`bench/eval/`): `EvalBench` reads `evalDimensions(LEDGER_NODE[liveId], EVAL_BASELINE_NODE)`; `Meter` springs its needle to the score and quivers while `run`. An `sr-only` list repeats every score for assistive tech.

`genome.ts` (pure TS): `bestLineage` walks `parent` links from the best node (the `best` flag, else the fittest survivor) to the root, stopping at a dangling parent or a cycle; `nodeTone` maps each node to exactly one legend entry (`lineage` / `alive` / `culled`); `genomeSummary` derives the header (deepest gen, best fitness, rounded gain vs the lineage root). Locked by `genome.test.ts`.

`TabSwitcher` maps `TABS` (`data.ts`) to buttons carrying `data-lab-tab={key}`; the active button gets a coloured glow from the tab's `BRAND_VAR` colour, and a mono blurb line shows the active tab's blurb. Labels hide below `sm` (icon-only on phones).

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/Lab.tsx` | One-line re-export of `./lab/index` |
| `src/components/feature-sections/lab/index.tsx` | Section root: `active` tab + version ledger, `SectionIntro`, switcher, keyed cross-fade around `<Bench>`, rail, tour anchor |
| `src/components/feature-sections/lab/bench/index.tsx` | Routes the active tab to its channel (`ChatBench` / `ArenaBench` / `EvolutionBench` / `EvalBench`) |
| `src/components/feature-sections/lab/bench/types.ts` | `BenchProps` (`active`, `ledger`, `dispatch`) |
| `src/components/feature-sections/lab/bench/parts/Frame.tsx` | Bezel shared by every channel, plus `Readout`, `Swatch`, `BenchKey` |
| `src/components/feature-sections/lab/bench/parts/Screen.tsx` | Phosphor screen: measured SVG box, graticule, glow filter |
| `src/components/feature-sections/lab/bench/parts/Trace.tsx` | Path-length-drawn phosphor trace |
| `src/components/feature-sections/lab/bench/parts/Ticker.tsx` | Counting mono numeral (`useStillMotion`: jumps to the value under reduced motion) |
| `src/components/feature-sections/lab/bench/parts/useBenchClock.ts` | Step clock (re-armed timeout) + `canStart()` |
| `src/components/feature-sections/lab/bench/parts/useScreenBox.ts` | ResizeObserver content box with an SSR-stable fallback |
| `src/components/feature-sections/lab/bench/chat/` | `ChatBench`, `ChatScope` (trace), `ChatLog` (operator log), `signal.ts` (figures, seeded noise, timing) |
| `src/components/feature-sections/lab/bench/arena/` | `ArenaBench`, `ArenaScope` (two traces), `RoundStrip` (round register), `arena.ts` (beats, profiles, tally) |
| `src/components/feature-sections/lab/bench/evolution/` | `EvolutionBench`, `StripChart`, `NodeMark`, `strip.ts` (lineage, envelope, sweep timing) |
| `src/components/feature-sections/lab/bench/eval/` | `EvalBench`, `Meter` (one dial per dimension) |
| `src/components/feature-sections/lab/data.ts` | `TABS`, `CHAT_SCRIPT`, and the matrix projections `ARENA_ROUNDS`, `GENOME_NODES`, `EVAL_DIMENSIONS`, `EVAL_SAMPLE_RUNS` |
| `src/components/feature-sections/lab/experiment.ts` | The one experiment matrix (version × input × dimension) every figure derives from; `LEDGER_NODE`, `EVAL_BASELINE_NODE`, `arenaRounds`, `evalDimensions`, `genomeNodes` |
| `src/components/feature-sections/lab/ledger.ts` | Version ledger: `initialLedger`, `activate` (exactly one `production` row), `setBaseline`, `deltaVsBaseline`, `isRegression` (drop >= 5), `arenaContenders`, `ledgerReducer`, `REFINED_VERSION` |
| `src/components/feature-sections/lab/genome.ts` | Genome projections: `bestNode`, `bestLineage`, `nodeTone`, `genomeSummary` |
| `src/components/feature-sections/lab/components/TabSwitcher.tsx` | Pill tab row + active glow + blurb line |
| `src/components/feature-sections/lab/components/VersionRail.tsx` | Version chips + LIVE beacon (shared `layoutId`, `useStillMotion`-gated) + Activate / Pin as baseline; `aria-live` "{version} is live" |
| `src/components/feature-sections/lab/types.ts` | `LabTab`, `TabDef`, `ChatMsg`, `Round`, `GenomeNode`, copy-key types |
| `src/components/feature-sections/lab/*.test.ts` | `ledger.test.ts` (one-production invariant, rollback, rail-vs-arena ratings), `experiment.test.ts` (matrix agreement), `genome.test.ts` (lineage, tones, header), `still-motion.test.ts` (no framer `useReducedMotion` anywhere in the context) |
| `src/i18n/pending/labSection.ts` | English-only pending copy for the section; its `bench` key holds the instrument vocabulary |

## Data & state
- **Source:** Static module literals — no fetch, no Supabase, no orchestrator. `CHAT_SCRIPT` (7 msgs) lives in `data.ts`; arena rounds, genome nodes and eval dimensions are projected from `experiment.ts`. No images: the bench draws everything in SVG.
- **Stores:** None (no Zustand). Section state is `active` + the ledger reducer (`index.tsx`). Each channel keeps only its clock step (`useBenchClock`); everything else is derived per render from the step and the ledger. The keyed `motion.div` remounts the channel on a tab switch, so a channel restarts its clock each time it is shown.
- **API routes:** None.
- **Copy:** `labSectionCopy` from `src/i18n/pending/labSection.ts` (owner-approved English-only pending namespace), plus `t.labVersions.*` for the rail and the Live / Activate / "is live" strings the channels share with it.

## Integration points
- **Mount.** Lazy-loaded as `LazyLab` (`src/components/feature-sections/feature-lazy.tsx:41`, `createLazySection(..., SectionSkeleton, { ssr: false })`) and placed in `src/app/features/page.tsx:102-106` inside `<StageSection id="lab" glow="cyan" …>` wrapped by `<LazyMount stage minHeight={820} label="Lab">`.
- **`SectionWrapper`.** Renders inside `SectionWrapper fit="fill" id="lab"` (desktop stage: at least one viewport high, content centred — `src/styles/stage.css`; the section is not yet fitted to one screen); the `SectionIntro` block is wrapped in a `whileInView` `staggerContainer` (`once: true`). `TabSwitcher` self-drives its own `whileInView fadeUp` reveal rather than inheriting.
- **Guided tour.** `data-tour-diagram="lab"` (the spotlight target, `tour-script.ts:309`) and `data-lab-tab={key}` on each button let the tour highlight the diagram and click tabs. The vision-grid card `id="lab"` (`src/components/sections/vision-grid/data.ts:59`) links to a guide topic, not here; the tour clicks it via `[data-card-id="lab"]` (`tour-script.ts:244`).
- **Shared libs.** `SectionWrapper`, `SectionIntro` (`@/components/primitives`), `staggerContainer`/`fadeUp` from `@/lib/animations`, `BRAND_VAR` from `@/lib/brand-theme`, `lucide-react` icons.

## Conventions & gotchas
- **Version rail is localized; the rest is pending.** The rail and the strings it lends the channels read `t.labVersions.*` (all 14 locales). Everything else reads `labSectionCopy`, an English-only pending namespace by owner decision (see `docs/features/platform/internationalization.md`). Translating it means moving the namespace into `en.ts` + the 13 locales and deleting the module. The version ids (`v4.2`, `v4.3`) and the applied diffs in the chat are data/config text, not copy.
- **Rail contract.** Keep the ledger the only place a version id or rating is written: a channel that shows a version must read it from the ledger, not re-type it. The tour clicks `data-lab-tab` buttons only; the rail adds no tour target (`data-lab-version` on each chip is for tests/inspection).
- **Motion gating.** Every loop goes through `useLoopGate` (reduced motion via `useStillMotion`, plus in-view and tab visibility), so each clock stops off-screen and on a hidden tab, and under reduced motion each channel rests on its finished reading: Chat shows the whole run, Arena the last locked round (or the one picked), Evolution the full chart, Eval still needles. Visitor-started replays (Chat replay, Evolution re-sweep) refuse to start while `document.hidden` (`canStart`). The reduced-motion flag only changes props, never DOM shape. `lab/still-motion.test.ts` pins "no framer `useReducedMotion`" across the context's `filePaths` in `context-map.json`, so keep that list accurate.
- **Hydration.** Screens render at `FALLBACK_BOX` on server and first paint, then the ResizeObserver callback commits the measured size; the chat signal's noise is seeded, never `Math.random`.
- **Tokens.** Colours come from `BRAND_VAR` / `tint` (`@/lib/brand-theme`) and semantic Tailwind tokens; text stays at or above the `/60` opacity floor.
- **Desktop stage:** the section is `fit="fill"`; below the tab switcher one `data-stage-slot` holds the bench and the Versions & Ratings rail side by side (rail 21rem). Every channel's `Frame` fills the slot, so all four tabs are the same height and switching never shifts the page; screens measure the space they get. Off the stage (phones, tablets) the bench and rail stack and each channel sets its own height.

## Related docs
- [Plugin Ecosystem](plugin-ecosystem.md)
- [Feature index](../INDEX.md)
