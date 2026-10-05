import type { FleetAgent, FleetTeam } from "../fleet-data";

/* The office floor: one department zone per team, one desk per agent, laid
   out to the field's real size. Every desk on the floor is one size, the
   largest at which every zone holds its whole team. */

/** Desk art is drawn in a 100 x 88 box. */
export const DESK_VB = { w: 100, h: 88 };
const LABEL_H = 24;
const PAD = 8;
const GAP = 12;
const MARGIN = 12;

export interface DeskBox { a: FleetAgent; x: number; y: number; z: Zone }

export interface Zone {
  t: FleetTeam;
  x: number;
  y: number;
  w: number;
  h: number;
  mem: FleetAgent[];
  desks: DeskBox[];
}

export interface FloorLayout {
  W: number;
  H: number;
  /** Desk width in px (height follows the art's aspect). */
  dw: number;
  dh: number;
  zones: Zone[];
  desk: Map<string, DeskBox>;
}

/** The largest desk (and its column count) that fits `n` desks in a box. */
function fitDesks(n: number, w: number, h: number): { d: number; cols: number } {
  let best = { d: 0, cols: 1 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const d = Math.min(w / cols, ((h / rows) * DESK_VB.w) / DESK_VB.h);
    if (d > best.d) best = { d, cols };
  }
  return best;
}

export function layoutFloor(agents: FleetAgent[], teams: FleetTeam[], W: number, H: number): FloorLayout {
  const vis = teams.filter((t) => agents.some((a) => a.team === t.id));
  const members = vis.map((t) => agents.filter((a) => a.team === t.id));
  const k = Math.max(1, vis.length);

  // Choose the zone grid that gives the biggest uniform desk.
  let plan = { zc: 1, zr: k, d: 0 };
  for (let zc = 1; zc <= k; zc++) {
    const zr = Math.ceil(k / zc);
    const zw = (W - 2 * MARGIN - (zc - 1) * GAP) / zc;
    const zh = (H - 2 * MARGIN - (zr - 1) * GAP) / zr;
    const d = Math.min(...members.map((m) => fitDesks(m.length, zw - 2 * PAD, zh - LABEL_H - PAD).d));
    if (d > plan.d) plan = { zc, zr, d };
  }
  const dw = Math.floor(Math.min(plan.d, 150));
  const dh = Math.floor((dw * DESK_VB.h) / DESK_VB.w);
  const zw = (W - 2 * MARGIN - (plan.zc - 1) * GAP) / plan.zc;
  const zh = (H - 2 * MARGIN - (plan.zr - 1) * GAP) / plan.zr;

  const out: FloorLayout = { W, H, dw, dh, zones: [], desk: new Map() };
  vis.forEach((t, i) => {
    const z: Zone = {
      t,
      x: Math.round(MARGIN + (i % plan.zc) * (zw + GAP)),
      y: Math.round(MARGIN + Math.floor(i / plan.zc) * (zh + GAP)),
      w: Math.floor(zw),
      h: Math.floor(zh),
      mem: members[i],
      desks: [],
    };
    const innerW = z.w - 2 * PAD;
    const innerH = z.h - LABEL_H - PAD;
    const cols = Math.max(1, Math.min(members[i].length, Math.floor(innerW / dw)));
    const rows = Math.ceil(members[i].length / cols);
    const gx = (innerW - cols * dw) / (cols + 1);
    const gy = Math.max(0, (innerH - rows * dh) / (rows + 1));
    members[i].forEach((a, j) => {
      const box = { a, x: Math.round(z.x + PAD + gx + (j % cols) * (dw + gx)), y: Math.round(z.y + LABEL_H + gy + Math.floor(j / cols) * (dh + gy)), z };
      z.desks.push(box);
      out.desk.set(a.id, box);
    });
    out.zones.push(z);
  });
  return out;
}
