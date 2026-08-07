/**
 * Pure geometry for the "Presence" hero orb (variant A). No JSX — sibling
 * data module in the CommandCenterIllustration style so the component file
 * stays focused. The stage is a 640×640 SVG viewBox: the avatar disc at
 * center, a breathing ambient glow, a slowly rotating dashed guide ring,
 * and a 5-dot task-progress arc riding the orb perimeter (mirroring the
 * desktop orb's task dots).
 */

export const SIZE = 640;
export const C = SIZE / 2;

/** Avatar disc radius (the circular video/poster mask). */
export const ORB_R = 186;
/** Ambient breathing-glow radius. */
export const GLOW_R = ORB_R + 84;
/** Rotating dashed guide-ring radius. */
export const GUIDE_R = ORB_R + 46;
/** Task-dot arc radius, between the disc edge and the guide ring. */
export const DOT_R = ORB_R + 26;

/** Avatar disc width as a fraction of the stage, for the CSS overlay. */
export const ORB_PCT = `${(((ORB_R * 2) / SIZE) * 100).toFixed(2)}%`;

const DOT_COUNT = 5;
const SPREAD = Math.PI * 0.62; // arc the 5 dots cover, centered on 12 o'clock

/** Angle (radians, standard math convention) of dot `i` on the arc. */
function dotAngle(i: number): number {
  return -Math.PI / 2 - SPREAD / 2 + (SPREAD * i) / (DOT_COUNT - 1);
}

/** The 5 task-progress dots arced across the top of the orb perimeter. */
export const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const a = dotAngle(i);
  return { x: C + Math.cos(a) * DOT_R, y: C + Math.sin(a) * DOT_R };
});

/** Faint arc track the task dots ride on (first dot → last dot). */
export const dotTrackPath = (() => {
  const p0 = DOTS[0];
  const p1 = DOTS[DOT_COUNT - 1];
  return (
    `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ` +
    `A ${DOT_R} ${DOT_R} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
  );
})();

// Centering a rotation/scale on the SVG viewBox origin requires
// `transform-box: view-box` so `transform-origin` resolves in user units.
export const spinOrigin = {
  transformBox: "view-box",
  transformOrigin: `${C}px ${C}px`,
} as const;
