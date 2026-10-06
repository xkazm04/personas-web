/**
 * Orbit geometry for the lit hub (viewBox VB_W x VB_H). The tools sit on a
 * tilted ellipse around the hub, so the orbit reads in perspective: nodes at
 * the back (top) are smaller and dimmer than the ones in front.
 */
export const VB_W = 1100;
export const VB_H = 500;
export const ART_AR = VB_W / VB_H;
export const HUB = { x: 550, y: 238, r: 58 };
export const ORBIT = { rx: 470, ry: 178 };

export interface OrbitNode {
  x: number;
  y: number;
  /** 0 = back of the orbit, 1 = front. */
  depth: number;
  /** Curved spoke from this node into the hub's rim. */
  spoke: string;
  /** The same curve, hub rim out to the node. */
  spokeOut: string;
}

const f = (n: number) => n.toFixed(1);

function spokes(x: number, y: number) {
  const dx = HUB.x - x;
  const dy = HUB.y - y;
  const len = Math.hypot(dx, dy);
  // End on the hub's rim, not its centre.
  const ex = HUB.x - (dx / len) * (HUB.r + 6);
  const ey = HUB.y - (dy / len) * (HUB.r + 6);
  // Bow the curve a little, always the same hand, so the spokes swirl.
  const bow = 0.14 * len;
  const cx = (x + ex) / 2 + (-dy / len) * bow;
  const cy = (y + ey) / 2 + (dx / len) * bow;
  return {
    spoke: `M${f(x)} ${f(y)} Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`,
    spokeOut: `M${f(ex)} ${f(ey)} Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}`,
  };
}

export function orbitNodes(count: number): OrbitNode[] {
  return Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const x = HUB.x + ORBIT.rx * Math.cos(a);
    const y = HUB.y + ORBIT.ry * Math.sin(a);
    return { x, y, depth: (Math.sin(a) + 1) / 2, ...spokes(x, y) };
  });
}

/** Percent position inside the art box, for HTML overlays. */
export const pct = (x: number, y: number) => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` });

/** Perspective rings around the hub: rx, tilt ratio, dash pattern, period (s). */
export const RINGS = [
  { rx: 96, ratio: 0.36, dash: "2 10", period: 16 },
  { rx: 150, ratio: 0.36, dash: "28 18", period: 26 },
  { rx: 214, ratio: 0.36, dash: "1 7", period: 40 },
] as const;
