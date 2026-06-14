# Design Engine
> A self-building "Persona Matrix" that turns one sentence into eight populated capability cells radiating from a central intent tile · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
The Design Engine is the opening section of the `/features` page. It dramatizes
the product's core promise — *"One sentence. One matrix."* — by animating a
persona being assembled live. A user prompt ("Triage my Gmail inbox and draft
replies for urgent emails.") types itself into a glowing center tile, then the
eight surrounding dimensions — **Tasks, Apps & Services, When It Runs, Human
Review, Messages, Memory, Errors, Events** — light up one by one. Each cell
"thinks", optionally asks a clarifying question (with multiple-choice chips and
a pre-picked answer), then fills with its resolved value. A spoke overlay fires
a glowing "command packet" from the center out to each cell as it is engaged,
selling the "intent at center · 8 dimensions radiate outward" metaphor. When
all eight cells resolve, the header flips to **ready to deploy** and a `replay`
button appears.

## How it works
`DesignEngine.tsx` is a `SectionWrapper(id="design")` with a heading + intro
paragraph and the `DesignEngineMatrix` diagram below. The matrix
(`design-engine-matrix/index.tsx`) lays out a CSS `grid-cols-3` of nine tiles:
eight `MatrixTile`s around one `IntentTile` at the center, with a `RadiateOverlay`
SVG absolutely positioned on top.

The animation is driven entirely by `usePersonaMatrixBuild()` in
`designMatrixShared.tsx`. An `IntersectionObserver` (rootMargin `-80px`, watching
an empty sentinel `<div ref={sectionRef}>`) fires `runBuild()` once when the
section scrolls into view. `runBuild` schedules a long chain of `setTimeout`s
into a `timeoutsRef` array: first the prompt types in at 90ms/char, then for each
cell — `thinking` (1650ms) → optional `asking` (4200ms) → `answered` (1800ms) →
`filled` (1200ms) — advancing a `cumulative` cursor. `phase` runs `idle → running
→ done`. All timeouts are cleared on unmount and on `replay`.

Per-cell rendering: `MatrixTile` shows the Leonardo background image, dimension
label, a spinner while `thinking`, a spring-animated check on `filled`, and a
pulsing border ring while `asking`. `TileValue` is the `AnimatePresence`
state machine that swaps the cell body between pending skeleton bars →
`analyzing intent…` → question chips → answered value → final value (the `apps`
cell renders custom Gmail/Slack SVG badges instead of plain text). `IntentTile`
holds the typewriter prompt box, a rotating Sparkles badge, and a `filledCount/8`
progress bar; its accent shifts purple → emerald when `phase === "done"`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/DesignEngine.tsx` | Section shell: heading, intro copy, renders the matrix |
| `src/components/feature-sections/DesignEngineMatrix.tsx` | One-line re-export of `./design-engine-matrix/index` |
| `src/components/feature-sections/designMatrixShared.tsx` | `usePersonaMatrixBuild` hook (timeout choreography, phase/state machine), re-exports cell types |
| `src/components/feature-sections/design-engine-matrix/index.tsx` | 3×3 grid layout, header/footer chrome, replay button, wires tiles + overlay |
| `src/components/feature-sections/design-engine-matrix/data.ts` | `CELL_IMAGE`/`INTENT_IMAGE` paths, fluid type + height Tailwind classes |
| `src/components/feature-sections/design-matrix/designMatrixCells.ts` | `CELLS` cell defs (label, icon, color, `finalValue`, optional `question`), `USER_PROMPT` |
| `src/components/feature-sections/design-engine-matrix/components/MatrixTile.tsx` | One dimension tile: image, label, spinner/check, asking ring |
| `src/components/feature-sections/design-engine-matrix/components/IntentTile.tsx` | Center tile: typewriter prompt, rotating badge, progress bar |
| `src/components/feature-sections/design-engine-matrix/components/RadiateOverlay.tsx` | SVG spokes + animated command packets from center to cells |
| `src/components/feature-sections/design-engine-matrix/components/TileValue.tsx` | Per-state `AnimatePresence` cell body (skeleton/thinking/asking/answered/filled) |
| `public/imgs/features/matrix/*.png` | 9 Leonardo backgrounds: 8 cell images + `intent.png` (all present) |
| `public/tools/gmail.svg`, `public/tools/slack.svg` | App badges rendered in the filled `apps` cell |

## Data & state
- **Source:** Fully static/hardcoded — `CELLS` + `USER_PROMPT` literals in `designMatrixCells.ts`. No mock API, no fetch.
- **Stores:** None (no Zustand). All state is local `useState` inside `usePersonaMatrixBuild` (`statuses`, `phase`, `userTyped`) plus refs (`timeoutsRef`, `hasRun`, `sectionRef`).
- **API routes:** None.
- **Types:** `CellKey`, `CellDef`, `CellState` (`"pending" | "thinking" | "asking" | "answered" | "filled"`), `CellStatus`, `PersonaMatrixState` — defined in `designMatrixCells.ts` / `designMatrixShared.tsx`.

## Integration points
- Rendered as the first, **eager** (non-lazy) section on `/features`
  (`src/app/features/page.tsx:43`), wrapped in `StageSection`; kept a static
  import for LCP/SEO while the rest of the page is `LazyMount`-gated.
- The `#design` anchor is the first entry in that page's scroll-map nav
  (`features/page.tsx:20`).
- `DesignEngine.tsx` carries `data-tour-diagram="design"` (`:39`), so the
  guided product tour can spotlight this diagram.
- Depends on shared `fadeUp`/`staggerContainer` variants from `@/lib/animations`,
  `SectionWrapper`, `SectionHeading`, `GradientText`, and `next/image`.

## Conventions & gotchas
- **i18n — NOT followed.** Every user-facing string here is **hardcoded English**:
  the heading/intro in `DesignEngine.tsx` ("One sentence. One matrix.", "eight
  cells of truth…"), all `CELLS` labels/values/questions, `USER_PROMPT`, the
  header chrome ("Persona Matrix", "building"/"ready to deploy"/"idle",
  "replay", "cells resolved", "radiate from center"), `IntentTile`'s
  "Describe what your agent should do…" / "{n}/8 resolved", and
  `TileValue`'s "analyzing intent…". There is **no** `useTranslation` call
  anywhere in the feature. This violates convention #1 in `CLAUDE.md` — any
  future edit touching copy should migrate these into `src/i18n/en.ts` and all
  13 locales.
- **Animation gating — followed.** `useReducedMotion` is honored in the build
  hook (skips `runBuild` / observer entirely when reduced), `IntentTile`
  (no glow pulse / badge rotation), `MatrixTile` (static asking ring), and
  `RadiateOverlay` (no command-packet dispatch). The whole timeout choreography
  is short-circuited, so reduced-motion users see the static, pending matrix.
- **Radiate overlay is desktop-only.** The SVG is `hidden … md:block` and uses
  a `viewBox="0 0 3 3"` with `preserveAspectRatio="none"`, so spoke endpoints
  track the responsive 3×3 grid centers without DOM measurement. The command
  packets are drawn as **zero-length round-capped `<line>`s** (not `<circle>`s)
  precisely because the non-uniform viewBox scale would distort a circle into an
  ellipse — keep this trick if you touch the overlay.
- **Color tokens — partially off-convention.** Cell accents are **raw hex**
  (`#06b6d4`, `#a855f7`, …) in `designMatrixCells.ts` and inline `style`
  colors/box-shadows throughout, rather than semantic Tailwind tokens. This is
  deliberate (per-cell dynamic theming via inline style), but note it diverges
  from convention #2; the `force-dark` wrapper pins the diagram to dark styling.
- **"eight cells" vs "8 dimensions" copy drift.** `DesignEngine.tsx` intro calls
  them "eight cells of truth"; the matrix header calls them "8 dimensions". Both
  equal `CELLS.length === 8` — cosmetic inconsistency only.
- **Dead field:** `CellStatus.answer?: number` is declared but never set or
  read; the picked answer is sourced from `def.question.picked` instead.
- **Replay re-arm caveat:** `replay` resets `hasRun.current = false` and reruns,
  but the `IntersectionObserver` was already `disconnect()`ed after the first
  fire, so re-entry won't auto-trigger again — replay is the only re-run path.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Feature index](../INDEX.md)
