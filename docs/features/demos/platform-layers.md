# Growth Dial (Platform Layers)
> "Built to grow with you": one laptop, agents branching up out of it from 1 on Day 1 to 40 by Year 1, the four platform layers lighting as each stop needs them · **Route:** `/how` (third stage section, anchor `#platform-layers`) · **Status:** Live

## What it does
Tells the platform's four layers as time instead of a stack diagram. A single laptop (its screen
shows a keyring: your keys stay home) sits under faint dashed "seats" for every agent it will
ever run. A **scrubber** along the bottom has four stops - **Day 1 · One helper**, **Week 2 · A
chain**, **Month 3 · A team**, **Year 1 · A fleet** - and as it advances, agents branch up out of
the laptop ring by ring (1 -> 3 -> 12 -> 40), each newcomer stemming from the agent nearest it:

- **Week 2** - the first three helpers carry real tool marks (Gmail, Slack, GitHub) and cyan
  pulses run from the first helper to the other two: one event starts the next.
- **Month 3** - a purple prompt bubble types "Draft the weekly report" beside the newest agent:
  agents from plain words.
- **Year 1** - an amber watch sweep crosses the fleet from the laptop, and one far node flashes
  rose then comes back emerald with a "healed" tag.

A left-hand **ledger** shows the stop, its name, the agent count as a large gradient number, and
"What carries it": the four layers (Runs on your computer, One event starts the next, Agents from
plain words, Watches and heals itself), each lighting as the stop that leans on it is reached.
"Same laptop. No servers." stays beside the laptop at every stop. It autoplays; the play/pause
button, the drag/keyboard range and the stop labels all take over. On phones (under 64rem) the
same story is redrawn at phone size: the stop and its count as a headline, the laptop with a
taller, narrower fan of agents, the scrubber, and the four layers as a list underneath.

## How it works
**Entry.** `index.tsx:9` picks the layout with `useWide()` (`shared/useWide.ts`, a
`useSyncExternalStore` over `matchMedia("(min-width: 64rem)")`, server snapshot `true`): wide ->
`LayersGrowthDial` (`Main.tsx`); narrow -> `PhoneDial` (`PhoneDial.tsx`).

**Stop clock.** `useGrowth()` (`useGrowth.ts:13`, shared by both layouts) holds `stage` (0-3) and
`userPaused`. `useLoopGate(boxRef, { userStopped: userPaused })` (`:16`) gives `run` (on screen,
tab visible, motion allowed, not paused) and `still` (reduced motion). While `run`, a
`setTimeout` advances the stage every `STEP_MS` (3.8 s) and holds Year 1 for `HOLD_MS` (6.5 s)
before wrapping (`:24-28`; `geometry.ts:89-90`). Choosing a stop (scrubber, label) pauses
(`choose`, `:30`); play from Year 1 restarts at Day 1 (`toggle`, `:34`). Under reduced motion the
stage starts at, and is reset to, Year 1 with the prev-state pattern (`:17-22`).

**Geometry.** `grow()` (`geometry.ts:68`) builds one drawing around its `root`, the top centre
of the laptop screen: `WIDE` (1320 x 600, `:81`) and `NARROW` (640 x 560, a taller fan for
phones, `:84`). `build()` (`:31`) fans four `RINGS` (`:22`; 3, 9, 12, 16 seats, the first two
cyan/purple branded) over 18-162 degrees with the drawing's `sx`/`sy` squash, orders seats so the
first `COUNTS[k]` (`:7`) are the stops, and gives each node a `parent` (nearest node of the ring
below, or the laptop). `designed` and `healed` (`:73-74`) pick the Month 3 and Year 1 story
nodes. `W`, `H`, `ROOT`, `NODES`, `DESIGNED`, `HEALED` are the wide drawing's.

**Scene** (`Scene.tsx:17`, one `aria-hidden` SVG for drawing `g`) draws, back to front: growth
guides (`:38`), dashed seats for every future agent (`:51`), `WatchSweep` (`:65`), one stem per
node with `pathLength` 0/1 (`:67`), `ChainPulses` from Week 2 (`:80`), the `Node`s (scale/opacity
in by index, staggered for the newcomers; `:82`, `:92`), `HealFlash` (`:86`) and the `Laptop`
(`:87`).
Looping pieces live in `SceneParts.tsx` and go through `loopTransition(live, ...)`
(`src/lib/motion/loop-gate`). Tool marks are `SvgToolGlyph` (`shared/ToolGlyph.tsx:43`): an
alpha mask over a filled rect, so `/tools/*.svg` silhouettes take a themed colour.

**HTML layer.** `ArtBox` (`shared/Shell.tsx:35`) is an aspect-locked, `inline-size` container;
`frame(W, H)` (`:67`) returns `box()`, `u()` and `fs()` so the prompt bubble (`Main.tsx:40`),
"healed" tag (`:65`), "Same laptop" note (`:76`), `Ledger` and `Scrubber` are positioned and sized
in the drawing's units. `Scrubber` (`Scrubber.tsx:19`) layers an invisible native
`<input type="range" min=0 max=3>` (`:70`) over a gradient track and stop dots, with a visible
thumb that shows the range's focus ring (`peer-focus-visible`), plus the stop labels as buttons
(`:95`) and the play/pause button (`:40`).

**Phone layout.** `PhoneDial` (`PhoneDial.tsx`) runs the same `useGrowth` clock over the `NARROW`
scene: the stop (`when` / `what`, `text-2xl`) and the count (`text-6xl` gradient) as a headline
row (`aria-live="polite"`), the drawing with the prompt bubble (top, right-aligned to the
designed node) and a pilled "healed" tag, the "Same laptop" line, `PhoneScrubber`
(`PhoneScrubber.tsx`: 44px play button, the same invisible range over a pixel-sized track, the
`when` labels as buttons under the dots), and the layer list lighting as in the wide ledger.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/growth-dial/index.tsx` | Entry: wide -> dial, narrow -> phone dial |
| `src/components/sections/growth-dial/useGrowth.ts` | Stop clock + loop gate shared by both layouts (`stage`, `run`, `still`, `choose`, `toggle`) |
| `src/components/sections/growth-dial/Main.tsx` | Wide dial: prompt/healed/laptop labels, ledger + scrubber over the `WIDE` scene |
| `src/components/sections/growth-dial/PhoneDial.tsx` | Phone dial: headline row, `NARROW` scene with prompt/healed labels, scrubber, layer list |
| `src/components/sections/growth-dial/PhoneScrubber.tsx` | Phone scrubber: play/pause, range, stop buttons in pixel sizes |
| `src/components/sections/growth-dial/geometry.ts` | `grow()` -> `WIDE` (1320 x 600) / `NARROW` (640 x 560): root, nodes, story nodes, sweep reach; `COUNTS`, `RINGS`, timings, column/scrubber boxes |
| `src/components/sections/growth-dial/Scene.tsx` | SVG growth scene: guides, seats, stems, nodes |
| `src/components/sections/growth-dial/SceneParts.tsx` | `Laptop`, `stemPath`, `ChainPulses`, `WatchSweep`, `HealFlash` |
| `src/components/sections/growth-dial/Ledger.tsx` | Left column: stop, count, layer list (`aria-live="polite"`) |
| `src/components/sections/growth-dial/Scrubber.tsx` | Range input, stop labels, play/pause |
| `src/components/sections/growth-dial/shared/Shell.tsx` | `LayersShell` (section + intro), `ArtBox`, `frame()`, `StylisedTag` |
| `src/components/sections/growth-dial/shared/useWide.ts` | `useWide` (`min-width: 64rem`) |
| `src/components/sections/growth-dial/shared/layers.ts` | `LAYERS` (run/coordinate/design/monitor: brand + icon), `ToolId` |
| `src/components/sections/growth-dial/shared/ToolGlyph.tsx` | Masked tool marks: `ToolGlyph` (HTML) and `SvgToolGlyph` |
| `src/components/sections/how-lazy.tsx` (`:61-65`) | `LazyPlatformLayers` imports `growth-dial` (`ssr: false`, `SectionSkeleton`) |
| `src/app/how/page.tsx` (`:65-67`) | Mounts it in `StageSection id="platform-layers"` |

## Data & state
- **Source:** static geometry (`geometry.ts`) and `LAYERS`; copy in `howSectionsCopy.layers`
  (`src/i18n/en.ts`): `eyebrow`, `heading`/`headingGradient`/`headingTrailing`, `stylised`, and
  `v2` (`lede`, `artLabel`, `scrubLabel`, `play`/`pause`, `agent`/`agents`, `sameLaptop`,
  `ledgerLabel`, `prompt`, `healed`, `stops[4]` `{when, what}`, `layerLines` keyed by layer id).
  `layers.names` is typed and filled but unused. No fetch, no API routes.
- **State:** `stage`, `userPaused`, `prevStill` in `useGrowth`; the loop gate's verdict. No Zustand.
- **Assets:** `/public/tools/{gmail,slack,github}.svg`.

## Integration points
- **`/how`** - `StageSection id="platform-layers" glow="purple" fromColor="emerald"
  toColor="purple"` (`how/page.tsx:65`); scroll-map item `PLATFORM: LAYERS` (`:20`). The
  component's `SectionWrapper id="platform-layers"` (`Shell.tsx:16`) repeats the id.
- **Stage fit** - `SectionWrapper fit="fill" className="overflow-clip"`; `ArtBox` carries
  `data-stage-slot` / `data-stage-art` / `--art-ar` (`src/styles/stage.css`), so the drawing
  takes the height left under the intro without growing past it.
- **Loop gate** - `useLoopGate` (`src/hooks/useLoopGate.ts`) and `loopTransition`;
  `src/lib/motion/loop-gate.test.ts` scans `growth-dial` (no framer `useReducedMotion`, no bare
  `repeat: Infinity`, no private `IntersectionObserver`).
- **Shared** - `SectionIntro`, `BRAND_VAR`/`tint` (`src/lib/brand-theme.ts`), `lucide-react`.

## Conventions & gotchas
- **Replaced 2026-10-06** by the owner-picked winner of the /how prototype review ("Growth
  dial"). The previous scroll-spread layer stack (`src/components/sections/platform-layers/`:
  `Layer`, `LayerConnection`, `ConnectionPillar`, `StackLabels`, `visuals.tsx`) is deleted and
  lives in git history. The doc keeps its old filename and anchor.
- **i18n - English only, pending translation.** Copy is in `howSections` (`PENDING_TRANSLATION`);
  the 13 other locales fall back to English.
- **Phones get a phone-sized dial.** Below 64rem `PhoneDial` replaces the wide art (the old
  `CompactList` card stack is gone): same clock, same scene code over the `NARROW` drawing, all
  type in pixel sizes (16px reading, 12px labels; the scrubber shows only the `when` labels, the
  `what` is in the headline). The phone drawing's nodes are small (outer ring about 6px radius at
  390px), so the year-one fleet reads as a mass. `useWide` checks width only, so a wide but short
  window gets the wide dial without the stage fit. The wide `Ledger` and the phone headline row are
  each `aria-live="polite"`; only one layout is mounted at a time.
- **Reduced motion is Year 1, still.** Stage starts and rests at 3, every transition is
  `duration: 0`, `run` is false so nothing advances and the loops rest (the sweep parked at -44
  degrees, the healed ring shown, chain pulses parked mid-arc). All controls still work.
- **The ledger is a live region.** `Ledger` is `aria-live="polite"` (`Ledger.tsx:23`), so during
  autoplay a screen reader hears each stop change roughly every 4 s.
- **Ring guides follow the rings.** `Scene.tsx:38` draws the guides from `RINGS` and the
  drawing's `sx` / `sy`, so a ring change moves its guide too.
- **Unused exports.** The HTML `ToolGlyph` and the `notion`/`linear` members of `ToolId` have no
  caller in this folder.

## Related docs
- [Platform Command](platform-command.md)
- [How It Works page](../content/how-it-works.md)
- [Feature index](../INDEX.md)
