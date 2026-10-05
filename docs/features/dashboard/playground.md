# Fleet Playground (prototypes)
> Prototypes of a fleet dashboard for 10 to 100 agents, ported from the dashboard-fleet design contest into the site's theme and redesigned as full-frame real-time overviews: the **Board** (variant 1, "The Monitor, Relit"), the baseline design, and **Night shift** (variant 2, the fleet as a city), kept as a showcase for presentation screenshots and video · **Route:** `/dashboard/playground` · **Nav label:** "Playground" · **Status:** Demo-only prototype (synthetic demo fleet)

## What it does
One page answers *is everything fine, who needs me, what is moving, where do I go next* two ways over the same synthetic fleet of 99 agents in nine teams. A thin toolbar holds the title, the **Demo fleet** / **Stylised illustration** badges, the two tabs and the scale control (10 / 30 / 99 agents); everything below it is the stage, edge to edge (the dashboard drops its page padding and max width for this route).

Every view's top level (L0) has the same frame: the agents own the whole field, and all text sits in thin edges around them: a **top strip** (how many need you, working / resting / off counts, usage meters, clock, key hints), a **right rail** (everyone who needs you, most urgent first; hovering a row lights the agent in the field, selecting it opens the agent), and a **bottom strip** (newest events, system processes). Hovering or focusing an agent floats a card next to it instead of reserving space.

Both draw one state language, so a fleet of 100 sorts itself at a glance:
- **needs you** (failed, waiting for input, draft ready, or a pending review) is the loudest thing on screen: solid amber, red for failures and critical reviews, with a glyph for why (`!` failed, `?` waiting, a page for a draft, a flag or count for reviews);
- **working** is lit in the brand colour and moves (progress fills, rising light, a persona typing);
- **resting** (queued or idle) is present but dim;
- **off** is hatched, shuttered or a covered desk.

- **Board.** Nine team bays fill the field, tiles ordered needs → working → resting → off inside each bay. Tile content grows with the room it has: callsign + glyph at 99, + state and name at 30, + emblem and task at 10. Clicking a bay opens the team (L1); opening an agent shows its scene (emblem, run ring and stylised trace, reviews to approve or send back, messages).
- **Night shift** (showcase, no drill-down). One building per team, one window per agent, drawn to the field's real size with the roof line near the top; a thin sky band with the moon. Needs and working windows carry their callsign; every window that needs you sends a beam to a beacon on its roof. Clicking a window, a building or a rail row pins its card (click the sky or street, or Esc, to unpin). In light themes the night becomes dusk.

Both prototypes run a seeded simulation (runs progress and complete, failures self-heal or appear; on the Board your decisions land in the log). Escape goes back exactly one level; every agent is reachable from the keyboard; `N` walks the agents that need you.

## How it works
**Route and shell.** `src/app/dashboard/playground/page.tsx` renders `FleetPlayground.tsx`; `src/app/dashboard/layout.tsx` lists the route in `FULL_BLEED_PREFIXES` (no page padding or max width). The shell owns the view and the scale; the stage is `calc(100dvh - 4.25rem)` minus the 48px toolbar, with a 700px floor. Each prototype is a `next/dynamic({ ssr: false })` chunk, so the 130 KB fleet JSON and the art never reach the route's first load.

**Shared L0 pieces.** `FleetFrame.tsx` (the top / main / rail / bottom grid), `attention.ts` (`attentionOf`, `needsTone`, `ATTENTION_COLOR`, `countAttention`: the one state language, colours from site tokens only), `NeedsYouRail.tsx` (the ranked rail). Copy: `t.fleetPlayground.rail.*`, `t.fleetPlayground.attention.*`.

**Data.** `fleet-data.ts` types `fleet.json` (copied from `.contest/arena/dashboard-fleet/data/`) and exports `FLEET`, `sliceFleet(scale)`, `needsYou`, `urgency`, `topSeverity`, `formatAge`, `formatClock`. "Now" is `FLEET.nowMs`, never `Date.now()`.

**Board (`board/`).** `sim.ts` is a pure reducer with its PRNG seed in state; `useBoardRuntime.ts` ticks it once a second while the tab is visible; `useBoardNav.ts` holds the fleet → team → agent levels, the attention target, `N` and Escape. `TopStrip.tsx`, `Field.tsx` (bays), `Tile.tsx` (size-adaptive tile, `data-agent-id`), `HoverCard.tsx`, `BottomStrip.tsx`; `TeamScene.tsx` and `AgentScene.tsx` (+ `RunCard.tsx`, `AgentSide.tsx`) for the deeper levels; `Emblem.tsx` + `emblem-shapes.ts` the nine emblem families; `model.ts` ranking and ordering; `copy.ts` rail rows and plural helpers. Styling in `board.module.css` and `tiles.module.css`, fed the shared colours as `--at-*` variables.

**Night shift (`night/`).** `nightStore.ts` is the seeded store; `useNightSim.ts` ticks it while visible; `useFieldSize.ts` measures the field. `index.tsx` + `CityField.tsx` laid out by `city-layout.ts` to the field's pixel size (1-3 window columns per building, floors stretched so the roof line sits at ~17% of the field), `Backdrop`, `Moon`, `Building` + `Ornament` (trade roofs), `WindowArt`, `Wires`/`Packets`, `Vehicles`, `HoverCard` (hover or pinned), `Legend`, `Strips.tsx` (top/bottom), `rail.ts`. Colours in `palette.ts` derive from site tokens with `color-mix`; `vocab.ts` maps states to window words.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/playground/page.tsx` | Route |
| `src/app/dashboard/layout.tsx` | `FULL_BLEED_PREFIXES` opt-out from page padding |
| `src/components/dashboard/fleet-playground/FleetPlayground.tsx` | Shell: toolbar, tabs, scale, stage, lazy prototypes |
| `src/components/dashboard/fleet-playground/FleetFrame.tsx`, `attention.ts`, `NeedsYouRail.tsx` | Shared L0 frame, state language, needs-you rail |
| `src/components/dashboard/fleet-playground/fleet-data.ts` + `fleet.json` | Typed demo fleet and selectors |
| `src/components/dashboard/fleet-playground/board/*` | Board prototype (variant 1) |
| `src/components/dashboard/fleet-playground/night/index.tsx` | Night shift city (variant 2, showcase) |
| `src/components/dashboard/DashboardNavigation.tsx` | "Playground" nav entry (unscoped) |

## Data & state
- **Copy:** `t.fleetPlayground.*` (`rail`, `attention`, `board`, `city`) in `src/i18n/en.ts`, English only, registered in `PENDING_TRANSLATION`. The nav label `t.dashboard.playground` is translated in all 14 locales. Fleet strings (names, tasks, review titles, team names, simulated event texts) are demo data, not UI copy.
- **State:** shell `useState` for view and scale; Board's reducer state; Night's module store. Nothing persists; a reload returns to the seeded fleet.
- **No API.** The playground does not read the orchestrator, Supabase or the dashboard mocks.

## Integration points
- Mounted under the dashboard layout (auth guard, demo session via `/demo`), listed in the sidebar and mobile nav after Knowledge.
- `e2e/smoke-routes.ts` covers the route.

## Conventions & gotchas
- Prototype, not product: the simulation, the decisions and the fleet are fake by design and labelled so.
- All colour is from site tokens; state and severity text is mixed toward `--foreground` in light themes to hold contrast. "Working" uses `--brand-cyan`, so it takes each theme's brand colour (purple in dark-purple, green in dark-matrix).
- Motion is gated by `useStillMotion` (reduced motion: crossfades and stillness) and `usePageVisibility` (loops and simulation stop on a hidden tab). Under reduced motion the simulation still updates data.
- Desktop-only, like the contest brief: no phone layout. The stage keeps a 700px minimum height.
- Board's `N` and Escape listen on the document while the Board is mounted (ignored in inputs and with modifiers).
- Variant 1's Timeline and Map views and each variant's own header and scale control were not ported. Variant 2's Office (an office-floor L0, team cutaway and agent room) was built and then descoped: it added no clarity the Board does not give.
