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
`DesignEngine.tsx` is a `SectionWrapper(fit="fill", id="design")` with a heading,
a one-line lede, the `/features` **tour launcher** (`TourLauncher tourId="features"`,
bridging to `/demo?tour=1`; it moved here from `InfoPageLayout`'s slot so the first
stage starts under the navbar) and the `DesignEngineMatrix` diagram below. The matrix
(`design-engine-matrix/index.tsx`) lays out a CSS `grid-cols-3` of nine tiles:
eight `MatrixTile`s around one `IntentTile` at the center, with a `RadiateOverlay`
SVG absolutely positioned on top.

**Stage fit (desktop).** The matrix wrapper is the section's `data-stage-slot`, so on
the stage (`src/styles/stage.css`) the 3×3 grid takes the height left under the
matrix header in `minmax(0, fr)` rows (the intent row 1.35×), tiles drop their
260/320px minimum (`stage:min-h-0` in `data.ts`), dimension labels size by screen
height, and the footer counter hides (`stage:hidden`).

The animation is driven entirely by `usePersonaMatrixBuild()` in
`designMatrixShared.tsx`. An `IntersectionObserver` (rootMargin `-80px`, watching
an empty sentinel `<div ref={sectionRef}>`) fires `runBuild()` once when the
section scrolls into view. `runBuild` schedules a long chain of `setTimeout`s
into a `timeoutsRef` array: first the prompt types in at 90ms/char, then for each
cell — `thinking` (1650ms) → optional `asking` (4200ms) → `answered` (1800ms) →
`filled` (1200ms) — advancing a `cumulative` cursor. Under reduced motion the
observer calls `showFinal()` instead, jumping straight to the resolved end-state. `phase` runs `idle → running
→ done`. All timeouts are cleared on unmount and on `replay`.

Per-cell rendering: `MatrixTile` shows the Leonardo background image, dimension
label, a spinner while `thinking`, a spring-animated check on `filled`, and a
pulsing border ring while `asking`. `TileValue` is the `AnimatePresence`
state machine that swaps the cell body between pending skeleton bars →
`analyzing intent…` → question chips → answered value → final value (the `apps`
cell renders custom Gmail/Slack SVG badges instead of plain text). `IntentTile`
holds the typewriter prompt box, a rotating Sparkles badge, and a `filledCount/8`
progress bar; its accent shifts purple → emerald when `phase === "done"`.
`MatrixTile` is `memo`-wrapped so the ~11 chars/s typing in the intent tile no
longer re-renders all eight tiles (untouched cells keep an identical status object).
The matrix panel uses an almost-opaque `bg-background/95` instead of `backdrop-blur-xl`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/DesignEngine.tsx` | Section shell: heading, lede, tour launcher, renders the matrix (stage slot) |
| `src/components/feature-sections/DesignEngineMatrix.tsx` | One-line re-export of `./design-engine-matrix/index` |
| `src/components/feature-sections/designMatrixShared.tsx` | `usePersonaMatrixBuild` hook (timeout choreography, phase/state machine; reads `t.designMatrix.userPrompt`), re-exports cell types + `localizeCells` |
| `src/components/feature-sections/design-engine-matrix/index.tsx` | 3×3 grid layout, header/footer chrome, replay button, wires tiles + overlay |
| `src/components/feature-sections/design-engine-matrix/data.ts` | `CELL_IMAGE`/`INTENT_IMAGE` paths, fluid type + height Tailwind classes (with `stage:` overrides) |
| `src/components/feature-sections/design-matrix/designMatrixCells.ts` | `CELLS` cell identities (`CellBase`: key, icon, color, optional `question` id + `picked`); `localizeCells(copy)` joins in the translated label/value/question words |
| `src/components/feature-sections/design-engine-matrix/components/MatrixTile.tsx` | One dimension tile (memoised): image, label, spinner/check, asking ring |
| `src/components/feature-sections/design-engine-matrix/components/IntentTile.tsx` | Center tile: typewriter prompt, rotating badge, progress bar |
| `src/components/feature-sections/design-engine-matrix/components/RadiateOverlay.tsx` | SVG spokes + animated command packets from center to cells |
| `src/components/feature-sections/design-engine-matrix/components/TileValue.tsx` | Per-state `AnimatePresence` cell body (skeleton/thinking/asking/answered/filled) |
| `public/imgs/features/matrix/*.png` | 9 Leonardo backgrounds: 8 cell images + `intent.png` (all present) |
| `public/tools/gmail.svg`, `public/tools/slack.svg` | App badges rendered in the filled `apps` cell |

## Data & state
- **Source:** Fully static — cell identities in `CELLS` (`designMatrixCells.ts`); every word (labels, values, questions, the typed prompt, chrome) in the `designMatrix` namespace of `src/i18n/en.ts`. No mock API, no fetch.
- **Stores:** None (no Zustand). All state is local `useState` inside `usePersonaMatrixBuild` (`statuses`, `phase`, `userTyped`) plus refs (`timeoutsRef`, `hasRun`, `sectionRef`).
- **API routes:** None.
- **Types:** `CellKey`, `CellBase`, `CellDef`, `CellState` (`"pending" | "thinking" | "asking" | "answered" | "filled"`), `CellStatus`, `PersonaMatrixState` — defined in `designMatrixCells.ts` / `designMatrixShared.tsx`.

## Integration points
- Rendered as the first, **eager** (non-lazy) section on `/features`
  (`src/app/features/page.tsx:63`), wrapped in `StageSection`; kept a static
  import for LCP/SEO while the rest of the page is `LazyMount`-gated.
- The `#design` anchor is the first entry in that page's scroll-map nav
  (`features/page.tsx:42`).
- `DesignEngine.tsx` carries `data-tour-diagram="design"` (`:45`), so the
  guided product tour can spotlight this diagram, and hosts the page's
  `TourLauncher` (`:40`).
- Depends on shared `fadeUp`/`staggerContainer` variants from `@/lib/animations`,
  `SectionWrapper`, `SectionHeading`, `GradientText`, and `next/image`.

## Conventions & gotchas
- **i18n — migrated, English-only for now.** All copy (heading, lede, cell
  labels/values/questions, the typed prompt, header/footer chrome, "analyzing
  intent…", "{filled}/{total} resolved") lives in the `designMatrix` namespace of
  `src/i18n/en.ts`, read via `useTranslation()`. `designMatrix` is listed in
  `PENDING_TRANSLATION`, so the 13 other locales fall back to English until it is
  translated (add it to every locale, then remove it from the list).
- **Animation gating — followed.** `useReducedMotion` is honored in the build
  hook (the observer calls `showFinal()` instead of `runBuild()`, and `replay`
  takes the same instant path), `IntentTile` (no glow pulse / badge rotation),
  `MatrixTile` (static asking ring), and `RadiateOverlay` (no command-packet
  dispatch). Reduced-motion users see the fully resolved matrix, no choreography.
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
- **Dead field:** `CellStatus.answer?: number` is only set by
  `createFilledStatuses` (the reduced-motion end-state) and never read; the picked
  answer is sourced from `def.question.picked` instead.
- **Replay re-arm caveat:** `replay` resets `hasRun.current = false` and reruns,
  but the `IntersectionObserver` was already `disconnect()`ed after the first
  fire, so re-entry won't auto-trigger again — replay is the only re-run path.

## Related docs
- [Multi-Provider AI](multi-provider-ai.md)
- [Feature index](../INDEX.md)
