# Plugin Ecosystem
> The "plug-in bay": every plugin the desktop ships (Dev Tools, Obsidian Brain, Drive, Twin) is a cartridge that seats into a lit window and plays its own scene, with the connector catalog shown under the cartridges · **Route:** `/features` (deep-dive section `#plugins`) · **Status:** Live

## What it does
Pitches Personas' plugin model: agents don't just chat, they drive purpose-built
**workspaces**. Four cartridges stack on the left; pressing one slides it in until its
two prongs seat in the window's socket (a light sweeps the window rim), and the window
shows that plugin's scene:

- **Dev Tools** - the **Athena Fleet**: 4x4 grid of 16 Claude Code sessions that spawn,
  work, block on questions and go stale on their own clocks while Athena's orb glides cell
  to cell and resolves each blocker on-policy. A 16-segment meter in the header is the fleet
  itself, one segment per session in its state colour.
- **Obsidian Brain** - a vault graph beside a side panel; each recall lights one note in the
  graph and its backlink in the panel at the same moment.
- **Drive** - five agents' exports (PDF, PNG, CSV, MP4, MD) drop through chutes into a managed
  local drive and appear in a file browser; then the app updates (v0.5 -> v0.6) and every file
  stays.
- **Twin** - one intent from you is mirrored into Slack, Gmail and LinkedIn at once, each in
  that channel's tone (a formality gauge, a differently shaped card per channel), and the
  replies come home to the twin; a footer lists other channels it reaches (Teams, Telegram,
  Discord, X).

Under the cartridges a **reach plate** shows twelve real connector marks and "N connectors
in the catalog". The intro states how many plugins the desktop ships and how many are on
stage, both computed (all four are on stage now). The window header shows the plugin's icon,
tagline, a "Stylised" tag and a "plugin N of 4" counter. Pure presentational demo; nothing
real runs and nothing is fetched.

## How it works
**Manifest seam.** `src/data/desktop-plugins.ts` exports `DESKTOP_PLUGINS` (`status:
"shipped" | "dev-only" | "removed"`, `source` citation, `verifiedAgainst`). Shipped today:
`dev-tools`, `drive`, `obsidian-brain`, `twin`; `scraper` dev-only; `artist`, `research-lab`
removed. Projected from it:
1. **Roster** - `plugins/roster.ts` (component-free) holds `SHOWCASE_KEYS` (now all four,
   `satisfies readonly ShippedPluginId[]`), `assertShowcaseShipped`, `SHOWCASE_COUNTS`,
   `pluginsIntro(copy, showcased, shipped, formatNumber)`. `plugins-bay/shared/roster.ts`
   adds the bay's own `LAB_PLUGINS` (key, manifest label, `copyKey`, brand, icon), `ORDER`
   (dev-tools first, because the tour clicks it), `DEFAULT_LAB_PLUGIN` and `pluginTagline()`
   (translated `pluginShowcase.taglines` for Dev Tools/Brain, pending
   `featuresSections.plugins.taglines` for Drive/Twin).
2. **Guide Find-in-App tree** - `src/data/guide/desktop-modules.ts` builds the Plugins children
   from the shipped manifest.
3. **Intro** - `plugins-bay/index.tsx` calls `pluginsIntro(...)` with `toLocaleString(language)`;
   with `showcased >= shipped` it uses `introAll`.

`src/data/desktop-plugins.test.ts` is the contract (shipped set, citations, showcase subset of
shipped, derived intro, locale interpolation, guide-nav, tour/Brain guards).

**Shell.** `plugins-bay/index.tsx` is the only stateful piece: `active` (`LabPluginKey`, default
`dev-tools`). It renders `SectionIntro` then a `data-tour-diagram="plugins"` `data-stage-fixed`
block (`role="group"`, 1120px max): a 290px cartridge column (`Cartridge` per plugin, plus
`ReachPlate` pinned to the bottom) and `PluginWindow`. `Cartridge` is a `motion.button`
(`data-plugin-key`, `aria-pressed`) that slides 16px when active; `PluginWindow` draws the
back plate, brand-lit rim, one socket per cartridge, the seating flash, the header, and an
`AnimatePresence mode="wait"` blur-crossfade around `SCENES[plugin.key]`, a
`Record<LabPlugin["key"], ComponentType>`, so a plugin added to the manifest is a tsc error
until it has a scene. The window is a fixed 540px tall.

**Scenes** each own a clock via `useLoopGate` (on screen, tab visible, motion allowed):
- `FleetScene` - `setInterval` (`TICK_MS` 1200) advancing a tick; `phase = tick % CYCLE (24)`;
  state from the shared pure functions in `plugins/dev-tools-grid/athenaFleetData.ts`
  (`stateAt`, `orbAt`, `cellStatusText`); `FleetCell` tiles (`fleetTone.ts` maps each state to a
  theme token); the floating `AthenaOrb` from `plugins/dev-tools-grid/AthenaFleetParts.tsx`.
  Still frame = tick 12 (mid-triage).
- `BrainScene` + `BrainGraph` - a recall index advances every 2.6 s over `BACKLINKS` from
  `plugins/second-brain/secondBrainData.ts`; the graph is an SVG over HTML chips.
- `drive/DriveScene` - `useBeat(ref, 1000, DRIVE_STILL)` (`shared/useBeat.ts`): `driveAt(step)`
  over a 9-beat cycle (files land on beats 0-4, update beat 5, hold); `DriveDrawer` (SVG
  chutes/slots), `DriveBrowser` (rows), `driveData.ts` (`FILES`, `VERSIONS`).
- `twin/TwinScene` - `useBeat(ref, 1100, TWIN_STILL)`: `twinAt(step)` over a 12-beat cycle
  (listen, intent, recall, tone, mirror, typing, sent, three replies, hold); `TwinSource`,
  `TwinWires`, `ChannelCard`, `twinData.ts`.

`useBeat` returns `stillStep` while not running, a complete frame that tells the whole story, so
reduced motion is a finished picture, not a blank first beat.

**Catalog slice.** `plugins-bay/shared/catalog.ts` holds `TOOLS` (16 connectors: id, label, icon
basename, catalog brand colour), `CONNECTOR_COUNT` (125), `REACH_TOOLS`, `TWIN_CHANNELS`,
`TWIN_MORE_CHANNELS` and `brandInk()` (colour pulled toward the theme text colour). It is a
curated copy so the chunk does not import the ~100 KB `src/data/connectors.ts`;
`catalog.test.ts` pins every entry to its catalog row (label, icon, colour, file exists), the
count to `connectors.length`, no duplicates, and that `local_drive`, `twin`, `obsidian_memory`
exist as connectors.

**Stage fit.** `SectionWrapper fit="min"`; the block carries `data-stage-fixed`, so the
fixed-pixel bay zooms as a whole by viewport-height tier (`src/styles/stage.css`).

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/plugins-bay/index.tsx` | Section shell: intro, active cartridge state, layout |
| `plugins-bay/Cartridge.tsx` | Cartridge button (`data-plugin-key`), slide-and-seat motion, prongs |
| `plugins-bay/PluginWindow.tsx` | Lit window, sockets, seating flash, header, scene crossfade, `SCENES` map |
| `plugins-bay/ReachPlate.tsx` | Connector reach plate (12 marks, "N connectors", "+M more") |
| `plugins-bay/shared/roster.ts` | `LAB_PLUGINS`, `DEFAULT_LAB_PLUGIN`, `pluginTagline` |
| `plugins-bay/shared/catalog.ts`, `catalog.test.ts` | Curated connector slice + its catalog-fidelity test |
| `plugins-bay/shared/useBeat.ts`, `ToolLogo.tsx` | Beat clock with still frame; masked brand mark |
| `plugins-bay/FleetScene.tsx`, `FleetCell.tsx`, `fleetTone.ts` | Dev Tools scene |
| `plugins-bay/BrainScene.tsx`, `BrainGraph.tsx` | Obsidian Brain scene |
| `plugins-bay/drive/` (`DriveScene`, `DriveDrawer`, `DriveBrowser`, `driveData`) | Drive scene |
| `plugins-bay/twin/` (`TwinScene`, `TwinSource`, `TwinWires`, `ChannelCard`, `twinData`) | Twin scene |
| `src/components/feature-sections/plugins/roster.ts` | `SHOWCASE_KEYS` (all four), counts, `pluginsIntro`, `assertShowcaseShipped` |
| `plugins/dev-tools-grid/athenaFleetData.ts`, `AthenaFleetParts.tsx` | Fleet state machine; `AthenaOrb` (the only export left in that file) |
| `plugins/second-brain/secondBrainData.ts` | Brain nodes, edges, `BACKLINKS`, `CAPTURES`, `nodeById` |
| `src/data/desktop-plugins.ts`, `desktop-plugins.test.ts` | Manifest and contract test |
| `src/lib/fillTemplate.ts` | `{name}` substitution |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyPlugins` imports `plugins-bay` (`:47-51`) |

## Data & state
- **Source:** static. Manifest, roster, scene data files above. No fetch, no mock-API call, no
  API routes.
- **Copy:** `t.pluginShowcase` (all 14 locales): heading, derived intro, `tabsLabel`, `counter`,
  Dev Tools/Brain taglines. `t.pluginsExtra` (pending): `fleet` and `brain` scene words.
  `t.featuresSections.plugins` (pending): `more`, `stylised`, `taglines`, `v1.artLabel|reach`,
  `drive.*`, `twin.*` (incl. per-channel tone/message/reply).
- **State:** `active` in `index.tsx`; per-scene `useState` tick/step. No Zustand.

## Integration points
- **Desktop app** - `DESKTOP_PLUGINS` mirrors the desktop `PluginsSidebarNav.tsx` and
  `CHANGELOG.md`; re-verify and bump `verifiedAgainst` on each desktop sync.
- **`/features`** - the final `StageSection id="plugins"` + `LazyMount stage minHeight={820}
  label="Plugins"` (`src/app/features/page.tsx:108-112`); scroll-map `PLUGINS` -> `#plugins`
  (`page.tsx:51`).
- **Product tour** - step `id: "plugins"` (`src/lib/tour-script.ts:280`) spotlights
  `[data-tour-diagram="plugins"]` and clicks `[data-plugin-key="dev-tools"]` (`:286`); keep
  `dev-tools` in the roster (guarded by the contract test).
- **Guide** - `desktop-modules.ts` Plugins children come from the manifest.
- **Static assets** - connector marks under `/public/tools/*.svg`; Athena orb
  `/athena/athena_idle_loop.mp4` (poster `/athena/athena_baseline.jpg`).

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous implementation
  (`plugins/index.tsx`, `PluginTabs`/`PluginCard` tabbed window, `DevToolsGrid`, `SecondBrain` and
  its graph/side panel, `data.ts`/`types.ts`, two-plugin roster) is in git history. The shared
  data files (`roster.ts`, `athenaFleetData.ts`, `secondBrainData.ts`) stayed in `plugins/` and
  are still imported by the bay; `plugins/` holds no components except `AthenaOrb`.
- **i18n - partly English-only.** `pluginShowcase` is translated in all 14 locales;
  `pluginsExtra` and `featuresSections` are in `PENDING_TRANSLATION`, so the 13 other locales fall
  back to English for scene bodies, Drive/Twin taglines and the reach plate. The
  `pluginShowcase.introTail` English text was cut on this branch; the other 13 locales keep the
  longer tail. Left in code on purpose: product/plugin labels, session names, file names, version
  strings, vault stats.
- **Stale counts outside this context.** Tour narration `features6` (`src/i18n/en.ts`, 14 locales,
  recorded `/tour/features6.mp3`) still says "six purpose-built plugins" - an owner task (audio
  regeneration).
- **Motion gating.** Scene loops are ambient and gated by `useLoopGate` (framer's
  `useReducedMotion` is barred in this context by `lab/still-motion.test.ts`); every scene rests on
  a complete still frame. `Cartridge`, `PluginWindow` and the block's entrance use `useStillMotion`
  (`duration: 0`, no seating flash). `AthenaOrb` keeps the same `<video>` mounted and pauses it
  (poster shown, `preload="none"`) while `reduced` - so it also stops off-screen or in a hidden
  tab; keep that so reduced-motion visitors never loop the mp4.
- **Colour.** Brand colours via `BRAND_VAR`/`tint()` and `color-mix`; connector brand colours go
  through `brandInk()` so near-black marks read on dark themes. The old raw-hex fleet tiles are
  gone (`fleetTone.ts` uses tokens).
- **Counter semantics.** The window's "plugin N of M" counts the bay (4) and the intro's two numbers
  come from the roster and the manifest; they are equal now, but keep them derived.
- **Label vs key.** `"obsidian-brain"` shows the desktop's label "Obsidian Brain"; the roster
  `copyKey` is `brain`.
- **Catalog drift.** `CONNECTOR_COUNT` and the `TOOLS` rows are copied, not imported; the unit test
  is the only thing that notices a catalog change, so run `npm run test:unit` after touching
  `src/data/connectors.ts`.
- **Twin wire geometry.** `WIRE_Y` in `twinData.ts` assumes three equal cards with a 10px gap in a
  ~410px column; change both together.
- **A11y.** Cartridges are real buttons (`aria-pressed`); scene SVGs are `aria-hidden`; connector
  marks carry `sr-only` labels; status lines are `aria-live="off"` so the loop does not chatter.

## Related docs
- [Agent Lab](agent-lab.md)
- [Feature index](../INDEX.md)
