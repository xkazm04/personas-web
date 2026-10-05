# Use Cases
> The "one persona, many capabilities" section as "Slot reels": six needs, each a reel of real connector tools that spins and stops on the one the persona picks, dealt into its card · **Route:** `/` (homepage section, anchor `#use-cases`, address `personas`, wrapper `#tools`) · **Status:** Live

## What it does

A public homepage section (heading "One persona, **many capabilities**") that makes one claim: a single persona keeps its identity while it reaches for the right tool for each job from the connectors you already use. The art is a slot machine:

1. **Six reels**, one per need ("Write to a client", "Keep meeting notes", "Book the follow-up", "Track the work", "Ship the code", "Get paid"), each loaded with 4 to 6 real tools (Slack, Outlook, Gmail, Teams, Discord, Telegram for "reach", and so on). The need lights over its reel, the reel winds up, spins and stops with the chosen tool on the **payline**.
2. **The persona card** on the left ("Chief of staff", with the product's own persona art and a hand of six capability slots). The payline runs straight into it; each won tool is dealt into the next slot.
3. **The finale:** after the sixth reel the payline glows and reads as the persona's whole toolkit, then the loop restarts.

A control pill under the art (Previous, Pause/Play, Next, Replay, "n / 6") lets the visitor step or stop; once they do, playback never re-arms itself. A status line (screen-reader only) names the current need, the options and the chosen tool. Under reduced motion there is no autoplay: the section rests on the first case, fully composed, and the visitor can still step or press Play.

The tools are a curated slice of the real connector catalog; which one is "chosen" per need is scripted marketing copy, not live behaviour.

## How it works

**Composition (`index.tsx`).** `UseCases` builds `pb = useCaseCycle(artRef, still, BEATS)` (`BEATS = [900, 800, 1900, 900, 1300]` ms for NEED, CONSIDER, SCAN, CHOOSE, DOCK; `index.tsx:16`) and lays everything out in `cqw` units of the art box (`HAND_W`, `REELS_X`, `REEL_W`, `PAY_Y`). It maps `CASES` to `Reel`s with a `ReelState` (`waiting | need | consider | spinning | locked`) derived from the phase, draws the payline (brighter when `pb.finale`), a `motion.span` comet that flies from the active reel to the card during DOCK, and the `PersonaHand`.

**Stage (`shared/CaseStage.tsx`).** `SectionWrapper fit="fill" id="use-cases"` (`CaseStage.tsx:34`), `SectionIntro` heading, then one `data-stage-slot` holding the `data-stage-art` box: `role="img"`, `data-tour-diagram="tools"` (the home tour's first step spotlights it), a fixed aspect ratio (`ar` = 100/40) and `containerType: inline-size`, so every size is in `cqw` and proportions hold from a laptop to a 1080p monitor. Below: `CycleControls` and the `sr-only` live status (`aria-live` is `off` while playing, `polite` when stepping).

**Playback reducer (`shared/cycle.ts`).** Pure, clock-free (testable, no `Date.now()` in render). Position is `(caseIdx, phase)` over five phases `NEED -> CONSIDER -> SCAN -> CHOOSE -> DOCK`; after the last case a FINALE (`caseIdx === count`) rests, then loops (`run` bumps so timers restart). Actions: `ARM`, `TICK`, `PAUSE`, `PLAY`, `REPLAY`, `NEXT`, `PREV`. The initial and resting state is case 0 at DOCK. `ARM` is a no-op once `armed`, which any visitor action sets (WCAG 2.2.2: their stop is open-ended). `shared/cycle.test.ts` covers it.

**Hook (`shared/useCaseCycle.ts`).** An `IntersectionObserver` (thresholds 0 / 0.35 / 0.7) sets `inView` and dispatches `ARM` at 35% unless `prefers-reduced-motion` matches. A `setTimeout` per beat ticks only while `playing && inView && !hidden (usePageVisibility) && (!still || userPlayed)`. It returns `active`, `phase`, `finale`, `docked[]`, `playing`, `ticking`, `moving` (false = jump, for reduced motion without a visitor Play) and the `toggle/replay/next/prev` handlers.

**Catalog (`shared/catalog.ts`).** `TOOLS` (id, label, icon basename under `/public/tools/`, brand colour) is a hand-copied slice of `src/data/connectors.ts`, so the landing chunk does not import the whole catalog. `CASES` is the script (`need`, ordered `candidates`, `chosen`, never first), `BYSTANDERS` the field no case considers. `brandTint`/`brandInk` use `color-mix` so near-black brands stay readable per theme. `shared/catalog.test.ts` holds every tool to its catalog row (label, icon, colour, file exists) and checks no candidate repeats across cases.

**Reels (`Reel.tsx`, `reels.ts`).** `reels.ts` builds each strip (candidates repeated 4 times plus a 3-cell tail), the start and end stop indices and the `translateY` that puts an index on the payline (`PAYLINE_ROW`). `Reel` animates the strip over `spinMs` with an overshooting ease; `PersonaHand.tsx` renders the card and deals tools in; `shared/ToolGlyph.tsx` paints a glyph as a CSS mask of the SVG (`bg-current`).

**Copy (`shared/useCaseCopy.ts`).** Heading from `t.useCasesSection.heading` / `headingGradient`, persona name and description from `t.useCasesPersona`, everything else from `t.landingSections.useCases` (`artLabel`, `needs`, `status`, `controls`, `prevCase`, `nextCase`, `capabilities`, `jobsCount`), filled with `fillTemplate`.

**Stage fit.** `fit="fill"`: exactly one desktop stage (`src/styles/stage.css`); the art box sizes to the slot by aspect ratio.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/use-cases/index.tsx` | Section body: reels, payline, comet, persona hand; `BEATS` |
| `src/components/sections/use-cases/shared/CaseStage.tsx` | Shell: `id="use-cases"`, intro, art box (`data-tour-diagram="tools"`), controls, sr-only status |
| `src/components/sections/use-cases/shared/cycle.ts` | Pure playback reducer (phases, ARM/TICK/PAUSE/PLAY/REPLAY/NEXT/PREV) |
| `src/components/sections/use-cases/shared/useCaseCycle.ts` | Timer + in-view/hidden/still gating over the reducer |
| `src/components/sections/use-cases/shared/CycleControls.tsx` | Previous / Pause-Play / Next / Replay pill and "n / N" |
| `src/components/sections/use-cases/shared/catalog.ts` | `TOOLS` (real connector slice), `CASES` script, `BYSTANDERS`, tint helpers |
| `src/components/sections/use-cases/shared/catalog.test.ts` | Pins every tool to its `connectors.ts` row and icon file |
| `src/components/sections/use-cases/shared/useCaseCopy.ts` | Copy assembly (`useCasesSection` heading + `landingSections.useCases`) |
| `src/components/sections/use-cases/shared/ToolGlyph.tsx` | Masked-SVG tool glyph |
| `src/components/sections/use-cases/Reel.tsx`, `reels.ts` | One reel and its strip maths |
| `src/components/sections/use-cases/PersonaHand.tsx` | Persona card with six capability slots |
| `src/components/sections/use-cases/components/ConnectorIcon.tsx` | `next/image` glyph flattened by `.connector-icon`; no longer used here, still used by Athena onboarding |

## Data & state
- **Source:** static; the script is `CASES` + `TOOLS`. No fetch, no stores, no API routes. State lives in `useCaseCycle` (a `useReducer`) plus an `inView` flag.
- **Copy:** `t.landingSections.useCases.*` and `t.useCasesPersona.*` (persona name/description, `pause`/`play`/`replay`) plus the live `t.useCasesSection.heading` / `headingGradient`. `landingSections` and `useCasesPersona` are in `PENDING_TRANSLATION` (`src/i18n/en.ts`): English only, the 13 other locales fall back at runtime, pending a namespace translation.

## Integration points
- `SectionWrapper` (`fit="fill"`, `id="use-cases"`) and `SectionIntro`; `src/app/page.tsx` wraps it in `#tools` with `data-scroll-anchor="personas"` (`lib/landing-address.ts` maps `tools` and `use-cases` to `personas`).
- `fillTemplate` (`src/lib/fillTemplate.ts`) fills the status, aria and count templates.
- Glyphs are the catalog's own monochrome SVGs under `/public/tools/`; the data row source is `src/data/connectors.ts` (the **Connectors catalog** page).
- `data-tour-diagram="tools"` hooks the guided tour.
- `useStillMotion`, `usePageVisibility`, `BRAND_VAR`/`tint` (`src/lib/brand-theme.ts`).

## Conventions & gotchas
- **Replaced on 2026-10-05** by the winner of the landing review ("Slot reels"). The previous tool tabs, persona card and capability ledger (`usePersonaPlayback`, `ToolTabs`, `PersonaLedger`, the `toolBases` data and the "Browse All Templates" button) are in git history.
- **Resting state is a composed frame.** SSR, reduced motion and a visitor's stop all show case 0 at DOCK; playback arms only from `IntersectionObserver` callbacks on the client and re-checks `prefers-reduced-motion` at arm time. Don't seed an empty state: it would change server markup.
- **Keep the catalog honest.** Adding or renaming a tool means editing `TOOLS` to match `src/data/connectors.ts` (label, icon, colour) and the icon file; `catalog.test.ts` fails the unit run otherwise. A chosen tool must not be the first candidate and no tool may repeat across cases.
- **Animation gating:** `useStillMotion` (`index.tsx`) plus `usePageVisibility` and the 35% in-view rule in `useCaseCycle`; `moving` false makes transitions jump instead of animate.
- **English-only copy** in `landingSections.useCases`; the `useCasesSection` interface still declares unused keys (`integrations`, `patterns`, `description`, `autoplayHint`, `whatCanAutomate`, per-tool `cases`) from the old section.
- **Tokens:** semantic classes plus `tint()`/`color-mix` for brand colours; tool colours go through inline `style` on purpose.

## Related docs
- [Why Agents](why-agents.md)
- [Connectors catalog](../connectors/catalog.md)
- [Feature index](../INDEX.md)
