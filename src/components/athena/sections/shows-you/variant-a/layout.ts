/**
 * Scene geometry for "The Glide" — every module and every walkthrough target
 * is placed from percent rects over the app canvas, so the corner brackets
 * (which read the same numbers) always frame the real control.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`):
 *   WIDE     — two-column product screen: spine on the left (templates →
 *              connectors → trigger), right rail (recent runs, monitoring,
 *              the action button).
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

/** md+ — the full two-column screen. */
export const WIDE: SceneLayout = {
  toolbar: { x: 3.5, y: 1.5, w: 93, h: 7 },
  connectors: { x: 3.5, y: 44, w: 55.5, h: 27.5 },
  connRows: [
    { x: 5.5, y: 58.3, w: 51.5, h: 6 },
    { x: 5.5, y: 65.1, w: 51.5, h: 6 },
  ],
  labels: { templates: { x: 3.5, y: 9 }, trigger: { x: 3.5, y: 72.5 } },
  labelW: 55.5,
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
  templateAlt: { x: 32, y: 16.5, w: 27, h: 26 },
  runs: { x: 63.5, y: 9, w: 33, h: 33.5 },
  monitor: { x: 63.5, y: 44, w: 33, h: 33 },
} as const;

export const layoutFor = (compact: boolean): SceneLayout => (compact ? COMPACT : WIDE);
