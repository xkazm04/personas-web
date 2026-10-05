/**
 * B1 "Murmuration" - the swarm simulation, pure and frame-rate independent.
 *
 * Agents drift in loose team clouds on a slow flow field. An event lands, the
 * nearest free team gathers into a ring around it (the team at work), the
 * ring flashes "handled", and the team lets go. A coach light wanders between
 * the teams. The visitor's pointer draws nearby agents in; a click is an event.
 * Positions are in CSS pixels; homes are viewport fractions so a resize keeps
 * the composition.
 */

export const TEAM_COUNT = 5;
/** Mission timeline (seconds of mission age). */
export const GATHER = 0.9;
export const WORK_END = 2.8;
export const RELEASE = 3.5;
/** Intro: agents assemble into the honeycomb mark, then burst into teams. */
export const INTRO = 3.2;
const INTRO_HOLD_END = 1.0; // intro seconds LEFT when the mark lets go

export interface Agent { x: number; y: number; vx: number; vy: number; team: number; slot: number; size: number; u: number }
export interface Mission { x: number; y: number; age: number; label: string }
export interface Team { fx: number; fy: number; ax: number; ay: number; seed: number; members: number[]; mission: Mission | null }
export interface Ripple { x: number; y: number; age: number; team: number }
export interface World {
  w: number; h: number; t: number; intro: number; nextEvent: number; labelIdx: number;
  agents: Agent[]; teams: Team[]; ripples: Ripple[];
  ox: number; oy: number; px: number; py: number; pointer: boolean;
  rnd: () => number;
}

// Team homes, as viewport fractions: the right ~60% of the stage, clear of
// the headline column on the left.
const HOMES: ReadonlyArray<[number, number]> = [
  [0.7, 0.26], [0.88, 0.22], [0.9, 0.62], [0.78, 0.82], [0.7, 0.56],
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A point on the honeycomb mark (two nested pointy-top hexagons), u in [0,1). */
export function markPoint(w: number, h: number, u: number): [number, number] {
  const outer = u < 0.64;
  const v = outer ? u / 0.64 : (u - 0.64) / 0.36;
  const r = Math.min(w, h) * (outer ? 0.3 : 0.15);
  const cx = w * 0.72;
  const cy = h * 0.5;
  const side = Math.floor(v * 6) % 6;
  const f = v * 6 - Math.floor(v * 6);
  const a0 = (-90 + side * 60) * (Math.PI / 180);
  const a1 = (-90 + (side + 1) * 60) * (Math.PI / 180);
  const x = Math.cos(a0) * (1 - f) + Math.cos(a1) * f;
  const y = Math.sin(a0) * (1 - f) + Math.sin(a1) * f;
  return [cx + x * r, cy + y * r];
}

export function createWorld(w: number, h: number, withIntro: boolean, seed = 11): World {
  const rnd = mulberry32(seed);
  const n = Math.round(Math.min(820, Math.max(260, (w * h) / 1900)));
  const teams: Team[] = HOMES.map(([fx, fy], i) => ({ fx, fy, ax: fx * w, ay: fy * h, seed: i * 2.3, members: [], mission: null }));
  const agents: Agent[] = [];
  for (let i = 0; i < n; i++) {
    const team = i % TEAM_COUNT;
    const slot = teams[team].members.length;
    teams[team].members.push(i);
    const edge = rnd() * Math.PI * 2;
    const x = withIntro ? w * 0.72 + Math.cos(edge) * w : teams[team].ax + (rnd() - 0.5) * 160;
    const y = withIntro ? h * 0.5 + Math.sin(edge) * h : teams[team].ay + (rnd() - 0.5) * 160;
    agents.push({ x, y, vx: 0, vy: 0, team, slot, size: 1.3 + rnd() * 1.8, u: rnd() });
  }
  return {
    w, h, t: 0, intro: withIntro ? INTRO : 0, nextEvent: withIntro ? 0.4 : 1.2, labelIdx: 0,
    agents, teams, ripples: [], ox: w * 0.72, oy: h * 0.5, px: 0, py: 0, pointer: false, rnd,
  };
}

export function resizeWorld(world: World, w: number, h: number) {
  const sx = w / world.w;
  const sy = h / world.h;
  for (const a of world.agents) { a.x *= sx; a.y *= sy; }
  for (const t of world.teams) { t.ax *= sx; t.ay *= sy; if (t.mission) { t.mission.x *= sx; t.mission.y *= sy; } }
  world.w = w;
  world.h = h;
}

/** Drop an event: at (x, y) for the nearest team, or near a random free team's home. */
export function spawnEvent(world: World, label: string, at?: [number, number]) {
  const { w, h, teams, rnd } = world;
  let pick = -1;
  if (at) {
    let best = Infinity;
    teams.forEach((tm, i) => {
      const d = Math.hypot(tm.ax - at[0], tm.ay - at[1]) + (tm.mission ? 400 : 0);
      if (d < best) { best = d; pick = i; }
    });
  } else {
    const free = teams.map((tm, i) => (tm.mission ? -1 : i)).filter((i) => i >= 0);
    if (free.length === 0) return;
    pick = free[Math.floor(rnd() * free.length)];
  }
  const tm = teams[pick];
  const x = at ? at[0] : Math.min(w * 0.88, Math.max(w * 0.67, tm.fx * w + (rnd() - 0.5) * w * 0.14));
  const y = at ? at[1] : Math.min(h * 0.78, Math.max(h * 0.24, tm.fy * h + (rnd() - 0.5) * h * 0.16));
  tm.mission = { x, y, age: 0, label };
  world.ripples.push({ x, y, age: 0, team: pick });
}

export function skipIntro(world: World) {
  world.intro = 0;
}

export function step(world: World, dt: number, nextLabel: () => string) {
  const { w, h, teams, agents } = world;
  world.t += dt;
  const t = world.t;
  const wasIntro = world.intro > INTRO_HOLD_END;
  world.intro = Math.max(0, world.intro - dt);

  for (const tm of teams) {
    let tx = tm.fx * w + Math.sin(t * 0.21 + tm.seed) * w * 0.05;
    let ty = tm.fy * h + Math.cos(t * 0.17 + tm.seed * 1.3) * h * 0.07;
    if (tm.mission) {
      tm.mission.age += dt;
      if (tm.mission.age > RELEASE) tm.mission = null;
      else { tx = tm.mission.x; ty = tm.mission.y; }
    }
    const k = Math.min(1, dt * 2.4);
    tm.ax += (tx - tm.ax) * k;
    tm.ay += (ty - tm.ay) * k;
  }

  if (world.intro === 0) {
    world.nextEvent -= dt;
    const busy = teams.filter((tm) => tm.mission).length;
    if (world.nextEvent <= 0 && busy < 2) {
      spawnEvent(world, nextLabel());
      world.nextEvent = 1.9 + world.rnd() * 1.3;
    }
  }

  // The coach light wanders the stage, between the teams.
  world.ox = w * (0.74 + Math.sin(t * 0.13) * 0.13);
  world.oy = h * (0.5 + Math.sin(t * 0.19 + 1.1) * 0.24);

  const holding = world.intro > INTRO_HOLD_END;
  const damp = Math.exp(-3.4 * dt);
  for (const a of agents) {
    const tm = teams[a.team];
    const size = tm.members.length;
    const m = tm.mission;
    let tx: number, ty: number, k: number;
    if (holding) {
      [tx, ty] = markPoint(w, h, a.u);
      k = 10;
    } else if (m && m.age < WORK_END + 0.3) {
      const ring = 30 + Math.sqrt(size) * 5;
      const ang = (a.slot / size) * Math.PI * 2 + t * 0.9;
      const gather = Math.min(1, m.age / GATHER);
      tx = m.x + Math.cos(ang) * ring;
      ty = m.y + Math.sin(ang) * ring;
      k = 2 + gather * 6;
    } else {
      const ang = a.slot * 2.39996 + t * (a.team % 2 ? 0.05 : -0.04);
      const rad = Math.sqrt((a.slot + 0.5) / size) * Math.min(w, h) * 0.09;
      tx = tm.ax + Math.cos(ang) * rad;
      ty = tm.ay + Math.sin(ang) * rad;
      k = 1.3;
    }
    let fx = (tx - a.x) * k;
    let fy = (ty - a.y) * k;
    if (!holding) {
      const flow = Math.sin(a.x * 0.0042 + t * 0.35) + Math.cos(a.y * 0.0051 - t * 0.27);
      fx += Math.cos(flow * Math.PI) * 26;
      fy += Math.sin(flow * Math.PI) * 26;
    }
    if (world.pointer && !holding) {
      const dx = world.px - a.x;
      const dy = world.py - a.y;
      const d = Math.hypot(dx, dy);
      if (d < 180 && d > 1) {
        const s = 1 - d / 180;
        fx += (dx / d) * 90 * s - (dy / d) * 140 * s;
        fy += (dy / d) * 90 * s + (dx / d) * 140 * s;
      }
    }
    // The mark bursts outward the moment it lets go.
    if (wasIntro && !holding) {
      const dx = a.x - w * 0.72;
      const dy = a.y - h * 0.5;
      const d = Math.hypot(dx, dy) || 1;
      a.vx += (dx / d) * 260;
      a.vy += (dy / d) * 260;
    }
    a.vx = (a.vx + fx * dt) * damp;
    a.vy = (a.vy + fy * dt) * damp;
    a.x += a.vx * dt;
    a.y += a.vy * dt;
  }

  for (const r of world.ripples) r.age += dt;
  world.ripples = world.ripples.filter((r) => r.age < 1.8);
}
