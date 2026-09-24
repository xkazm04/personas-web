/* Geometry for the effort-dial illustration (viewBox units). */

export const CX = 320;
export const CY = 305;
export const OUTER = 252;
export const END = 4.4;
export const SECONDS_PER_BEAT = 1.15;

const r2 = (n: number) => Math.round(n * 100) / 100;
export const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [r2(CX + r * Math.cos(a)), r2(CY - r * Math.sin(a))] as const;
};
/** Annular sector from angle a0 down to a1 (degrees, CCW from +x). */
export function sector(rIn: number, rOut: number, a0: number, a1: number) {
  const [x0, y0] = pt(rOut, a0);
  const [x1, y1] = pt(rOut, a1);
  const [x2, y2] = pt(rIn, a1);
  const [x3, y3] = pt(rIn, a0);
  return `M${x0} ${y0} A${rOut} ${rOut} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${rIn} ${rIn} 0 0 0 ${x3} ${y3} Z`;
}

export const ZONES = [
  { name: "Haiku", from: 180, to: 122, thick: 16, mid: 151, chip: 16 },
  { name: "Sonnet", from: 118, to: 62, thick: 28, mid: 90, chip: 26 },
  { name: "Opus", from: 58, to: 0, thick: 42, mid: 29, chip: 38 },
] as const;

export const INNER_IN = 116;
export const INNER_OUT = 140;
export const PARK_R = 178;
export const DROP_Y = -40;
export const NEEDLE = 236;

export const TICKS = Array.from({ length: 19 }, (_, i) => i * 10);
