import type { BrandKey } from "@/lib/brand-theme";

/**
 * The pneumatic-post office (viewBox VB_W x VB_H), drawn in isometric: a floor
 * plate, a glass hub column in the middle, four agent desks on the plate's
 * corners, a tube from every desk into the hub, and two outside tubes - the
 * request coming in from Slack, the result leaving for Notion.
 */
export const VB_W = 900;
export const VB_H = 560;
export const ART_AR = VB_W / VB_H;
export const HUB = { x: 450, top: 196, base: 336, rx: 64, ry: 24 };
export const DESK = { hw: 74, hh: 37, h: 38 };

export type DeskId = "research" | "writer" | "reviewer" | "publisher";
export const DESKS: { id: DeskId; x: number; y: number; brand: BrandKey }[] = [
  { id: "research", x: 250, y: 236, brand: "cyan" },
  { id: "writer", x: 650, y: 236, brand: "purple" },
  { id: "reviewer", x: 650, y: 436, brand: "amber" },
  { id: "publisher", x: 250, y: 436, brand: "emerald" },
];
export const SOURCE = { x: 70, y: 62, tool: "slack" };
export const SINK = { x: 830, y: 62, tool: "notion" };

const f = (n: number) => n.toFixed(1);
type P = [number, number];
const cubic = (a: P, c1: P, c2: P, b: P) => `M${f(a[0])} ${f(a[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(b[0])} ${f(b[1])}`;

/** A tube both ways: `in` runs toward the hub, `out` away from it. */
function tube(a: P, c1: P, c2: P, b: P): { in: string; out: string } {
  return { in: cubic(a, c1, c2, b), out: cubic(b, c2, c1, a) };
}

/** Where a desk's tube leaves: the top corner of its desk nearest the hub. */
export const deskOutlet = (d: { x: number; y: number }): P => [d.x + (d.x < HUB.x ? DESK.hw : -DESK.hw), d.y - DESK.h];

/** Where it enters the hub: back desks high on the column, front desks low. */
const portFor = (d: { x: number; y: number }): P => [HUB.x + (d.x < HUB.x ? -1 : 1) * (HUB.rx - 4), d.y < 300 ? HUB.top + 44 : HUB.top + 104];

function deskTube(d: { x: number; y: number }) {
  const a = deskOutlet(d);
  const b = portFor(d);
  const dir = d.x < HUB.x ? 1 : -1;
  const rise = d.y < 300 ? 26 : 90;
  return tube(a, [a[0] + dir * 24, a[1] - rise], [b[0] - dir * (d.y < 300 ? 36 : 70), b[1] - (d.y < 300 ? 10 : 34)], b);
}

export const TUBES: Record<DeskId | "source" | "sink", { in: string; out: string }> = {
  ...(Object.fromEntries(DESKS.map((d) => [d.id, deskTube(d)])) as Record<DeskId, { in: string; out: string }>),
  source: tube([SOURCE.x + 34, SOURCE.y + 10], [SOURCE.x + 190, SOURCE.y - 40], [HUB.x - 150, HUB.top - 120], [HUB.x - 22, HUB.top - 6]),
  sink: tube([SINK.x - 34, SINK.y + 10], [SINK.x - 190, SINK.y - 40], [HUB.x + 150, HUB.top - 120], [HUB.x + 22, HUB.top - 6]),
};

/** Back desks sit behind the hub column, front desks before it. */
export const isBack = (d: { y: number }) => d.y < 300;

/** Iso box faces for a desk standing on floor point (x, y). */
export function deskFaces(x: number, y: number) {
  const { hw, hh, h } = DESK;
  const t = y - h;
  const pts = (p: P[]) => p.map(([a, b]) => `${f(a)},${f(b)}`).join(" ");
  return {
    top: pts([[x, t - hh], [x + hw, t], [x, t + hh], [x - hw, t]]),
    left: pts([[x - hw, t], [x, t + hh], [x, y + hh], [x - hw, y]]),
    right: pts([[x, t + hh], [x + hw, t], [x + hw, y], [x, y + hh]]),
    /** A screen standing on the desk's back-left edge, facing the viewer. */
    screen: pts([[x - 46, t - 8], [x + 10, t - 36], [x + 10, t - 98], [x - 46, t - 70]]),
  };
}

export const pct = (x: number, y: number) => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` });

/**
 * The relay, in order: each leg leaves one place, passes the hub, and lands at
 * the next. `carry` is the capsule's content key.
 */
export const LEGS = [
  { from: "source", to: "research", carry: "request" },
  { from: "research", to: "writer", carry: "research" },
  { from: "writer", to: "reviewer", carry: "writer" },
  { from: "reviewer", to: "publisher", carry: "reviewer" },
  { from: "publisher", to: "sink", carry: "publisher" },
] as const;

/** Phases: leg 0, work, leg 1, work, ... leg 4, rest. Even phases travel. */
export const TRAVEL_MS = 1900;
export const WORK_MS = 1500;
export const PHASE_MS = [...LEGS.flatMap((_, i) => (i < LEGS.length - 1 ? [TRAVEL_MS, WORK_MS] : [TRAVEL_MS])), 3200];
export const FINAL_PHASE = PHASE_MS.length - 1;
export const legOfPhase = (phase: number) => (phase % 2 === 0 && phase < FINAL_PHASE ? phase / 2 : -1);

export type DeskState = "idle" | "incoming" | "working" | "done";
/** Desk k receives in phase 2k, works in 2k+1, and is done after. */
export const deskState = (k: number, phase: number): DeskState =>
  phase < 2 * k ? "idle" : phase === 2 * k ? "incoming" : phase === 2 * k + 1 ? "working" : "done";
