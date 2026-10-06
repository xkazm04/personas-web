/**
 * Scene geometry for "The Glide" — every module and every walkthrough target
 * is placed from percent rects over the app canvas, so the corner brackets
 * (which read the same numbers) always frame the real control.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — three-column product screen sized for one stage: templates,
 *              then connectors over the trigger, then the payoff column
 *              (recent runs, monitoring, the action button).
 *   COMPACT  — the spine goes full width and the right rail drops out; the
 *              action button becomes a full-width CTA at the bottom. Fewer
 *              items rather than smaller type (text-base floor is absolute).
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Everything the scene positions that is *not* a walkthrough target. */
export interface SceneLayout {
  /** Breadcrumb + filter-chip toolbar across the top of the canvas. */
  toolbar: Rect;
  /** Backing panel of the connector list (header sits inside it). */
  connectors: Rect;
  /** Already-connected rows stacked under the Slack target row. */
  connRows: Rect[];
  labels: { templates: Point; trigger: Point };
  /** Width of a section-label row so its right-hand hint can align. */
  labelW: number;
}

/**
 * Bracket clearance: LockBrackets hangs its corners 12px outside the target,
 * so a section label must clear its own 24px line box *plus* that 12px before
 * the target starts — otherwise the corner strokes cut through the label.
 */

/** md+ — a three-column screen, sized for one stage: the choice column on the
 *  left (templates), the wiring column in the middle (connectors over the
 *  trigger), the payoff column on the right (runs, monitoring, the button).
 *  The story reads left to right, which is also the way she travels. Rows are
 *  never under ~10% tall, so a 40px row still holds at the shortest stage. */
export const WIDE: SceneLayout = {
  toolbar: { x: 2.5, y: 2, w: 86, h: 9 },
  connectors: { x: 33, y: 12.5, w: 34, h: 47 },
  connRows: [
    { x: 34.5, y: 34.5, w: 31, h: 10.5 },
    { x: 34.5, y: 46.5, w: 31, h: 10.5 },
  ],
  labels: { templates: { x: 2.5, y: 12.5 }, trigger: { x: 33, y: 62 } },
  labelW: 28,
};

/** <md — single column, one already-connected row, no right rail. */
export const COMPACT: SceneLayout = {
  toolbar: { x: 4, y: 1, w: 92, h: 6.5 },
  connectors: { x: 4, y: 41, w: 92, h: 20 },
  connRows: [{ x: 6, y: 54.5, w: 88, h: 6 }],
  labels: { templates: { x: 4, y: 8 }, trigger: { x: 4, y: 62.5 } },
  labelW: 92,
};

/**
 * Right-rail modules. They only ever render at md+ (`hidden md:flex`), so a
 * single rect set is enough — no compact twin to keep in sync.
 */
export const WIDE_ONLY = {
  templateAlt: { x: 2.5, y: 63, w: 28, h: 34 },
  runs: { x: 69.5, y: 12.5, w: 28, h: 38 },
  monitor: { x: 69.5, y: 53, w: 28, h: 26 },
} as const;

export const layoutFor = (compact: boolean): SceneLayout => (compact ? COMPACT : WIDE);
