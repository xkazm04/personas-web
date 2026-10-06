/**
 * Geometry for "The Keys" (workshop lab v2) - viewBox units, one uniform scale.
 *
 * A floor plan of your work: six rooms off one corridor, each room a real
 * tool. The walls are the lines you drew, and a door is the only way through
 * one. Your side - the keys you hold, and the tray where things come to you -
 * stands outside the plan. WIDE lays the rooms in two rows along a horizontal
 * corridor; COMPACT stands the same plan upright, two columns along a
 * vertical one. Room order (and so every index in ./data) is the same in both.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Door {
  /** Hinge point. */
  hx: number;
  hy: number;
  len: number;
  /** Direction of the closed leaf, degrees (0 = +x, 90 = +y). */
  base: number;
  /** Rotation that opens it into the room, degrees (+ = clockwise). */
  swing: number;
}

export interface Room {
  box: Box;
  door: Door;
  /** Where the room's name sits (top-left) and where its work sits. */
  label: { x: number; y: number };
  job: Box;
  /** Where a handed key hangs, just inside the door. */
  hook: { x: number; y: number };
}

export interface V2Layout {
  W: number;
  H: number;
  walls: string;
  rooms: readonly Room[];
  /** Her stations: the entrance, then outside each room's door. */
  entrance: { x: number; y: number };
  stations: readonly { x: number; y: number }[];
  herSize: number;
  keys: { panel: Box; head: { x: number; y: number }; ring: { x: number; y: number; r: number }; slots: readonly { x: number; y: number }[]; tag: { w: number; h: number } };
  tray: { panel: Box; head: { x: number; y: number }; note: Box };
}

const WIDE_CX = [167, 454, 740];
/** Base frame of the wide layout; `wide(k)` stretches it vertically by k to
 *  fill a tall stage slot (shared/useStretch). Doors, keys and her face keep
 *  their size; rooms, the corridor's place and the panels stretch. */
export const WIDE_W = 1320;
export const WIDE_H = 600;

export function wide(k: number): V2Layout {
  const y = (v: number) => Math.round(v * k);
  const top = y(40);
  const bottom = y(580);
  const mid = y(310);
  const c0 = mid - 40;
  const c1 = mid + 40;
  const gaps = (wy: number) =>
    `M 24 ${wy} H 135 M 199 ${wy} H 422 M 486 ${wy} H 708 M 772 ${wy} H 884`;
  const room = (i: number): Room => {
    const up = i < 3;
    const cx = WIDE_CX[i % 3];
    const x = [24, 311, 597][i % 3];
    const w = [287, 286, 287][i % 3];
    const ry = up ? top : c1;
    const h = up ? c0 - top : bottom - c1;
    return {
      box: { x, y: ry, w, h },
      door: { hx: cx - 32, hy: up ? c0 : c1, len: 64, base: 0, swing: up ? -90 : 90 },
      label: { x: x + 22, y: up ? ry + 20 : bottom - 48 },
      job: { x: x + 24, y: up ? ry + 70 : c1 + 92, w: w - 48, h: 66 },
      hook: { x: cx + 62, y: up ? c0 - 24 : c1 + 24 },
    };
  };
  return {
    W: WIDE_W,
    H: y(WIDE_H),
    walls: [
      `M 24 ${c0} V ${top} H 884 V ${bottom} H 24 V ${c1}`,
      gaps(c0),
      gaps(c1),
      `M 311 ${top} V ${c0} M 311 ${c1} V ${bottom} M 597 ${top} V ${c0} M 597 ${c1} V ${bottom}`,
    ].join(" "),
    rooms: [0, 1, 2, 3, 4, 5].map(room),
    entrance: { x: 52, y: mid },
    stations: WIDE_CX.concat(WIDE_CX).map((x) => ({ x, y: mid })),
    herSize: 70,
    keys: {
      panel: { x: 924, y: top, w: 376, h: y(302) - top },
      head: { x: 946, y: y(58) },
      ring: { x: 1222, y: y(76), r: 18 },
      slots: [1004, 1112, 1220, 1004, 1112, 1220].map((x, i) => ({ x, y: i < 3 ? y(160) : y(240) })),
      tag: { w: 96, h: 56 },
    },
    tray: {
      panel: { x: 924, y: y(326), w: 376, h: bottom - y(326) },
      head: { x: 946, y: y(344) },
      note: { x: 946, y: y(392), w: 332, h: 160 },
    },
  };
}

const ROW_Y = [8, 192, 376];

function compactRoom(i: number): Room {
  const left = i < 3;
  const y = ROW_Y[i % 3];
  const x = left ? 8 : 232;
  return {
    box: { x, y, w: 160, h: 184 },
    door: { hx: left ? 168 : 232, hy: y + 114, len: 56, base: 90, swing: left ? 90 : -90 },
    label: { x: x + 12, y: y + 12 },
    job: { x: x + 10, y: y + 46, w: 140, h: 60 },
    hook: { x: left ? 140 : 260, y: y + 150 },
  };
}

export const COMPACT: V2Layout = {
  W: 400,
  H: 860,
  walls: [
    "M 232 8 H 392 V 560 H 8 V 8 H 168",
    "M 168 8 V 122 M 168 178 V 306 M 168 362 V 490 M 168 546 V 560",
    "M 232 8 V 122 M 232 178 V 306 M 232 362 V 490 M 232 546 V 560",
    "M 8 192 H 168 M 232 192 H 392 M 8 376 H 168 M 232 376 H 392",
  ].join(" "),
  rooms: [0, 1, 2, 3, 4, 5].map(compactRoom),
  entrance: { x: 200, y: 36 },
  stations: [0, 1, 2, 0, 1, 2].map((r) => ({ x: 200, y: ROW_Y[r] + 142 })),
  herSize: 52,
  keys: {
    panel: { x: 8, y: 580, w: 384, h: 112 },
    head: { x: 24, y: 592 },
    ring: { x: 360, y: 604, r: 12 },
    slots: [0, 1, 2, 3, 4, 5].map((i) => ({ x: 44 + i * 62.4, y: 656 })),
    tag: { w: 54, h: 46 },
  },
  tray: {
    panel: { x: 8, y: 708, w: 384, h: 148 },
    head: { x: 24, y: 720 },
    note: { x: 24, y: 750, w: 352, h: 94 },
  },
};

export const layoutFor = (compact: boolean, k: number): V2Layout => (compact ? COMPACT : wide(k));
