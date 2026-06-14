# Orchestration Hub
> A radial architecture-explainer: eight trigger nodes orbit a central persona hub, auto-cycling through a synced trigger-detail panel to show how any signal can wake any agent. · **Route:** `/` (homepage section, wrapped `#pipelines`; section anchor `#orchestration-hub`) · **Status:** Live

## What it does

A homepage demo that explains Personas' trigger model in one picture. A ring of **eight trigger nodes** (Schedule, Polling, Webhook, File watcher, Clipboard, App focus, Event, Composite) orbits a central persona chip, each connected by a spoke. A continuous "signal rain" of pulses streams down every spoke toward the hub, dramatizing "any signal can wake any agent."

One trigger is **active** at a time: it glows (tinted chip, halo, brighter/faster spoke pulse) and the right-hand **Trigger detail** panel cross-fades to show that trigger's description, a concrete "fires when" condition (e.g. `POST /github/pr.opened`), the persona it wakes (e.g. *PR Reviewer*), and a deep-link into the relevant guide page. The active trigger **auto-cycles** every ~9.6s; hovering the ring pauses it, and clicking a node selects it and pauses briefly so you can read before the cycle resumes.

## How it works

**Shell** (`index.tsx`). `OrchestrationHub` drives the active index with `useAutoCycle` (`src/hooks/useAutoCycle.ts`) over `TRIGGERS.length` items at `AUTO_CYCLE_MS` (9600ms, `data.ts:130`), pausing while `hovering` is true (`index.tsx:22-27`). The active trigger object is `TRIGGERS[active]` with a `?? TRIGGERS[0]` fallback. `handleSelect(id)` looks up the index, calls `setActive(idx)`, then `pauseFor(TAP_PAUSE_MS)` where `TAP_PAUSE_MS = AUTO_CYCLE_MS * 2` (`index.tsx:19`, `31-40`) — a *timed* pause rather than a permanent one, specifically because touch taps don't emit a paired `pointerleave` and would otherwise freeze the cycle. Layout is a two-column grid (`lg:grid-cols-[1.2fr_1fr]`): a square ring container that owns the hover handlers, and the `TriggerDetail` panel. The whole diagram carries `data-tour-diagram="orchestration"` (`index.tsx:65`) so the guided tour can spotlight it.

**Ring geometry** (`data.ts:127-138`). `nodePosition(index, total)` places nodes on a circle: `angle = (index/total)·2π − π/2` (so node 0 sits at top), `x = CENTER + cos·RADIUS`, `y = CENTER + sin·RADIUS`, with `CENTER=260`, `RADIUS=200`, `NODE_SIZE=96`. The SVG `viewBox` is `0 0 520 520` (`HubRing.tsx:27`) — i.e. `2·CENTER` — so the ring is centered in the viewBox.

**Ring** (`HubRing.tsx`). One `<svg aria-hidden="true">` rendered in z-order: (1) a slowly-rotating ambient guide circle (`rotate 360` over 80s, or a static dashed circle when reduced); (2) a radial-gradient hub glow tinted to the active brand via a `useId`-scoped gradient; (3) spoke `<line>`s (active spoke gets the brand color + thicker stroke); (4) the **signal-rain** `motion.circle` pulses — one per spoke, animating `cx/cy` from the node inward to `CENTER`, staggered by `i·0.3s`, with the active spoke's pulse larger/faster (`duration 1.5` vs `2.8`); (5) the central persona node (dual-theme `agents-prompts-{dark,light}.png` inside a circular `foreignObject` mask); (6) the eight `HubNode`s last so they sit on top of spokes. `reduced` is computed once from `useReducedMotion() ?? false` and threaded down to nodes.

**Node** (`HubNode.tsx`). Each node is a clickable `<g onClick>` containing: an opaque `<rect fill="var(--background)">` backing that hides the spoke line behind it, then a `foreignObject` holding a `motion.div` chip with the lucide icon + label. Active styling is data-driven inline (`tint(brand, …)` background/border, `BRAND_VAR[brand]` icon, brand glow `boxShadow`). A pulsing `motion.circle` halo renders only when `isActive && !reduced` (`HubNode.tsx:36`). Entrance spring is staggered by `index·0.05`; when `reduced`, `initial={false}` and `transition={{ duration: 0 }}` disable it.

**Detail panel** (`TriggerDetail.tsx`). Re-derives the active trigger from `activeId` (same `?? TRIGGERS[0]` fallback). An `<AnimatePresence mode="wait">` keyed on `trigger.id` cross-fades (`y: 8 → 0 → −8`, 0.3s) between: icon tile, "Trigger" eyebrow + label, description, a mono "Fires when" example, a `Bot`-iconed persona pill (always cyan-tinted, independent of the trigger's own brand), and an optional `doc` deep-link (`BookOpen` + `ArrowRight`).

**Node catalog** (`data.ts:35-124`). `TRIGGERS: TriggerDef[]` — eight entries, each `{ id, label, icon (lucide), brand (BrandKey, not hex), description, example, persona, doc? }`. The file comment notes it mirrors the real `personas/src/features/triggers/sub_triggers/configs`. Brands repeat across triggers (e.g. two `purple`, two `emerald`).

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/orchestration-hub/index.tsx` | Section shell; `useAutoCycle` driver, hover pause, tap-select with timed resume |
| `src/components/sections/orchestration-hub/data.ts` | `TRIGGERS` catalog, ring geometry (`CENTER`/`RADIUS`/`NODE_SIZE`/`nodePosition`), `AUTO_CYCLE_MS`, `TriggerDef`/`DocRef` types |
| `src/components/sections/orchestration-hub/HubRing.tsx` | SVG ring: ambient circle, hub glow, spokes, signal-rain pulses, central persona node, maps `HubNode`s |
| `src/components/sections/orchestration-hub/HubNode.tsx` | Single orbit node: opaque backing + icon/label chip, active halo + glow, entrance spring |
| `src/components/sections/orchestration-hub/TriggerDetail.tsx` | Right-hand panel; cross-fades active trigger's description/example/persona/doc link |
| `src/hooks/useAutoCycle.ts` | Shared auto-advance hook (active index, hover/`pauseFor` pause, reduced-motion aware) |
| `src/components/sections/lazy.tsx` | `LazyOrchestrationHub` dynamic import (`lazy.tsx:161`) |
| `src/app/page.tsx` | Renders it on `/` as a gated `LazyMount` section inside `<div id="pipelines">` (`page.tsx:53`) |

## Data & state
- **Source:** Static. The `TRIGGERS` array in `data.ts` is the only data source — no API, no mocks, no Supabase. Persona/example/doc strings are hardcoded literals.
- **Stores:** None (no Zustand). State is local to the section: `hovering` (`useState`) plus `useAutoCycle`'s internal `active`/pause state.
- **API routes:** None. The only outbound links are `<Link>`s to `/guide/triggers/*` guide pages (from each trigger's optional `doc.href`).
- **Types:** `TriggerDef`, `DocRef` (`data.ts:19-33`); `BrandKey` (`src/lib/brand-theme.ts`); `LucideIcon` (lucide-react).

## Integration points
- **Brand theming:** `BRAND_VAR` and `tint` from `src/lib/brand-theme.ts` color every node, spoke, halo, glow, and the detail panel (data-driven → inline styles, not Tailwind tokens). Triggers reference brand *keys* so they adapt to light/dark themes.
- **Motion:** `useAutoCycle` (wrapping framer-motion's `useReducedMotion`) for the cycle; `HubRing` independently calls `useReducedMotion` for the continuous SVG motion. `fadeUp` (`src/lib/animations.ts`) + `SectionWrapper` provide the section's scroll-reveal.
- **Layout primitives:** `SectionWrapper`, `SectionIntro` (`@/components/primitives`), `EYEBROW` (`src/lib/typography.ts`).
- **Guided tour:** `data-tour-diagram="orchestration"` is the spotlight hook for the Athena tour (see [Guided tour](../marketing/guided-tour.md)).
- **Lazy mount:** imported via `createLazySection` in `lazy.tsx` and gated behind `LazyMount minHeight={640}` so its chunk loads on scroll.
- **Central image asset:** `/imgs/guide/agents-prompts-{dark,light}.png` (decorative, `alt=""`).

## Conventions & gotchas
- **i18n gap (real issue):** the entire section renders **hardcoded English** — the `SectionIntro` heading/description (`index.tsx:47-52`), every `TriggerDef` `label`/`description`/`example`/`persona`/`doc.label` (`data.ts`), and the panel's static labels ("Trigger", "Fires when", the `→` eyebrow) in `TriggerDetail.tsx`. None route through `useTranslation()`, so this violates the repo's "every user-facing string lives in `en.ts`" rule and ships untranslated in the other 13 locales. Any copy edit here should be an i18n migration first.
- **Accessibility gap (real issue):** the whole `<svg>` is `aria-hidden="true"` (`HubRing.tsx:27`), yet the nodes are interactive — they're plain `<g onClick>` elements (`HubNode.tsx:34`) with no `role="button"`, `tabindex`, key handler, or accessible name. The ring is therefore **mouse/touch-only**: keyboard and screen-reader users can't select a trigger, and the active state isn't announced. The auto-cycle is the sole way those users see the other triggers. Consider real buttons (or an `aria-live` mirror of the detail panel) if you touch this.
- **Animation gating (done right):** every continuous/looping animation is gated. The ambient rotation and signal-rain pulses are skipped when `reduced` (`HubRing.tsx:36,81`); the node halo and entrance spring are gated in `HubNode.tsx:36,61-65`; `useAutoCycle` halts on `prefers-reduced-motion`. Follow this pattern — `custom-animation/require-animation-gating` only catches `requestAnimationFrame`, so framer loops like these would otherwise slip past lint.
- **`view-box` transform origin:** SVG rotations/scales set `transformBox: "view-box"` + an explicit pixel `transformOrigin` (`HubRing.tsx:57`, `HubNode.tsx:47`). This is the repo's required pattern for SVG motion — omitting it makes elements orbit the wrong point.
- **Legacy wrapper id:** the section is mounted inside `<div id="pipelines">` (`page.tsx:53`, `lazy.tsx` array) — a leftover from the old "Pipelines" concept this radial hub replaced (see the comment at `index.tsx:13-17`). The `SectionWrapper`'s own id is `orchestration-hub`. Deep-links / the scroll map may use either; don't assume they match.
- **Tap pause is timed, not sticky:** clicking a node uses `pauseFor(AUTO_CYCLE_MS·2)`, not a permanent pause, on purpose (touch devices emit no `pointerleave` after a tap). If you change selection behavior, preserve the auto-resume or the cycle can wedge on touch.
- **Two fallbacks must stay in sync:** both `index.tsx` and `TriggerDetail.tsx` independently resolve the active trigger with `?? TRIGGERS[0]`; the panel re-finds by `id` rather than receiving the object. Keep `TRIGGERS` ids stable.
- **Persona pill brand is fixed:** the detail panel's persona pill is always cyan-tinted (`TriggerDetail.tsx:82-86`), regardless of the trigger's own `brand` — intentional, not a bug to "fix."
- **Geometry vs. clipping:** with `RADIUS=200`, `CENTER=260` and `NODE_SIZE=96`, node chips extend to ~308px from center — just inside the 520 viewBox, but the outer card uses `overflow-hidden` (`index.tsx:56`) as a safety clip. Changing `RADIUS`/`NODE_SIZE` without re-checking the viewBox can clip nodes.

## Related docs
- [Visual Flow Composer & Playground](flow-composer.md)
- [Platform Layers](platform-layers.md)
- [Feature index](../INDEX.md)
