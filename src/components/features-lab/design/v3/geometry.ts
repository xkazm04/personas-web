import { Activity, AlertTriangle, Brain, Calendar, ListTodo, MessageSquare, Plug, UserCheck, type LucideIcon } from "lucide-react";
import type { DimKey } from "../shared/dims";
import { makeTimeline } from "../shared/timeline";

/** A 1000 x H plate (1 unit = 0.1cqw of the art box). */
export const W = 1000;
export const H = 490;
export const AR = W / H;
export const CX = 500;
export const CY = 245;

/** Petal inner / outer radius, the core, the sentence ring, the label anchors. */
export const RI = 50;
export const RO = 152;
export const CORE_R = 40;
export const RING_R = 170;
export const LABEL_R = 192;

export const u = (n: number) => `${n / 10}cqw`;

/**
 * The persona's eight petals, in the desktop app's canonical petal order
 * (trigger, task, connector, message, review, memory, event, error - 45deg
 * apart), turned half a step so none points straight at the sentence.
 */
export const PETALS: { key: DimKey; angle: number; icon: LucideIcon }[] = [
  { key: "triggers", angle: 22.5, icon: Calendar },
  { key: "tasks", angle: 67.5, icon: ListTodo },
  { key: "apps", angle: 112.5, icon: Plug },
  { key: "messages", angle: 157.5, icon: MessageSquare },
  { key: "review", angle: 202.5, icon: UserCheck },
  { key: "memory", angle: 247.5, icon: Brain },
  { key: "events", angle: 292.5, icon: Activity },
  { key: "errors", angle: 337.5, icon: AlertTriangle },
];

const rad = (deg: number) => (deg * Math.PI) / 180;
/** A point at `r` along a clockwise-from-top angle. */
export function polar(deg: number, r: number) {
  return { x: CX + r * Math.sin(rad(deg)), y: CY - r * Math.cos(rad(deg)) };
}

/** One petal pointing up from the centre, as points (x, y) around (0, 0). */
const PETAL_PTS: [number, number][] = [
  [0, -RI],
  [46, -RI - 18],
  [52, -RO + 40],
  [0, -RO],
  [-52, -RO + 40],
  [-46, -RI - 18],
  [0, -RI],
];

/**
 * A petal turned to `deg` around the plate's centre, in plate coordinates
 * (no group transform, so a CSS scale about the centre stays exact).
 */
export function petalPath(deg: number): string {
  const c = Math.cos(rad(deg));
  const s = Math.sin(rad(deg));
  const p = PETAL_PTS.map(([x, y]) => `${(CX + x * c - y * s).toFixed(1)} ${(CY + x * s + y * c).toFixed(1)}`);
  return `M${p[0]} C${p[1]}, ${p[2]}, ${p[3]} C${p[4]}, ${p[5]}, ${p[6]} Z`;
}

/** The petal's gradient axis (inner to outer tip) in plate coordinates. */
export function petalAxis(deg: number) {
  return { a: polar(deg, RI), b: polar(deg, RO) };
}

/** The sentence's arc over the top of the plate, left to right. */
const A = 100;
const s = polar(-A, RING_R);
const e = polar(A, RING_R);
export const RING_D = `M${s.x.toFixed(1)} ${s.y.toFixed(1)} A${RING_R} ${RING_R} 0 1 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;

export const LABEL_W = 250;

/** Where a petal's annotation sits: just outside its tip, growing outward. */
export function labelBox(angle: number) {
  const p = polar(angle, LABEL_R);
  const c = Math.cos(rad(angle));
  const right = Math.sin(rad(angle)) > 0;
  const x = right ? p.x : p.x - LABEL_W;
  const v: "top" | "middle" | "bottom" = c > 0.6 ? "bottom" : c < -0.6 ? "top" : "middle";
  return { x, y: p.y, right, v };
}

export const TYPE_MS = 2800;

export const STEPS = makeTimeline(
  ["tasks", "apps", "triggers", "review", "messages", "memory", "errors", "events"],
  { type: TYPE_MS, read: 1600, engage: 1000, ask: 5600, resolve: 900, finale: 3200 },
);
