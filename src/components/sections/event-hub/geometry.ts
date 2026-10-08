/**
 * Orbit geometry for the lit hub. The tools sit on a tilted ellipse around the
 * hub, so the orbit reads in perspective: nodes at the back (top) are smaller
 * and dimmer than the ones in front. Two drawings: the wide one (VB_W x VB_H)
 * and a near-round one sized for phones.
 */

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

type Ring = { rx: number; ratio: number; dash: string; period: number };

const f = (n: number) => n.toFixed(1);

function makeOrbit(spec: { w: number; h: number; hub: { x: number; y: number; r: number }; orbit: { rx: number; ry: number }; floor: { rx: number; ry: number }; rings: readonly Ring[] }) {
  const { hub: HUB, orbit: ORBIT } = spec;
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
  return {
    ...spec,
    nodes(count: number): OrbitNode[] {
      return Array.from({ length: count }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / count;
        const x = HUB.x + ORBIT.rx * Math.cos(a);
        const y = HUB.y + ORBIT.ry * Math.sin(a);
        return { x, y, depth: (Math.sin(a) + 1) / 2, ...spokes(x, y) };
      });
    },
    /** Percent position inside the art box, for HTML overlays. */
    pct: (x: number, y: number) => ({ left: `${(x / spec.w) * 100}%`, top: `${(y / spec.h) * 100}%` }),
  };
}

export type OrbitGeometry = ReturnType<typeof makeOrbit>;

/** Perspective rings around the hub: rx, tilt ratio, dash pattern, period (s). */
export const WIDE = makeOrbit({
  w: 1100,
  h: 500,
  hub: { x: 550, y: 238, r: 58 },
  orbit: { rx: 470, ry: 178 },
  floor: { rx: 520, ry: 215 },
  rings: [
    { rx: 96, ratio: 0.36, dash: "2 10", period: 16 },
    { rx: 150, ratio: 0.36, dash: "28 18", period: 26 },
    { rx: 214, ratio: 0.36, dash: "1 7", period: 40 },
  ],
});

/** Phones: eight tools (the four routes' ends) on a gentler tilt. */
export const NARROW = makeOrbit({
  w: 400,
  h: 400,
  hub: { x: 200, y: 196, r: 46 },
  orbit: { rx: 138, ry: 140 },
  floor: { rx: 196, ry: 180 },
  rings: [
    { rx: 70, ratio: 0.6, dash: "2 10", period: 16 },
    { rx: 100, ratio: 0.6, dash: "28 18", period: 26 },
  ],
});

/* The wide drawing's names, as HubView reads them. */
export const { w: VB_W, h: VB_H, hub: HUB, pct } = WIDE;
export const ART_AR = VB_W / VB_H;
export const orbitNodes = (count: number) => WIDE.nodes(count);
