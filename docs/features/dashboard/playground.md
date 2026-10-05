# Fleet Playground (prototypes)
> Prototypes of a fleet dashboard for 10 to 100 agents, ported from the dashboard-fleet design contest into the site's theme: the **Board** (variant 1, "The Monitor, Relit"), and **Night shift** + **Office** (variant 2, the fleet as a city and one team's building opened up) · **Route:** `/dashboard/playground` · **Nav label:** "Playground" · **Status:** Demo-only prototype (synthetic demo fleet)

## What it does
One page answers *is everything fine, who needs me, what is moving, where do I go next* three ways, over the same synthetic fleet of 99 agents in nine teams. A scale control (10 / 30 / 99 agents) drives all three; three tabs switch between them. The page labels itself **Demo fleet** and **Stylised illustration**: every number comes from the demo data, and the artwork is drawn, not a screenshot.

- **Board.** A spotlight on the left holds whatever is under attention at display scale: with nothing hovered it shows the fleet verdict ("23 need you"), the state mix and a ranked needs-you queue; hovering or focusing a team or an agent swaps in a large procedural emblem (one shape family per team) with name, state and task. Nine team bays hold one tile per agent whose form follows the room it has (callsign pillars at 99, named tiles at 30, task cards at 10). The healthy mass stays dim; failed tiles are fractured, input requests pulse, drafts fold a corner, review badges take their severity colour. `N` walks the queue; clicking a bay zooms into the team; opening an agent shows its scene (emblem, run ring and stylised trace, reviews to approve or send back, messages). A band underneath carries usage pace, system processes and a live ticker.
- **Night shift.** Each team is a building drawn for its trade and each agent a window; what sits in the window is the state (rising light, a slumped figure on red glass, a raised lantern, a paper draft, a dim lamp, shutters). Every agent that needs you throws a beam to a lantern tag. The sky gives the totals; the moon is the 5-hour usage meter and its halo the 7-day one. Hovering a window turns the sky into its stage and lights its message wires; the street carries the system processes and a ticker. Clicking a building opens it in **Office**. In light themes the night becomes dusk.
- **Office.** One team's building in cutaway: a room per agent with a persona at a desk acting out its state, a team switcher (teams present at the current scale), team stats, a "needs you on these floors" queue and the latest events. Opening a room fills the frame with that agent: current run (retry / answer / accept), reviews (approve / send back), events, stats, last 12 runs, a 24-hour spark and messages.

Both prototypes run a seeded simulation (runs progress and complete, failures self-heal or appear, your decisions land in the log), so the page is alive without real data. Escape closes the top layer only; every agent is reachable from the keyboard.

## How it works
**Route and shell.** `src/app/dashboard/playground/page.tsx` renders `FleetPlayground` (`src/components/dashboard/fleet-playground/FleetPlayground.tsx`) inside the dashboard layout. The shell owns the title, badges, scale (`FleetScale`), the tab list (arrow keys move between tabs) and the selected team for Office; the stage is a fixed-height frame (`clamp(720px, 100dvh - 7rem, 960px)`). Each prototype is a `next/dynamic({ ssr: false })` chunk, so the 130 KB fleet JSON and the art never reach the route's first load.

**Data.** `fleet-data.ts` types `fleet.json` (copied from `.contest/arena/dashboard-fleet/data/`) and exports `FLEET`, `sliceFleet(scale)` (the first N agents plus the teams, edges and events that touch them), `needsYou`, `urgency`, `topSeverity`, `formatAge`, `formatClock`. "Now" is `FLEET.nowMs`, never `Date.now()`.

**Board (`board/`).** `sim.ts` is a pure reducer with its PRNG seed in state; `useBoardRuntime.ts` ticks it once a second while the tab is visible; `useBoardNav.ts` holds the fleet → team → agent levels, the attention target, `N` and Escape. `model.ts` ranks the queue and computes tile layout; `Board.tsx`/`Tile.tsx` draw bays and tiles; `Spotlight.tsx`/`SpotLayers.tsx`/`Queue.tsx` the spotlight; `TeamScene.tsx` and `AgentScene.tsx` (+ `RunCard.tsx`, `AgentSide.tsx`) the deeper levels; `Band.tsx` the footer; `Emblem.tsx` + `emblem-shapes.ts` the nine emblem families. Styling in `board.module.css` and `tiles.module.css`.

**Night shift and Office (`night/`).** `nightStore.ts` is one seeded store shared by City and Office (an approval in Office shows in the City; a clicked window is handed to Office so it opens straight into that room); `useNightSim.ts` subscribes and ticks while visible. The City is a 1440×860 design stage scaled to the frame (`useFitStage.ts`, `city-layout.ts`): `Backdrop`, `Moon`, `Building` + `Ornament` (trade roofs), `WindowArt`, `Lanterns` (placed by `lantern-placement.ts`, a collision pass in urgency order around the summary and moon), `SkyDisplay`, `Wires`/`Packets`, `Vehicles`, `Ticker`, `Legend`. Office is `Office.tsx` + `OfficeInfo.tsx` + `Cutaway.tsx` + `Persona.tsx`, and `AgentRoom.tsx` + `AgentPanels.tsx` + `MiniSky.tsx` for the agent level. Colours in `palette.ts` derive from site tokens with `color-mix`; `vocab.ts` maps states to window/room words.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/playground/page.tsx` | Route |
| `src/components/dashboard/fleet-playground/FleetPlayground.tsx` | Shell: tabs, scale, stage frame, lazy prototypes |
| `src/components/dashboard/fleet-playground/fleet-data.ts` + `fleet.json` | Typed demo fleet and selectors |
| `src/components/dashboard/fleet-playground/board/*` | Board prototype (variant 1) |
| `src/components/dashboard/fleet-playground/night/index.tsx` | Night shift city (variant 2) |
| `src/components/dashboard/fleet-playground/night/Office.tsx` | Office: team cutaway and agent room (variant 2) |
| `src/components/dashboard/DashboardNavigation.tsx` | "Playground" nav entry (unscoped) |

## Data & state
- **Copy:** `t.fleetPlayground.*` (`board`, `city`, `office` sub-blocks) in `src/i18n/en.ts`, English only, registered in `PENDING_TRANSLATION`. The nav label `t.dashboard.playground` is translated in all 14 locales. Fleet strings (names, tasks, review titles, team names, simulated event texts) are demo data, not UI copy.
- **State:** shell `useState` for view, scale and team; Board's reducer state; Night's module store. Nothing persists; a reload returns to the seeded fleet.
- **No API.** The playground does not read the orchestrator, Supabase or the dashboard mocks.

## Integration points
- Mounted under the dashboard layout (auth guard, demo session via `/demo`), listed in the sidebar and mobile nav after Knowledge.
- `e2e/smoke-routes.ts` covers the route.

## Conventions & gotchas
- Prototype, not product: the simulation, the decisions and the fleet are fake by design and labelled so.
- All colour is from site tokens; state and severity text is mixed toward `--foreground` in light themes to hold contrast. Data hues are computed colours.
- Motion is gated by `useStillMotion` (reduced motion: crossfades and stillness) and `usePageVisibility` (loops and simulation stop on a hidden tab). Under reduced motion the simulation still updates data.
- The City is a fixed design stage scaled to fit; its type is set in design units so labels stay ≥ 12px down to a ~1280px-wide viewport. Desktop-only, like the contest brief: no phone layout.
- Board's `N` and Escape listen on the document while the Board is mounted (ignored in inputs and with modifiers).
- Variant 1's Timeline and Map views and each variant's own header and scale control were not ported.
