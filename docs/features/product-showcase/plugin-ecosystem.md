# Plugin Ecosystem
> Tabbed plugin showcase — four self-contained agent workspaces (Artist, Dev Tools, Brain, Research Lab) each rendered as a live mini-demo · **Route:** `/features` (deep-dive section `#plugins`) · **Status:** Live

## What it does
Pitches Personas' plugin model: agents don't just chat, they drive purpose-built **workspaces**. The section is a single glass "app window" with a row of plugin tabs across the top. Pick a tab and the window swaps to that plugin's live mini-demo:

- **Artist** — a generative-media studio: a 3×3 grid of six style tiles (Cinematic, Sketch, 3D, Pixel, Watercolor, Glass) backed by real Leonardo illustrations, a prompt box, a selected-style badge, and a "Lucid Origin · 1024×1024 · ~8s" engine card.
- **Dev Tools** — the **Athena Fleet**: a 4×4 grid of 16 CLI sessions that spawn, work, block on questions, and go stale on their own clocks while Athena's avatar orb glides cell to cell, resolving each blocker on-policy and narrating it ("✓ approved — quarantine 3"). Loops to "16/16 green · 0 human interruptions."
- **Brain** — a "second brain" knowledge graph: an animated SVG node graph (central note + six satellites, pulse rings) beside a side panel of backlinks and recent captures, footed with vault stats (4,281 notes · 18,904 links · 92% recall).
- **Research Lab** — two sub-variants switchable via a nested toggle: a **Project Lifecycle** 8-stage pipeline (scoping → complete) with four active projects on progress rails, and a **Literature** source board (2×2 cards with status, citations, annotations, tags).

The window header shows the active plugin's icon/tagline and a "plugin N of 4" counter; the dot color is the plugin's brand accent. It is a pure presentational demo — no real plugins run, no data is fetched.

## How it works
Entry is `Plugins.tsx` (one-line re-export of `plugins/index.tsx`). `index.tsx` is the only stateful piece: it holds `active` (the selected `PluginKey`, default `"dev-tools"`) and `variantByPlugin` (a per-plugin map of which sub-variant is showing, lazily initialized to each plugin's first variant). It resolves `activePlugin`/`activeVariant` from the static `PLUGINS` array (`data.ts`) and renders `<SectionIntro>` + `<PluginTabs>` + `<PluginCard>`.

`PluginTabs` renders one pill per plugin; the active pill gets a brand-tinted border + glow via `color-mix` inline styles (because `p.color` is a CSS var from `BRAND_VAR`, hex-suffix alpha won't work — see the inline comment at `PluginTabs.tsx:39`). `PluginCard` draws the glass window chrome, an optional nested variant switcher (only when a plugin has >1 variant — currently just Research Lab), and an `AnimatePresence mode="wait"` crossfade keyed on `${active}-${activeVariantKey}` so swapping tabs animates the body. The actual demo body is `activeVariant.component` — each grid is an independent `"use client"` component referenced by the `PluginDef`.

Each grid self-drives its own entrance animation with `whileInView`/`viewport={{ once: true }}` (it does **not** inherit the parent stagger). Two grids are genuinely interactive/looping:

- **Athena Fleet** (`DevToolsGrid` + `dev-tools-grid/`): a deterministic clock. A `setInterval` (`TICK_MS = 1200`) advances `tick`; `phase = tick % CYCLE` (CYCLE = 24) drives everything. Pure functions in `athenaFleetData.ts` compute each cell's `CellState` (`stateAt`), the orb's position/caption (`orbAt`), and per-cell status text (`cellStatusText`). Three acts: spawn (waves fill the 4×4), churn (three cells block on `ask` questions, one goes `stale`), triage (the orb visits `ORB_STOPS` in attention order, flips blocked cells to `resolving`, then they return to `working` until `doneAt`). `AthenaFleetParts.tsx` renders the cells and the floating orb (the same avatar the site tour uses).
- **Second Brain graph** (`SecondBrainGraph`): an SVG (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`) drawing `EDGES` as gradient `motion.line`s (animated `pathLength`), positioned HTML node chips for `SATELLITES` + `CENTRAL`, and three expanding pulse rings. Data is in `secondBrainData.ts`; `SecondBrainSidePanel` lists `BACKLINKS`/`CAPTURES`.

`ArtistGrid`, `ResearchLifecycle`, and `ResearchSources` are static (no clocks) — they animate in once and hold.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/Plugins.tsx` | One-line re-export of `plugins/index` |
| `src/components/feature-sections/plugins/index.tsx` | Stateful root: `active` tab + per-plugin variant state, composes Intro/Tabs/Card |
| `src/components/feature-sections/plugins/data.ts` | `PLUGINS[]` — the four plugin defs (key/label/tagline/icon/color/variants) |
| `src/components/feature-sections/plugins/types.ts` | `PluginKey`, `PluginDef`, `VariantDef` |
| `src/components/feature-sections/plugins/components/PluginTabs.tsx` | Top pill tab row, brand-tinted active state |
| `src/components/feature-sections/plugins/components/PluginCard.tsx` | Glass window chrome, nested variant switcher, `AnimatePresence` body |
| `src/components/feature-sections/plugins/ArtistGrid.tsx` | Artist style-tile grid (6 Leonardo tiles) + prompt/engine panel |
| `src/components/feature-sections/plugins/DevToolsGrid.tsx` | Athena Fleet clock + grid + status line |
| `src/components/feature-sections/plugins/dev-tools-grid/athenaFleetData.ts` | Fleet data + deterministic state machine (`stateAt`/`orbAt`/`cellStatusText`) |
| `src/components/feature-sections/plugins/dev-tools-grid/AthenaFleetParts.tsx` | `FleetCell` tile + `AthenaOrb` floating avatar (video / reduced-motion poster) |
| `src/components/feature-sections/plugins/SecondBrain.tsx` | Brain layout: header, graph + side panel grid, vault-stats footer |
| `src/components/feature-sections/plugins/second-brain/SecondBrainGraph.tsx` | Animated SVG knowledge graph (edges, nodes, pulse rings) |
| `src/components/feature-sections/plugins/second-brain/SecondBrainSidePanel.tsx` | Backlinks + recent-captures panel |
| `src/components/feature-sections/plugins/second-brain/secondBrainData.ts` | `CENTRAL`/`SATELLITES`/`EDGES`/`BACKLINKS`/`CAPTURES`/`nodeById` |
| `src/components/feature-sections/plugins/ResearchLifecycle.tsx` | 8-stage pipeline timeline + 4 active projects (variant A) |
| `src/components/feature-sections/plugins/ResearchSources.tsx` | Literature source board, 2×2 cards (variant B) |
| `src/app/features/page.tsx` | Mounts the section at `#plugins` via `LazyPlugins` (`page.tsx:82-86`) |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyPlugins` scroll-gated dynamic import (`:47`) |

## Data & state
- **Source:** all static module constants — `PLUGINS` (`data.ts`), `CELLS`/`ORB_STOPS` (`athenaFleetData.ts`), `SATELLITES`/`EDGES`/`BACKLINKS`/`CAPTURES` (`secondBrainData.ts`), and per-file inline arrays (`TILES` in ArtistGrid, `STAGES`/`PROJECTS` in ResearchLifecycle, `SOURCES` in ResearchSources). No fetch, no mock-API call.
- **Stores:** none. No Zustand. Only local `useState` in `index.tsx` (active tab + variant map) and the `tick` counter in `DevToolsGrid`.
- **API routes:** none.
- **Types:** `PluginKey` / `PluginDef` / `VariantDef` (`types.ts`); `CellState` / `FleetCellDef` / `OrbStop` (`athenaFleetData.ts`); `NodeType` / `GraphNode` (`secondBrainData.ts`). Brand colors via `BRAND_VAR` (`@/lib/brand-theme`).

## Integration points
- **`/features` page** — composed as the final `StageSection id="plugins"` (`src/app/features/page.tsx:82`), inside a `LazyMount` (`minHeight={820}`) and routed through `LazyPlugins` so its chunk loads on scroll approach. The `#plugins` anchor feeds the page's scroll-map (`scrollMapItems`, `page.tsx:27`).
- **Shared primitives** — `SectionWrapper` (`id="plugins"`, one-shot `staggerContainer` reveal), `SectionIntro`, and animation tokens `staggerContainer`/`fadeUp` from `@/lib/animations`.
- **Brand theme** — `data.ts` assigns each plugin a `BRAND_VAR` color (rose/cyan/purple/blue); `PluginTabs`/`PluginCard` consume it through `color-mix` inline styles.
- **Product tour** — the window carries `data-tour-diagram="plugins"` (`index.tsx:52`) and each tab a `data-plugin-key` (`PluginTabs.tsx:31`), so the Athena guided tour can target it.
- **Static assets** — Artist tiles load `/imgs/features/plugins/artist/{cinematic,sketch,3d,pixel,watercolor,glass}.png`; the fleet orb loads `/athena/athena_idle_loop.mp4` (poster `/athena/athena_baseline.jpg`). All present in `public/`.

## Conventions & gotchas
- **i18n violation (real issue):** the entire plugins tree imports `useTranslation` **zero** times — every user-facing string is hardcoded English. The `SectionIntro` heading/description (`index.tsx:45-48`), all `label`/`tagline`/`blurb` copy (`data.ts`), fleet status lines and captions (`DevToolsGrid.tsx:43-54`, `ORB_STOPS` in `athenaFleetData.ts`), `cellStatusText` phrases, project/source titles, vault stats, and "Recall a thought…" / "Capture" placeholders are all inline literals. This breaks the project's non-negotiable i18n rule. Migrate to `src/i18n/en.ts` (+ 14-locale lockstep) before adding more copy here.
- **Animation gating is partial (real issue).** `DevToolsGrid` and the second-brain pair (`SecondBrain` → `SecondBrainGraph`) correctly call `useReducedMotion` and short-circuit (no `setInterval`, no looping video, `duration: 0` on entrances). But `ArtistGrid`, `ResearchLifecycle`, `ResearchSources`, `PluginCard`, and `PluginTabs` use `motion` `whileInView`/`whileHover`/`animate` with **no** `useReducedMotion` check — they still animate (scale, slide, progress-rail fills, hover lift) under "reduce motion". The custom lint rule only flags `requestAnimationFrame`/`cancelAnimationFrame`, so framer `whileInView`-only motion slips past it. Gate these if you touch them.
- **Token violations (real issue).** Heavy raw-hex usage instead of semantic/brand tokens: `TILES` colors (`#ec4899`, `#f472b6`, …) in `ArtistGrid`, `STAGES` colors (`#fbbf24`, `#3b82f6`, …) in `ResearchLifecycle`, `STATUS_STYLE` colors in `ResearchSources`, plus raw `bg-[#0b0c12]` cell backgrounds and `rgba(34,211,238,…)` shadows in `AthenaFleetParts`, and `rgba(0,0,0,…)` scrim gradients in `ArtistGrid`. Only `data.ts` (and the orb's `border-brand-cyan`) uses `BRAND_VAR`/semantic tokens. The `color-mix` inline-style pattern in `PluginTabs`/`PluginCard` is the correct way to alpha a brand CSS var.
- **Copy/count mismatch (real issue).** `SectionIntro` says "**Six** purpose-built plugins shipped with Personas" (`index.tsx:47`), but `PLUGINS` defines only **four** — and `PluginCard` renders an honest "plugin N of 4" counter (`PluginCard.tsx:58`). The "six" is stale. (The Artist grid separately, and correctly, shows "6 styles"; don't confuse the two.)
- **Stale strings in motion captions.** `ORB_STOPS` captions and `cellStatusText` use emoji/em-dash literals ("✓ approved — quarantine 3", "⚡ nudged") — these are hardcoded English *and* would need translating; they're part of the i18n debt above, not separate decoration.
- **`type` keys vs labels.** `PluginKey` `"obsidian-brain"` surfaces as label `"Brain"`; the variant key for Brain is `"brain"`. The nested variant switcher only shows when `variants.length > 1` (`PluginCard.tsx:25,62`) — currently Research Lab only.
- **Reduced-motion orb resource discipline.** Under reduced motion `AthenaOrb` mounts a static `<Image>` poster, **not** the `<video>` (`AthenaFleetParts.tsx:113-132`) — keep that branch when editing the orb so reduced-motion users never download/loop the mp4.
- **Late-mount/`once`-reveal caveat.** Every grid self-drives `whileInView once:true` rather than inheriting `SectionWrapper`'s one-shot stagger — which is correct here (children that mount after the wrapper's reveal would otherwise stay hidden). Preserve the self-driven `whileInView` if you refactor; don't switch them to `variants`-inherited reveals.
- **A11y is reasonable.** Decorative images use `alt=""` + `aria-hidden`, tabs use `aria-pressed`, the SVG is `aria-hidden`. The non-functional Artist "add"/search and "Capture" controls are presentational (no handlers) — fine for a demo, but they look interactive.

## Related docs
- [Agent Lab](agent-lab.md)
- [Feature index](../INDEX.md)
