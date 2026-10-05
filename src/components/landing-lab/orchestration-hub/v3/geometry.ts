import { TRIGGERS } from "@/components/sections/orchestration-hub/data";

/* V3 "sunrise" geometry: the ten triggers are rays of a half-disc fanned above
   the horizon, the agent is the sun rising at its centre. The fan's view box
   ends at the horizon; the agent and the words sit across that line. */
export const W = 1320;
export const H = 530;
export const OX = 660;
export const OY = 530;
/** Inner and outer radius of the rays. */
export const R0 = 132;
export const R1 = 450;
/** The agent's disc. */
export const SUN_R = 112;
/** The open ray's window onto its scene. */
export const PORT_D = 294;
export const PORT_R = 122;
/** Label anchor radius. */
export const LABEL_R = 470;
/** Alternate narrow rays push their label further out, so neighbours near the top never touch. */
export const LABEL_STAGGER = 46;
/** Degrees the open ray takes; the other nine share the rest of the half-disc. */
export const OPEN_DEG = 74;
const GAP = 1.1;
/** One beat of the signal sweeping down the open ray into the agent. */
export const SWEEP_S = 2.8;

const N = TRIGGERS.length;
const NARROW = (180 - OPEN_DEG) / (N - 1);

export interface Ray {
  /** Start and end angle in SVG degrees (clockwise from +x); 180 = left horizon, 270 = up. */
  a0: number;
  a1: number;
}

/** The fan with ray `open` opened: left-to-right in trigger order. */
export function fanLayout(open: number): Ray[] {
  let a = 180;
  return TRIGGERS.map((_, i) => {
    const span = i === open ? OPEN_DEG : NARROW;
    const ray = { a0: a + GAP / 2, a1: a + span - GAP / 2 };
    a += span;
    return ray;
  });
}

// Two decimals: server and browser trig can disagree in the last digit (hydration).
const r2 = (n: number) => Math.round(n * 100) / 100;

export function at(radius: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: r2(OX + radius * Math.cos(t)), y: r2(OY + radius * Math.sin(t)) };
}

/** An annular wedge between R0 and R1 (always < 180 degrees, so the small arc). */
export function wedge(a0: number, a1: number, r0 = R0, r1 = R1): string {
  const p0 = at(r0, a0);
  const p1 = at(r1, a0);
  const p2 = at(r1, a1);
  const p3 = at(r0, a1);
  return `M${p0.x} ${p0.y} L${p1.x} ${p1.y} A${r1} ${r1} 0 0 1 ${p2.x} ${p2.y} L${p3.x} ${p3.y} A${r0} ${r0} 0 0 0 ${p0.x} ${p0.y} Z`;
}

export const pctX = (x: number) => `${r2((x / W) * 100)}%`;
export const pctY = (y: number) => `${r2((y / H) * 100)}%`;
