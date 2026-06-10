import { completedCount, totalPhases } from "@/data/roadmap-phases";

/**
 * Pure geometry + layout constants for {@link CommandCenterIllustration}.
 * Kept in a sibling data module (no JSX) so the component file stays focused
 * and small. The diagram is a 220×220 SVG: a progress-arc ring of one segment
 * per roadmap phase, with a radar sweep, breathing core, and orbit layered on.
 */

export const phases = Array.from({ length: totalPhases }, (_, i) => ({
  index: i + 1,
  completed: i < completedCount,
}));

// ── Layout ────────────────────────────────────────────────────────────────
export const CX = 110;
export const CY = 110;
export const RADIUS = 100;
export const STROKE = 4;
const GAP = 4;
export const SEGMENT_ANGLE = (360 - GAP * totalPhases) / totalPhases;
export const SEGMENT_STEP = SEGMENT_ANGLE + GAP;
export const INNER_R = RADIUS - 18; // dashed guide ring + satellite orbit

/** Point on a circle around the diagram center. `deg` is clock-angle from 12 o'clock, clockwise. */
export function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// ── Radar sweep ─────────────────────────────────────────────────────────────
// An annular sector that grazes the progress ring while leaving the center
// version readout clear. Rotated continuously by the component.
const SWEEP_SPAN = 56; // degrees of arc the beam covers
const SWEEP_INNER = 46;

export const sweepPath = (() => {
  const oi = polar(SWEEP_INNER, 0);
  const oo = polar(RADIUS, 0);
  const eo = polar(RADIUS, SWEEP_SPAN);
  const ei = polar(SWEEP_INNER, SWEEP_SPAN);
  return (
    `M ${oi.x.toFixed(2)} ${oi.y.toFixed(2)} ` +
    `L ${oo.x.toFixed(2)} ${oo.y.toFixed(2)} ` +
    `A ${RADIUS} ${RADIUS} 0 0 1 ${eo.x.toFixed(2)} ${eo.y.toFixed(2)} ` +
    `L ${ei.x.toFixed(2)} ${ei.y.toFixed(2)} ` +
    `A ${SWEEP_INNER} ${SWEEP_INNER} 0 0 0 ${oi.x.toFixed(2)} ${oi.y.toFixed(2)} Z`
  );
})();

// Bright at the leading edge of the sweep, fading toward the trailing edge.
export const sweepLead = polar((RADIUS + SWEEP_INNER) / 2, SWEEP_SPAN);
export const sweepTrail = polar((RADIUS + SWEEP_INNER) / 2, 0);

// Centering a rotation on the SVG viewBox origin requires `transform-box: view-box`
// so `transform-origin` resolves in user units (not the element's own bbox).
export const spinOrigin = {
  transformBox: "view-box",
  transformOrigin: `${CX}px ${CY}px`,
} as const;
