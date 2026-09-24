/* Geometry for the "router" illustration: one wide layout (desktop) and one tall
 * layout (phone), both in their own viewBox units. Token motion is computed from a
 * single progress value, so the picture at p = 1 is the resolved end state. */

export type Pt = readonly [number, number];
export type LaneKey = "haiku" | "sonnet" | "opus" | "ollama";

export interface Lane {
  c1: Pt;
  c2: Pt;
  /** Station centre; the token docks here. */
  end: Pt;
  width: number;
  /** Station ring radius. */
  ring: number;
  label: Pt;
  anchor: "start" | "middle";
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  w: number;
  h: number;
  font: number;
  tokenScale: number;
  machine: Box;
  /** Monitor neck and foot below the machine box. */
  stand: { neck: Box; foot: Box };
  machineLabel: Pt;
  claude: Box;
  claudeLabel: Pt;
  rail: Box;
  railFrom: Pt;
  router: Pt;
  routerR: number;
  lanes: Record<LaneKey, Lane>;
}

export interface Token {
  lane: LaneKey;
  r: number;
  lock?: boolean;
  /** Queue position on the rail, 0..1 from the rail start to the router. */
  slot: number;
  start: number;
}

/** Entry order is deliberately mixed so the sorting reads. */
export const TOKENS: Token[] = [
  { lane: "opus", r: 15, slot: 0.74, start: 0.0 },
  { lane: "haiku", r: 7, slot: 0.53, start: 0.2 },
  { lane: "ollama", r: 11, lock: true, slot: 0.32, start: 0.4 },
  { lane: "sonnet", r: 10.5, slot: 0.11, start: 0.6 },
];
export const TOKEN_SPAN = 0.4;
/** Share of a token's own span spent on the rail before the router. */
const RAIL_SHARE = 0.38;

export const WIDE: Layout = {
  w: 1000,
  h: 440,
  font: 20,
  tokenScale: 1,
  machine: { x: 16, y: 34, w: 524, h: 344 },
  stand: { neck: { x: 254, y: 378, w: 44, h: 22 }, foot: { x: 196, y: 400, w: 160, h: 10 } },
  machineLabel: [44, 70],
  claude: { x: 604, y: 20, w: 380, h: 392 },
  claudeLabel: [660, 63],
  rail: { x: 40, y: 182, w: 250, h: 36 },
  railFrom: [60, 200],
  router: [300, 200],
  routerR: 30,
  lanes: {
    haiku: { c1: [440, 200], c2: [560, 115], end: [770, 115], width: 3, ring: 17, label: [818, 122], anchor: "start" },
    sonnet: { c1: [440, 200], c2: [600, 215], end: [770, 215], width: 6, ring: 22, label: [818, 222], anchor: "start" },
    opus: { c1: [440, 200], c2: [560, 325], end: [770, 325], width: 10, ring: 30, label: [818, 332], anchor: "start" },
    ollama: { c1: [300, 300], c2: [320, 318], end: [420, 318], width: 6, ring: 22, label: [454, 325], anchor: "start" },
  },
};

export const TALL: Layout = {
  w: 360,
  h: 600,
  font: 15,
  tokenScale: 0.75,
  machine: { x: 10, y: 20, w: 340, h: 300 },
  stand: { neck: { x: 162, y: 320, w: 36, h: 16 }, foot: { x: 120, y: 336, w: 120, h: 8 } },
  machineLabel: [32, 50],
  claude: { x: 10, y: 372, w: 340, h: 218 },
  claudeLabel: [58, 570],
  rail: { x: 24, y: 106, w: 170, h: 28 },
  railFrom: [36, 120],
  router: [206, 120],
  routerR: 24,
  lanes: {
    haiku: { c1: [206, 260], c2: [70, 360], end: [70, 480], width: 2.5, ring: 13, label: [70, 526], anchor: "middle" },
    sonnet: { c1: [206, 260], c2: [180, 360], end: [180, 480], width: 5, ring: 17, label: [180, 526], anchor: "middle" },
    opus: { c1: [206, 260], c2: [290, 360], end: [290, 480], width: 8, ring: 23, label: [290, 526], anchor: "middle" },
    ollama: { c1: [280, 120], c2: [300, 160], end: [300, 222], width: 5, ring: 17, label: [300, 268], anchor: "middle" },
  },
};

export function laneD(l: Layout, lane: Lane): string {
  const [x0, y0] = l.router;
  return `M ${x0} ${y0} C ${lane.c1[0]} ${lane.c1[1]} ${lane.c2[0]} ${lane.c2[1]} ${lane.end[0]} ${lane.end[1]}`;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => t * t * (3 - 2 * t);

/** A token's own progress, 0 (queued) .. 1 (docked). */
export function tokenQ(p: number, t: Token): number {
  return clamp01((p - t.start) / TOKEN_SPAN);
}

function bezier(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
    u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
  ];
}

/** Where a token sits at its own progress q. */
export function tokenAt(l: Layout, t: Token, q: number): Pt {
  const [fx, fy] = l.railFrom;
  const [rx, ry] = l.router;
  if (q < RAIL_SHARE) {
    const u = t.slot + (1 - t.slot) * ease(q / RAIL_SHARE);
    return [fx + (rx - fx) * u, fy + (ry - fy) * u];
  }
  const lane = l.lanes[t.lane];
  return bezier(l.router, lane.c1, lane.c2, lane.end, ease((q - RAIL_SHARE) / (1 - RAIL_SHARE)));
}

/** 0 until the token enters its lane, then 1: the lane lights as it is used. */
export function laneLit(q: number): number {
  return clamp01((q - RAIL_SHARE) / 0.12);
}

/** A short swell of the station ring as the token docks; 0 at rest. */
export function dockPulse(q: number): number {
  return q <= 0.9 || q >= 1 ? 0 : Math.sin((Math.PI * (q - 0.9)) / 0.1);
}
