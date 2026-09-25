# Use Cases
> The "one persona, many capabilities" section — one app-style persona card picks up jobs as each of eight real tools connects to it, with a tab row, a capability ledger and a pausable one-shot playback. · **Route:** `/` (homepage section, anchor `#use-cases`, wrapper `#tools`) · **Status:** Live

## What it does

A public homepage section (heading "One persona, **many capabilities**") that makes one claim: a single persona keeps its identity (name, icon, colour) while it picks up many jobs across the tools you already use. It has three parts:

1. **Tool tabs** — eight connector tabs (Gmail, Slack, GitHub, Google Drive, Jira, Notion, Calendar, Figma). A connected tool carries a green check. At the end of the row a **Pause / Play / Replay** control drives the playback.
2. **Persona card** — a reduced copy of the app's persona card ("Chief of staff"): health stripe, tinted icon frame, name + description, an "Active" chip with a live job count, a row of eight connector slots that fill as tools attach (dashed while empty), and a sample trigger / last-run / spend footer. A lock note under it says identity never changes.
3. **Capability ledger** — the focused tool's jobs in full (title + description, "adds N jobs to …"), then one reserved row per tool: connected rows list that tool's job titles, unconnected rows stay dashed ("not connected").

When the section scrolls into view the card empties and the eight tools connect one by one (a thin progress bar under the next tab shows the beat), then it rests with everything attached. Picking a tab stops playback and focuses that tool. Under reduced motion there is no playback and no control: every tool is shown attached. A "Browse All Templates" button links to `/templates`.

The tool list and jobs are illustrative marketing copy, not live integrations.

## How it works

**Composition (`index.tsx`).** `UseCasesPersonaCard` renders `SectionWrapper fit="min" id="use-cases"` (`index.tsx:39`) with a `SectionIntro`, then a `role="group"` container (`rootRef`, `data-tour-diagram="tools"`, `data-stage-zoom`, `index.tsx:42-49`) holding `ToolTabs` and a two-column grid of `PersonaCard` (sticky on `lg`) and `CapabilityLedger`. Tools come from `localizeTools(t.useCasesSection)` (`data.ts`), which joins each `toolBases` entry (id, icon, colour) with its translated name and jobs. `useId()` is stripped of colons (`index.tsx:31`) to build the tab / tabpanel ids.

**Playback (`usePersonaPlayback.ts`).** One progress value — `attached.length` — walks 0 → 8 once. The resting state (server render, reduced motion, finished, paused) is every tool attached with the first focused, so SSR and reduced-motion markup are the full card. On the client an `IntersectionObserver` with a 240px bottom margin arms playback once, just before the box scrolls in: it resets to an empty card unless the visitor already chose a tool (`touched`). A second observer sets `inView` at ≥30% visibility; a `setTimeout` beat (`FIRST_BEAT_MS` 900, then `BEAT_MS` 1700) attaches the next tool only while `ticking` (playing + in view + not still). `choose(id)` pauses and attaches/focuses that tool; `toggle()` pauses, resumes, or replays from empty when complete.

**Tabs (`ToolTabs.tsx`).** A `role="tablist"` (4 columns, 8 on `lg`) with roving `tabIndex`; arrow keys, Home and End call `onChoose` and move focus. The beat bar is a `motion.span` animating `scaleX` over `beatMs`. The pause/play/replay button sits in a fixed-height slot so the reduced-motion form (no button) does not shift layout.

**Ledger (`PersonaLedger.tsx`, default export `CapabilityLedger`).** The focused tool's panel (`role="tabpanel"`, `aria-live="polite"`) cross-fades via `AnimatePresence mode="wait"`; the `adds` sentence is split around `{tool}` so the tool name renders bold, and both halves go through `fillTemplate`. Transitions collapse to `duration: 0` when `still`.

**Stage fit.** `fit="min"`, and the block under the intro carries `data-stage-zoom`, so on tall monitors it scales up by height tier (1.2 / 1.35 / 1.6, `src/styles/stage.css:144-158`) instead of floating at laptop size. On the stage the pause control sits at the end of the tab row (`stage:flex-row`, `ToolTabs.tsx:65`), the ledger is two columns (`stage:grid-cols-2`, `PersonaLedger.tsx:88`) and a connected row stays on one line, its chips fading out at the edge (`PersonaLedger.tsx:118`). Measured by `e2e/stage-fit.spec.ts`: one stage (571px) at 1366x768.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/use-cases/index.tsx` | Section shell: intro, tabs, persona card + ledger grid, templates CTA |
| `src/components/sections/use-cases/usePersonaPlayback.ts` | Arm-once, in-view-only playback state (`attached`, `focus`, `choose`, `toggle`); `BEAT_MS` / `FIRST_BEAT_MS` |
| `src/components/sections/use-cases/data.ts` | `toolBases[]` (id, icon, colour) + `localizeTools()` |
| `src/components/sections/use-cases/types.ts` | `ToolId`, `ToolBase`, `Tool`, `ToolIcon` |
| `src/components/sections/use-cases/components/ToolTabs.tsx` | Tab row, beat bar, pause/play/replay control |
| `src/components/sections/use-cases/components/PersonaCard.tsx` | App-shaped persona card; connector slots fill as tools attach |
| `src/components/sections/use-cases/components/PersonaLedger.tsx` | `CapabilityLedger`: focused tool's jobs + one row per tool |
| `src/components/sections/use-cases/components/ConnectorIcon.tsx` | `next/image` glyph, flattened to one tone via `.connector-icon` |

## Data & state
- **Source:** static — `toolBases` in `data.ts`; names and jobs are copy. No fetch. **Stores:** none; state lives in `usePersonaPlayback`. **API routes:** none. **Types:** `types.ts`.
- **Copy:** `t.useCasesSection.*` (heading, `browseTemplates`, and per-tool `{ name, cases[] }`) and `t.useCasesPersona.*` (persona name/description, card and ledger labels, tab/control labels, aria templates). `useCasesPersona` is listed in `PENDING_TRANSLATION` (`src/i18n/en.ts:2294`): English only by owner decision, optional in the 13 locale files (`LocaleTranslations`), with the runtime falling back to English.

## Integration points
- `SectionWrapper` (`fit="min"`, anchor `id="use-cases"`) and `SectionIntro`; the page wraps it in `#tools` (`src/app/page.tsx:52`).
- `fillTemplate` from `src/lib/fillTemplate.ts` fills the aria and count templates.
- Connector glyphs are `next/image` from `/public/icons/connectors/*.svg`; `.connector-icon` (`src/app/globals.css:962`) flattens them per theme. The same assets back the **Connectors catalog** page.
- The CTA links to `/templates`; `data-tour-diagram="tools"` hooks the guided tour.

## Conventions & gotchas
- **Resting state is the full card.** SSR and reduced motion render every tool attached; playback is armed only from `IntersectionObserver` callbacks on the client and re-checks `prefers-reduced-motion` at arm time. Don't seed an empty card in initial state — it would change server markup and hide the claim from reduced-motion visitors.
- **Animation gating:** `useStillMotion` (`index.tsx:30`) — no playback, no beat bar, no control, zero-duration transitions when still. Ticking also stops when less than 30% of the block is visible.
- **`useId()` colon strip:** ids like `:r5:` are invalid in CSS selectors / `url(#)` references; `index.tsx:31` strips them.
- **i18n drift:** the `useCasesSection` interface still declares `integrations`, `patterns`, `description`, `autoplayHint`, `whatCanAutomate` and a `stripe` tool that this section does not render. The spend figure `0.04` in the card footer is a literal number.
- **Tokens:** mostly semantic; data-driven brand colours (tool `color`) go through inline `style` on purpose.

## Related docs
- [Why Agents](why-agents.md)
- [Connectors catalog](../connectors/catalog.md)
- [Feature index](../INDEX.md)
