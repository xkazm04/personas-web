"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The SURFACES this wall is assembled from. Its light lives next door in
 * `./ink`, which is a different kind of atom and a different argument.
 *
 * `Slot` is the important one: a percent-placed box MOUNTED FOR THE WHOLE LOOP
 * that wears two skins — a dashed waiting outline and the real screen —
 * crossfading against each other. The box never appears or disappears, so a
 * wall of twenty screens solidifying cannot shift a single one of them, and the
 * bench is holding the announcement's place long before there is anything to
 * announce.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a screen is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 *
 * One hard rule runs through every file in this variant: framer cannot
 * interpolate `color-mix()`, and `tint()` returns exactly that. Colour changes
 * therefore ride SCOPED CSS transitions (`SKIN`), and framer is left with
 * transforms and opacity — which is why a screen taking on her verdict is a
 * `transition-[border-color]` and never an `animate` prop.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
export const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * A box in the field. `solid` flips the waiting outline into the real thing;
 * `waiting` says whether that outline should be visible at all yet. `delay`
 * ripples the outlines in across the wall so even the placeholders arrive as a
 * gesture rather than a switch.
 */
export function Slot({
  rect,
  solid,
  waiting,
  reduced,
  delay = 0,
  round = "rounded-lg",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  waiting: boolean;
  reduced: boolean;
  delay?: number;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className="absolute" style={rectStyle(rect)}>
      <motion.span
        className={`pointer-events-none absolute inset-0 border border-dashed ${round}`}
        style={{ borderColor: tint("cyan", 15), backgroundColor: tint("cyan", 3) }}
        initial={false}
        animate={{ opacity: waiting && !solid ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : delay }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 border ${round} ${SKIN} ${className}`}
        style={
          solid
            ? // A bare `border` resolves to `currentColor` — near-white on this
              // page, which is how a sibling section once grew a white outline
              // the theme never asked for. Callers colour their emphatic states;
              // the calm state needs a themed floor here rather than at every
              // call site.
              { ...style, borderColor: style?.borderColor ?? tint("cyan", 16) }
            : BARE
        }
      >
        {solid && children}
      </div>
    </div>
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
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i, lead) }}
    >
      {children}
    </motion.span>
  );
}
