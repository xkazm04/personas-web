/**
 * V3 "Zoom" geometry. Four scenes, each drawn in its own LOCAL frame of
 * FW x FH units, nested inside the next: the task (A) sits on an agent card in
 * the chain (B), the chain is one card of the fleet (C), the fleet is the
 * screen of your computer (D). The camera shows one frame at a time and zooms
 * between them.
 */

export const FW = 1320;
export const FH = 500;

/** Art box: the lens (one frame) plus the zoom path under it. */
export const W = 1320;
export const H = 600;
export const PATH_Y = 516;

export interface Place {
  x: number;
  y: number;
  s: number;
}

/** Where each inner frame sits inside its parent, in the parent's units. */
export const SCREEN: Place = { x: 560, y: 110, s: 460 / FW }; // C inside D
export const FLEET_CARD = { col: 1, row: 1 };
export const CARD = { w: 300, h: 80, x0: 45, y0: 200, gapX: 10, gapY: 14, cols: 4, rows: 3 };
export function cardXY(col: number, row: number) {
  return { x: CARD.x0 + col * (CARD.w + CARD.gapX), y: CARD.y0 + row * (CARD.h + CARD.gapY) };
}
const CHAIN_S = CARD.h / FH;
/** A chain drawn inside a fleet card, centred in it. */
export function chainInCard(col: number, row: number): Place {
  const c = cardXY(col, row);
  return { x: c.x + (CARD.w - FW * CHAIN_S) / 2, y: c.y, s: CHAIN_S };
}
export const CHAIN: Place = chainInCard(FLEET_CARD.col, FLEET_CARD.row); // B inside C
export const AGENT_CARD = { x: 350, y: 225, w: 290, h: 110 };
export const TASK: Place = { x: AGENT_CARD.x, y: AGENT_CARD.y, s: AGENT_CARD.w / FW }; // A inside B

export const placeAttr = (p: Place) => `translate(${p.x} ${p.y}) scale(${p.s})`;

/** Camera rects in D's (world) units, indexed by level: 0 = task ... 3 = computer. */
interface Rect {
  x: number;
  y: number;
  w: number;
}
function compose(outer: Rect, p: Place): Rect {
  const k = outer.w / FW;
  return { x: outer.x + p.x * k, y: outer.y + p.y * k, w: outer.w * p.s };
}
const D: Rect = { x: 0, y: 0, w: FW };
const C = compose(D, SCREEN);
const B = compose(C, CHAIN);
const A = compose(B, TASK);
export const CAMERAS: Rect[] = [A, B, C, D];

/**
 * The world transform for a continuous level `p` (0..3). Between two levels
 * x, y and w move by the same fraction of the way, which is a zoom about the
 * one point both frames share; w itself moves in log space so every doubling
 * of the view takes the same time.
 */
export function cameraTransform(p: number): string {
  const i = Math.min(2, Math.max(0, Math.floor(p)));
  const f = Math.min(1, Math.max(0, p - i));
  const a = CAMERAS[i];
  const b = CAMERAS[i + 1];
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * f);
  const g = (w - a.w) / (b.w - a.w);
  const x = a.x + (b.x - a.x) * g;
  const y = a.y + (b.y - a.y) * g;
  const k = FW / w;
  return `translate(${-x * k} ${-y * k}) scale(${k})`;
}

/** Autoplay: how long each level holds before zooming out, then the return. */
export const HOLD_MS = [2600, 3000, 3200, 4800];
export const ZOOM_S = 1.7;
