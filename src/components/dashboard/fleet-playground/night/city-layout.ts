import type { FleetAgent, FleetTeam } from "../fleet-data";
import { ornamentAnchor } from "./ornament-geometry";

/** The city is drawn on a fixed design stage and scaled to fit the frame. */
export const DW = 1440;
export const DH = 860;
export const GROUND = DH - 144;

export interface Tier {
  ww: number;
  wh: number;
  gx: number;
  pad: number;
  fg: number;
  lobby: number;
  oneColumn: boolean;
}

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
  floors: number;
  mem: FleetAgent[];
  wins: WinBox[];
  /** Highest point of the roof ornament (where the wires tie on). */
  anchor: number;
}

export interface CityLayout {
  tier: Tier;
  pitch: number;
  teams: BuildingBox[];
  win: Map<string, WinBox>;
}

/** Windows grow as the fleet shrinks, so 10, 30 and 99 agents all fill the frame. */
function tierFor(maxPerTeam: number): Tier {
  if (maxPerTeam <= 2) return { ww: 100, wh: 128, gx: 18, pad: 24, fg: 30, lobby: 74, oneColumn: true };
  if (maxPerTeam <= 4) return { ww: 60, wh: 86, gx: 12, pad: 12, fg: 26, lobby: 40, oneColumn: false };
  return { ww: 36, wh: 46, gx: 8, pad: 10, fg: 18, lobby: 0, oneColumn: false };
}

export function layoutCity(agents: FleetAgent[], teams: FleetTeam[]): CityLayout {
  const vis = teams.filter((t) => agents.some((a) => a.team === t.id));
  const max = Math.max(...vis.map((t) => agents.filter((a) => a.team === t.id).length));
  const tier = tierFor(max);
  const pitch = (DW - 60) / vis.length;
  const out: CityLayout = { tier, pitch, teams: [], win: new Map() };

  vis.forEach((t, i) => {
    const mem = agents.filter((a) => a.team === t.id);
    const n = mem.length;
    const cols = tier.oneColumn ? 1 : n <= 2 ? n : n <= 4 ? 2 : 3;
    const floors = Math.ceil(n / cols);
    const inner = cols * tier.ww + (cols - 1) * tier.gx;
    const w = Math.min(Math.max(inner + 2 * tier.pad, 150), pitch - 14);
    const bodyH = 16 + floors * (tier.wh + tier.fg) + tier.lobby + 34;
    const cx = 30 + pitch * (i + 0.5);
    const top = GROUND - bodyH;
    const b: BuildingBox = { t, i, cx, w, top, n, cols, floors, mem, wins: [], anchor: ornamentAnchor(t.id, top) };
    const x0 = cx - inner / 2;
    mem.forEach((a, k) => {
      const row = Math.floor(k / cols);
      const c = k % cols;
      const box: WinBox = {
        a,
        x: Math.round(x0 + c * (tier.ww + tier.gx)),
        y: Math.round(top + 16 + row * (tier.wh + tier.fg) + tier.fg * 0.35),
        w: tier.ww,
        h: tier.wh,
        row,
        b,
      };
      b.wins.push(box);
      out.win.set(a.id, box);
    });
    out.teams.push(b);
  });
  return out;
}

/** Empty slots on a building's last floor, bricked up. */
export function emptySlots(b: BuildingBox, tier: Tier): { x: number; y: number }[] {
  const inner = b.cols * tier.ww + (b.cols - 1) * tier.gx;
  const out: { x: number; y: number }[] = [];
  for (let k = b.n; k < b.cols * b.floors; k++) {
    const r = Math.floor(k / b.cols);
    const c = k % b.cols;
    out.push({
      x: Math.round(b.cx - inner / 2 + c * (tier.ww + tier.gx)),
      y: Math.round(b.top + 16 + r * (tier.wh + tier.fg) + tier.fg * 0.35),
    });
  }
  return out;
}

/** The arc a message travels between two windows, through the sky. */
export function arcPath(L: CityLayout, from: string, to: string): string | null {
  const A = L.win.get(from);
  const B = L.win.get(to);
  if (!A || !B) return null;
  const ax = A.x + A.w / 2;
  const bx = B.x + B.w / 2;
  const my = Math.max(240, Math.min(A.y, B.y) - 70 - Math.abs(bx - ax) * 0.14);
  return `M ${ax} ${A.y} Q ${(ax + bx) / 2} ${my} ${bx} ${B.y}`;
}
