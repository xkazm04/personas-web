"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { type BrandKey, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The atoms this scene is assembled from.
 *
 * `Slot` is the load-bearing one: a percent-placed box MOUNTED FOR THE WHOLE
 * LOOP wearing two skins — a dashed waiting outline and the real panel —
 * crossfading against each other. The box never appears or disappears, so the
 * lattice cannot shove the list down when it solidifies, and the geometry a
 * reading is about to fly through is true from the first frame.
 *
 * `Travel` is the second one: a field-sized layer whose TRANSFORM carries its
 * child to (x%, y%). Percentage transforms resolve against the element's own
 * box, and this box is exactly the field — so `x: "78%"` lands the child 78%
 * across it, on the compositor, without animating `left`/`top`. It is how a
 * reading gets from a cell to a rank, and how four of them can overtake each
 * other in the same space without any of them reflowing anything.
 *
 * Borders are themed in EVERY state, including the calm ones: a bare `border`
 * with no colour resolves to `currentColor`, which on this page is near-white.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

/**
 * The console voice, with the page's tracking held back until there is width
 * for it. `ANNOTATION_DIM` sets `tracking-[0.18em]`, which on a 42%-wide panel
 * header costs about forty pixels a line and truncated both headers at md —
 * and two utilities for the same property cannot be stacked, since which one
 * wins is decided by the generated stylesheet's order rather than by ours.
 */
export const META =
  "font-mono text-base uppercase tracking-[0.06em] text-muted-dark lg:tracking-[0.18em]";

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** A box in the field: the dashed placeholder that becomes the real panel. */
export function Slot({
  rect,
  solid,
  reduced,
  accent = "cyan",
  round = "rounded-2xl",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  reduced: boolean;
  accent?: BrandKey;
  round?: string;
  className?: string;
  style?: CSSProperties;
  /** Optional: the lattice and the list are frames their content flies INTO,
   *  so both mount a Slot with nothing inside it. */
  children?: ReactNode;
}) {
  return (
    <div className="absolute" style={rectStyle(rect)}>
      <motion.span
        className={`pointer-events-none absolute inset-0 border border-dashed ${round}`}
        style={{ borderColor: tint(accent, 18), backgroundColor: tint(accent, 3) }}
        initial={false}
        animate={{ opacity: solid ? 0 : 1 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 border ${round} ${SKIN} ${className}`}
        style={
          solid ? { ...style, borderColor: style?.borderColor ?? tint(accent, 20) } : BARE
        }
      >
        {solid && children}
      </div>
    </div>
  );
}

export type Spring =
  | { type: "spring"; stiffness: number; damping: number; mass?: number }
  | { duration: number };

/** A field-sized layer whose transform carries its child to (x%, y%). */
export function Travel({
  x,
  y,
  spring,
  z = 0,
  children,
}: {
  x: number;
  y: number;
  spring: Spring;
  z?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: z }}
      initial={false}
      animate={{ x: `${x}%`, y: `${y}%` }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}

/** One part of a stage: `i` is its place in the queue, `lead` offsets a whole
 *  group (the texture that trails structure it shares a tick with). */
export function Part({
  show,
  i = 0,
  lead = 0,
  reduced,
  className = "",
  style,
  children,
}: {
  show: boolean;
  i?: number;
  lead?: number;
  reduced: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <motion.span
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i, lead) }}
    >
      {children}
    </motion.span>
  );
}
