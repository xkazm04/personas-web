# Agent Lab
> An interactive tabbed showcase for refining personas — Chat, Arena, Evolution, and Eval — each tab a self-running mini-demo. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
"The Lab" is the `/features` section that pitches the four ways Personas helps you improve an agent. A pill-style tab switcher swaps between four interactive panels:

- **Chat** — a scripted "refinement chat" types itself out: the user asks for a behavior change, the assistant reasons over run stats, then an `applied diff` block shows the config delta. A **replay** button restarts the script.
- **Arena** — two prompt versions (A vs. B) fight across 5 rounds; each round auto-advances, scores animate in, a win/lose badge springs in, and a running win tally updates.
- **Evolution** — a static "genome tree" SVG: nodes per generation (G0–G5), best lineage in amber, alive in emerald, culled greyed out, with a pulsing halo on the best node. Entrance-animated only (no cycling).
- **Eval** — an animated radar chart scoring a persona across 6 dimensions (Accuracy, Clarity, Tone, Latency, Cost, Safety) against a dashed baseline, plus a per-dimension delta list and an average summary.

All data is fabricated demo content — nothing fetches. It is a marketing showcase, not the real lab tooling.

## How it works
`Lab.tsx` is a one-line re-export of `./lab/index`. `index.tsx` holds the single piece of cross-tab state — `active: LabTab` (`useState<LabTab>("chat")`, `index.tsx:16`) — and renders `SectionIntro`, the `TabSwitcher`, and the active tab inside a `motion.div` keyed by `active` so each tab switch cross-fades (opacity + y, 0.35s, `index.tsx:39-50`). The switcher and active panel are wrapped in `data-tour-diagram="lab"` so the guided tour can spotlight both together (referenced from `src/lib/tour-script.ts:283`).

`TabSwitcher` maps `TABS` (`data.ts`) to buttons; the active button gets a colored glow via inline `boxShadow` using the tab's `color` (a `BRAND_VAR` value), and a mono blurb line under the row shows the active tab's `blurb`. Tab labels are hidden below `sm` (`hidden sm:inline`), leaving icon-only on mobile.

Each tab panel is a glass card (`bg-background/80 backdrop-blur-xl`) with a `TabBackdrop` behind it, a header row, a body, and a footer legend. The three animated tabs are **self-driven** — they do not depend on `index.tsx` to start; they run on mount:
- **ChatTab** schedules a chain of `setTimeout`s (cumulative `delay` from `CHAT_SCRIPT`), appending one message at a time and auto-scrolling via `requestAnimationFrame`. Phase tracks `idle → running → done`; the header dot/text reflects `applying changes` vs. `synced`.
- **ArenaTab** runs a 3.4s `setInterval` that advances the round, flips to `fighting` (scores show `…`), then a 0.9s timeout flips to `result`.
- **EvalTab** computes the radar geometry in render (`axisPoint`/`scorePath`) and animates the baseline path, score path, dots, and side list in on mount.
- **EvolutionTab** is purely entrance-animated (path-draw + spring nodes + one looping pulse) and has no interval/state.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/Lab.tsx` | One-line re-export of `./lab/index` |
| `src/components/feature-sections/lab/index.tsx` | Section body: `active` tab state, `SectionIntro`, tab switch cross-fade, tour anchor |
| `src/components/feature-sections/lab/data.ts` | `TABS`, `CHAT_SCRIPT`, `ARENA_ROUNDS`, `GENOME_NODES`, `EVAL_DIMENSIONS` — all hardcoded English/demo data |
| `src/components/feature-sections/lab/types.ts` | `LabTab`, `TabDef`, `ChatMsg`, `Round`, `GenomeNode` shapes |
| `src/components/feature-sections/lab/components/TabSwitcher.tsx` | Pill tab row + active glow + blurb line |
| `src/components/feature-sections/lab/components/TabBackdrop.tsx` | Per-tab dark/light `next/image` illustration behind each panel |
| `src/components/feature-sections/lab/components/ChatTab.tsx` | Scripted refinement chat with replay; reduced-motion gated |
| `src/components/feature-sections/lab/components/ArenaTab.tsx` | A/B prompt duel, auto-advancing rounds; reduced-motion gated |
| `src/components/feature-sections/lab/components/EvalTab.tsx` | Hand-built radar SVG + delta list; reduced-motion gated |
| `src/components/feature-sections/lab/components/EvolutionTab.tsx` | Genome-tree SVG; entrance-only, **not** reduced-motion gated |

## Data & state
- **Source:** Static module literals in `data.ts` — no fetch, no Supabase, no orchestrator. Demo content: `CHAT_SCRIPT` (7 msgs), `ARENA_ROUNDS` (5), `GENOME_NODES` (10), `EVAL_DIMENSIONS` (6). Tab illustrations load from `/imgs/features/lab/{tab}-{dark|light}.png`.
- **Stores:** None (no Zustand). State is all component-local: `active` (`index.tsx`), `visible`/`phase`/`prevReduced` + timeout refs (ChatTab), `currentRound`/`phase`/`prevReduced` (ArenaTab). EvalTab and EvolutionTab are stateless.
- **API routes:** None.
- **Types:** `LabTab = "chat" | "arena" | "evolution" | "eval"`; `TabDef = { key, label, icon: LucideIcon, color, blurb }`; `ChatMsg = { role: "user"|"assistant"|"diff", content, delay }`; `Round = { id, input, winner: "A"|"B", scoreA, scoreB }`; `GenomeNode = { id, gen, x, fitness, parent, alive, best }`.

## Integration points
- **Mount.** Lazy-loaded as `LazyLab` (`src/components/feature-sections/feature-lazy.tsx:41`, `createLazySection(..., SectionSkeleton, { ssr: false })`) and placed in `src/app/features/page.tsx:76` inside `<StageSection id="lab" glow="cyan" …>` wrapped by `<LazyMount minHeight={820} label="Lab">`. Also imported directly by the scratch `src/app/todo/page.tsx`.
- **`SectionWrapper`.** Renders inside `SectionWrapper id="lab"`; the `SectionIntro` block is wrapped in a `whileInView` `staggerContainer` (`once: true`). `TabSwitcher` self-drives its own `whileInView fadeUp` reveal rather than inheriting.
- **Guided tour.** `data-tour-diagram="lab"` (the spotlight target, `tour-script.ts:283`) and `data-lab-tab={key}` on each button let the tour highlight the diagram and click tabs. The vision-grid card `id="lab"` (`src/components/sections/vision-grid/data.ts:108`) deep-links here.
- **Shared libs.** `SectionWrapper`, `SectionIntro` (`@/components/primitives`), `staggerContainer`/`fadeUp` from `@/lib/animations`, `BRAND_VAR` from `@/lib/brand-theme`, `lucide-react` icons.

## Conventions & gotchas
- **i18n — NOT wired (real gap).** The whole section is **hardcoded English**, against the 14-locale lockstep rule. There is no `useTranslation()` / `t.*` anywhere under `lab/`. This includes the `SectionIntro` `heading="The"` / `gradient="Lab"` / the long `description` (`index.tsx:27-30`); every `TABS` label and blurb in `data.ts`; all `CHAT_SCRIPT` content; panel headers ("Refinement chat", "Prompt arena", "Genome tree", "Eval radar"); status/legend strings ("applying changes"/"synced", "applied diff", "fitness score", "round complete", "best lineage"/"alive"/"culled", "current"/"baseline", "6 dimensions · 50 sample runs"); the chat input placeholder "Tell the agent what to change…"; and button labels ("replay", "breed next gen"). The `aria-label`s in ArenaTab ("Version A wins this round" etc.) are English too. Localizing means lifting all of this into `src/i18n/en.ts` and hand-translating into the other 13 locales.
- **Copy/feature mismatch.** The `SectionIntro` description opens with "**Six** ways to make your personas better" but only **four** tabs ship; the blurb then lists four. Likewise `TABS[3].blurb` says "Score personas across **6 dimensions**" which is accurate to `EVAL_DIMENSIONS` — but the headline "six ways" is not. Treat the headline number as stale copy.
- **Ungated motion (real gotcha).** `ChatTab`, `ArenaTab`, and `EvalTab` correctly import and call `useReducedMotion` and short-circuit (Chat renders the full script immediately; Arena jumps to the last round's result; Eval zeros its transition durations). **`EvolutionTab` does not** — it imports only `motion`, runs path-draw + spring entrance animations, and an **infinite** pulse on the best node (`animate={{ opacity: […], r: […] }}`, `transition={{ duration: 2, repeat: Infinity }}`, `EvolutionTab.tsx:114-123`) with no reduced-motion guard. The `custom-animation/require-animation-gating` lint rule keys on `requestAnimationFrame`/`cancelAnimationFrame` (which this file doesn't use), so it isn't flagged — but the continuous `repeat: Infinity` loop should gate. `ChatTab` does use `requestAnimationFrame` (auto-scroll) and is correctly gated, satisfying the rule.
- **Dead / non-functional controls.** EvolutionTab's "breed next gen" button (`EvolutionTab.tsx:158`) has **no `onClick`** — it's decorative; the imported `Play` icon is the only thing it does. The ChatTab "Tell the agent what to change…" field is a static `div`, not an input. EvolutionTab has no `Play`-driven interaction at all despite the affordance.
- **Hardcoded color tokens (token violations).** Against the "no raw hex" convention: ArenaTab uses literal `#06b6d4` / `#a855f7` for A/B (`ArenaTab.tsx:83`); EvalTab uses `#10b981` and `rgba(16, 185, 129, 0.28)` for the score path/dots; EvolutionTab uses `#f59e0b` / `#10b981` / `#06b6d4` / `#ffffff` / `rgba(127,127,127,0.45)` and the Tailwind `text-amber-400` / `emerald-400` / `amber-500` classes instead of `text-brand-*`. By contrast `TABS[].color` correctly uses `BRAND_VAR.*`, and ChatTab/EvalTab headers use `text-brand-cyan`/`text-brand-emerald`. The SVG hexes are partly unavoidable (animated `stroke`/`fill` attributes), but the Tailwind `*-400`/`*-500` utility classes have `brand-*` equivalents and are genuine token drift.
- **Text opacity.** Several mono labels sit at `text-foreground/60` (e.g. `TabSwitcher` inactive buttons + blurb, panel sublabels). `/60` is the floor the `custom-a11y/no-low-text-opacity` rule allows, so these pass — but nothing here should drop below it.
- **Redundant Arena timer.** ArenaTab sets the `fighting → result` timeout in **two** places: inside the `setInterval` callback (`ArenaTab.tsx:32`, whose returned cleanup never runs) and again in a separate `useEffect` keyed on `phase`/`currentRound` (`:38-43`). The second effect is the one that actually re-arms; the in-interval timeout is effectively redundant and its cleanup is dead. Harmless but confusing — both fire ~0.9s after a round starts.
- **React 19 purity.** EvalTab and EvolutionTab compute geometry (`Math.cos/sin`, path strings) in render from static data — pure, fine. No `Date.now()`/`Math.random()` anywhere. Reduced-motion resets use the prev-state pattern (`prevReduced`) rather than `setState`-in-effect, per the React 19 rule.
- **TabBackdrop.** Decorative only — `aria-hidden`, `alt=""`, `priority={false}`, separate dark/light `next/image` layers with a gradient scrim. Images at `/imgs/features/lab/{tab}-{dark|light}.png` must exist for all four tabs or the panels show empty backdrops.

## Related docs
- [Plugin Ecosystem](plugin-ecosystem.md)
- [Feature index](../INDEX.md)
