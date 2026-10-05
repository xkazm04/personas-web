import { loopTransition } from "@/lib/motion/loop-gate";

/**
 * Shared ink for the trigger vignettes (scenes-*.tsx): every colour is a theme
 * token or a colour-mix of one, so a scene reads in all eleven themes.
 */
export const INK = "rgba(var(--surface-overlay), 0.62)";
export const SOFT = "rgba(var(--surface-overlay), 0.26)";
export const FAINT = "rgba(var(--surface-overlay), 0.1)";
export const PAPER = "rgba(var(--surface-overlay), 0.05)";
export const SOLID = "var(--background)";

export const mix = (tone: string, pct: number) => `color-mix(in srgb, ${tone} ${pct}%, transparent)`;

export interface SceneProps {
  /** The loop may run (gate open, hub not stopped). Off = the rest pose. */
  run: boolean;
  /** The trigger's brand colour (a CSS var). */
  tone: string;
}

/** One beat of a vignette: the whole story plays once per period. */
export const PERIOD = 3.6;

type Ease = "easeInOut" | "linear" | "easeOut" | "easeIn";

/**
 * A looping keyframe track for one element. Running: the keyframes repeat
 * every PERIOD. Stopped: the element snaps to `rest` - the scene's complete
 * "it fired" pose, so reduced motion and a paused hub see a finished story,
 * never a blank. The element itself never changes (props only).
 */
export function beat<K extends string>(
  run: boolean,
  frames: Record<K, number[]>,
  rest: Record<K, number>,
  times: number[],
  ease: Ease = "easeInOut",
) {
  return {
    initial: false as const,
    animate: run ? frames : rest,
    transition: loopTransition(run, { duration: PERIOD, ease, times }),
  };
}

/* Rotations about a point go through <Spin> (Spin.tsx): framer pivots SVG on
   the element's own fill-box centre, whatever transform-box says. */

/** Scale/pulse an element about its own centre. */
export const SELF = { transformBox: "fill-box" as const, transformOrigin: "center" };

/** Two decimals: server and browser trig can differ in the last digit, which would break hydration. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** A point on a circle, angle in degrees clockwise from 12 o'clock. */
export function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return { x: r2(cx + r * Math.sin(a)), y: r2(cy - r * Math.cos(a)) };
}

/** A looping transition with keyframe `times` (kept mutable for framer's type). */
export function timedLoop(run: boolean, duration: number, times: number[], ease: Ease = "easeInOut") {
  return loopTransition(run, { duration, ease, times });
}
