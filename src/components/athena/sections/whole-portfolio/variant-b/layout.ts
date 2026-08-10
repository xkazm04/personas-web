/**
 * Scene geometry for "Worst First" — section 5, variant B.
 *
 * The argument is a RANKING, so the field is two halves that must stay in one
 * coordinate system: a dense lattice of readings on one side, an ordered short
 * list on the other, and readings that physically TRAVEL from a cell in the
 * first into a rank in the second. Everything below is percent-of-field, so a
 * reading leaving cell (7, 5) and a reading arriving at rank 0 are described in
 * the same numbers and can never miss each other.
 *
 * Two sets, switched on the md breakpoint (`useIsMobile`): WIDE puts the
 * lattice left and the list right, with Athena riding a gutter lane down the
 * lattice; COMPACT stacks the same argument and thins it — fewer projects and
 * fewer checks each, never smaller type.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FieldLayout {
  compact: boolean;
  /** Projects down, checks across. The lattice's whole density budget. */
  rows: number;
  cols: number;
  /** Athena waits here, rides this lane down the lattice, settles here. */
  dock: Point;
  lane: number;
  head: Point;
  lattice: Rect;
  latticeHead: Rect;
  rowX: number;
  rowW: number;
  rowTop: number;
  rowH: number;
  /** Share of a row given to the project's name. */
  nameFrac: number;
  /** Share of a row between the name and the first reading. */
  railFrac: number;
  /** Gap between two readings, as a percent of the readings strip. */
  cellGap: number;
  list: Rect;
  listHead: Rect;
  listTop: number;
  slotH: number;
  slotGap: number;
  /** What the top slot grows to when it opens. */
  cardH: number;
  pillX: number;
  pillW: number;
  /**
   * The overtake, in percent of the field. A reading climbing the list swings
   * OUT of the column (`bowOut`, toward the lattice) and comes back in — the
   * passing lane — while the one it passes only eases aside (`bowIn`). Both
   * are budgeted so a bowed pill still lands inside the field: swinging the
   * droppers the other way by the same amount threw them off the right edge.
   */
  bowOut: number;
  bowIn: number;
}

/**
 * md+ — lattice left, list right.
 *
 * The percentages are budgeted against the field's FLOOR height (set by the
 * section shell), because a percent box shrinks with the viewport while the
 * type inside it does not. Every box here holds its content at that floor.
 */
export const WIDE: FieldLayout = {
  compact: false,
  rows: 9,
  cols: 11,
  dock: { x: 3.4, y: 6 },
  lane: 3.4,
  head: { x: 55.8, y: 16 },
  lattice: { x: 7.6, y: 0, w: 46.4, h: 100 },
  latticeHead: { x: 9, y: 1.6, w: 43.6, h: 7 },
  rowX: 9,
  rowW: 43.6,
  rowTop: 10.5,
  rowH: 9.72,
  nameFrac: 0.38,
  railFrac: 0.023,
  cellGap: 3,
  list: { x: 57.5, y: 0, w: 42.5, h: 100 },
  listHead: { x: 59.5, y: 1.6, w: 38.5, h: 7 },
  listTop: 11.5,
  slotH: 9,
  slotGap: 2,
  cardH: 40,
  pillX: 78.75,
  pillW: 38.5,
  bowOut: -6,
  bowIn: 1.6,
};

/** &lt;md — the same argument stacked, and thinned: six projects, seven checks. */
export const COMPACT: FieldLayout = {
  compact: true,
  rows: 6,
  cols: 7,
  dock: { x: 6, y: 5 },
  lane: 6,
  head: { x: 6, y: 49.5 },
  lattice: { x: 11, y: 0, w: 88.5, h: 43 },
  latticeHead: { x: 12.4, y: 1, w: 85.7, h: 5.5 },
  rowX: 12.4,
  rowW: 85.7,
  rowTop: 7.5,
  rowH: 5.75,
  nameFrac: 0.42,
  railFrac: 0.01,
  cellGap: 6,
  list: { x: 0.5, y: 46, w: 99, h: 54 },
  listHead: { x: 12, y: 47, w: 86, h: 5.5 },
  listTop: 52.5,
  slotH: 6.3,
  slotGap: 1.1,
  cardH: 24,
  pillX: 50,
  pillW: 95,
  bowOut: -2.2,
  bowIn: 0.8,
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/** One project's row, in field percent. */
export function rowRect(L: FieldLayout, row: number): Rect {
  return { x: L.rowX, y: L.rowTop + row * L.rowH, w: L.rowW, h: L.rowH };
}

/** Left edge and width of the readings strip inside a row, in field percent. */
export function stripX(L: FieldLayout): number {
  return L.rowX + L.rowW * (L.nameFrac + L.railFrac);
}
export function stripW(L: FieldLayout): number {
  return L.rowW * (1 - L.nameFrac - L.railFrac);
}

/**
 * The centre of one reading, in field percent. Derived from the SAME flex
 * arithmetic the strip lays out with (n equal cells separated by `cellGap`
 * percent of the strip) rather than the convenient `(i + 0.5) / n` — otherwise
 * a reading at the far end of a row launches its pill a visible distance from
 * the cell it came out of, and the traceability is the whole point.
 */
export function cellPoint(L: FieldLayout, row: number, col: number): Point {
  const cell = (100 - (L.cols - 1) * L.cellGap) / L.cols;
  const centre = col * (cell + L.cellGap) + cell / 2;
  return {
    x: stripX(L) + (centre / 100) * stripW(L),
    y: L.rowTop + (row + 0.5) * L.rowH,
  };
}

/**
 * Where a reading sits the beat it rises OUT of the lattice.
 *
 * It wants to be exactly on the cell it came from — that is the traceability
 * this whole scene is built on. But a lifted reading is already list-row wide,
 * and below md a list row is nearly the whole field, so a cell out at the right
 * end of a row would launch its pill a third of the way off screen. So the x is
 * clamped into the field and the y is not: the pill still rises on the row it
 * belongs to, over the project whose name is right there, and the hollow ring
 * it leaves behind keeps the exact address. At md+ the clamp never binds.
 */
export function liftPoint(L: FieldLayout, row: number, col: number): Point {
  const at = cellPoint(L, row, col);
  const edge = L.pillW / 2 + 1;
  return { x: Math.min(Math.max(at.x, edge), 100 - edge), y: at.y };
}

/** How tall the box at a rank is — the top one grows when it opens. */
export function slotHeight(L: FieldLayout, rank: number, open: boolean): number {
  return open && rank === 0 ? L.cardH : L.slotH;
}

/**
 * The centre of a rank in the list. When the top slot opens, the ranks below
 * it move DOWN rather than being covered: the list making room is what keeps
 * the ordering the point instead of the card replacing it.
 */
export function slotCentre(L: FieldLayout, rank: number, open: boolean): Point {
  if (!open) {
    return { x: L.pillX, y: L.listTop + rank * (L.slotH + L.slotGap) + L.slotH / 2 };
  }
  if (rank === 0) return { x: L.pillX, y: L.listTop + L.cardH / 2 };
  const top = L.listTop + L.cardH + L.slotGap + (rank - 1) * (L.slotH + L.slotGap);
  return { x: L.pillX, y: top + L.slotH / 2 };
}
