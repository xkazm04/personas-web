/**
 * The drawings of the inked mind: one small vignette per beat, in local
 * coordinates around (0,0), each a list of strokes. `accent` strokes are
 * drawn in the beat's colour; the rest in ink. Generated shapes (gear,
 * rosette) are built here so the vignette component stays declarative.
 */
export interface Stroke { d: string; accent?: boolean; fill?: boolean }

/** Art box (viewBox) and where each beat's vignette sits in it. */
export const ART = { w: 1180, h: 500 };
/** Drawing scale of every vignette. */
export const INK_SCALE = 1.3;
export const SPOTS: { x: number; y: number }[] = [
  { x: 120, y: 150 },
  { x: 305, y: 335 },
  { x: 530, y: 150 },
  { x: 760, y: 335 },
  { x: 935, y: 150 },
  { x: 1060, y: 335 },
];

function gear(teeth: number, r: number, depth: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / (teeth * 4);
  for (let i = 0; i < teeth * 4; i++) {
    const rr = i % 4 < 2 ? r : r - depth;
    const a = i * step - Math.PI / 2;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function rosette(bumps: number, r: number, amp: number): string {
  const pts: string[] = [];
  const n = bumps * 6;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r + Math.cos(a * bumps) * amp;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

const circle = (cx: number, cy: number, r: number) =>
  `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;

export const DRAWINGS: Record<"parse" | "select" | "execute" | "verify" | "result", Stroke[]> = {
  // Reading: a page under a magnifying glass, keywords marked.
  parse: [
    { d: "M-46 -40 H14 L28 -26 V40 H-46 Z" },
    { d: "M14 -40 V-26 H28" },
    { d: "M-36 -22 H4 M-36 -8 H16 M-36 6 H-2 M-36 20 H12" },
    { d: "M-36 -8 H-12 M-36 20 H-18", accent: true },
    { d: circle(20, 8, 22) },
    { d: "M36 24 L58 46" },
  ],
  // Choosing: a toolbox, lid up, tools standing out of it.
  select: [
    { d: "M-54 -2 H54 V42 H-54 Z" },
    { d: "M-54 12 H54" },
    { d: "M-18 -2 V-14 H18 V-2" },
    { d: "M-34 -2 L-46 -40 M-52 -44 L-44 -34 L-38 -48" },
    { d: "M28 -2 L36 -42 L40 -50" },
    { d: "M-7 6 H7 V18 H-7 Z", accent: true },
  ],
  // Working: a gear with a spark in its heart.
  execute: [
    { d: gear(9, 42, 7) },
    { d: circle(0, 0, 26) },
    { d: "M5 -22 L-11 3 H1 L-5 22 L12 -5 H0 L8 -22 Z", accent: true, fill: true },
  ],
  // Checking: a seal with a check and two ribbons.
  verify: [
    { d: "M-16 34 L-26 62 L-14 56 L-8 66 L-2 40 M16 34 L26 62 L14 56 L8 66 L2 40" },
    { d: rosette(14, 40, 3.5) },
    { d: circle(0, 0, 28) },
    { d: "M-14 0 L-4 11 L16 -12", accent: true },
  ],
  // Handing back: an envelope with the answer rising out of it.
  result: [
    { d: "M-28 8 V-44 H28 V8" },
    { d: "M-18 -32 H18 M-18 -8 H14" },
    { d: "M-18 -20 H10", accent: true },
    { d: "M-50 -4 H50 V44 H-50 Z" },
    { d: "M-50 -4 L0 24 L50 -4" },
    { d: "M50 -46 L54 -36 L64 -32 L54 -28 L50 -18 L46 -28 L36 -32 L46 -36 Z", accent: true, fill: true },
  ],
};

/** Tool tiles (rounded squares) around the tools spot. */
export function toolOffsets(n: number): { x: number; y: number }[] {
  if (n >= 3) return [{ x: -78, y: 8 }, { x: 0, y: -14 }, { x: 78, y: 8 }];
  if (n === 2) return [{ x: -46, y: 0 }, { x: 46, y: 0 }];
  return [{ x: 0, y: 0 }];
}
export const TILE = "M-22 -32 H22 Q32 -32 32 -22 V22 Q32 32 22 32 H-22 Q-32 32 -32 22 V-22 Q-32 -32 -22 -32 Z";

/** Ink line from one vignette to the next (it runs behind their paper discs). */
export function journey(i: number): string {
  const a = SPOTS[i];
  const b = SPOTS[i + 1];
  const mid = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
}
