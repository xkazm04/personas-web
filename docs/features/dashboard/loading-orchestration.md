# Dashboard loading orchestration (the tier standard)

> How every `/dashboard/*` view loads: frame first, deep content spread out in relaxed time · Applies to all 15 views · Status: Standard (2026-10-08)

## What it does

Opening a dashboard view should feel instant *and* calm. The shell and the view's
own outline appear on the first frame, the numbers that answer the view's question
land as soon as they exist, and the heavy or nested parts — charts, graphs, drill
panels — arrive one after another over the next half-second instead of all at once.
Nothing on screen moves out of the way when something new lands, and coming back to
a view you already opened shows it exactly as you left it, with no replay.

## The standard

### Four tiers

Every element of a view belongs to exactly one tier. The tier decides **when it
mounts**, **what holds its place**, and **how it enters**.

| Tier | What | When it mounts | Placeholder | Entrance |
| --- | --- | --- | --- | --- |
| **T0 Frame** | Shell (navbar, sidebar, scope bar) and the view's header (title, subtitle, primary actions) | With the view, synchronously | None — never ghosted | None — never animated |
| **T1 Structure** | Section chrome: card borders, section titles/icons, toolbars, tab strips, empty grid cells sized to their content | With the view, synchronously | None — it *is* the reservation for T2/T3 | `.dash-arrive` cascade, index by visual order, capped at 6 |
| **T2 Content** | The data that answers the view's question: KPI values, the primary list's first screenful, status badges | As soon as its data exists | Inside the T1 chrome only, with the ghost delay (`.dash-ghost`), and only when nothing is held yet | `.dash-arrive` on the loading → settled edge; rows keyed by a stable id |
| **T3 Deep** | Anything heavy or nested: charts, graphs, canvases, visualizations, secondary/below-the-fold panels, rich detail bodies | When the view's arrival queue releases it (`<Deferred>`) — after the frame paints, one slot per ~90 ms, idle-scheduled, near-viewport first | `<Deferred minHeight>` reservation (empty, or a geometry-true `ghost`) | `.dash-settle` fade |

Timeline on a cold open, roughly:

```
0 ms      T0 frame + T1 chrome paint (one commit); T3 chunks start downloading
0–270 ms  T1 cascade plays (45 ms step, 240 ms each, cap 6)
~mock     T2 data lands → content cascade inside the chrome
120 ms    T3 queue opens; slot 1 mounts
+90 ms    slot 2 … each in an idle callback, in order, near-viewport only
1.5 s     idle warm-up of likely-next view chunks begins
```

### Rules

1. **Fetch early, mount late.** Deferral never applies to downloads. A `<Deferred>`
   slot passes its chunk's loader as `preload`, which starts on mount, so the code
   is in flight while the frame paints. Only main-thread work — mounting, layout,
   chart rendering — is spread out. (Registry: *lazy-section-loading* warns that
   splitting code deeper than the nav creates waterfalls; this rule is how we split
   *mount* deeper without splitting the *fetch* into a waterfall.)
2. **Code-split only what is heavy.** A deep slot is not automatically a chunk.
   Split with `next/dynamic({ ssr: false })` only for heavy dependencies (chart
   libraries, graph/canvas engines, markdown renderers); keep everything else in
   the view chunk and just defer its mount. Shared heavy modules are their own unit,
   loaded once and reused.
3. **Chrome is never deferred.** A card's border, title and toolbar are T1 and paint
   with the view. Only the body goes inside `<Deferred>`. A view that ghosts its own
   chrome is telling the user the *surface* is missing when only the *data* is.
4. **Reserve, don't repair.** Every T2/T3 region claims its final height in the first
   render (`minHeight`, a fixed chart height, a sized grid cell). Arrival replaces a
   reservation; it never pushes content down. Animate with opacity/transform only.
5. **One placeholder per slot, delayed.** A slot shows at most one not-yet state.
   Ghosts appear only after `--ghost-delay` (160 ms) so warm loads show nothing.
   No minimum display time — data renders the moment it exists. No spinners as
   placeholders (spinners belong on pressed controls). No generic shapes: a ghost
   either matches the body's real geometry or is omitted.
6. **Placeholders never cover held data.** A refetch keeps showing the last data
   with an ambient indicator (`StalenessIndicator`); the ghost is for first load only.
7. **Play once.** Entrances fire on first arrival only. Kept-alive views are guarded
   by `data-arrived` (written by `ViewOutlet` on `animationend`), so a warm return
   never replays. Never re-key a subtree to replay an animation.
8. **Reduced motion settles instantly** — `.dash-arrive` / `.dash-settle` render their
   end state on the first frame; the ghost still waits out its delay (that is not
   motion; it is what stops flashing). This is handled in CSS; do not add a parallel
   JS path.
9. **Cascades index fixed regions, or stably-keyed rows.** Position-indexed stagger
   is only honest where position is identity. Never key a row by array index.
10. **Below the fold waits for the scroll.** `<Deferred>` queues only within ~300 px of
    the viewport, so a long view does not mount its bottom on open.

### Order inside a view

Give `<Deferred order>` by reading priority, not DOM convenience: the slot that
answers the view's question first (usually the main chart) is `order={0}`;
supporting visualizations `1`, `2`…; secondary panels last. Equal orders release
in document order.

## How it works

- **`src/styles/dashboard.css`** — tier classes and tokens (`--arrive-step`,
  `--arrive-duration`, `--settle-duration`, `--ghost-delay`) and the per-theme canvas.
- **`src/components/dashboard/arrival/scheduler.ts`** — `ArrivalQueue`: opens
  `FIRST_LEAD_MS` (120) after the view's first paint, releases one slot per
  `SLOT_GAP_MS` (90) inside `requestIdleCallback` (300 ms timeout), lowest `order`
  first; closes while the view is hidden.
- **`arrival/ArrivalProvider.tsx`** — one queue per view; `ViewOutlet` wraps every
  kept-alive view in one. `<Activity>` runs effect cleanups on hide, so a hidden
  view never releases.
- **`arrival/Deferred.tsx`** — `<Deferred minHeight order preload ghost>` and the
  lower-level `useDeepTurn(ref, order)` for components that gate inline.
- **`arrival/arrive.ts`** — `ARRIVE`, `arriveAt(i)`, `arrive(i)` for the T1/T2 cascade.
- **`arrival/ViewGap.tsx`** — the view-chunk gap: held height, sr-only status, a
  faint line after the ghost delay. Deliberately shapeless (views share no body
  geometry). Also used for a tab whose first data is not here yet and whose
  body shape depends on that data (observability tabs, real-mode leaderboard).
- **`spa/ViewOutlet.tsx`** — provider per view, the delegated `markArrived`
  replay guard, and `warmLikelyViews` (idle warm-up of `IDLE_WARM` chunks after
  1.5 s, skipped on save-data / 2g).

## Usage

```tsx
import Deferred from "@/components/dashboard/arrival/Deferred";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";

const loadChart = () => import("@/components/dashboard/LatencyChart");
const LatencyChart = dynamic(loadChart, { ssr: false });

<header>…</header>                                   {/* T0 */}
<section className={`${ARRIVE} grid gap-4`} style={arriveAt(1)}>  {/* T1 */}
  <GlowCard>
    <CardTitle />                                     {/* T1 chrome */}
    <Deferred minHeight={280} order={0} preload={loadChart}>   {/* T3 */}
      <LatencyChart data={data} />
    </Deferred>
  </GlowCard>
</section>
```

## Canvas backgrounds

`.dash-canvas` (on the dashboard layout root) replaces the flat
`bg-[var(--background)]`: two soft radial lights plus a theme-specific texture on
fixed, composited pseudo-elements (no repaint on scroll), masked to fade toward
the content. Tokens per theme: `--dash-glow-a`, `--dash-glow-b`, `--dash-pattern`,
`--dash-pattern-size`, `--dash-pattern-mask`.

| Theme | Texture |
| --- | --- |
| Midnight (default) | dot grid, blue dusk lights |
| Cyan | hairline grid |
| Bronze | diagonal hatch |
| Frost | dotted hairlines |
| Purple | sparse two-layer starfield, violet/magenta nebula |
| Pink | counter-diagonal lines |
| Red | faint scanlines, crimson vignette |
| Matrix | column rules + scanlines fading downward |
| Light | paper grain |
| Ice | blueprint grid |
| News | halftone corner |

Dropped under `forced-colors` and print. Add a theme → add its block to
`dashboard.css` beside its `themes.css` block.

## Conventions & gotchas

- `ViewOutlet`'s `onAnimationEnd` only marks `dash-arrive` / `dash-settle`. Other
  entrances (framer-motion) are JS-driven and do not replay on `display` toggles.
- framer-motion entrance variants already in views count as T1/T2 entrances; do not
  stack `.dash-arrive` on an element that also has a framer `initial`.
- `Deferred` keeps `minHeight` after release as a floor; size it to the body's real
  height, not larger.
- A view rendered outside `ViewOutlet` (tests, `/m`) uses a self-opening fallback
  queue, so slots still release.

## Registry basis

`software-engineering`: *lazy-section-loading* (frame eager / sections lazy,
placeholder contract, prefetch on intent, idle warm-up, warm return),
*placeholder-design* (geometry-matched, delayed, never covers data),
*arrival-choreography* (one edge, play once, cap the cascade, reduced motion =
settled), *layout-stability-by-reservation*, *page-load-pipeline* (script cost is
main-thread time). Recorded deviation: the registry splits code no deeper than the
nav; this standard defers **mount** deeper than the nav and keeps **fetch** at view
mount, which preserves the no-waterfall property.

## Related docs

- [shell-chrome](shell-chrome.md) — the SPA shell, `ViewOutlet`, keep-alive
- [observability](observability.md) — the established deferred-chart card shape
