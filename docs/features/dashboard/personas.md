# Personas (fleet monitor)
> The dashboard's main view: every persona in the fleet on one screen, in two views over the same synthetic fleet of up to 99 agents in nine teams: the **Board** (team bays, drill-down to team and agent) and **Night shift** (the fleet as a city, kept as a showcase without drill-down) · **Route:** `/dashboard/personas` (`/dashboard`, `/dashboard/agents` and `/dashboard/playground` redirect here) · **Nav:** first rail item, "Personas" · **Status:** Desktop stage demo-only (synthetic demo fleet); phone layout on demo + the live sync plane

## What it does
One page answers *is everything fine, who needs me, what is moving, where do I go next* two ways over the same synthetic fleet of 99 agents in nine teams. A thin toolbar holds the title (**Personas**), the **Demo fleet** / **Stylised illustration** badges, the two view tabs and the scale control (10 / 30 / 99 agents); everything below it is the stage, edge to edge (the view is full-bleed, and with no level-2 menu open the stage gets the full width beside the rail).

Every view's top level (L0) has the same frame: the agents own the whole field, and all text sits in thin edges around them: a **top strip** (how many need you, working / resting / off counts, usage meters, clock, key hints), a **right rail** (everyone who needs you, most urgent first; hovering a row lights the agent in the field, selecting it opens the agent), and a **bottom strip** (newest events, system processes). Hovering or focusing an agent floats a card next to it instead of reserving space.

Both draw one state language, so a fleet of 100 sorts itself at a glance:
- **needs you** (failed, waiting for input, draft ready, or a pending review) is the loudest thing on screen: solid amber, red for failures and critical reviews, with a glyph for why (`!` failed, `?` waiting, a page for a draft, a flag or count for reviews);
- **working** is lit in the brand colour and moves (progress fills, rising light, a persona typing);
- **resting** (queued or idle) is present but dim;
- **off** is hatched, shuttered or a covered desk.

- **Board.** Nine team bays fill the field, tiles ordered needs → working → resting → off inside each bay. Tile content grows with the room it has: callsign + glyph at 99, + state and name at 30, + emblem and task at 10. Clicking a bay opens the team (L1); opening an agent shows its scene (emblem, run ring and stylised trace, reviews to approve or send back, messages).
- **Night shift** (showcase, no drill-down). One building per team, one window per agent, drawn to the field's real size with the roof line near the top; a thin sky band with the moon. Needs and working windows carry their callsign; every window that needs you sends a beam to a beacon on its roof. Clicking a window, a building or a rail row pins its card (click the sky or street, or Esc, to unpin). In light themes the night becomes dusk.

Both views run a seeded simulation (runs progress and complete, failures self-heal or appear; on the Board your decisions land in the log). Escape goes back exactly one level; every agent is reachable from the keyboard; `N` walks the agents that need you.

**On a phone** (below 768 px) the view is agent management instead of the stage (PLAN M13, a phone layout of this view, not a new route): a reachability banner, then one row per persona with its glyph, name, **Active / Paused**, a 44 px **Pause / Resume** button, and the chip of its latest command (**Sending... -> Working... -> Done**, or Failed / Refused with the desktop's reason, or "Your computer didn't answer"). The banner follows the online gate: **offline** (a desktop has synced but its heartbeat is over 120 s old) disables every action and says "Personas isn't running on {device}, last seen {ago}" with no download CTA; **never synced** offers "Send the download to my computer" and no actions; **online but unpaired** points at pairing in Settings; **online** shows nothing. In demo a simulated computer answers (claim at 1.2 s, done at 2.0 s) and the demo CTA shows; `/demo?desktop=offline` and `/demo?desktop=never` switch the simulated computer off or away for review and e2e.

## How it works
**Phone layout (phase 2, E2E-1).** `index.tsx` picks `phone/PhonePersonas.tsx` when `useIsMobile()` (max-width 767 px) and the unchanged stage (`PersonasStage`) otherwise; the view is client-only, so the media query cannot mismatch a server render. `PhonePersonas` reads `personaStore` (demo: `mockApi`'s five personas; live: `synced_personas`), never `fleet.json`. `PhonePersonaRow.tsx` gates its button on `useSyncReachability().tierFor(persona.deviceId)` (the tier of the desktop that owns the persona) and on no open command, sends through `commandStore.send`, and shows `displayEnabled(persona, latest)`: the command's reported result until the synced persona is written after the command, then the mirror. `ReachabilityNotice.tsx` renders the tier banner (download via `mobile-landing/shared/handoff.ts`: share sheet, else clipboard), `CommandChip.tsx` the six states. Copy: `t.mobile.personas`, `t.mobile.reach`, `t.mobile.command` (English-only pending). Contract: `docs/concepts/mobile-revival/PHASE2-SPEC.md` §4.3, §6.2, §6.3.

**View and shell.** `src/components/dashboard/views/personas/index.tsx` is the view the dashboard SPA renders for `personas` (the default view: `/dashboard` and the demo entry land here); `spa/views.ts` marks it `fullBleed`. The shell owns the view and the scale; the stage is `calc(100dvh - 4.25rem)` minus the 48px toolbar, with a 700px floor. Each fleet view is a `next/dynamic({ ssr: false })` chunk, so the 130 KB fleet JSON and the art never reach the dashboard's first load. The view is kept alive across view switches (`spa/ViewOutlet.tsx`): leaving pauses the simulation (its effects unmount) and keeps the chosen view and scale.

**Shared L0 pieces.** `FleetFrame.tsx` (the top / main / rail / bottom grid), `attention.ts` (`attentionOf`, `needsTone`, `ATTENTION_COLOR`, `countAttention`: the one state language, colours from site tokens only), `NeedsYouRail.tsx` (the ranked rail). Copy: `t.personasMonitor.rail.*`, `t.personasMonitor.attention.*`.

**Data.** `fleet-data.ts` types `fleet.json` (copied from `.contest/arena/dashboard-fleet/data/`) and exports `FLEET`, `sliceFleet(scale)`, `needsYou`, `urgency`, `topSeverity`, `formatAge`, `formatClock`. "Now" is `FLEET.nowMs`, never `Date.now()`.

**Board (`board/`).** `sim.ts` is a pure reducer with its PRNG seed in state; `useBoardRuntime.ts` ticks it once a second while the tab is visible; `useBoardNav.ts` holds the fleet → team → agent levels, the attention target, `N` and Escape. `TopStrip.tsx`, `Field.tsx` (bays), `Tile.tsx` (size-adaptive tile, `data-agent-id`), `HoverCard.tsx`, `BottomStrip.tsx`; `TeamScene.tsx` and `AgentScene.tsx` (+ `RunCard.tsx`, `AgentSide.tsx`) for the deeper levels; `Emblem.tsx` + `emblem-shapes.ts` the nine emblem families; `model.ts` ranking and ordering; `copy.ts` rail rows and plural helpers. Styling in `board.module.css` and `tiles.module.css`, fed the shared colours as `--at-*` variables.

**Night shift (`night/`).** `nightStore.ts` is the seeded store; `useNightSim.ts` ticks it while visible; `useFieldSize.ts` measures the field. `index.tsx` + `CityField.tsx` laid out by `city-layout.ts` to the field's pixel size (1-3 window columns per building, floors stretched so the roof line sits at ~17% of the field), `Backdrop`, `Moon`, `Building` + `Ornament` (trade roofs), `WindowArt`, `Wires`/`Packets`, `Vehicles`, `HoverCard` (hover or pinned), `Legend`, `Strips.tsx` (top/bottom), `rail.ts`. Colours in `palette.ts` derive from site tokens with `color-mix`; `vocab.ts` maps states to window words.

## Key files
| File | Role |
| --- | --- |
| `src/components/dashboard/views/personas/index.tsx` | View shell: phone/desktop switch; desktop toolbar, tabs, scale, stage, lazy fleet views |
| `src/components/dashboard/views/personas/phone/*` | Phone layout: `PhonePersonas`, `PhonePersonaRow`, `ReachabilityNotice`, `CommandChip` |
| `src/hooks/useSyncReachability.ts`, `src/lib/sync/reachability.ts` | The online gate and its tier table (120 s heartbeat freshness) |
| `src/stores/commandStore.ts`, `src/lib/commands/*` | Send a verb and follow it (live: signed `pending_commands` rows; demo: `mockCommandPlane`) |
| `src/components/dashboard/spa/views.ts` | `personas` is the default view and full-bleed |
| `src/components/dashboard/fleet-monitor/FleetFrame.tsx`, `attention.ts`, `NeedsYouRail.tsx` | Shared L0 frame, state language, needs-you rail |
| `src/components/dashboard/fleet-monitor/fleet-data.ts` + `fleet.json` | Typed demo fleet and selectors |
| `src/components/dashboard/fleet-monitor/board/*` | Board view (variant 1 of the fleet contest) |
| `src/components/dashboard/fleet-monitor/night/index.tsx` | Night shift city (variant 2, showcase) |
| `src/components/dashboard/navRegistry.ts` | "Personas" rail section, first in the menu |

## Data & state
- **Copy:** `t.personasMonitor.*` (`rail`, `attention`, `board`, `city`) in `src/i18n/en.ts`, English only, registered in `PENDING_TRANSLATION`. The nav label `t.dashboard.personas` is translated in all 14 locales. Fleet strings (names, tasks, review titles, team names, simulated event texts) are demo data, not UI copy.
- **State:** shell `useState` for view and scale; Board's reducer state; Night's module store. Nothing persists; a reload returns to the seeded fleet.
- **No API on desktop.** The desktop-width stage does not read the orchestrator, Supabase or the dashboard mocks. The phone layout does: `personaStore` through the `api` proxy, `deviceStore` (`synced_devices`), `controllerStore` (`command_controllers`) and `commandStore` (`pending_commands`), all live-plane only except the persona list; demo simulates the device and the desktop.

## Integration points
- Rendered by the dashboard SPA (auth guard, demo session via `/demo`); first in the rail and in the mobile bar. Replaced the Agents grid (`/dashboard/agents`, removed 2026-10-05 with its portraits, tour step and narration) and the Playground label.
- `e2e/smoke-routes.ts` covers the route.

## Conventions & gotchas
- Demo data, not a live fleet: the simulation, the decisions and the fleet are synthetic by design and labelled so (Demo fleet badge). Wiring it to `usePersonaStore` / synced executions is the next step for a real tenant.
- All colour is from site tokens; state and severity text is mixed toward `--foreground` in light themes to hold contrast. "Working" uses `--brand-cyan`, so it takes each theme's brand colour (purple in dark-purple, green in dark-matrix).
- Motion is gated by `useStillMotion` (reduced motion: crossfades and stillness) and `usePageVisibility` (loops and simulation stop on a hidden tab). Under reduced motion the simulation still updates data.
- The fleet stage is desktop-only, like the contest brief, and keeps a 700px minimum height; phones get the persona list instead (2026-10-06). The two show different populations in demo (the stage's 99-agent `fleet.json` vs `mockApi`'s 5 personas): spec open question 5.
- Phone layout, deferred in E2E-1: Running / Failed row states (need `executionStore`), the Run sheet and Cancel action (M7), the persona detail sheet, and the "Out of sync, check the desktop" notice 30 s after a disagreeing mirror.
- Board's `N` and Escape listen on the document while the Board is mounted (ignored in inputs and with modifiers).
- Variant 1's Timeline and Map views and each variant's own header and scale control were not ported. Variant 2's Office (an office-floor L0, team cutaway and agent room) was built and then descoped: it added no clarity the Board does not give.
