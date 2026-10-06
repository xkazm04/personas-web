import { clamp01, ease, lerp, seg } from "../shared/motion";

/* Geometry and choreography for v2 "Doesn't fit the rules": a shape sorter.
 * The plate's four holes are the systems a business already has (labels in
 * i18n `howLab.timeline.v2.cases[].holes`); a request arrives as a cluster
 * of the shapes it really needs. Fixed rules try to push the whole cluster
 * through one hole, jam, and park it in the waiting tray; the agent reads it,
 * drops the part nobody needs, and fits each remaining piece. */

export const W = 1200;
export const H = 520;
export const DURATION = 11;

export type ShapeKind = "circle" | "square" | "triangle" | "hexagon";
/** Hole i always has this shape, so a scenario only says which holes it needs. */
export const SHAPES: ShapeKind[] = ["circle", "square", "triangle", "hexagon"];

export const PLATE = { x: 330, y: 318, w: 600, h: 136, depth: 22 };
export const HOLE_Y = 362;
export const HOLE_R = 38;
export const PIECE_R = 30;
export const holeX = (i: number) => PLATE.x + PLATE.w * ((i + 0.5) / 4);
export const SPAWN = { x: 155, y: 352 };
export const CENTER = { x: PLATE.x + PLATE.w / 2, y: 226 };
export const HOVER_Y = 240;
export const TRAY = { x: 958, y: 26, w: 236, h: 218 };
export const DONE = { x: 958, y: 270, w: 236, h: 218 };
export const TRAY_SPOT = { x: TRAY.x + TRAY.w / 2, y: TRAY.y + 186 };

/** Per case (same order as the i18n cases): holes the request needs, and the part the agent drops. */
export const CASES: { need: number[]; drop: number[] }[] = [
  { need: [0, 1, 2], drop: [] },
  { need: [1, 2], drop: [0] },
  { need: [0, 1, 2], drop: [] },
  { need: [1, 2, 3], drop: [0] },
];

/** The cluster's pieces, left to right, with their offset from its centre. */
export function cluster(c: number) {
  const ids = [...CASES[c].need, ...CASES[c].drop].sort((a, b) => a - b);
  return ids.map((hole, k) => ({ hole, dropped: CASES[c].drop.includes(hole), ox: (k - (ids.length - 1) / 2) * 52, oy: k % 2 ? -10 : 8 }));
}

type Key = [number, number, number, number?]; // p, x, y, scale
/** Piecewise path through keyframes, eased between each pair. */
export function track(p: number, keys: Key[]) {
  if (p <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] ?? 1 };
  for (let i = 1; i < keys.length; i++) {
    const [t1, x1, y1, s1 = 1] = keys[i];
    if (p <= t1) {
      const [t0, x0, y0, s0 = 1] = keys[i - 1];
      const k = ease(clamp01((p - t0) / (t1 - t0)));
      return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), s: lerp(s0, s1, k) };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l[1], y: l[2], s: l[3] ?? 1 };
}

/** A 0..1..0 bump over [a, b]. */
export const bump = (p: number, a: number, b: number) => Math.sin(Math.PI * seg(p, a, b));

/* Act one: fixed rules. */
export const JAMS = [0.15, 0.28];
export function rulesCluster(c: number, p: number) {
  const [a, b] = CASES[c].need;
  const ha = holeX(a);
  const hb = holeX(b);
  const pos = track(p, [
    [0, SPAWN.x, SPAWN.y, 0.3],
    [0.05, SPAWN.x, SPAWN.y, 1],
    [0.12, ha, HOVER_Y],
    [0.15, ha, 296],
    [0.17, ha, 258],
    [0.21, ha, 258],
    [0.25, hb, HOVER_Y],
    [0.28, hb, 296],
    [0.3, hb, 258],
    [0.33, hb, 258],
    [0.42, TRAY_SPOT.x, TRAY_SPOT.y, 0.6],
  ]);
  const shake = Math.sin(p * 260) * 7 * (bump(p, 0.15, 0.2) + bump(p, 0.28, 0.33));
  return { ...pos, r: shake, o: seg(p, 0, 0.03) };
}

/* Act two: the agent. */
export const SCAN = [0.58, 0.67];
export const landAt = (k: number) => 0.76 + k * 0.035;
export function agentPiece(c: number, k: number, p: number) {
  const piece = cluster(c)[k];
  const keep = cluster(c).filter((q) => !q.dropped);
  const order = keep.indexOf(piece);
  const cx = CENTER.x + piece.ox;
  const cy = CENTER.y + piece.oy;
  if (piece.dropped) {
    const pos = track(p, [
      [0.46, SPAWN.x + piece.ox, SPAWN.y + piece.oy, 0.3],
      [0.5, SPAWN.x + piece.ox, SPAWN.y + piece.oy],
      [0.58, cx, cy],
      [0.67, cx, cy],
      [0.74, cx - 30, cy - 70, 0.7],
    ]);
    return { ...pos, r: 0, o: seg(p, 0.46, 0.49) * (1 - 0.55 * seg(p, 0.7, 0.75)) };
  }
  const hx = holeX(piece.hole);
  const land = landAt(order);
  const pos = track(p, [
    [0.46, SPAWN.x + piece.ox, SPAWN.y + piece.oy, 0.3],
    [0.5, SPAWN.x + piece.ox, SPAWN.y + piece.oy],
    [0.58, cx, cy],
    [0.67, cx, cy],
    [0.73, hx, HOVER_Y],
    [land - 0.01, hx, HOVER_Y],
    [land + 0.04, hx, HOLE_Y, 0.86],
  ]);
  return { ...pos, r: 0, o: seg(p, 0.46, 0.49) };
}
