# Plugin Ecosystem
> Tabbed plugin showcase — two of the desktop's four shipped plugins (Dev Tools, Brain), each rendered as a live mini-demo, with the roster projected from one desktop-plugin manifest · **Route:** `/features` (deep-dive section `#plugins`) · **Status:** Live

## What it does
Pitches Personas' plugin model: agents don't just chat, they drive purpose-built **workspaces**. The section is a single glass "app window" with a row of plugin tabs across the top. Pick a tab and the window swaps to that plugin's live mini-demo:

- **Dev Tools** — the **Athena Fleet**: a 4×4 grid of 16 CLI sessions that spawn, work, block on questions, and go stale on their own clocks while Athena's avatar orb glides cell to cell, resolving each blocker on-policy and narrating it ("✓ approved — quarantine 3"). Loops to "16/16 green · 0 human interruptions."
- **Brain** — a "second brain" knowledge graph: an animated SVG node graph (central note + six satellites, pulse rings) beside a side panel of backlinks and recent captures, footed with vault stats (4,281 notes · 18,904 links · 92% recall).

The intro states how many plugins the desktop ships and how many are on stage ("Personas ships with 4 plugins, and 2 of them are at work below."). Both numbers are computed, not typed, and the sentence is translated in all 14 locales. The English tail was cut to "Switch tabs to meet each one." on this branch; the other 13 locales keep their longer, still-correct tail until the next translation pass. The window header shows the active plugin's icon/tagline and a "plugin N of 2" counter (the showcased count); the dot color is the plugin's brand accent. It is a pure presentational demo — no real plugins run, no data is fetched.

**Removed 2026-09-23:** the Artist (style grid) and Research Lab (project lifecycle + literature board) demos. The desktop removed both plugins (desktop `CHANGELOG.md:45`, [Unreleased] › Removed: "The Artist and Research Lab plugins are gone").

## How it works
**The manifest seam.** `src/data/desktop-plugins.ts` exports `DESKTOP_PLUGINS`, one entry per desktop plugin with `status: "shipped" | "dev-only" | "removed"`, a `source` citation (desktop `PluginsSidebarNav.tsx:78-82` or `CHANGELOG.md:45`) and a `verifiedAgainst` date. Today: `dev-tools`, `drive`, `obsidian-brain`, `twin` shipped; `scraper` dev-only; `artist`, `research-lab` removed. `ShippedPluginId` is a type derived from the array. Three things project from it:
1. **Showcase roster** — `plugins/roster.ts` (component-free) holds `SHOWCASE_KEYS` (`["dev-tools", "obsidian-brain"]`, `satisfies readonly ShippedPluginId[]`, so a removed id is a tsc error), `DEFAULT_SHOWCASE_KEY` (`"dev-tools"`), `assertShowcaseShipped(keys)` (throws naming a non-shipped id), `SHOWCASE_COUNTS` (`{ showcased, shipped }`), and the pure `pluginsIntro(copy, showcased, shipped, formatNumber?)`. `fillTemplate(template, vars)` now lives in `src/lib/fillTemplate.ts` (shared by five sections); `roster.ts` imports it and re-exports it for its existing callers.
2. **Guide Find-in-App tree** — `src/data/guide/desktop-modules.ts` builds the Plugins node's children as `browse` + every shipped plugin.
3. **Intro count** — `index.tsx` calls `pluginsIntro(t.pluginShowcase, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped, n => n.toLocaleString(language))`: it picks `introAll` (every shipped plugin on stage) or `introSome`, fills `{shipped}`/`{showcased}` with locale digits and appends `introTail`. Digits, not number words, so no locale needs a spell-out table; the ar/cs/ru templates are phrased to avoid noun-number agreement.

`src/data/desktop-plugins.test.ts` is the contract: shipped set, citations, showcase ⊆ shipped, removed-cannot-showcase, derived intro (template + injected formatter), `fillTemplate`, every locale interpolating every placeholder and differing from English, guide-nav = shipped set, and the tour/Brain guards.

Entry is `Plugins.tsx` (one-line re-export of `plugins/index.tsx`). `index.tsx` is the only stateful piece: it holds `active` (the selected `PluginKey`, default `DEFAULT_SHOWCASE_KEY`) and `variantByPlugin` (a per-plugin map of which sub-variant is showing, lazily initialized to each plugin's first variant). It resolves `activePlugin`/`activeVariant` from `PLUGINS` (`data.ts`, which maps `SHOWCASE_KEYS` over a `DEMOS: Record<PluginKey, …>` table, so roster and demos cannot drift) and renders `<SectionIntro>` + `<PluginTabs>` + `<PluginCard>`.

`PluginTabs` renders one pill per plugin; the active pill gets a brand-tinted border + glow via `color-mix` inline styles (because `p.color` is a CSS var from `BRAND_VAR`, hex-suffix alpha won't work — see the inline comment at `PluginTabs.tsx:46-47`). `PluginCard` draws the glass window chrome, an optional nested variant switcher (only when a plugin has >1 variant — none does since Research Lab left; kept for a future multi-variant demo such as Twin), and an `AnimatePresence mode="wait"` crossfade keyed on `${active}-${activeVariantKey}` so swapping tabs animates the body. The actual demo body is `activeVariant.component` — each grid is an independent `"use client"` component referenced by the `PluginDef`.

Each grid self-drives its own entrance animation with `whileInView`/`viewport={{ once: true }}` (it does **not** inherit the parent stagger). Both are genuinely interactive/looping:

- **Athena Fleet** (`DevToolsGrid` + `dev-tools-grid/`): a deterministic clock. A `setInterval` (`TICK_MS = 1200`) advances `tick` while `useLoopGate(rootRef).run` is true (grid on screen, tab visible, motion allowed); `phase = tick % CYCLE` (CYCLE = 24) drives everything. Pure functions in `athenaFleetData.ts` compute each cell's `CellState` (`stateAt`), the orb's position/caption (`orbAt`), and per-cell status text (`cellStatusText`). Three acts: spawn (waves fill the 4×4), churn (three cells block on `ask` questions, one goes `stale`), triage (the orb visits `ORB_STOPS` in attention order, flips blocked cells to `resolving`, then they return to `working` until `doneAt`). `AthenaFleetParts.tsx` renders the cells and the floating orb (the same avatar the site tour uses); the orb receives `reduced={!run}`, so its resolving pulse and video stop off screen too.
- **Second Brain graph** (`SecondBrainGraph`, passed `reduced={!run}` from `SecondBrain`'s `useLoopGate`, so its pulses loop only on screen): an SVG (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`) drawing `EDGES` as gradient `motion.line`s (animated `pathLength`), positioned HTML node chips for `SATELLITES` + `CENTRAL`, and three expanding pulse rings. Data is in `secondBrainData.ts`; `SecondBrainSidePanel` lists `BACKLINKS`/`CAPTURES`.

**Stage fit (desktop).** The section is `SectionWrapper fit="min"`; the tabs + card block (`data-tour-diagram="plugins"`) carries `data-stage-fixed` (`index.tsx:59`), so the fixed-pixel card zooms as a whole by viewport-height tier (0.68–1.35, `src/styles/stage.css`), and tab/card gaps tighten with `stage:` margins. The window is an almost-opaque `bg-background/95` (no `backdrop-blur-xl`).


## Key files
| File | Role |
| --- | --- |
| `src/data/desktop-plugins.ts` | `DESKTOP_PLUGINS` manifest (status + source + verifiedAgainst), `ShippedPluginId`, `SHIPPED_DESKTOP_PLUGINS` |
| `src/data/desktop-plugins.test.ts` | Contract test: manifest, roster, intro derivation, guide-nav projection |
| `src/components/feature-sections/plugins/roster.ts` | `SHOWCASE_KEYS`, `DEFAULT_SHOWCASE_KEY`, `assertShowcaseShipped`, `SHOWCASE_COUNTS`, `pluginsIntro`; re-exports `fillTemplate` |
| `src/lib/fillTemplate.ts` | `fillTemplate(template, vars)` — `{name}` substitution, unknown placeholders stay visible |
| `src/components/feature-sections/Plugins.tsx` | One-line re-export of `plugins/index` |
| `src/components/feature-sections/plugins/index.tsx` | Stateful root: `active` tab + per-plugin variant state, composes Intro/Tabs/Card |
| `src/components/feature-sections/plugins/data.ts` | `PLUGINS[]` — `SHOWCASE_KEYS` joined to their demo defs (label/taglineKey/icon/color/variants) |
| `src/components/feature-sections/plugins/types.ts` | `PluginKey` (= roster `ShowcaseKey`), `ShowcaseCopy` (= `Translations["pluginShowcase"]`), `PluginsExtraCopy` (= `Translations["pluginsExtra"]`), `PluginDef`, `VariantDef` (`blurbKey`) |
| `src/components/feature-sections/plugins/components/PluginTabs.tsx` | Top pill tab row, brand-tinted active state |
| `src/components/feature-sections/plugins/components/PluginCard.tsx` | Glass window chrome, nested variant switcher, `AnimatePresence` body |
| `src/components/feature-sections/plugins/DevToolsGrid.tsx` | Athena Fleet clock (`useLoopGate`) + grid + status line |
| `src/components/feature-sections/plugins/dev-tools-grid/athenaFleetData.ts` | Fleet data + deterministic state machine (`stateAt`/`orbAt`/`cellStatusText`) |
| `src/components/feature-sections/plugins/dev-tools-grid/AthenaFleetParts.tsx` | `FleetCell` tile + `AthenaOrb` floating avatar (video / reduced-motion poster) |
| `src/components/feature-sections/plugins/SecondBrain.tsx` | Brain layout: header, graph + side panel grid, vault-stats footer; `useLoopGate` for the graph's pulses |
| `src/components/feature-sections/plugins/second-brain/SecondBrainGraph.tsx` | Animated SVG knowledge graph (edges, nodes, pulse rings) |
| `src/components/feature-sections/plugins/second-brain/SecondBrainSidePanel.tsx` | Backlinks + recent-captures panel |
| `src/data/guide/desktop-modules.ts` | Guide Find-in-App tree; its Plugins children derive from the manifest |
| `src/components/feature-sections/plugins/second-brain/secondBrainData.ts` | `CENTRAL`/`SATELLITES`/`EDGES`/`BACKLINKS` (`noteKey`)/`CAPTURES` (`textKey`)/`nodeById` |
| `src/app/features/page.tsx` | Mounts the section at `#plugins` via `LazyPlugins` (`page.tsx:102-106`) |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyPlugins` scroll-gated dynamic import (`:47`) |

## Data & state
- **Source:** all static module constants — `DESKTOP_PLUGINS` (`src/data/desktop-plugins.ts`), `SHOWCASE_KEYS` (`roster.ts`), `PLUGINS` (`data.ts`), `CELLS`/`ORB_STOPS` (`athenaFleetData.ts`), `SATELLITES`/`EDGES`/`BACKLINKS`/`CAPTURES` (`secondBrainData.ts`). No fetch, no mock-API call.
- **Copy:** `t.pluginShowcase` (all 14 locales) for the intro, tabs and header; `t.pluginsExtra` (English-only, see below) for the demo bodies — `fleet` (title, status lines, pills, `asks`, `captions`, `cell` phrases), `brain` (header, footer, `backlinkNotes`, `captures`) and `variantBlurbs`.
- **Stores:** none. No Zustand. Only local `useState` in `index.tsx` (active tab + variant map) and the `tick` counter in `DevToolsGrid`.
- **API routes:** none.
- **Types:** `DesktopPlugin` / `DesktopPluginStatus` / `ShippedPluginId` (`desktop-plugins.ts`); `ShowcaseKey` (`roster.ts`); `PluginKey` / `PluginDef` / `VariantDef` (`types.ts`); `CellState` / `FleetCellDef` / `OrbStop` (`athenaFleetData.ts`); `NodeType` / `GraphNode` (`secondBrainData.ts`). Brand colors via `BRAND_VAR` (`@/lib/brand-theme`).

## Integration points
- **Desktop app** — `DESKTOP_PLUGINS` mirrors the desktop `PluginsSidebarNav.tsx` catalog and `CHANGELOG.md`. Re-verify it (and bump `verifiedAgainst`) on each desktop sync and whenever `docs/parity-backlog/PARITY-MATRIX.md` is refreshed; the matrix rates Twin "absent — plugins-page card", which is now one roster key plus one `DEMOS` entry.
- **`/features` page** — composed as the final `StageSection id="plugins"` (`src/app/features/page.tsx:102`), inside a `LazyMount` (`minHeight={820}`) and routed through `LazyPlugins` so its chunk loads on scroll approach. The `#plugins` anchor feeds the page's scroll-map (`scrollMapItems`, `page.tsx:49`).
- **Guide** — the Find-in-App module tree (`desktop-modules.ts`) takes its Plugins children from the manifest.
- **Shared primitives** — `SectionWrapper` (`id="plugins"`, one-shot `staggerContainer` reveal), `SectionIntro`, and animation tokens `staggerContainer`/`fadeUp` from `@/lib/animations`.
- **Brand theme** — `data.ts` assigns each plugin a `BRAND_VAR` color (cyan/purple); `PluginTabs`/`PluginCard` consume it through `color-mix` inline styles.
- **Product tour** — the tabs + window block carries `data-tour-diagram="plugins"` (`index.tsx:59`) and each tab a `data-plugin-key` (`PluginTabs.tsx:37`); the tour clicks `[data-plugin-key="dev-tools"]` (`src/lib/tour-script.ts:303`), so `dev-tools` must stay in the roster (guarded by the contract test).
- **Static assets** — the fleet orb loads `/athena/athena_idle_loop.mp4` (poster `/athena/athena_baseline.jpg`). The six Artist tiles under `/imgs/features/plugins/artist/` were deleted with the plugin (60a4f19).

## Conventions & gotchas
- **i18n — migrated; demo bodies English-only for now.** `t.pluginShowcase` (all 14 locales): the `SectionIntro` heading + gradient, the derived intro, the tab group's `aria-label`, the header's "plugin N of M" counter and both taglines. The demo bodies moved into `t.pluginsExtra` on this branch: `DevToolsGrid` status lines (via `fillTemplate`), title/subtitle, Blocked/Working/Done pills and "autonomous"; `CELLS[].askKey` → `fleet.asks`, `ORB_STOPS[].caption` → `fleet.captions` keys, and `cellStatusText(state, words, ask)` takes the `fleet.cell` words; `SecondBrain`/`SecondBrainSidePanel` chrome, `BACKLINKS[].noteKey` and `CAPTURES[].textKey`; and variant blurbs (`blurbKey` → `variantBlurbs`). `pluginsExtra` is listed in `PENDING_TRANSLATION` in `en.ts`, so the 13 other locales fall back to English until it is translated. Left in code on purpose: product/variant names (`label`), session names (`auth-refactor`, …), vault file names, the vault path, stats numbers and capture times.
- **Stale counts outside this context.** The tour narration `features6` (`src/i18n/en.ts`, 14 locales, and the recorded `/tour/features6.mp3`) still says "six purpose-built plugins" - an owner task (audio regeneration). The guide's Artist mentions were removed in all 14 locales (60a4f19).
- **Animation gating is partial (real issue).** `DevToolsGrid` and `SecondBrain` gate their ambient loops through `useLoopGate` (on screen + tab visible + `useStillMotion`; framer's `useReducedMotion` is barred from this context by `lab/still-motion.test.ts`): no `setInterval`, no resolving pulse / looping video, no graph pulses while any decider objects, and one-shot entrances use `duration: 0` under reduced motion. But `PluginCard` and `PluginTabs` use `motion` `whileInView`/`animate` with **no** reduced-motion check. The custom lint rule only flags `requestAnimationFrame`/`cancelAnimationFrame`, so framer `whileInView`-only motion slips past it. Gate these if you touch them.
- **Token violations (real issue).** Raw `bg-[#0b0c12]` cell backgrounds and `rgba(34,211,238,…)` shadows in `AthenaFleetParts`. `data.ts` (and the orb's `border-brand-cyan`) uses `BRAND_VAR`/semantic tokens. The `color-mix` inline-style pattern in `PluginTabs`/`PluginCard` is the correct way to alpha a brand CSS var.
- **Counter semantics.** `PluginCard`'s "plugin N of M" counts the *showcased* plugins (2), while the intro states the *shipped* count (4). The intro makes the difference explicit; don't "fix" one to match the other.
- **`type` keys vs labels.** `PluginKey` `"obsidian-brain"` surfaces as label `"Brain"` (the manifest and guide nav use the desktop label "Obsidian Brain"); the variant key for Brain is `"brain"`. The nested variant switcher only shows when `variants.length > 1` (`PluginCard.tsx:30,70`) — currently no plugin.
- **Orb resource discipline.** When its `reduced` prop is true `AthenaOrb` mounts a static `<Image>` poster, **not** the `<video>` (`AthenaFleetParts.tsx:115-131`). `DevToolsGrid` passes `reduced={!run}`, so the poster also replaces the video while the grid is off screen or the tab is hidden — keep that branch when editing the orb so reduced-motion users never download/loop the mp4.
- **Late-mount/`once`-reveal caveat.** Every grid self-drives `whileInView once:true` rather than inheriting `SectionWrapper`'s one-shot stagger — which is correct here (children that mount after the wrapper's reveal would otherwise stay hidden). Preserve the self-driven `whileInView` if you refactor; don't switch them to `variants`-inherited reveals.
- **A11y is reasonable.** Decorative images use `alt=""` + `aria-hidden`, tabs use `aria-pressed`, the SVG is `aria-hidden`. The non-functional "Capture" control is presentational (no handler) — fine for a demo, but it looks interactive.

## Related docs
- [Agent Lab](agent-lab.md)
- [Feature index](../INDEX.md)
