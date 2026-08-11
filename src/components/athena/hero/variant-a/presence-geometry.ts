/**
 * Pure geometry for the "Presence" hero (variant A, round 2). No JSX.
 *
 * Two coordinate spaces:
 *  1. Orb-local — a 640×640 SVG viewBox holding the avatar disc, breathing
 *     glow, guide ring, task-dot arc, and the acknowledge pulse ring.
 *  2. Stage — a 1024×640 viewBox that overlays the whole hero art block on
 *     lg+ screens. The orb square sits centered, so orb center = (512, 320)
 *     and radii are shared between both spaces (same unit scale). Blueprint
 *     callout leader lines live here.
 *
 * The stage is wider than the orb square (1024 vs 640) purely to buy the
 * blueprint labels a readable column: nothing on this page renders below
 * text-base, and 16px mono at 0.18em tracking needs ~180px per side.
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
/** Acknowledge pulse ring radius (one-shot, on hover/tap/Enter). */
export const ACK_R = ORB_R + 8;

/** Avatar disc width as a fraction of the orb square, for the CSS overlay. */
export const ORB_PCT = `${(((ORB_R * 2) / SIZE) * 100).toFixed(2)}%`;

const DOT_COUNT = 5;
const SPREAD = Math.PI * 0.62; // arc the 5 dots cover, centered on 12 o'clock

/** The 5 task-progress dots arced across the top of the orb perimeter. */
export const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const a = -Math.PI / 2 - SPREAD / 2 + (SPREAD * i) / (DOT_COUNT - 1);
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

/* ------------------------------------------------------------------ */
/* Stage space — blueprint callout leader lines (lg+ overlay)          */
/* ------------------------------------------------------------------ */

export const STAGE_W = 1024;
export const STAGE_H = 640;
export const STAGE_CX = STAGE_W / 2;
export const STAGE_CY = STAGE_H / 2;

const ANCHOR_R = ORB_R + 10; // leader start, just off the disc edge
const ELBOW_R = ORB_R + 56; // radial run before the horizontal elbow
const RUN_X = 322; // |x - CX| where the horizontal segment ends
/** |x - CX| where the HTML label column starts. The column then runs to the
 *  stage edge (STAGE_W/2 - LABEL_X = 182 units), which is the readable width
 *  budget for a text-base blueprint label. Keep it clear of GLOW_R (270). */
const LABEL_X = 330;

export type CalloutGeometry = {
  id: "talk" | "tasks" | "drag" | "summon";
  side: "left" | "right";
  /** Leader polyline: disc edge → radial elbow → horizontal end. */
  path: string;
  /** Anchor tick on the disc edge (leader start). */
  anchor: { x: number; y: number };
  /** Absolute CSS placement for the HTML label (percent of stage box). Both
   *  horizontal edges are pinned so the label box exactly fills its column
   *  and can never overflow the stage, whatever the copy length. */
  labelStyle: { top: string; left: string; right: string };
};

function callout(
  id: CalloutGeometry["id"],
  angleDeg: number, // y-down screen convention, 0° = 3 o'clock
): CalloutGeometry {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const side: CalloutGeometry["side"] = cos < 0 ? "left" : "right";
  const dir = cos < 0 ? -1 : 1;
  const p1 = { x: STAGE_CX + cos * ANCHOR_R, y: STAGE_CY + sin * ANCHOR_R };
  const p2 = { x: STAGE_CX + cos * ELBOW_R, y: STAGE_CY + sin * ELBOW_R };
  const p3 = { x: STAGE_CX + dir * RUN_X, y: p2.y };
  const topPct = `${((p2.y / STAGE_H) * 100).toFixed(2)}%`;
  const insetPct = `${(((STAGE_CX + LABEL_X) / STAGE_W) * 100).toFixed(2)}%`;
  return {
    id,
    side,
    path:
      `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ` +
      `L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} ` +
      `L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`,
    anchor: p1,
    labelStyle:
      side === "left"
        ? { top: topPct, right: insetPct, left: "0%" }
        : { top: topPct, left: insetPct, right: "0%" },
  };
}

/** One entry per `athenaPage.hero.callouts` item in src/i18n, same order. */
export const CALLOUT_GEOMETRY: readonly CalloutGeometry[] = [
  callout("talk", 148), // lower-left — her voice
  callout("tasks", -50), // upper-right — the task-dot arc
  callout("drag", 190), // left — the whole disc relocates
  callout("summon", 30), // lower-right — arrives from anywhere
];
