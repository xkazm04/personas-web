/** Static geometry of the A1 scene: one Overseer, three teams of three personas. */
export interface PNode {
  x: number;
  y: number;
  r: number;
  team: number;
  tint: 0 | 1 | 2;
  pulse: number;
  coached: number;
  order: number;
}
export interface Layout {
  w: number;
  h: number;
  cx: number;
  cy: number;
  R: number;
  nodes: PNode[];
  teams: { x: number; y: number }[];
  overseerR: number;
}

export function buildLayout(w: number, h: number, prev?: Layout): Layout {
  const wide = w >= 1024;
  const cx = wide ? w * 0.72 : w * 0.5;
  const cy = wide ? h * 0.55 : h * 0.8;
  const R = Math.min(w * (wide ? 0.27 : 0.5), h * (wide ? 0.45 : 0.3));
  const nodes: PNode[] = [];
  const teams: { x: number; y: number }[] = [];
  for (let t = 0; t < 3; t++) {
    const ta = -Math.PI / 2 + (t * Math.PI * 2) / 3 + 0.35;
    const tx = cx + Math.cos(ta) * R * 0.74;
    const ty = cy + Math.sin(ta) * R * 0.74;
    teams.push({ x: tx, y: ty });
    for (let k = 0; k < 3; k++) {
      const a = ta + (k * Math.PI * 2) / 3 + 0.5 * t;
      const i = t * 3 + k;
      nodes.push({
        x: tx + Math.cos(a) * R * 0.2,
        y: ty + Math.sin(a) * R * 0.2,
        r: R * (0.05 + (k === 0 ? 0.014 : 0)),
        team: t,
        tint: ((t + k) % 3) as 0 | 1 | 2,
        pulse: prev?.nodes[i]?.pulse ?? 0,
        coached: prev?.nodes[i]?.coached ?? 0,
        order: i,
      });
    }
  }
  return { w, h, cx, cy, R, nodes, teams, overseerR: R * 0.15 };
}

/** Radar plate behind the system: ring arcs with ticks, bleeding off the stage. Built once per layout. */
export function buildPlate(L: Layout): Path2D {
  const p = new Path2D();
  for (const k of [1.5, 1.95]) {
    p.moveTo(L.cx + L.R * k, L.cy);
    p.arc(L.cx, L.cy, L.R * k, 0, Math.PI * 2);
  }
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const len = i % 10 === 0 ? 0.1 : i % 5 === 0 ? 0.06 : 0.03;
    p.moveTo(L.cx + Math.cos(a) * L.R * 1.5, L.cy + Math.sin(a) * L.R * 1.5);
    p.lineTo(L.cx + Math.cos(a) * L.R * (1.5 + len), L.cy + Math.sin(a) * L.R * (1.5 + len));
  }
  return p;
}
