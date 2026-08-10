/**
 * Where everything sits in "You Left. It Kept Going." — section 4, variant C.
 *
 * The scene is one full-bleed FIELD, not a window, so every coordinate is a
 * percent of the field and nothing is ever positioned in pixels. The field
 * reads in four bands, top to bottom:
 *
 *   title      the section's own words, over quiet light only
 *   sky        the work — a scatter of small lights, joined by faint filaments
 *   seam       a single hairline where the field's ground begins
 *   ground     what you said (left), Athena (centre), what landed (right)
 *
 * Two sets, switched on the md breakpoint. Compact keeps the same story and
 * the same type size — it drops three of the eight lights and stacks the two
 * ground panels instead of shrinking anything.
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
  /** The hairline the ground starts at. */
  seamY: number;
  /** What you asked for, and the plan she offered back. */
  ask: Rect;
  /** The one composed answer waiting when you come back. */
  summary: Rect;
  /** Athena — on the seam, centre, for the whole loop. */
  athena: Point;
  /** You — on the seam beside your own words. */
  you: Point;
  /** Where you go when you step away: off the field entirely. */
  away: Point;
}

/** md+ — the two panels face each other across her. */
export const WIDE: FieldLayout = {
  seamY: 63,
  ask: { x: 5, y: 66.5, w: 37, h: 27 },
  summary: { x: 58, y: 66.5, w: 37, h: 27 },
  athena: { x: 50, y: 63 },
  you: { x: 26, y: 63 },
  away: { x: -12, y: 63 },
};

/** <md — the same story stacked; the sky tightens, the type never shrinks. */
export const COMPACT: FieldLayout = {
  seamY: 37,
  ask: { x: 4, y: 40, w: 92, h: 26 },
  summary: { x: 4, y: 68, w: 92, h: 24 },
  athena: { x: 50, y: 37 },
  you: { x: 16, y: 37 },
  away: { x: -14, y: 37 },
};

export const layoutFor = (compact: boolean): FieldLayout => (compact ? COMPACT : WIDE);

/**
 * One light in the sky. `task` names the plan line it carries — the three
 * lights you can read are exactly the three lines you approved, so the sky is
 * legibly YOUR request rather than decorative particles. The rest stay quiet:
 * eight things are running, and only a few need naming.
 *
 * `doneAt: null` marks the one that will not finish on its own. It does not
 * fail and it does not guess — it waits, from `WAIT_AT` to the end of the loop.
 */
export interface WorkNode {
  id: string;
  /** Index into COPY.work.tasks, or null for an unnamed light. */
  task: number | null;
  wide: Point;
  /** null → this light is not part of the compact sky. */
  narrow: Point | null;
  /** Dot diameter in px. */
  size: number;
  /** The tick it settles; null → it is the one that waits for you. */
  doneAt: number | null;
}

export const NODES: readonly WorkNode[] = [
  { id: "n1", task: null, wide: { x: 11, y: 43 }, narrow: null, size: 8, doneAt: 15 },
  { id: "n2", task: 0, wide: { x: 22, y: 30 }, narrow: { x: 30, y: 19 }, size: 12, doneAt: 14 },
  { id: "n3", task: null, wide: { x: 33, y: 56 }, narrow: { x: 11, y: 30 }, size: 8, doneAt: 17 },
  { id: "n4", task: null, wide: { x: 43, y: 41 }, narrow: { x: 50, y: 26 }, size: 13, doneAt: null },
  { id: "n5", task: 1, wide: { x: 56, y: 30 }, narrow: { x: 72, y: 18 }, size: 12, doneAt: 16 },
  { id: "n6", task: 2, wide: { x: 67, y: 52 }, narrow: null, size: 12, doneAt: 18 },
  { id: "n7", task: null, wide: { x: 78, y: 36 }, narrow: { x: 88, y: 31 }, size: 8, doneAt: 16 },
  { id: "n8", task: null, wide: { x: 89, y: 49 }, narrow: null, size: 8, doneAt: 19 },
] as const;

/** The one that waits — resolved once so no caller has to search for it. */
export const WAITING_NODE = NODES.find((n) => n.doneAt === null) as WorkNode;

/** A loose web, not a graph: enough thread to read as one piece of work. */
export const FILAMENTS: readonly (readonly [string, string])[] = [
  ["n1", "n2"],
  ["n1", "n3"],
  ["n2", "n4"],
  ["n3", "n4"],
  ["n4", "n5"],
  ["n5", "n6"],
  ["n5", "n7"],
  ["n7", "n8"],
] as const;

/** A node's point at the current breakpoint, or null if it sits this one out. */
export function nodePoint(node: WorkNode, compact: boolean): Point | null {
  return compact ? node.narrow : node.wide;
}

/** The lights actually on screen at this breakpoint. */
export function nodesFor(compact: boolean): WorkNode[] {
  return NODES.filter((n) => nodePoint(n, compact) !== null);
}

/** Filaments whose two ends are both on screen at this breakpoint. */
export function filamentsFor(compact: boolean): { id: string; a: Point; b: Point }[] {
  const at = (id: string) => {
    const node = NODES.find((n) => n.id === id);
    return node ? nodePoint(node, compact) : null;
  };
  return FILAMENTS.flatMap(([from, to]) => {
    const a = at(from);
    const b = at(to);
    return a && b ? [{ id: `${from}-${to}`, a, b }] : [];
  });
}
