import { clamp01, ease, r2 } from "../shared/motion";

/* Geometry and timing for V1 "Router, lit" (viewBox 1200 x 560). Agents live on
 * your machine (left); each one's thinking travels from its row through the
 * per-agent pick (the hub) to its engine: out through the machine's port to
 * Claude, or down to Ollama, which never leaves the machine. */

export type Pt = readonly [number, number];
export type Engine = "opus" | "sonnet" | "haiku" | "ollama";
export type AgentKey = "codeReview" | "inbox" | "brief" | "journal";
/** A cubic segment: start, control 1, control 2, end. */
type Cubic = readonly [Pt, Pt, Pt, Pt];

export const W = 1200;
export const H = 560;
export const DURATION = 4.6;

export const MACHINE = { x: 24, y: 36, w: 600, h: 492 };
export const CLOUD = { x: 684, y: 36, w: 492, h: 492 };
export const HUB: Pt = [396, 262];
export const PORT: Pt = [624, 262];

export const STATIONS: Record<Engine, { c: Pt; r: number }> = {
  opus: { c: [878, 160], r: 40 },
  sonnet: { c: [878, 292], r: 30 },
  haiku: { c: [878, 410], r: 22 },
  ollama: { c: [404, 458], r: 28 },
};

export const ROW = { x: 52, w: 268, h: 62, socket: 292 };

export interface Agent {
  key: AgentKey;
  engine: Engine;
  y: number;
  orb: number;
  start: number;
  lock?: boolean;
}

/** Departure order is deliberately mixed so the sorting reads. */
export const AGENTS: Agent[] = [
  { key: "codeReview", engine: "opus", y: 150, orb: 13, start: 0 },
  { key: "inbox", engine: "haiku", y: 236, orb: 7, start: 0.17 },
  { key: "journal", engine: "ollama", y: 322, orb: 10, start: 0.34, lock: true },
  { key: "brief", engine: "sonnet", y: 408, orb: 10, start: 0.51 },
];
const SPAN = 0.46;

const line = (a: Pt, b: Pt): Cubic => [a, [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + (2 * (b[0] - a[0])) / 3, a[1] + (2 * (b[1] - a[1])) / 3], b];

/** Row socket -> hub -> (port ->) station. */
export function route(a: Agent): Cubic[] {
  const s: Pt = [ROW.socket, a.y];
  const toHub: Cubic = [s, [s[0] + 60, s[1]], [HUB[0] - 60, HUB[1]], HUB];
  const st = STATIONS[a.engine].c;
  if (a.engine === "ollama") return [toHub, [HUB, [HUB[0], HUB[1] + 90], [st[0], st[1] - 90], st]];
  return [toHub, line(HUB, PORT), [PORT, [PORT[0] + 90, PORT[1]], [st[0] - 150, st[1]], st]];
}

export const d = (cs: Cubic[]) =>
  `M ${cs[0][0][0]} ${cs[0][0][1]} ` + cs.map(([, b, c, e]) => `C ${b[0]} ${b[1]} ${c[0]} ${c[1]} ${e[0]} ${e[1]}`).join(" ");

function bez([a, b, c, e]: Cubic, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * e[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * e[1],
  ];
}

/** Approximate length of each segment, so travel speed stays even across segments. */
function lengths(cs: Cubic[]): number[] {
  return cs.map((c) => {
    let len = 0;
    let prev = c[0];
    for (let i = 1; i <= 16; i++) {
      const pt = bez(c, i / 16);
      len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
      prev = pt;
    }
    return len;
  });
}

export const ROUTES = AGENTS.map((a) => {
  const cs = route(a);
  const ls = lengths(cs);
  return { cs, ls, total: ls.reduce((s, l) => s + l, 0), d: d(cs) };
});

/** A point `u` (0..1, by length) along agent i's route. */
export function at(i: number, u: number): Pt {
  const { cs, ls, total } = ROUTES[i];
  let rest = clamp01(u) * total;
  for (let k = 0; k < cs.length; k++) {
    if (rest <= ls[k] || k === cs.length - 1) {
      const pt = bez(cs[k], Math.min(1, rest / ls[k]));
      return [r2(pt[0]), r2(pt[1])];
    }
    rest -= ls[k];
  }
  return cs[0][0];
}

/** An agent's own progress: 0 in its row, 1 docked at its engine. */
export const own = (p: number, a: Agent) => clamp01((p - a.start) / SPAN);
/** Where the orb is along its route at overall progress p. */
export const orbU = (p: number, a: Agent) => ease(own(p, a));
/** 0 until docked, then 1. */
export const docked = (p: number, a: Agent) => clamp01((own(p, a) - 0.92) / 0.08);
/** A short swell as the orb docks; 0 at rest. */
export const swell = (p: number, a: Agent) => {
  const q = own(p, a);
  return q <= 0.88 || q >= 1 ? 0 : Math.sin((Math.PI * (q - 0.88)) / 0.12);
};
