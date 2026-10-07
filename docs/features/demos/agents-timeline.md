# Off the Rails (Agents Timeline)
> A stylised contour map where a fixed-rules train stalls on the scenario's snag while the agent's route draws around it, through four labelled waypoints, to the flag · **Route:** `/how` (first stage section, anchor `#agents-timeline`) · **Status:** Live

## What it does
Answers "why an agent and not a workflow?" with one picture. On a dotted contour map, a
**request** (cyan pin, with the customer's words on a card top-left) and a **destination flag**
(emerald, top-right) are joined by a straight **railway**. Halfway along it sits the scenario's
**snag**: a barrier with fallen rocks and a rose label naming the problem ("Two requests in one
email", "Paid with two cards", ...).

- **Fixed rules** are a train. It leaves first and runs fast, brakes into the snag, puts its
  hazard lights on, and a rose **stall clock** starts turning beside it with the cost ("waits 47
  minutes for a person.", "147 good payments undone.").
- **The agent** leaves at the same moment as an emerald route that bends around the snag. It
  draws leg by leg behind a glowing marker, lighting four **waypoints**, the steps it took
  ("Reads the whole message", "Spots the real request", ...), and reaches the flag, which flares;
  the result ("Address updated.") appears top-right under "Done".

Five scenarios (ambiguous email, split payment refund, staging setup, error recovery, VIP legacy
discount) play in turn. Chips above the map pick one, and the active chip's underline fills with
the story clock. **Replay** restarts the current one. A "Stylised" tag marks the art as designed,
not a screenshot.

## How it works
**Story clock.** `useStory` (`shared/motion.ts:48`) owns one framer `MotionValue` `p` that runs
0 -> 1 linearly over `DURATION` (10 s, `data.ts:10`) once the art is 30% in view (`useInView`,
`:52`). The animation is restarted on every `index:run` key change (`:63-82`) and paused/played
when `halted` (off-screen or hidden tab via `useIsVisible`, or the unused `paused` option)
changes (`:84-89`). When a run completes, `doneKey` marks it done; if nobody has picked a
scenario, the next one plays after `hold` (3.5 s, `index.tsx:25`; `motion.ts:91-97`).
`choose(i)` (`:99`) sets the index, bumps `run` and latches `picked`, which turns auto-advance off
for good. `replay` (`:104`) only bumps `run`.

**Everything reads `p`.** No component holds its own timer; all motion is `useTransform(p, ...)`
over windows of the story, using `seg(p, a, b)` (`motion.ts:25`):
- **Train** (`Movers.tsx:13`) - `trainAt(p)` (`data.ts:59`) eases the train over `TRAIN = [0.03,
  0.27]` to `STOP_T` (0.4 of the rail, short of the snag at `SNAG_T` 0.5) with a short decaying
  jolt; hazard lights blink after 0.27; the stall clock fades in over 0.29-0.33 and its hand turns
  through the rest of the story.
- **Route** (`Movers.tsx:65`) - five Catmull-Rom `legs` (`track()`, `data.ts:33`) through the
  start, the four waypoints and the end; each `Leg` (`Movers.tsx:44`) draws its `pathLength` over
  `legWindow(i)` (0.165 each from `AGENT_GO` 0.05, `data.ts:20-25`) and lights its waypoint as it
  lands; the marker follows `markerAt(p)` (`:52`). `ARRIVE` is 0.875.
- **Map** (`Map.tsx`) - `Terrain` (`:11`, contour ellipses from the track's `contours`) is
  static; `Railway` (`:24`) draws sleepers and rails, the snag barrier (with a rose glow that hits
  when the train stops, `:27`) and the start/end markers, plus the arrival flare (`:28-29`).
- **Labels** (`Labels.tsx:35`) - an HTML layer over the SVG: request card (`:45`), legend
  (`:58`), snag label (`:69`), stall note (`:75`), waypoint texts at hand-placed offsets
  (`ANCHOR`, `:16`), and the arrival block (`:88`).

**One coordinate system per map.** `data.ts` builds two tracks with one `track()` factory: `DESK`
(1200 x 560, the wide map) and `PHONE` (400 x 700, a portrait map). Each carries its own start,
end, waypoints, contours, stall-clock spot, `legs`, `markerAt` and `trainAt`; timing (`TRAIN`,
`legWindow`, `ARRIVE`) is shared. `Map`/`Movers`/`Scene` take the track as `g`. `ArtBox`
(`shared/Frame.tsx`) is an aspect-locked box with `container-type: inline-size`; `frame(w, h)`
returns `place()` (percent positions in viewBox units) and `fs()` (font size in viewBox units
with a pixel floor), so the SVG and the HTML labels scale together. `Scene` (`Scene.tsx`) is keyed
by scenario index, so a scenario change remounts the art with a 0.35 s fade.

**Phones.** `useWide()` (`shared/Frame.tsx`, `(min-width: 64rem)`) picks the layout; the section is
`ssr: false`, so the branch never meets a server render. Below 64rem `Phone.tsx` renders the
request card and legend above a portrait map (rail down the page, the route bowing left through
four numbered waypoints, the stall note and the snag's name in the open column right of the rail),
then the four steps as a numbered list that lights as the route reaches each number, then the
result card. Same `p`, same windows, same reduced-motion end frame.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/agents-race/index.tsx` | Section: `useStory`, chips + Replay, wide `ArtBox` + `Labels` or `Phone` by `useWide`, sr-only result announcement |
| `src/components/sections/agents-race/Scene.tsx` | One map's SVG layers (defs, terrain, railway, route, train) for track `g`, with its HTML words as children |
| `src/components/sections/agents-race/Phone.tsx` | Phone composition: request card, legend, portrait map with in-art stall note, snag name and numbered waypoint badges, step list, result |
| `src/components/sections/agents-race/shared/motion.ts` | `useStory` clock; palette (`RULES` rose, `WARN` amber, `AGENT` emerald, `CYAN`); `seg`/`lerp`/`fill` helpers |
| `src/components/sections/agents-race/shared/Frame.tsx` | `useTimelineCopy`, `useWide`, `Intro` (`SectionIntro`), `ArtBox`, `frame()`, `StylisedTag`, `ReplayButton`, `PauseButton`, `ScenarioChips` |
| `src/components/sections/agents-race/data.ts` | Geometry and timing: `track()` -> `DESK` / `PHONE` (rail, snag, waypoints, legs, contours, stall clock, `markerAt`, `trainAt`); shared `DURATION`, `TRAIN`, `legWindow`, `ARRIVE` |
| `src/components/sections/agents-race/Map.tsx` | `Terrain` and `Railway` (rails, snag, start/end, arrival flare) |
| `src/components/sections/agents-race/Movers.tsx` | `Train` (+ stall clock) and `Route` (legs, waypoints, marker) |
| `src/components/sections/agents-race/Labels.tsx` | HTML text layer placed in viewBox units |
| `src/components/sections/how-lazy.tsx` (`:49-53`) | `LazyAgentsTimeline` imports `agents-race` (`ssr: false`, `SectionSkeleton`) |
| `src/app/how/page.tsx` (`:56-58`) | Mounts it in the first `StageSection id="agents-timeline"` |

## Data & state
- **Source:** static. Geometry and timing in `data.ts`; every word in
  `howSectionsCopy.timeline` (`src/i18n/en.ts`): `heading`, `scenarios[]` (`name`, `trigger` are
  read here) and `v3` (`lede`, `artLabel`, legend/stage labels, `announce`, and `cases[]` with
  `snag`, `wait`, `waypoints[4]`, `result`). Scenarios and cases are matched by index. No fetch,
  no mock API, no API routes.
- **State:** all inside `useStory`: `index`, `run`, `picked`, `doneKey`, the `p` motion value and
  the animation controls ref. No Zustand.
- **Unused copy:** `timeline.scenarios[].rules`, `rulesResult`, `agent`, `agentResult` and
  `timeline.pause`/`resume` are typed and filled but nothing in `agents-race` reads them (left from
  the prototype round's other variants).

## Integration points
- **`/how`** - `StageSection id="agents-timeline" glow="cyan"` (`how/page.tsx:56`); the scroll map
  item `AGENTS: TIMELINE` targets `#agents-timeline` (`:18`). The page puts the id on the
  `StageSection` because the lazy chunk is absent from the server HTML; the component's own
  `SectionWrapper id="agents-timeline"` (`index.tsx:30`) repeats it.
- **Stage fit** - `SectionWrapper fit="fill"` (exactly one viewport under the navbar, intro at the
  shared heading height, `src/styles/stage.css`); `ArtBox` carries `data-stage-slot` /
  `data-stage-art` with `--art-ar`, so the map is as wide as the stage allows and never taller
  than the slot.
- **Shared** - `SectionWrapper`, `SectionIntro`, `useStillMotion`, `useIsVisible`, `BRAND_VAR`
  (`src/lib/brand-theme.ts`), `lucide-react` icons.

## Conventions & gotchas
- **Replaced 2026-10-06** by the owner-picked winner of the /how prototype review ("Off the
  rails"). The previous race (`src/components/sections/agents-timeline/`: two tracks of step
  pills, rAF race timers, `ComparisonSummary`, `data.test.ts`) is deleted and lives in git history.
- **i18n - English only, pending translation.** All copy is in `howSections`, which is listed in
  `PENDING_TRANSLATION` (`src/i18n/en.ts`); the 13 other locales fall back to English until the
  namespace is translated into every locale and removed from the list.
- **Under 64rem the map is redrawn, not scrolled.** `useWide` swaps the wide `ArtBox` for
  `Phone.tsx` (portrait `PHONE` track, max 26rem wide); nothing scrolls sideways at 360-1023px.
  The waypoint words move out of the art into a numbered list (the art carries only the numbers),
  and the request card, legend and result sit in flow above and below the map. The wide map's
  `min-w-[60rem]` / `overflow-x-auto` fallback is gone. Resizing across 64rem remounts the art.
- **Reduced motion is a finished frame.** Under `useStillMotion`, `p` rests at 1 (`motion.ts:66-69`):
  the train sits stalled, the route is fully drawn and the result is shown; nothing auto-advances
  and Replay is disabled (`index.tsx:34`). Markup never depends on the preference. The 0.35 s
  scene fade on scenario change (`Scene.tsx:15`) is not gated.
- **Picking a scenario stops the cycle permanently.** `picked` is never reset and there is no
  resume control on this section; `PauseButton` (`Frame.tsx:75`), `holdCycle` and the `ArtBox`
  pointer handlers exist but are not wired here.
- **The race is choreographed, not measured.** The train always stalls and the agent always
  arrives because the timing windows say so; stall costs (`wait`) are copy. The figures (47
  minutes, 3 days, 6 of 12 services) match the chat section's outcomes by hand - the old
  `data.test.ts` guard went with the old folder.
- **Accessibility.** The SVG is `role="img"` with `v3.artLabel`; chips are real buttons with
  `aria-pressed` and a full `showScenario` label; a polite sr-only status line announces the
  finished scenario (`index.tsx:46-48`).
- **Hand-placed labels.** Waypoint label offsets (`ANCHOR`, `Labels.tsx:16`) and each track's
  `clock` spot (`data.ts`) are tuned to the current waypoints; moving a waypoint means re-checking
  its label. On the phone map the snag's name starts 58 units right of the snag (`SNAG_X`,
  `Phone.tsx`) to clear the barrier and fallen rocks.

## Related docs
- [Split Screen, One Clock (Agents Chat)](agents-chat.md)
- [How It Works page](../content/how-it-works.md)
- [Feature index](../INDEX.md)
