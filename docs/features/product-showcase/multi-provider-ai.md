# Multi-Provider AI
> "Router, lit": four agents on your machine each send their thinking through a per-agent pick to the engine that suits them: Claude (via Claude Code) at Opus, Sonnet or Haiku weight, or Ollama on the machine for the private one · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Presents how Personas routes work across AI engines. The story is deliberately
narrow: **Claude is the primary engine** (reached through Claude Code), and
**Ollama** is the user-chosen path for private or offline work. Under the heading
"Powered by **Claude**. Private via **Ollama**." one drawing shows a machine
("Your machine") on the left with four agent rows (code review, inbox, journal,
brief) and, on the right, a Claude box with three stations: **Opus** (largest),
**Sonnet**, **Haiku**, each with a short trait line. One by one each agent's
"thinking" orb leaves its row, passes the **per-agent pick** hub, and docks at its
engine: code review to Opus, inbox to Haiku, brief to Sonnet, while the journal
agent (marked with a lock) turns down to **Ollama inside the machine**, which gains a
dashed shield. Each row then names its engine ("-> Opus"). Once docked, small pulses
keep every line busy. A replay button restarts the 4.6 s story.

It is a presentational marketing section: no inputs, no live data, no model calls.

## How it works
`models-router/index.tsx` (`MultiProviderAI`) is a `SectionWrapper(fit="fill",
id="multi-provider")` with `Intro` (heading + lede) and an `ArtBox` (`data-stage-slot` >
`data-stage-art`, `--art-ar` = 1200/560, inline-size container). The SVG is `role="img"`
with `aria-label={v1.artLabel}`; layers in paint order: `Defs`, `Backdrop` (machine and
Claude panels, the single port, "Your machine" / "via Claude Code" labels), `Stations`,
`Agents`, then the hub drawn last so orbs pass under it, plus the replay button and a
`StylisedTag`.

**Two motion values.** `usePlay(ref, DURATION)` (`shared/motion.ts`) gives `p` (0..1, played
once at 35% in view, `play()` replays; rests at 1 on the server and when still).
`useLoop(ref, 3.2, 0.3)` is the ambient pulse phase: runs only while in view and the tab is
foregrounded (`useIsVisible`), and rests at 0.3 under reduced motion.

**Geometry** (`geometry.ts`, viewBox 1200 x 560): `MACHINE`, `CLOUD`, `HUB`, `PORT`,
`STATIONS` (centre + radius; size reads as weight), `ROW`, and `AGENTS` (engine, row y,
orb size, `start` offset, `lock`) in a deliberately mixed departure order so the sorting
reads. `route(a)` builds each agent's cubic path (row socket -> hub -> port -> station, or
hub -> down to Ollama); `ROUTES` caches segment lengths so speed is even; `at(i, u)` gives
a point by length; `own`/`orbU`/`docked`/`swell` derive per-agent progress from `p`.
Float output is rounded with `r2` so server and browser agree on hydration.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/models-router/index.tsx` | Section shell and SVG composition, hub, replay |
| `models-router/geometry.ts` | Layout constants, `AGENTS`, routes, progress helpers (`orbU`, `docked`, `swell`) |
| `models-router/Agents.tsx` | Agent rows, travelling orbs, lit routes, ambient `Pulse`s, lock glyph on the private one |
| `models-router/Stations.tsx` | Opus/Sonnet/Haiku/Ollama stations: halo swell on docking, Ollama shield ring, trait lines |
| `models-router/Backdrop.tsx` | `Defs` gradients, machine and Claude panels, port, place labels |
| `models-router/shared/Frame.tsx` | `Intro` (templated heading), `ArtBox`, `frame()`, `ReplayButton`, `StylisedTag` |
| `models-router/shared/motion.ts` | `usePlay`, `useLoop`, palette (`CLAUDE` = amber, `LOCAL` = emerald), `mix`, `ease`, `r2` |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyMultiProviderAI` imports the folder (`:29-33`) |

## Data & state
- **Source:** static. Words: `aiModelsSection.heading` (template split on `{claude}` /
  `{ollama}` into `GradientText` names) and `.replay` (older namespace, reused), plus
  `featuresSections.models` (`stylised`, `yourMachine`, `viaClaudeCode`, `traits.*`,
  `agents.*`, `v1.lede|artLabel|pick`) in `src/i18n/en.ts`. Product/model names (Claude,
  Ollama, Haiku, Sonnet, Opus) are literals on purpose.
- **State:** two framer `MotionValue`s (`p`, loop phase) and a ref to the running
  animation; no Zustand, no fetch, no API routes.
- **Agent-to-engine mapping is illustrative:** `Agent.engine` is hard-coded per agent in
  `geometry.ts`; nothing is routed.

## Integration points
- `LazyMultiProviderAI` (`ssr: false`) in `<StageSection id="multi-provider" glow="cyan">` +
  `<LazyMount stage minHeight={760} label="AI models">` (`src/app/features/page.tsx:90-94`);
  scroll-map `AI MODELS` -> `#multi-provider` (`page.tsx:48`).
- `/features` only; not on the homepage.

## Conventions & gotchas
- **Replaced 2026-10-06** by the winner of the /features review. The previous
  implementation (`MultiProviderAI.tsx` and `multi-provider/` `RouterArt` with the
  wide/tall router layouts) is in git history.
- **i18n - English-only for now.** `aiModelsSection` and `featuresSections` are in
  `src/i18n/pending/` (PLAN M22); the other 13 locales fall back to English. Unread leftovers:
  `aiModelsSection.lede|artLabel|local`, `featuresSections.models.v2|v3` and
  `agents.support`.
- **Orphaned namespace still contradicts the section.** `featurePages["multi-provider"]`
  ("Not locked to one AI", four providers, automatic switching) is mirrored across all
  locales but nothing outside `i18n/` reads it. The shipped art tells the two-engine story
  (Ollama is a user-chosen lane, not an automatic fallback). Do not wire the component to
  that namespace as-is.
- **Motion gating.** `useStillMotion` pins `p` to 1 (everything docked) and the loop to its
  rest value; the replay button is `disabled`. DOM shape never changes. The story is
  one-shot; the ambient pulse loop stops off-screen, in a hidden tab and when still.
- **Colour.** Claude is amber and Ollama emerald via `BRAND_VAR` (theme tokens); the
  frame's replay button uses `border-glass` and `bg-background/70`. The "Stylised" tag is
  `text-muted-dark/80`.
- **Provider claims are marketing, not runtime truth in this repo.** The dashboard is
  mock-only; this describes the desktop app's behaviour.
- **Lint watch:** the replay button is `text-foreground/70`; keep text opacities at or
  above `/60` (`custom-a11y/no-low-text-opacity`).

## Related docs
- [Memory Layers](memory-layers.md)
- [Design Engine](design-engine.md)
- [Feature index](../INDEX.md)
