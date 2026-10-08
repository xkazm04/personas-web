/**
 * Precomputed artwork geometry for /m2: the dial's ticks, numerals and bands, the hero's small
 * clock, the FAQ knob and the night sky's stars. Pure and deterministic (the stars use a seeded
 * generator), so the server and the client draw the same picture.
 */
import { C, P, arcD, f1, p2 } from "./geometry";
import { DAY_PARTS, NODES } from "./data";

/** Bead ring radius (the agent's ring) and the day-part band radius, in dial units. */
export const RUN_R = 182;
export const BAND_R = 221;

function seg(a: [number, number], b: [number, number]) {
  return `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
}

/** 96 quarter-hour ticks in three weights. */
export const TICKS = (() => {
  const A: string[] = [];
  const B: string[] = [];
  const D: string[] = [];
  for (let i = 0; i < 96; i++) {
    const h = i / 4;
    const s = seg(P(292, h), P(i % 4 === 0 ? 274 : i % 2 === 0 ? 282 : 286.5, h));
    (i % 4 === 0 ? A : i % 2 === 0 ? B : D).push(s);
  }
  return { a: A.join(""), b: B.join(""), c: D.join("") };
})();

/** The 24 hour numerals, each rotated to read outward. */
export const NUMERALS = Array.from({ length: 24 }, (_, h) => {
  const [x, y] = P(260, h);
  return { h, x: f1(x), y: f1(y), label: p2(h), major: h % 6 === 0, rotate: `rotate(${h * 15} ${f1(x)} ${f1(y)})` };
});

/** Minute marks around the hub. */
export const MINUTES = Array.from({ length: 60 }, (_, i) => seg(P(146, i / 2.5), P(i % 5 === 0 ? 138 : 142, i / 2.5))).join("");

/** Day-one setup: the few minutes at 09:00 on the agent's ring. */
export const SETUP_ARC = arcD(RUN_R, 8.88, 9.42);
export const SETUP_DOTS = [8.97, 9.15, 9.33].map((h) => {
  const [x, y] = P(RUN_R, h);
  return { cx: f1(x), cy: f1(y) };
});

/** Your day as bands on the dial, each with a label at its middle. */
export const DAY_BANDS = DAY_PARTS.map(([id, h0, h1]) => {
  const hm = (h0 + h1) / 2;
  const [x, y] = P(BAND_R, hm);
  return { id, d: arcD(BAND_R, h0, h1), hm, x: f1(x), y: f1(y), rotate: `rotate(${(hm * 15).toFixed(2)} ${f1(x)} ${f1(y)})` };
});

/** A bead on the agent's ring at hour h: its translate + rotate transform. */
export function beadTransform(h: number): string {
  const [x, y] = P(RUN_R, h);
  return `translate(${f1(x)} ${f1(y)}) rotate(${(h * 15).toFixed(2)})`;
}

/** The pricing chapter's fixed overlay: the bill arc, its badge, and the three nodes. */
export const PRICE_ART = (() => {
  const c0 = P(244, 1.8);
  const c1 = P(276, 1.8);
  const bp = P(291, 1.8);
  return {
    bill: arcD(242, 0, 2.6667),
    stem: seg(c0, c1),
    badge: `translate(${f1(bp[0])} ${f1(bp[1])})`,
    nodes: NODES.map((n) => {
      const th = (n.a * Math.PI) / 180;
      return { x: C + BAND_R * Math.sin(th), y: C - BAND_R * Math.cos(th), art: n.art };
    }),
  };
})();

/** Where the travelling pulse sits for a beat index 0..3 (it leaves after the third node). */
export function pulseAt(idx: number): { cx: string; cy: string; opacity: string } {
  const i = Math.max(0, Math.min(3, idx));
  const a = ((-40 + 40 * Math.min(i, 2)) * Math.PI) / 180;
  return { cx: f1(C + BAND_R * Math.sin(a)), cy: f1(C - BAND_R * Math.cos(a)), opacity: i > 2 ? (1 - (i - 2)).toFixed(2) : "1" };
}

/** The hero's small clock: 12 ticks and four numerals on a 200 box. */
export const FACE = (() => {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const r1 = i % 3 === 0 ? 80 : 85;
    return { x1: f1(100 + 91 * Math.sin(a)), y1: f1(100 - 91 * Math.cos(a)), x2: f1(100 + r1 * Math.sin(a)), y2: f1(100 - r1 * Math.cos(a)) };
  });
  const nums = (
    [
      ["12", 0],
      ["3", 90],
      ["6", 180],
      ["9", 270],
    ] as const
  ).map(([label, deg]) => {
    const a = (deg * Math.PI) / 180;
    return { label, x: f1(100 + 65 * Math.sin(a)), y: f1(100 - 65 * Math.cos(a)) };
  });
  const pp = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return [100 + r * Math.sin(a), 100 - r * Math.cos(a)];
  };
  const a0 = pp(0, 38);
  const a1 = pp(60, 38);
  return {
    ticks,
    nums,
    arc: `M${f1(a0[0])} ${f1(a0[1])}A38 38 0 0 1 ${f1(a1[0])} ${f1(a1[1])}`,
    beads: [0, 30, 60].map((d) => {
      const p = pp(d, 38);
      return { cx: f1(p[0]), cy: f1(p[1]) };
    }),
  };
})();

/** A small analogue face reading h:m, on a 100 box. */
export function miniFace(h: number, m: number) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return { x1: f1(50 + 42 * Math.sin(a)), y1: f1(50 - 42 * Math.cos(a)), x2: f1(50 + 36 * Math.sin(a)), y2: f1(50 - 36 * Math.cos(a)) };
  });
  const ha = (((h % 12) + m / 60) * 30 * Math.PI) / 180;
  const ma = (m * 6 * Math.PI) / 180;
  return {
    ticks,
    hour: { x2: f1(50 + 21 * Math.sin(ha)), y2: f1(50 - 21 * Math.cos(ha)) },
    minute: { x2: f1(50 + 33 * Math.sin(ma)), y2: f1(50 - 33 * Math.cos(ma)) },
  };
}

/** The FAQ knob: 24 ticks and four coloured quarter arcs on a 300 box. */
export const KNOB = (() => {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    const major = i % 6 === 0;
    const r2 = major ? 116 : 126;
    return { x1: f1(150 + 136 * Math.sin(a)), y1: f1(150 - 136 * Math.cos(a)), x2: f1(150 + r2 * Math.sin(a)), y2: f1(150 - r2 * Math.cos(a)), major };
  });
  const arcs = Array.from({ length: 4 }, (_, i) => {
    const q0 = ((i * 90 - 36) * Math.PI) / 180;
    const q1 = ((i * 90 + 36) * Math.PI) / 180;
    return `M${f1(150 + 98 * Math.sin(q0))} ${f1(150 - 98 * Math.cos(q0))}A98 98 0 0 1 ${f1(150 + 98 * Math.sin(q1))} ${f1(150 - 98 * Math.cos(q1))}`;
  });
  return { ticks, arcs };
})();
export const KNOB_COLORS = ["var(--brand-cyan)", "var(--brand-purple)", "var(--brand-emerald)", "var(--brand-amber)"];

/** Athena's memory constellation (200 box). */
export const MEMORY_PTS: [number, number][] = [
  [24, 70],
  [58, 30],
  [112, 16],
  [168, 44],
  [180, 112],
  [150, 168],
  [90, 184],
  [36, 150],
];

/** Three layers of seeded stars over a 430x932 sky. */
export const STAR_LAYERS = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return [0, 1, 2].map(() =>
    Array.from({ length: 34 }, () => {
      const y = Math.pow(rnd(), 1.35) * 640;
      return { cx: (rnd() * 430).toFixed(1), cy: y.toFixed(1), r: (0.55 + rnd() * rnd() * 1.5).toFixed(2), o: (0.45 + rnd() * 0.55).toFixed(2) };
    }),
  );
})();
