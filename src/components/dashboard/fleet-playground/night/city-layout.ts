import type { FleetAgent, FleetTeam } from "../fleet-data";
import { ornamentAnchor } from "./ornament-geometry";

/* The city is laid out to the field's real size (CSS px): a thin sky band,
   the buildings across the full width and most of the height, a thin street.
   Every window in the city is one size, as large as the busiest team allows. */

export interface WinBox {
  a: FleetAgent;
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  b: BuildingBox;
}

export interface BuildingBox {
  t: FleetTeam;
  i: number;
  cx: number;
  w: number;
  top: number;
  n: number;
  cols: number;
  rows: number;
  mem: FleetAgent[];
  wins: WinBox[];
  /** Highest point of the roof ornament (where the wires tie on). */
  anchor: number;
}

export interface CityLayout {
  W: number;
  H: number;
  /** Bottom of the sky band. */
  sky: number;
  /** Top of the street. */
  ground: number;
  ww: number;
  wh: number;
  gap: number;
  pad: number;
  pitch: number;
  teams: BuildingBox[];
  win: Map<string, WinBox>;
}

const ORNAMENT = 58;
const SIGN = 30;
const MARGIN = 14;

export function layoutCity(agents: FleetAgent[], teams: FleetTeam[], W: number, H: number): CityLayout {
  const sky = Math.round(Math.min(96, Math.max(48, H * 0.085)));
  const street = Math.round(Math.min(44, Math.max(28, H * 0.05)));
  const ground = H - street;
  const vis = teams.filter((t) => agents.some((a) => a.team === t.id));
  const members = vis.map((t) => agents.filter((a) => a.team === t.id));
  const pitch = (W - 2 * MARGIN) / Math.max(1, vis.length);
  const maxBw = pitch - Math.min(28, Math.max(10, pitch * 0.12));
  const bodyMax = ground - sky - ORNAMENT;

  // The largest window width at which every team fits its slot.
  let ww = 10, gap = 4, pad = 8, cols: number[] = members.map(() => 1), rows = cols;
  for (let s = 130; s >= 10; s--) {
    const g = Math.max(4, Math.round(s * 0.26));
    const p = Math.max(8, Math.round(s * 0.28));
    const c = members.map((m) => Math.min(m.length, Math.floor((maxBw - 2 * p + g) / (s + g))));
    if (c.some((x) => x < 1)) continue;
    const r = members.map((m, i) => Math.ceil(m.length / c[i]));
    const tallest = Math.max(...r);
    if (2 * p + tallest * (s + g) - g + SIGN > bodyMax) continue;
    ww = s; gap = g; pad = p; cols = c; rows = r;
    break;
  }
  // Windows then grow taller into the spare height (up to 1.7x their width).
  const tallest = Math.max(1, ...rows);
  const wh = Math.floor(Math.min(ww * 1.7, (bodyMax - 2 * pad - SIGN - (tallest - 1) * gap) / tallest));

  const out: CityLayout = { W, H, sky, ground, ww, wh, gap, pad, pitch, teams: [], win: new Map() };
  vis.forEach((t, i) => {
    const mem = members[i];
    const c = cols[i];
    const r = rows[i];
    const inner = c * ww + (c - 1) * gap;
    const w = Math.min(maxBw, Math.max(inner + 2 * pad, Math.min(maxBw, 96)));
    const top = ground - (2 * pad + r * (wh + gap) - gap + SIGN);
    const cx = MARGIN + pitch * (i + 0.5);
    const b: BuildingBox = { t, i, cx, w, top, n: mem.length, cols: c, rows: r, mem, wins: [], anchor: ornamentAnchor(t.id, top) };
    const x0 = cx - inner / 2;
    mem.forEach((a, k) => {
      const row = Math.floor(k / c);
      const box: WinBox = { a, x: Math.round(x0 + (k % c) * (ww + gap)), y: Math.round(top + pad + row * (wh + gap)), w: ww, h: wh, row, b };
      b.wins.push(box);
      out.win.set(a.id, box);
    });
    out.teams.push(b);
  });
  return out;
}

/** Empty slots on a building's last floor, bricked up. */
export function emptySlots(L: CityLayout, b: BuildingBox): { x: number; y: number }[] {
  const inner = b.cols * L.ww + (b.cols - 1) * L.gap;
  const out: { x: number; y: number }[] = [];
  for (let k = b.n; k < b.cols * b.rows; k++) {
    out.push({
      x: Math.round(b.cx - inner / 2 + (k % b.cols) * (L.ww + L.gap)),
      y: Math.round(b.top + L.pad + Math.floor(k / b.cols) * (L.wh + L.gap)),
    });
  }
  return out;
}

/** The arc a message travels between two windows, up through the sky band. */
export function arcPath(L: CityLayout, from: string, to: string): string | null {
  const A = L.win.get(from);
  const B = L.win.get(to);
  if (!A || !B) return null;
  const ax = A.x + A.w / 2;
  const bx = B.x + B.w / 2;
  const my = Math.max(L.sky * 0.6, Math.min(A.b.anchor, B.b.anchor) - 30 - Math.abs(bx - ax) * 0.08);
  return `M ${ax} ${A.y} Q ${(ax + bx) / 2} ${my} ${bx} ${B.y}`;
}
