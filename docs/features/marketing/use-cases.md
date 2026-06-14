# Use Cases
> The "one persona, many capabilities" connector grid — pick a tool, see the jobs an agent can automate, with an SVG wire drawn from the chosen tool to its detail card, plus a live "agent army" stat grid. · **Route:** `/` (homepage section) · **Status:** Live

## What it does

A public homepage section (heading "One persona, **many capabilities**") that demonstrates what a Personas agent can do across the tools you already use. It has three stacked parts:

1. **Tool grid** — eight connector tiles (Gmail, Slack, GitHub, Google Drive, Jira, Notion, Calendar, Figma). On load it **auto-cycles** through them (one every 4 s) with a progress bar filling the active tile. Click any tile to stop auto-cycling and pin it; arrow keys / Home / End navigate, Escape resumes auto-play.
2. **Tool detail card** — for the selected tool, three "what can automate" use-case cards (title + description, e.g. Gmail → *Inbox triage*, *Follow-up reminders*, *Meeting prep*).
3. **Connector wire** — an animated dashed SVG path is drawn from the centre of the active tool tile down to the top of the detail card, tinted with the tool's brand colour. This is the "connector wiring" visual.

Below those sits the **Agent Army grid** — six cards of fictional running agents (name, connector icon, execution count, success-rate bar, status dot) that tick up and occasionally flip status in real time to feel alive. A "Browse All Templates" button links to `/templates`.

All copy (heading, "What Personas can automate" label, button) is illustrative marketing; the tool list, use cases, and agent stats are hardcoded demo data, not live integrations.

## How it works

**Composition (`index.tsx`).** `UseCases` owns the section. It creates a container `ref` and a detail-card `ref`, derives a CSS-safe SVG gradient id from `useId()` (`index.tsx:24`), and wires two hooks:

- `useToolSelection(!prefersReducedMotion)` → selection state, autoplay, progress, mobile flag, button-ref maps, and the click/keydown handlers.
- `useConnectorPath(selected, isMobile, containerRef, detailCardRef, desktopButtonRefs, mobileButtonRefs)` → the SVG `d` string and a visibility flag.

It renders an absolutely-positioned full-bleed `<svg>` (the connector), then `<ToolGrid>`, then the `<ToolDetailCard>` inside `<AnimatePresence mode="wait">` keyed on `activeTool.id` so switching tools cross-fades. `<AgentArmyGrid>` and the templates CTA follow.

**Selection + autoplay (`useToolSelection.ts`).** `selected` starts at `tools[0].id`. Autoplay runs a `requestAnimationFrame` loop that advances `progress` toward 1 over `AUTOPLAY_INTERVAL` (4000 ms), then calls `advanceToNext()` (wraps with modulo). The loop is **tab-visibility aware**: while `document.hidden` it parks and, on resume, rebases its start time from the last shown progress so the bar doesn't snap past the interval (`useToolSelection.ts:40-45`). The first manual click flips `autoplay` off permanently (tracked by `userClickedRef`); Escape re-enables it. `isMobile` comes from a `matchMedia("(max-width: 767px)")` listener. Keyboard handler moves focus to the next/prev button via the ref maps.

**Connector path (`useConnectorPath.ts`).** On `selected`/`isMobile` change it measures the source button and the detail card with `getBoundingClientRect()`, converts to container-relative coords, and builds a cubic Bézier `M sx sy C … ` whose control points sit at 55% of the vertical gap (`useConnectorPath.ts:43-49`). It debounces the measure behind a `setTimeout` (200 ms, or 0 under reduced motion) so it runs *after* the detail card's enter animation has settled, and uses a `selectionCycleRef` guard to drop stale timers. A `ResizeObserver` on the container re-measures on layout change (via `requestAnimationFrame`, or synchronously under reduced motion). Visibility is reset to `false` the moment the selection key changes (prev-state pattern, `useConnectorPath.ts:21-24`) and flipped back `true` after the measure, so the wire fades out/in rather than jumping between positions.

**Rendering the wire (`index.tsx:56-78`).** The `<motion.path>` animates `opacity` based on `connectorVisible && connectorPath`, strokes with a `linearGradient` (active tool colour → purple), and applies the `dash-flow` CSS keyframe animation for the marching-ants effect — gated off when `prefersReducedMotion`.

**Agent Army (`AgentArmyGrid.tsx`).** Local `agents` state seeded from `initialAgents`. A self-rescheduling `setTimeout` (3–5 s jitter) bumps a random agent's `executions`, has a 20% chance to flip a non-healing agent between running/idle, and flashes that card for 600 ms (`flashIdx`). Cards animate in on scroll (`whileInView`), and the success-rate bar width animates to `rate%` with a colour band (≥90 emerald, ≥80 amber, else rose).

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/use-cases/index.tsx` | Section shell: SVG connector, grid, detail card, agent grid, CTA |
| `src/components/sections/use-cases/data.ts` | `tools[]`, `initialAgents[]`, `statusStyles`, `AUTOPLAY_INTERVAL` |
| `src/components/sections/use-cases/types.ts` | `Tool`, `ToolIcon`, `AgentData`, `AgentStatus` |
| `src/components/sections/use-cases/useToolSelection.ts` | Selection / autoplay / progress / keyboard / mobile state |
| `src/components/sections/use-cases/useConnectorPath.ts` | Measures DOM, builds the Bézier `d` string, visibility gating |
| `src/components/sections/use-cases/components/ToolGrid.tsx` | Desktop grid + mobile scroll strip of tool buttons (`role="toolbar"`) |
| `src/components/sections/use-cases/components/ToolButton.tsx` | Single tool tile (active styling, autoplay progress bar) |
| `src/components/sections/use-cases/components/ToolDetailCard.tsx` | Selected tool's three use-case cards |
| `src/components/sections/use-cases/components/AgentArmyGrid.tsx` | Live-ticking fleet stat grid |
| `src/components/sections/use-cases/components/ConnectorIcon.tsx` | `next/image` glyph, flattened to one tone via `.connector-icon` |

## Data & state
- **Source:** all static/hardcoded — `tools` and `initialAgents` in `data.ts`. No fetch, no live integration. **Stores:** none (no Zustand); all state is local React (`useState`/`useRef` in the two hooks + `AgentArmyGrid`). **API routes:** none. **Types:** `Tool`, `ToolIcon`, `AgentData`, `AgentStatus` in `types.ts`. **Copy:** `t.useCasesSection.*` (`heading`, `headingGradient`, `whatCanAutomate`, `browseTemplates`) via `useTranslation()`.

## Integration points
- `SectionWrapper` (`@/components/SectionWrapper`) provides the `id="use-cases"` anchor and the one-shot reveal; `SectionIntro` renders the heading.
- `fadeUp` from `@/lib/animations` is the variant for grid/card/CTA reveals.
- Connector glyphs are `next/image` from `/public/icons/connectors/*.svg`; `.connector-icon` (defined in `src/app/globals.css:961`) flattens them per theme. The same icon assets back the **Connectors catalog** page.
- `dash-flow` keyframe lives in `src/app/globals.css:655`.
- The CTA links to the `/templates` route; `data-tour-diagram="tools"` on the container hooks the guided tour.
- Bundled with **Why Agents** in `context-map.json` (shared "agent army / use cases" context) — but they are separate sections.

## Conventions & gotchas
- **`useId()` colon strip (real, load-bearing):** `useId()` returns ids like `:r5:` that are valid HTML but **invalid in CSS selectors**, so `stroke="url(#…)"` would resolve to nothing and the wire would render unstyled. `index.tsx:24` strips the colons. Don't reintroduce a raw `useId()` into any SVG `url(#)` reference.
- **Animation gating:** all three motion surfaces gate on `useReducedMotion` — the `dash-flow` marching-ants (`index.tsx:73`), the connector re-measure path (synchronous instead of rAF, and 0 ms instead of 200 ms debounce), and `AgentArmyGrid`'s ticker (early-returns entirely, `AgentArmyGrid.tsx:16`). Autoplay also starts off when reduced motion is set (`useToolSelection.ts:10`).
- **React 19 purity:** `useConnectorPath` uses the prev-state reset pattern to clear visibility on selection change (no `setState` in an effect body). `AgentArmyGrid` calls `Math.random()` only inside timer callbacks, never in render — keep it that way.
- **`statusStyles` is an exhaustive `Record<AgentStatus, …>`** (`data.ts:106`) so adding a status without a style is a `tsc` error; `AgentArmyGrid.tsx:63` *also* falls back to `idle` at runtime against stale state. Keep both.
- **Tokens:** mostly semantic (`border-glass`, `text-foreground`, `text-muted`, `bg-brand-cyan/*`). Brand colours that are **data-driven** (tool/agent `color`, the gradient stop, rate-bar colour) are applied via inline `style` — that's intentional, not a token violation.
- **i18n drift:** the `useCasesSection` interface declares `integrations`, `patterns`, `description`, and `autoplayHint` keys that this component **does not render** (only `heading`, `headingGradient`, `whatCanAutomate`, `browseTemplates` are used). They ship in all 14 locales but are currently dead — verify before pruning, and don't add new hardcoded English (the section has zero literal user-facing strings except the `aria-label="Integration tools"` on the toolbars, which **is** a hardcoded English string and a real a11y/i18n gap).
- **Mobile vs desktop have separate button-ref maps** (`desktopButtonRefs` / `mobileButtonRefs`); the connector picks the right one off `isMobile`. A button not in the active layout has `offsetParent === null`, which `useConnectorPath.ts:34` treats as "no path" — so the wire correctly hides when the source tile is in the hidden layout.

## Related docs
- [Why Agents](why-agents.md)
- [Connectors catalog](../connectors/catalog.md)
- [Feature index](../INDEX.md)
