/** Breathing room (px) drawn around the spotlit element. */
const PADDING = 22;
/** Minimum gap kept between the cutout and the viewport edge. */
const MARGIN = 44;
/** Extra bottom clearance so the cutout never runs under the caption card. */
const BOTTOM_GAP = 150;
/** Step-to-step tween duration. */
export const TWEEN_MS = 600;

/** The edges of a rect; a `DOMRect` satisfies it. */
export interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
/** Smooth ease-in-out for the tween. */
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** Blends `from` toward `to` at tween progress `t` (0..1), eased. */
export function blendEdges(from: Edges, to: Edges, t: number): Edges {
  const e = ease(t);
  return {
    left: from.left * (1 - e) + to.left * e,
    top: from.top * (1 - e) + to.top * e,
    right: from.right * (1 - e) + to.right * e,
    bottom: from.bottom * (1 - e) + to.bottom * e,
  };
}

/**
 * Pads the target's edges and clamps them inside the viewport. Narrow
 * viewports get tighter margins so the frame doesn't crush the visible content
 * area.
 */
export function cutoutFrame(edges: Edges, vw: number, vh: number) {
  const m = vw < 480 ? 18 : MARGIN;
  const bg = vw < 480 ? 180 : BOTTOM_GAP;
  const x = clamp(edges.left - PADDING, m, vw - m);
  const y = clamp(edges.top - PADDING, m, vh - m);
  const right = clamp(edges.right + PADDING, m, vw - m);
  const bottom = clamp(edges.bottom + PADDING, m, vh - bg);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}
