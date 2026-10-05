import { TRIGGERS } from "@/components/sections/orchestration-hub/data";
import { polar } from "./shared/scene-kit";

/* V1 ring geometry (600-unit view box). The SVG and the HTML node layer both
   read these, so a tile always sits exactly on its spoke. */
export const VB = 600;
export const C = 300;
/** Radius of the node circle. */
export const R = 212;
/** The agent lens. */
export const HUB_R = 74;
/** Node tile edge, in view-box units. */
export const TILE = 104;
export const BEZEL_R = 288;
/** One beat of the travelling signal: trigger -> spoke -> agent. */
export const SIGNAL_S = 2.4;

export const STEP_DEG = 360 / TRIGGERS.length;

export const NODES = TRIGGERS.map((t, i) => {
  const deg = i * STEP_DEG;
  return {
    trigger: t,
    deg,
    at: polar(C, C, R, deg),
    /** The spoke runs from just inside the tile to the lens rim. */
    from: polar(C, C, R - TILE / 2 + 6, deg),
    to: polar(C, C, HUB_R + 8, deg),
  };
});

/** View-box units to a percentage of the ring box. */
export const pct = (v: number) => `${(v / VB) * 100}%`;

/** Bezel ticks: 60 minor marks, a major mark under every trigger. */
export const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 6 === 0;
  return { major, a: polar(C, C, BEZEL_R - (major ? 12 : 6), i * 6), b: polar(C, C, BEZEL_R, i * 6) };
});
