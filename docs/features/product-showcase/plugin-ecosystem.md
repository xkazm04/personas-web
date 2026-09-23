# Plugin Ecosystem
> Tabbed plugin showcase — two of the desktop's four shipped plugins (Dev Tools, Brain), each rendered as a live mini-demo, with the roster projected from one desktop-plugin manifest · **Route:** `/features` (deep-dive section `#plugins`) · **Status:** Live

## What it does
Pitches Personas' plugin model: agents don't just chat, they drive purpose-built **workspaces**. The section is a single glass "app window" with a row of plugin tabs across the top. Pick a tab and the window swaps to that plugin's live mini-demo:

- **Dev Tools** — the **Athena Fleet**: a 4×4 grid of 16 CLI sessions that spawn, work, block on questions, and go stale on their own clocks while Athena's avatar orb glides cell to cell, resolving each blocker on-policy and narrating it ("✓ approved — quarantine 3"). Loops to "16/16 green · 0 human interruptions."
- **Brain** — a "second brain" knowledge graph: an animated SVG node graph (central note + six satellites, pulse rings) beside a side panel of backlinks and recent captures, footed with vault stats (4,281 notes · 18,904 links · 92% recall).

The intro states how many plugins the desktop ships and how many are on stage ("Personas ships with 4 plugins, and 2 of them are at work below."). Both numbers are computed, not typed, and the sentence is translated in all 14 locales. The window header shows the active plugin's icon/tagline and a "plugin N of 2" counter (the showcased count); the dot color is the plugin's brand accent. It is a pure presentational demo — no real plugins run, no data is fetched.

**Removed 2026-09-23:** the Artist (style grid) and Research Lab (project lifecycle + literature board) demos. The desktop removed both plugins (desktop `CHANGELOG.md:45`, [Unreleased] › Removed: "The Artist and Research Lab plugins are gone").

## How it works
**The manifest seam.** `src/data/desktop-plugins.ts` exports `DESKTOP_PLUGINS`, one entry per desktop plugin with `status: "shipped" | "dev-only" | "removed"`, a `source` citation (desktop `PluginsSidebarNav.tsx:78-82` or `CHANGELOG.md:45`) and a `verifiedAgainst` date. Today: `dev-tools`, `drive`, `obsidian-brain`, `twin` shipped; `scraper` dev-only; `artist`, `research-lab` removed. `ShippedPluginId` is a type derived from the array. Three things project from it:
1. **Showcase roster** — `plugins/roster.ts` (component-free) holds `SHOWCASE_KEYS` (`["dev-tools", "obsidian-brain"]`, `satisfies readonly ShippedPluginId[]`, so a removed id is a tsc error), `DEFAULT_SHOWCASE_KEY` (`"dev-tools"`), `assertShowcaseShipped(keys)` (throws naming a non-shipped id), `SHOWCASE_COUNTS` (`{ showcased, shipped }`), and the pure template helpers `fillTemplate(template, vars)` and `pluginsIntro(copy, showcased, shipped, formatNumber?)`.
2. **Guide Find-in-App tree** — `src/data/guide/desktop-modules.ts` builds the Plugins node's children as `browse` + every shipped plugin.
3. **Intro count** — `index.tsx` calls `pluginsIntro(t.pluginShowcase, SHOWCASE_COUNTS.showcased, SHOWCASE_COUNTS.shipped, n => n.toLocaleString(language))`: it picks `introAll` (every shipped plugin on stage) or `introSome`, fills `{shipped}`/`{showcased}` with locale digits and appends `introTail`. Digits, not number words, so no locale needs a spell-out table; the ar/cs/ru templates are phrased to avoid noun-number agreement.

`src/data/desktop-plugins.test.ts` is the contract: shipped set, citations, showcase ⊆ shipped, removed-cannot-showcase, derived intro (template + injected formatter), `fillTemplate`, every locale interpolating every placeholder and differing from English, guide-nav = shipped set, and the tour/Brain guards.

Entry is `Plugins.tsx` (one-line re-export of `plugins/index.tsx`). `index.tsx` is the only stateful piece: it holds `active` (the selected `PluginKey`, default `DEFAULT_SHOWCASE_KEY`) and `variantByPlugin` (a per-plugin map of which sub-variant is showing, lazily initialized to each plugin's first variant). It resolves `activePlugin`/`activeVariant` from `PLUGINS` (`data.ts`, which maps `SHOWCASE_KEYS` over a `DEMOS: Record<PluginKey, …>` table, so roster and demos cannot drift) and renders `<SectionIntro>` + `<PluginTabs>` + `<PluginCard>`.

`PluginTabs` renders one pill per plugin; the active pill gets a brand-tinted border + glow via `color-mix` inline styles (because `p.color` is a CSS var from `BRAND_VAR`, hex-suffix alpha won't work — see the inline comment at `PluginTabs.tsx:39`). `PluginCard` draws the glass window chrome, an optional nested variant switcher (only when a plugin has >1 variant — none does since Research Lab left; kept for a future multi-variant demo such as Twin), and an `AnimatePresence mode="wait"` crossfade keyed on `${active}-${activeVariantKey}` so swapping tabs animates the body. The actual demo body is `activeVariant.component` — each grid is an independent `"use client"` component referenced by the `PluginDef`.

Each grid self-drives its own entrance animation with `whileInView`/`viewport={{ once: true }}` (it does **not** inherit the parent stagger). Both are genuinely interactive/looping:

- **Athena Fleet** (`DevToolsGrid` + `dev-tools-grid/`): a deterministic clock. A `setInterval` (`TICK_MS = 1200`) advances `tick`; `phase = tick % CYCLE` (CYCLE = 24) drives everything. Pure functions in `athenaFleetData.ts` compute each cell's `CellState` (`stateAt`), the orb's position/caption (`orbAt`), and per-cell status text (`cellStatusText`). Three acts: spawn (waves fill the 4×4), churn (three cells block on `ask` questions, one goes `stale`), triage (the orb visits `ORB_STOPS` in attention order, flips blocked cells to `resolving`, then they return to `working` until `doneAt`). `AthenaFleetParts.tsx` renders the cells and the floating orb (the same avatar the site tour uses).
- **Second Brain graph** (`SecondBrainGraph`): an SVG (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`) drawing `EDGES` as gradient `motion.line`s (animated `pathLength`), positioned HTML node chips for `SATELLITES` + `CENTRAL`, and three expanding pulse rings. Data is in `secondBrainData.ts`; `SecondBrainSidePanel` lists `BACKLINKS`/`CAPTURES`.


## Key files
| File | Role |
| --- | --- |
| `src/data/desktop-plugins.ts` | `DESKTOP_PLUGINS` manifest (status + source + verifiedAgainst), `ShippedPluginId`, `SHIPPED_DESKTOP_PLUGINS` |
| `src/data/desktop-plugins.test.ts` | Contract test: manifest, roster, intro derivation, guide-nav projection |
| `src/components/feature-sections/plugins/roster.ts` | `SHOWCASE_KEYS`, `DEFAULT_SHOWCASE_KEY`, `assertShowcaseShipped`, `SHOWCASE_COUNTS`, `fillTemplate`, `pluginsIntro` |
| `src/components/feature-sections/Plugins.tsx` | One-line re-export of `plugins/index` |
| `src/components/feature-sections/plugins/index.tsx` | Stateful root: `active` tab + per-plugin variant state, composes Intro/Tabs/Card |
| `src/components/feature-sections/plugins/data.ts` | `PLUGINS[]` — `SHOWCASE_KEYS` joined to their demo defs (label/taglineKey/icon/color/variants) |
| `src/components/feature-sections/plugins/types.ts` | `PluginKey` (= roster `ShowcaseKey`), `ShowcaseCopy` (= `Translations["pluginShowcase"]`), `PluginDef`, `VariantDef` |
| `src/components/feature-sections/plugins/components/PluginTabs.tsx` | Top pill tab row, brand-tinted active state |
| `src/components/feature-sections/plugins/components/PluginCard.tsx` | Glass window chrome, nested variant switcher, `AnimatePresence` body |
| `src/components/feature-sections/plugins/DevToolsGrid.tsx` | Athena Fleet clock + grid + status line |
| `src/components/feature-sections/plugins/dev-tools-grid/athenaFleetData.ts` | Fleet data + deterministic state machine (`stateAt`/`orbAt`/`cellStatusText`) |
| `src/components/feature-sections/plugins/dev-tools-grid/AthenaFleetParts.tsx` | `FleetCell` tile + `AthenaOrb` floating avatar (video / reduced-motion poster) |
| `src/components/feature-sections/plugins/SecondBrain.tsx` | Brain layout: header, graph + side panel grid, vault-stats footer |
| `src/components/feature-sections/plugins/second-brain/SecondBrainGraph.tsx` | Animated SVG knowledge graph (edges, nodes, pulse rings) |
| `src/components/feature-sections/plugins/second-brain/SecondBrainSidePanel.tsx` | Backlinks + recent-captures panel |
| `src/data/guide/desktop-modules.ts` | Guide Find-in-App tree; its Plugins children derive from the manifest |
| `src/components/feature-sections/plugins/second-brain/secondBrainData.ts` | `CENTRAL`/`SATELLITES`/`EDGES`/`BACKLINKS`/`CAPTURES`/`nodeById` |
| `src/app/features/page.tsx` | Mounts the section at `#plugins` via `LazyPlugins` (`page.tsx:82-86`) |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyPlugins` scroll-gated dynamic import (`:47`) |

## Data & state
- **Source:** all static module constants — `DESKTOP_PLUGINS` (`src/data/desktop-plugins.ts`), `SHOWCASE_KEYS` (`roster.ts`), `PLUGINS` (`data.ts`), `CELLS`/`ORB_STOPS` (`athenaFleetData.ts`), `SATELLITES`/`EDGES`/`BACKLINKS`/`CAPTURES` (`secondBrainData.ts`). No fetch, no mock-API call.
- **Stores:** none. No Zustand. Only local `useState` in `index.tsx` (active tab + variant map) and the `tick` counter in `DevToolsGrid`.
- **API routes:** none.
- **Types:** `DesktopPlugin` / `DesktopPluginStatus` / `ShippedPluginId` (`desktop-plugins.ts`); `ShowcaseKey` (`roster.ts`); `PluginKey` / `PluginDef` / `VariantDef` (`types.ts`); `CellState` / `FleetCellDef` / `OrbStop` (`athenaFleetData.ts`); `NodeType` / `GraphNode` (`secondBrainData.ts`). Brand colors via `BRAND_VAR` (`@/lib/brand-theme`).

## Integration points
- **Desktop app** — `DESKTOP_PLUGINS` mirrors the desktop `PluginsSidebarNav.tsx` catalog and `CHANGELOG.md`. Re-verify it (and bump `verifiedAgainst`) on each desktop sync and whenever `docs/parity-backlog/PARITY-MATRIX.md` is refreshed; the matrix rates Twin "absent — plugins-page card", which is now one roster key plus one `DEMOS` entry.
- **`/features` page** — composed as the final `StageSection id="plugins"` (`src/app/features/page.tsx:82`), inside a `LazyMount` (`minHeight={820}`) and routed through `LazyPlugins` so its chunk loads on scroll approach. The `#plugins` anchor feeds the page's scroll-map (`scrollMapItems`, `page.tsx:27`).
- **Guide** — the Find-in-App module tree (`desktop-modules.ts`) takes its Plugins children from the manifest.
- **Shared primitives** — `SectionWrapper` (`id="plugins"`, one-shot `staggerContainer` reveal), `SectionIntro`, and animation tokens `staggerContainer`/`fadeUp` from `@/lib/animations`.
- **Brand theme** — `data.ts` assigns each plugin a `BRAND_VAR` color (cyan/purple); `PluginTabs`/`PluginCard` consume it through `color-mix` inline styles.
- **Product tour** — the window carries `data-tour-diagram="plugins"` (`index.tsx:53`) and each tab a `data-plugin-key` (`PluginTabs.tsx:31`); the tour clicks `[data-plugin-key="dev-tools"]` (`src/lib/tour-script.ts:303`), so `dev-tools` must stay in the roster (guarded by the contract test).
- **Static assets** — the fleet orb loads `/athena/athena_idle_loop.mp4` (poster `/athena/athena_baseline.jpg`). The six Artist tiles under `/imgs/features/plugins/artist/` were deleted with the plugin (60a4f19).

## Conventions & gotchas
- **i18n — partly migrated (real issue).** Translated (`t.pluginShowcase`, all 14 locales): the `SectionIntro` heading + gradient, the derived intro, the tab group's `aria-label`, the header's "plugin N of M" counter and both taglines. `index.tsx` reads `useTranslation()` and passes `copy` down to `PluginTabs`/`PluginCard`; `data.ts` holds a `taglineKey`, not the English text. Product names (`label`: Dev Tools, Brain) stay untranslated by design. **Still hardcoded English** (the demo bodies): `DevToolsGrid` status lines, "Agent fleet", "16 CLIs · Athena on watch", the Blocked/Working/Done pills and "autonomous"; `ORB_STOPS` captions, `CELLS[].ask` questions and `cellStatusText` phrases (`athenaFleetData.ts`); `SecondBrain` "Second brain", "Recall a thought...", "Capture", "Vault:", notes/links/recall; `SecondBrainSidePanel` "Connections", "Recent thoughts"; `BACKLINKS[].note` and `CAPTURES` text + times (`secondBrainData.ts`); and the variant `label`/`blurb` in `data.ts` (not rendered while every plugin has one variant). Those phrases are pure-data today, so migrating them means passing `t` into `cellStatusText`/`orbAt` or keying the data by id.
- **Stale counts outside this context.** The tour narration `features6` (`src/i18n/en.ts`, 14 locales, and the recorded `/tour/features6.mp3`) still says "six purpose-built plugins" - an owner task (audio regeneration). The guide's Artist mentions were removed in all 14 locales (60a4f19).
- **Animation gating is partial (real issue).** `DevToolsGrid` and the second-brain pair (`SecondBrain` → `SecondBrainGraph`) read reduced motion through `useStillMotion` (SSR-safe and live; framer's `useReducedMotion` is barred from this context by `lab/still-motion.test.ts`) and short-circuit (no `setInterval`, no looping video, `duration: 0` on entrances). But `PluginCard` and `PluginTabs` use `motion` `whileInView`/`animate` with **no** reduced-motion check. The custom lint rule only flags `requestAnimationFrame`/`cancelAnimationFrame`, so framer `whileInView`-only motion slips past it. Gate these if you touch them.
- **Token violations (real issue).** Raw `bg-[#0b0c12]` cell backgrounds and `rgba(34,211,238,…)` shadows in `AthenaFleetParts`. `data.ts` (and the orb's `border-brand-cyan`) uses `BRAND_VAR`/semantic tokens. The `color-mix` inline-style pattern in `PluginTabs`/`PluginCard` is the correct way to alpha a brand CSS var.
- **Counter semantics.** `PluginCard`'s "plugin N of M" counts the *showcased* plugins (2), while the intro states the *shipped* count (4). The intro makes the difference explicit; don't "fix" one to match the other.
- **Stale strings in motion captions.** `ORB_STOPS` captions and `cellStatusText` use emoji/em-dash literals ("✓ approved — quarantine 3", "⚡ nudged") — these are hardcoded English *and* would need translating; they're part of the remaining i18n debt above, not separate decoration.
- **`type` keys vs labels.** `PluginKey` `"obsidian-brain"` surfaces as label `"Brain"` (the manifest and guide nav use the desktop label "Obsidian Brain"); the variant key for Brain is `"brain"`. The nested variant switcher only shows when `variants.length > 1` (`PluginCard.tsx:25,62`) — currently no plugin.
- **Reduced-motion orb resource discipline.** Under reduced motion `AthenaOrb` mounts a static `<Image>` poster, **not** the `<video>` (`AthenaFleetParts.tsx:113-132`) — keep that branch when editing the orb so reduced-motion users never download/loop the mp4.
- **Late-mount/`once`-reveal caveat.** Every grid self-drives `whileInView once:true` rather than inheriting `SectionWrapper`'s one-shot stagger — which is correct here (children that mount after the wrapper's reveal would otherwise stay hidden). Preserve the self-driven `whileInView` if you refactor; don't switch them to `variants`-inherited reveals.
- **A11y is reasonable.** Decorative images use `alt=""` + `aria-hidden`, tabs use `aria-pressed`, the SVG is `aria-hidden`. The non-functional "Capture" control is presentational (no handler) — fine for a demo, but it looks interactive.

## Related docs
- [Agent Lab](agent-lab.md)
- [Feature index](../INDEX.md)
