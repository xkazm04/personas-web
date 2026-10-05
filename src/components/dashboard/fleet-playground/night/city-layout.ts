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
  /** Between windows side by side. */
  gap: number;
  /** Between floors; grows when the windows alone cannot fill the height. */
  vgap: number;
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
  let ground = H - street;
  const vis = teams.filter((t) => agents.some((a) => a.team === t.id));
  const members = vis.map((t) => agents.filter((a) => a.team === t.id));
  const pitch = (W - 2 * MARGIN) / Math.max(1, vis.length);
  // Buildings take ~88% of their slot; at least 10px of street between them.
  const maxBw = Math.min(pitch * 0.9, pitch - 10);
  const bodyMax = ground - sky - ORNAMENT;

  // Try every window width; per building use as many columns (1-3) as fit the
  // slot, and keep the size whose windows have the most area while staying
  // close to square (height 0.8x-1.35x the width) - discounted when the
  // windows cover too little of the facade, so towers do not end up as one
  // thin column of lights on a wide blank wall.
  let best = { area: 0, ww: 10, wh: 12, gap: 3, pad: 6, cols: members.map(() => 1), rows: members.map((m) => m.length) };
  for (let s = 130; s >= 10; s--) {
    const g = Math.max(3, Math.round(s * 0.18));
    const p = Math.max(6, Math.round(s * 0.2));
    const c = members.map((m) => Math.min(m.length, 3, Math.floor((maxBw - 2 * p + g) / (s + g))));
    if (c.some((x) => x < 1)) continue;
    const r = members.map((m, i) => Math.ceil(m.length / c[i]));
    const tallest = Math.max(...r);
    const wh = Math.min(Math.round(s * 1.35), Math.floor((bodyMax - 2 * p - SIGN - (tallest - 1) * g) / tallest));
    if (wh < s * 0.8) continue;
    const busiest = c[members.reduce((m, x, i) => (x.length > members[m].length ? i : m), 0)];
    const cover = Math.min(1, (busiest * s + (busiest - 1) * g) / (maxBw * 0.7));
    const score = s * wh * cover;
    if (score <= best.area) continue;
    best = { area: score, ww: s, wh, gap: g, pad: p, cols: c, rows: r };
  }
  const { ww, gap, pad, cols, rows } = best;
  let { wh } = best;
  let vgap = gap;

  // Use the height: the tallest roof sits ~17% down the field. Floors stretch
  // up to 2:1, then the space between them grows. A fleet of 10 keeps its
  // near-square windows and is centred instead (half the slack becomes plaza).
  const tallest = Math.max(1, ...rows);
  const roofLine = Math.max(sky + 34, Math.round(H * 0.17));
  const avail = () => ground - roofLine - 2 * pad - SIGN;
  if (agents.length > 10) {
    wh = Math.max(wh, Math.min(2 * ww, Math.floor((avail() - (tallest - 1) * gap) / tallest)));
    if (tallest > 1) vgap = Math.max(gap, Math.min(Math.round(wh * 0.6), Math.floor((avail() - tallest * wh) / (tallest - 1))));
  } else {
    const slack = avail() - tallest * wh - (tallest - 1) * gap;
    if (slack > 0) ground -= Math.round(slack / 2);
  }

  const out: CityLayout = { W, H, sky, ground, ww, wh, gap, vgap, pad, pitch, teams: [], win: new Map() };
  vis.forEach((t, i) => {
    const mem = members[i];
    const c = cols[i];
    const r = rows[i];
    const inner = c * ww + (c - 1) * gap;
    const w = Math.min(maxBw, Math.max(inner + 2 * pad, pitch * 0.86));
    const top = ground - (2 * pad + r * (wh + vgap) - vgap + SIGN);
    const cx = MARGIN + pitch * (i + 0.5);
    const b: BuildingBox = { t, i, cx, w, top, n: mem.length, cols: c, rows: r, mem, wins: [], anchor: ornamentAnchor(t.id, top) };
    const x0 = cx - inner / 2;
    mem.forEach((a, k) => {
      const row = Math.floor(k / c);
      const box: WinBox = { a, x: Math.round(x0 + (k % c) * (ww + gap)), y: Math.round(top + pad + row * (wh + vgap)), w: ww, h: wh, row, b };
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
      y: Math.round(b.top + L.pad + Math.floor(k / b.cols) * (L.wh + L.vgap)),
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
