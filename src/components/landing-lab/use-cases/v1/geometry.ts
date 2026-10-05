import { BYSTANDERS, CASES, type ToolKey } from "../shared/catalog";

/**
 * V1 "magnetic field" layout, in art units (VIEW_W x VIEW_H). The persona sits
 * left inside a ring of six capability sockets; the right two thirds are a
 * loose hex field of every tool. Positions are deterministic (no randomness),
 * and each case's candidates are spread across the field rather than grouped,
 * so a need visibly pulls its options out of the crowd.
 */

export const VIEW_W = 1100;
export const VIEW_H = 500;
export const TILE = 46;
export const SOCKET = 58;

export const PERSONA = { cx: 200, cy: 236, ring: 168 };
/** Where a need pulls its candidates toward: the field's edge nearest the persona. */
export const ATTRACTOR = { x: 520, y: 262 };
export const PULL = 0.3;

const COLS = 9;
const ROWS = 5;
const X0 = 545;
const DX = 61;
const Y0 = 108;
const DY = 86;

/** Round-robin through the cases so neighbours in the list belong to different needs. */
function fieldOrder(): ToolKey[] {
  const order: ToolKey[] = [];
  const longest = Math.max(...CASES.map((c) => c.candidates.length));
  let b = 0;
  for (let k = 0; k < longest; k++) {
    for (const c of CASES) if (c.candidates[k]) order.push(c.candidates[k]);
    for (let j = 0; j < 2 && b < BYSTANDERS.length; j++) order.push(BYSTANDERS[b++]);
  }
  while (b < BYSTANDERS.length) order.push(BYSTANDERS[b++]);
  return order;
}

export interface FieldSpot {
  key: ToolKey;
  x: number;
  y: number;
  /** Seconds of phase offset for the idle drift. */
  drift: number;
}

/** 45 spots on a staggered grid, filled through a stride (19, coprime with 45; searched for the widest spread of each case) to scatter each need's options. */
export const FIELD: FieldSpot[] = (() => {
  const tools = fieldOrder();
  const n = COLS * ROWS;
  const spots: FieldSpot[] = [];
  tools.forEach((key, i) => {
    const slot = (i * 19) % n;
    const row = Math.floor(slot / COLS);
    const col = slot % COLS;
    const jx = (((slot * 37) % 11) - 5) * 1.2;
    const jy = (((slot * 53) % 13) - 6) * 1.4;
    spots.push({
      key,
      x: X0 + col * DX + (row % 2 ? DX / 2 : 0) + jx,
      y: Y0 + row * DY + jy,
      drift: ((slot * 7) % 10) / 4,
    });
  });
  return spots;
})();

export const spotOf = (key: ToolKey) => FIELD.find((s) => s.key === key)!;

/** Socket i on the persona's ring, clockwise from the upper right. */
export function socketAt(i: number) {
  const a = ((-60 + i * 60) * Math.PI) / 180;
  return { x: PERSONA.cx + PERSONA.ring * Math.cos(a), y: PERSONA.cy + PERSONA.ring * Math.sin(a) };
}

/** Art units -> percent of the art box. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;
export const px = (x: number) => `${r3((x / VIEW_W) * 100)}%`;
export const py = (y: number) => `${r3((y / VIEW_H) * 100)}%`;
/** Art units -> cqw (the art box is the inline-size container). */
export const cq = (u: number) => `${r3((u / VIEW_W) * 100)}cqw`;
