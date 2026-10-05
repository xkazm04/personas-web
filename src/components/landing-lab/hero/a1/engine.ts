import { buildLayout, buildPlate, type Layout } from "./scene";

export interface Ev { pts: number[]; target: number; p: number; speed: number; tint: 0 | 1 | 2}
export interface Packet { from: number; p: number; speed: number }
export interface Spark { node: number; a: number; life: number; spin: number }
export interface Dust { x: number; y: number; v: number; tint: 0 | 1 | 2; size: number; seed: number; ang: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const smooth = (v: number) => {
  const c = clamp(v, 0, 1);
  return c * c * (3 - 2 * c);
};

export function bez(p: number[], t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p[0] + b * p[2] + c * p[4] + d * p[6], a * p[1] + b * p[3] + c * p[5] + d * p[7]];
}

/** The simulation: dust flowing through a field, events arriving at personas, results returning to the Overseer. */
export class SignalEngine {
  layout: Layout = buildLayout(1280, 720);
  time = 0;
  intro = 0;
  wedge = -1.2;
  plate: Path2D | null = null;
  overseerPulse = 0;
  nextEvent = 0.3;
  events: Ev[] = [];
  packets: Packet[] = [];
  sparks: Spark[] = [];
  dust: Dust[] = [];
  pointer = { x: -1e4, y: -1e4 };

  constructor(private dustCount: number) {}

  resize(w: number, h: number) {
    this.layout = buildLayout(w, h, this.layout);
    this.plate = buildPlate(this.layout);
    if (this.dust.length === 0) {
      for (let i = 0; i < this.dustCount; i++) {
        this.dust.push({ x: rnd(0, w), y: rnd(0, h), v: rnd(22, 52), tint: (i % 3) as 0 | 1 | 2, size: rnd(0.8, 2), seed: Math.random() * 6.28, ang: 0 });
      }
    }
  }

  private spawnEvent() {
    const { h, nodes, R } = this.layout;
    const target = Math.floor(Math.random() * nodes.length);
    const n = nodes[target];
    const y0 = rnd(h * 0.12, h * 0.88);
    const x0 = -20;
    const pts = [x0, y0, n.x - R * 1.5, y0 + rnd(-h * 0.25, h * 0.25), n.x - R * 0.6, n.y + rnd(-R * 0.5, R * 0.5), n.x, n.y];
    this.events.push({ pts, target, p: 0, speed: rnd(0.2, 0.32), tint: n.tint });
  }

  flow(x: number, y: number) {
    return Math.sin(x * 0.0042 + this.time * 0.12) * 2.4 + Math.cos(y * 0.0051 - this.time * 0.09) * 2.4;
  }

  step(dtRaw: number) {
    const dt = Math.min(dtRaw, 0.05);
    const L = this.layout;
    this.time += dt;
    this.intro = Math.min(1, this.intro + dt / 2.4);
    this.overseerPulse = Math.max(0, this.overseerPulse - dt * 1.4);
    for (const n of L.nodes) {
      n.pulse = Math.max(0, n.pulse - dt * 1.1);
      n.coached = Math.max(0, n.coached - dt * 0.7);
      const dx = n.x - this.pointer.x, dy = n.y - this.pointer.y;
      if (dx * dx + dy * dy < 90 * 90) n.coached = Math.min(1, n.coached + dt * 3);
    }
    // Overseer beam: a wedge that turns and coaches every persona it crosses.
    this.wedge += dt * 0.55;
    for (const n of L.nodes) {
      const da = Math.atan2(Math.sin(Math.atan2(n.y - L.cy, n.x - L.cx) - this.wedge), Math.cos(Math.atan2(n.y - L.cy, n.x - L.cx) - this.wedge));
      if (da > -0.1 && da < 0.1) n.coached = 1;
    }
    // Events in.
    this.nextEvent -= dt;
    if (this.intro > 0.45 && this.nextEvent <= 0 && this.events.length < 14) {
      this.spawnEvent();
      this.nextEvent = rnd(0.18, 0.45);
    }
    for (let i = this.events.length - 1; i >= 0; i--) {
      const e = this.events[i];
      e.p += dt * e.speed;
      if (e.p >= 1) {
        const n = L.nodes[e.target];
        n.pulse = 1;
        for (let k = 0; k < 7; k++) this.sparks.push({ node: e.target, a: rnd(0, 6.28), life: 1, spin: rnd(2.5, 5) * (k % 2 ? 1 : -1) });
        this.packets.push({ from: e.target, p: 0, speed: rnd(0.45, 0.6) });
        this.events.splice(i, 1);
      }
    }
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const k = this.packets[i];
      k.p += dt * k.speed;
      if (k.p >= 1) {
        this.overseerPulse = 1;
        this.packets.splice(i, 1);
      }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt * 0.9;
      s.a += s.spin * dt;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }
    // Dust follows the field and shies from the pointer.
    for (const d of this.dust) {
      const ang = this.flow(d.x, d.y) + d.seed * 0.05;
      d.ang = ang;
      let vx = Math.cos(ang) * d.v, vy = Math.sin(ang) * d.v;
      const px = d.x - this.pointer.x, py = d.y - this.pointer.y;
      const pd = Math.hypot(px, py);
      if (pd < 150 && pd > 0.1) {
        const f = (1 - pd / 150) * 160;
        vx += (px / pd) * f;
        vy += (py / pd) * f;
      }
      d.x += vx * dt;
      d.y += vy * dt;
      if (d.x < -10) d.x = L.w + 10;
      else if (d.x > L.w + 10) d.x = -10;
      if (d.y < -10) d.y = L.h + 10;
      else if (d.y > L.h + 10) d.y = -10;
    }
  }

  /** Settle a complete, mid-flight frame for reduced motion. */
  warm(seconds: number) {
    for (let t = 0; t < seconds; t += 1 / 30) this.step(1 / 30);
    this.pointer = { x: -1e4, y: -1e4 };
  }
}
