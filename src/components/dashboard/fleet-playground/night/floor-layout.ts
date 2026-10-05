import type { FleetAgent, FleetTeam } from "../fleet-data";

/* The office floor: one department zone per team, one desk per agent, laid
   out to the field's real size. The zone grid is the one that gives the
   biggest desks; inside each zone the desks grow to fill it and spread evenly
   across its whole width and height, so no zone has an empty band. */

/** Desk art is drawn in a 100 x 88 box. */
export const DESK_VB = { w: 100, h: 88 };
const LABEL_H = 24;
const PAD = 8;
const GAP = 12;
const MARGIN = 12;

export interface DeskBox { a: FleetAgent; x: number; y: number; w: number; h: number; z: Zone }

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
  const zw = (W - 2 * MARGIN - (plan.zc - 1) * GAP) / plan.zc;
  const zh = (H - 2 * MARGIN - (plan.zr - 1) * GAP) / plan.zr;

  const out: FloorLayout = { W, H, zones: [], desk: new Map() };
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
    const n = members[i].length;
    // This zone's own best fit (a little air between desks), capped so a
    // small team does not get furniture twice the size of its neighbours'.
    const fit = fitDesks(n, innerW * 0.94, innerH * 0.94);
    const w = Math.floor(Math.min(fit.d, plan.d * 1.3, 160));
    const h = Math.floor((w * DESK_VB.h) / DESK_VB.w);
    const cols = fit.cols;
    const rows = Math.ceil(n / cols);
    // Space-evenly in both axes: the slack becomes equal gaps, top to bottom.
    const gx = (innerW - cols * w) / (cols + 1);
    const gy = (innerH - rows * h) / (rows + 1);
    members[i].forEach((a, j) => {
      const inRow = j < (rows - 1) * cols ? cols : n - (rows - 1) * cols;
      // A short last row is centred under the rows above it.
      const rowX = z.x + PAD + (innerW - inRow * w - (inRow - 1) * gx) / 2;
      const box = { a, x: Math.round(rowX + (j % cols) * (w + gx)), y: Math.round(z.y + LABEL_H + gy + Math.floor(j / cols) * (h + gy)), w, h, z };
      z.desks.push(box);
      out.desk.set(a.id, box);
    });
    out.zones.push(z);
  });
  return out;
}
