/**
 * Strand geometry for A3. Each strand starts as part of a tangle on the left,
 * pinches through the Overseer knot at (KX, KY) and leaves as an orderly lane
 * on the right. `states` are phase-shifted snapshots the SVG morphs between;
 * state 0 doubles as the still frame.
 */
export const VB_W = 1600;
export const VB_H = 900;
export const KX = 800;
export const KY = 300;
export const STRANDS = 9;
export const STATES = 6;
const POINTS = 80;
const X0 = -40;
const X1 = VB_W + 40;

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (v: number) => {
  const c = clamp(v);
  return c * c * (3 - 2 * c);
};

function y(k: number, x: number, theta: number): number {
  const u = (k - (STRANDS - 1) / 2) / ((STRANDS - 1) / 2);
  if (x <= KX) {
    const d = clamp((KX - x) / (KX + 40));
    const amp = 255 * Math.pow(d, 1.35);
    const f1 = (Math.PI * 2) / (430 + (k % 3) * 80);
    const f2 = (Math.PI * 2) / (330 + (k % 4) * 50);
    const wave = 0.62 * Math.sin(x * f1 + k * 1.7 + theta) + 0.38 * Math.sin(x * f2 + k * 2.9 - theta * 2);
    return KY + amp * wave + u * 10 * d;
  }
  const d = clamp((x - KX) / (VB_W - KX));
  const gap = 190 * Math.pow(d, 1.1);
  const sway = 34 * smooth(d * 1.6) * Math.sin(((x - KX) * Math.PI * 2) / 820 - theta + k * 0.18);
  return KY + u * gap + sway;
}

export function strandPath(k: number, state: number): string {
  const theta = (state / STATES) * Math.PI * 2;
  let d = "";
  for (let i = 0; i <= POINTS; i++) {
    const x = X0 + ((X1 - X0) * i) / POINTS;
    d += `${i ? "L" : "M"}${Math.round(x)} ${Math.round(y(k, x, theta))}`;
  }
  return d;
}

/** `values` for an SVG <animate> on `d`: every state, then state 0 again to close the loop. */
export function strandValues(k: number): string {
  return Array.from({ length: STATES + 1 }, (_, s) => strandPath(k, s % STATES)).join(";");
}
