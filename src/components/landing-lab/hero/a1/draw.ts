import { bez, smooth, type SignalEngine } from "./engine";
import { rgba, type Palette, type Rgb } from "./palette";

const TWO_PI = Math.PI * 2;

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: Rgb, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, a));
  g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.fill();
}

function hex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    ctx[i ? "lineTo" : "moveTo"](x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TWO_PI);
  ctx.fill();
}

/** Draws one frame of the A1 signal field. */
export function drawScene(ctx: CanvasRenderingContext2D, e: SignalEngine, pal: Palette) {
  const L = e.layout;
  const tints: Rgb[] = [pal.cyan, pal.purple, pal.emerald];
  const wide = L.w >= 1024;
  const fadeLeft = (x: number) => (wide ? 0.5 + 0.5 * smooth((x - L.w * 0.2) / (L.w * 0.32)) : 1);
  const intro = smooth(e.intro);
  ctx.clearRect(0, 0, L.w, L.h);
  ctx.lineCap = "round";

  glow(ctx, L.cx, L.cy, L.R * 1.7, pal.purple, 0.2 * intro);
  glow(ctx, L.cx - L.R * 0.4, L.cy + L.R * 0.3, L.R * 1.2, pal.cyan, 0.13 * intro);

  // Radar plate and orbit.
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(pal.ink, 0.13 * intro);
  if (e.plate) ctx.stroke(e.plate);
  ctx.strokeStyle = rgba(pal.ink, 0.16 * intro);
  for (const k of [0.74, 1.14]) {
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, L.R * k, 0, TWO_PI);
    ctx.stroke();
  }

  // The Overseer's beam.
  if (intro > 0.3 && typeof ctx.createConicGradient === "function") {
    const g = ctx.createConicGradient(e.wedge - 0.95, L.cx, L.cy);
    g.addColorStop(0, rgba(pal.amber, 0));
    g.addColorStop(0.15, rgba(pal.amber, 0.3 * intro));
    g.addColorStop(0.1501, rgba(pal.amber, 0));
    g.addColorStop(1, rgba(pal.amber, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(L.cx, L.cy);
    ctx.arc(L.cx, L.cy, L.R * 1.14, e.wedge - 0.95, e.wedge + 0.05);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = rgba(pal.amber, 0.55 * intro);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(L.cx, L.cy);
  ctx.lineTo(L.cx + Math.cos(e.wedge) * L.R * 1.14, L.cy + Math.sin(e.wedge) * L.R * 1.14);
  ctx.stroke();

  // Team links.
  for (const n of L.nodes) {
    const ia = smooth(e.intro * 2.2 - n.order * 0.12);
    const team = L.teams[n.team];
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = rgba(tints[n.tint], (0.3 + n.coached * 0.4) * ia);
    ctx.beginPath();
    ctx.moveTo(n.x, n.y);
    ctx.lineTo(team.x, team.y);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(pal.ink, (0.1 + n.coached * 0.3) * ia);
    ctx.beginPath();
    ctx.moveTo(team.x, team.y);
    ctx.lineTo(L.cx, L.cy);
    ctx.stroke();
  }

  // The field: flowing streaks.
  for (const d of e.dust) {
    const m = fadeLeft(d.x);
    ctx.strokeStyle = rgba(tints[d.tint], 0.7 * m);
    ctx.lineWidth = d.size;
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - Math.cos(d.ang) * d.v * 0.5, d.y - Math.sin(d.ang) * d.v * 0.5);
    ctx.stroke();
  }

  // Events travelling in: trails sampled along their curve.
  for (const ev of e.events) {
    const c = tints[ev.tint];
    let [px, py] = bez(ev.pts, Math.min(ev.p, 1));
    const hx = px, hy = py;
    for (let k = 1; k <= 18; k++) {
      const p = ev.p - k * 0.02;
      if (p < 0) break;
      const [x, y] = bez(ev.pts, p);
      const f = 1 - k / 19;
      ctx.strokeStyle = rgba(c, 0.85 * f * fadeLeft(x));
      ctx.lineWidth = 0.8 + f * 3.4;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(x, y);
      ctx.stroke();
      px = x;
      py = y;
    }
    const m = fadeLeft(hx);
    glow(ctx, hx, hy, 26, c, 0.7 * m);
    dot(ctx, hx, hy, 3.6, rgba(pal.ink, 0.95 * m));
  }

  // Results returning to the Overseer.
  for (const k of e.packets) {
    const n = L.nodes[k.from];
    const x = n.x + (L.cx - n.x) * k.p, y = n.y + (L.cy - n.y) * k.p;
    glow(ctx, x, y, 14, pal.amber, 0.65);
    dot(ctx, x, y, 2.8, rgba(pal.amber, 0.95));
  }

  // Personas: honeycomb cells, the product's own mark.
  for (const n of L.nodes) {
    const ia = smooth(e.intro * 2.2 - n.order * 0.12);
    const c = tints[n.tint];
    glow(ctx, n.x, n.y, n.r * (3.6 + n.pulse * 3 + n.coached * 2), c, (0.3 + n.pulse * 0.5 + n.coached * 0.3) * ia);
    hex(ctx, n.x, n.y, n.r * (0.9 + 0.3 * ia + n.pulse * 0.2));
    ctx.fillStyle = rgba(c, 0.92 * ia);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.ink, (0.6 + n.coached * 0.4) * ia);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    hex(ctx, n.x, n.y, n.r * (1.55 + n.pulse * 1.2));
    ctx.strokeStyle = rgba(c, (0.5 + n.pulse * 0.4) * ia);
    ctx.stroke();
  }
  for (const s of e.sparks) {
    const n = L.nodes[s.node];
    const r = n.r * (2.3 + (1 - s.life) * 1.4);
    dot(ctx, n.x + Math.cos(s.a) * r, n.y + Math.sin(s.a) * r, 2, rgba(pal.ink, s.life * 0.9));
  }

  // The Overseer core.
  const o = L.overseerR;
  glow(ctx, L.cx, L.cy, o * (3.6 + e.overseerPulse * 1.8), pal.amber, (0.34 + e.overseerPulse * 0.4) * intro);
  ctx.lineWidth = 2;
  [1.45, 2.0, 2.6].forEach((k, i) => {
    ctx.setLineDash([o * (0.5 + i * 0.2), o * 0.35]);
    ctx.lineDashOffset = e.time * (i % 2 ? -16 : 22) * (1 + i * 0.3);
    ctx.strokeStyle = rgba(pal.ink, (0.6 - i * 0.15) * intro);
    ctx.beginPath();
    ctx.arc(L.cx, L.cy, o * k, 0, TWO_PI);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  dot(ctx, L.cx, L.cy, o * (0.8 + e.overseerPulse * 0.14), rgba(pal.amber, 0.97 * intro));
  dot(ctx, L.cx, L.cy, o * 0.3, rgba(pal.ink, 0.92 * intro));
}
