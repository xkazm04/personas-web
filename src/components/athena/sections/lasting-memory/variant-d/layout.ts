/**
 * Scene geometry for "The Anatomy" — the lasting-memory section, variant D.
 *
 * One coordinate system, deliberately: percent of the field, for everything.
 * Nothing here is projected and nothing travels except light, so type sits in
 * the art at its authored size at every viewport with nothing to keep in sync.
 *
 * The shape is an ANATOMY — three zones stacked in the order material moves
 * through them, and the silhouette does the arguing before a word is read:
 *
 *   WIDE at the top      what she is working from right now. Plentiful, and
 *                        rewritten constantly.
 *   NARROW in the middle her, resting. Everything has to pass through here,
 *                        and it is the smallest part of the picture.
 *   WIDE at the bottom   what she kept. It only ever fills further.
 *
 * A slot on the shelf exists from the first frame whether or not anything has
 * landed in it yet, so "how full is the shelf" is a thing the eye can MEASURE
 * across the loop rather than a claim the copy makes. That is the same move
 * the sibling variant makes with its two congruent brackets.
 *
 * Percentages are budgeted against the field's FLOOR height (36rem, set by the
 * section shell): a percent box shrinks with the viewport, the type inside it
 * does not.
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

export interface FieldLayout {
  /** The working surface — what she is talking from right now. */
  now: Rect;
  /** Her. The throat everything passes through. */
  chamber: Rect;
  /** The shelf. Every slot is here from the first frame. */
  kept: Rect;
  /** How many scraps the working surface holds at once. */
  scraps: number;
  cols: number;
  rows: number;
  /** Gaps, in percent of the field along their own axis. */
  scrapGap: number;
  slotGapX: number;
  slotGapY: number;
  padX: number;
  padY: number;
  /** How far above a zone its name sits. */
  labelLift: number;
  /** The row between her and the shelf where the beat caption lives. It runs
   *  the full width and is centred, so five words never wrap into the zone
   *  label under them. */
  captionY: number;
  /** Short copy on the shelf — fewer characters, never smaller type. */
  short: boolean;
}

/** md+ — the full anatomy, four things' worth of shelf across. */
export const WIDE: FieldLayout = {
  now: { x: 3, y: 6, w: 94, h: 13 },
  chamber: { x: 40, y: 31, w: 20, h: 19 },
  kept: { x: 3, y: 64, w: 94, h: 34 },
  scraps: 9,
  cols: 4,
  rows: 2,
  scrapGap: 1.1,
  slotGapX: 1.6,
  slotGapY: 3,
  padX: 1,
  padY: 1.6,
  labelLift: 4.6,
  captionY: 52,
  short: false,
};

/** <md — the same three zones in the same order, fewer things in each. The
 *  shelf grows taller rather than wider so the fill still reads as fill. */
export const COMPACT: FieldLayout = {
  now: { x: 2, y: 5, w: 96, h: 12 },
  chamber: { x: 34, y: 22, w: 32, h: 15 },
  kept: { x: 2, y: 51, w: 96, h: 47 },
  scraps: 6,
  cols: 2,
  rows: 3,
  scrapGap: 1.4,
  slotGapX: 2,
  slotGapY: 2.2,
  padX: 1.4,
  padY: 1.4,
  labelLift: 4.4,
  captionY: 39,
  short: true,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** How many slots the shelf has — filled or not, they are all mounted. */
export const slotCount = (L: FieldLayout): number => L.cols * L.rows;

/** Where scrap `i` sits on the working surface. */
export function scrapRect(L: FieldLayout, i: number): Rect {
  const inner = L.now.w - L.padX * 2;
  const w = (inner - L.scrapGap * (L.scraps - 1)) / L.scraps;
  return {
    x: L.now.x + L.padX + i * (w + L.scrapGap),
    y: L.now.y + L.padY,
    w,
    h: L.now.h - L.padY * 2,
  };
}

/** Where shelf slot `i` sits, filling left to right and then down. */
export function slotRect(L: FieldLayout, i: number): Rect {
  const innerW = L.kept.w - L.padX * 2;
  const innerH = L.kept.h - L.padY * 2;
  const w = (innerW - L.slotGapX * (L.cols - 1)) / L.cols;
  const h = (innerH - L.slotGapY * (L.rows - 1)) / L.rows;
  const col = i % L.cols;
  const row = Math.floor(i / L.cols);
  return {
    x: L.kept.x + L.padX + col * (w + L.slotGapX),
    y: L.kept.y + L.padY + row * (h + L.slotGapY),
    w,
    h,
  };
}

export const center = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
/** Where material leaves a box, and where it arrives at one. */
export const foot = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h });
export const head = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y });

/**
 * One stream, from anchor to anchor. Both tangents are vertical, so a stream
 * leaves the surface going straight down and arrives going straight down —
 * which is what makes nine of them read as a funnel rather than as a fan.
 */
export function curve(a: Point, b: Point, bow = 0.55): string {
  const run = b.y - a.y;
  const r = (n: number) => Math.round(n * 100) / 100;
  return `M ${r(a.x)} ${r(a.y)} C ${r(a.x)} ${r(a.y + run * bow)}, ${r(b.x)} ${r(b.y - run * bow)}, ${r(b.x)} ${r(b.y)}`;
}

/** Everything you said in this stretch → her. One per scrap: the whole surface
 *  feeds the pass, which is the "much" half of the asymmetry. */
export function intakePaths(L: FieldLayout): string[] {
  const to = head(L.chamber);
  return Array.from({ length: L.scraps }, (_, i) => curve(foot(scrapRect(L, i)), to));
}

/** Her → the slot each kept thing lands in. Three, against nine. */
export function outletPaths(L: FieldLayout, n: number): string[] {
  const from = foot(L.chamber);
  return Array.from({ length: n }, (_, i) => curve(from, head(slotRect(L, i)), 0.62));
}
