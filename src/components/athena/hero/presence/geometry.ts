/**
 * Pure geometry for "Presence, evolved" (hero v1). No JSX.
 *
 * ONE coordinate space: a 1600x640 stage viewBox with Athena at its centre.
 * The live hero drew the orb in its own 640 square and the callouts in a
 * second 1024-wide space; here the drafting layer, the orb, the leader lines
 * and the demonstrations all share one space, so a leader can never drift off
 * the disc it points at. Below lg the same SVG is shown through a 640-wide
 * window (CSS crops it to the orb square) and the callouts become a list.
 *
 * The stage is 2.5:1 so the label columns stay readable while the orb takes
 * the full height of the slot: on the desktop stage the art box is
 * `min(100%, 100cqh * 2.5)` wide.
 */

export const STAGE_W = 1600;
export const STAGE_H = 640;
export const CX = STAGE_W / 2;
export const CY = STAGE_H / 2;
/** Width / height, for the CSS aspect box. */
export const STAGE_AR = STAGE_W / STAGE_H;
/** Left edge of the orb square, for the below-lg crop window. */
export const SQUARE_X = CX - STAGE_H / 2;

/** The avatar disc. Larger than the live 186/640 so the being owns the slot. */
export const ORB_R = 206;
export const RIM_R = ORB_R + 2;
export const DOT_R = ORB_R + 28;
export const GUIDE_R = ORB_R + 52;
export const BEZEL_R = ORB_R + 88;
export const GLOW_R = ORB_R + 110;

/** Disc width as a percentage of the wide stage and of the square window. */
export const ORB_PCT_WIDE = `${(((ORB_R * 2) / STAGE_W) * 100).toFixed(3)}%`;
export const ORB_PCT_SQUARE = `${(((ORB_R * 2) / STAGE_H) * 100).toFixed(3)}%`;

export const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

/** Rotation / scale centred on the orb (SVG's default origin is 0,0). */
export const orbOrigin = { transformBox: "view-box", transformOrigin: `${CX}px ${CY}px` } as const;

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
};

/* Task dots: five on an arc across the top of the disc. */
const DOT_SPREAD = 112;
export const DOTS = Array.from({ length: 5 }, (_, i) => polar(DOT_R, -90 - DOT_SPREAD / 2 + (DOT_SPREAD * i) / 4));
export const DOT_TRACK = `M ${DOTS[0].x.toFixed(1)} ${DOTS[0].y.toFixed(1)} A ${DOT_R} ${DOT_R} 0 0 1 ${DOTS[4].x.toFixed(1)} ${DOTS[4].y.toFixed(1)}`;

/* The instrument bezel: a tick every 3 degrees, a long one every 30. */
export const BEZEL_TICKS = Array.from({ length: 120 }, (_, i) => {
  const deg = i * 3;
  const long = deg % 30 === 0;
  const a = polar(BEZEL_R, deg);
  const b = polar(BEZEL_R + (long ? 14 : 6), deg);
  return { d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, long };
});

/* Voice bars (the "talk" demonstration): radial bars hugging the disc. */
export const VOICE_BARS = Array.from({ length: 72 }, (_, i) => ({
  deg: i * 5,
  /** Rest length, deterministic so the ring reads as a voice, not a gear. */
  len: 10 + Math.round(18 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45))),
}));

/* Drop brackets (the "your desktop" demonstration): four corner marks. */
const B = ORB_R + 34;
const ARM = 34;
export const BRACKETS = [
  [-1, -1], [1, -1], [1, 1], [-1, 1],
].map(([sx, sy]) => {
  const x = CX + sx * B;
  const y = CY + sy * B;
  return `M ${x} ${y - sy * ARM} L ${x} ${y} L ${x - sx * ARM} ${y}`;
});

/* Callouts: leader from the disc edge, a radial elbow, then horizontal. */
const ANCHOR_R = ORB_R + 12;
const ELBOW_R = ORB_R + 66;
const RUN_X = 360;
/** |x - CX| where the HTML label column starts; it runs to the stage edge. */
const LABEL_X = 374;

export type CalloutId = "talk" | "tasks" | "drag" | "summon";

function callout(id: CalloutId, deg: number) {
  const p1 = polar(ANCHOR_R, deg);
  const p2 = polar(ELBOW_R, deg);
  const left = Math.cos((deg * Math.PI) / 180) < 0;
  const p3 = { x: CX + (left ? -RUN_X : RUN_X), y: p2.y };
  const inset = pct(CX + LABEL_X, STAGE_W);
  return {
    id,
    left,
    points: [p1, p2, p3],
    path: `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`,
    labelStyle: left
      ? { top: pct(p2.y, STAGE_H), right: inset, left: "0%" }
      : { top: pct(p2.y, STAGE_H), left: inset, right: "0%" },
  };
}

/** One per `athenaPage.hero.callouts` item, same order. */
export const CALLOUTS = [
  callout("talk", 150),
  callout("tasks", -48),
  callout("drag", 192),
  callout("summon", 30),
] as const;
