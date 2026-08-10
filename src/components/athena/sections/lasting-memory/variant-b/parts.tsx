"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The atoms this scene is assembled from.
 *
 * `Slot` is the important one: a percent-placed box that is MOUNTED FOR THE
 * WHOLE LOOP and wears two skins — a dashed waiting outline and the real
 * card — crossfading against each other. The box never appears or
 * disappears, so nothing in this field can reflow, and a card that settles
 * out of the lit band settles by TRANSFORM off a box that never moved.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a card is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 *
 * `Wash` is this section's own atom. Every surface gets the identical element
 * at the identical beat, delayed by how deep it sits — so one light travels
 * down through the lit band, the resting layer and the record in turn. Three
 * strata, one memory, argued in light rather than in copy.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow,color]";

/** One slow shared cycle for the closing frame. Long on purpose: the hold has
 *  to read as calm, and anything under three seconds reads as a pulse. */
export const BREATH = { duration: 4.6, repeat: Infinity, ease: "easeInOut" } as const;

/** How a card travels when it stops being worked from. Slow and weighted —
 *  it is settling, not falling, and it has to stay readable the whole way. */
export const SETTLE = { type: "spring", stiffness: 34, damping: 15, mass: 1.1 } as const;

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * A box in the field. `solid` flips the waiting outline into the real card;
 * `waiting` says whether that outline should be visible at all yet. `shift`
 * is a transform, never a position, so the box the threads read stays put.
 */
export function Slot({
  rect,
  solid,
  waiting,
  reduced,
  shift = "0%",
  round = "rounded-xl",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  waiting: boolean;
  reduced: boolean;
  shift?: string;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute"
      style={rectStyle(rect)}
      initial={false}
      animate={{ y: shift }}
      transition={reduced ? { duration: 0 } : SETTLE}
    >
      <motion.span
        className={`pointer-events-none absolute inset-0 border border-dashed ${round}`}
        style={{ borderColor: tint("cyan", 16), backgroundColor: tint("cyan", 3) }}
        initial={false}
        animate={{ opacity: waiting && !solid ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 border ${round} ${SKIN} ${className}`}
        style={
          solid
            ? // A bare `border` resolves to `currentColor` and this page's text
              // is near-white — which is how a sibling section grew a white
              // outline the theme never asked for. Callers tint only their
              // emphatic states, so the calm one needs a floor here.
              { ...style, borderColor: style?.borderColor ?? tint("cyan", 18) }
            : BARE
        }
      >
        {solid && children}
      </div>
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

/** An accent sweep across a panel the instant something commits to it. */
export function Sheen({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 26)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

/** The one travelling light. `depth` is the surface's own y in the field, so
 *  the delay is geometry rather than a hand-tuned queue. */
export function Wash({ on, depth, reduced }: { on: boolean; depth: number; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ backgroundColor: tint("cyan", 30) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.9, delay: (depth / 100) * 0.85, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}
