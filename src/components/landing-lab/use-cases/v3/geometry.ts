import { CASES, type ToolKey } from "../shared/catalog";

/**
 * V3 "patch bay" layout in art units. The persona's own panel on the left
 * carries six output sockets, one per need; the right is a rack of tool jacks,
 * one rack per kind of tool, plus two racks nobody calls on. A cable runs from
 * a socket to the jack the persona picks, hanging under its own weight.
 */

export const VIEW_W = 1100;
export const VIEW_H = 500;

export const PANEL = { x: 6, y: 26, w: 432, h: 448 };
export const BUST = { x: 14, y: 104, w: 200, h: 231 };
export const SOCKET_X = 410;
export const socketY = (i: number) => 78 + i * 69;

export const JACK_R = 21;
const RACK_W = 284;
const RACK_H = 92;
const SLOTS = 6;
const COL_X = [506, 806];
const ROW_Y = [34, 150, 266, 382];

export interface Rack {
  /** The case this rack answers, or -1 for a rack no need calls on. */
  caseIdx: number;
  x: number;
  y: number;
  w: number;
  h: number;
  jacks: { key: ToolKey | null; x: number; y: number }[];
}

const EXTRA: ToolKey[][] = [
  ["hubspot", "attio", "pipedrive", "zapier"],
  ["google_drive", "dropbox", "onedrive", "figma", "canva"],
];

/** Rack order on the board: col A top to bottom, then col B. Values are case indices (-1, -2 = extra racks). */
const BOARD = [0, 2, 4, -1, 1, 3, 5, -2];

export const RACKS: Rack[] = BOARD.map((ci, n) => {
  const x = COL_X[Math.floor(n / 4)];
  const y = ROW_Y[n % 4];
  const keys: (ToolKey | null)[] = ci >= 0 ? CASES[ci].candidates : EXTRA[-ci - 1];
  const step = RACK_W / SLOTS;
  return {
    caseIdx: ci,
    x,
    y,
    w: RACK_W,
    h: RACK_H,
    jacks: Array.from({ length: SLOTS }, (_, k) => ({ key: keys[k] ?? null, x: x + step * (k + 0.5), y: y + RACK_H / 2 + 4 })),
  };
});

export const rackOf = (caseIdx: number) => RACKS.find((r) => r.caseIdx === caseIdx)!;

export function jackOf(key: ToolKey) {
  for (const r of RACKS) for (const j of r.jacks) if (j.key === key) return j;
  throw new Error(`no jack for ${key}`);
}

/** A cable from socket i to a point, sagging below both ends. Same command shape for every target, so paths morph. */
export function cablePath(i: number, x: number, y: number): string {
  const sx = SOCKET_X;
  const sy = socketY(i);
  const dx = x - sx;
  const sag = 46 + dx * 0.16;
  const c1x = sx + dx * 0.32;
  const c1y = Math.max(sy, y) + sag;
  const c2x = x - dx * 0.12;
  const c2y = y + sag * 0.9;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(sx)} ${f(sy)} C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x)} ${f(y + JACK_R * 0.4)}`;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;
export const px = (x: number) => `${r3((x / VIEW_W) * 100)}%`;
export const py = (y: number) => `${r3((y / VIEW_H) * 100)}%`;
export const cq = (u: number) => `${r3((u / VIEW_W) * 100)}cqw`;
