"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { FieldLayout, Rect } from "./layout";

/**
 * The surfaces this scene is assembled from. Its LINES live next door in
 * `./ink`, which is a different kind of atom and a different argument.
 *
 * `Slot` is the shared one: a percent-placed box MOUNTED FOR THE WHOLE LOOP
 * that wears two skins — a dashed waiting outline and the real panel —
 * crossfading against each other. The box never appears or disappears, so the
 * three bands solidifying can never move the point a day is about to stand on,
 * and the shelf is holding its place before there is anything on it.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a thing is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 *
 * `BREATH` is the closing beat: during the hold the shelf, everything on it
 * and her own glow ride the same cycle with no offset, so the last frame rises
 * and falls as one thing. Shared here rather than tuned per component.
 *
 * One hard rule runs through every file in this variant: framer cannot
 * interpolate `color-mix()`, and `tint()` returns exactly that. Colour changes
 * therefore ride SCOPED CSS transitions (`SKIN`), and framer is left with
 * transforms and opacity — which is also why the day-to-day fading in this
 * scene is a `transition-[background-color]` and never an `animate` prop.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
export const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

/** The slower skin the days fade on. A day going quiet is the passage of time,
 *  not a state change, and it should take visibly longer than anything that
 *  happens inside a single beat. */
export const SLOW_SKIN = "duration-[1200ms] transition-[background-color,box-shadow]";

/** One slow shared cycle. Long on purpose: the hold has to read as calm, and
 *  anything under three seconds reads as a pulse instead. */
export const BREATH = { duration: 4.6, repeat: Infinity, ease: "easeInOut" } as const;

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * A box in the field. `solid` flips the waiting outline into the real thing;
 * `waiting` says whether that outline should be visible at all yet.
 */
export function Slot({
  rect,
  solid,
  waiting,
  reduced,
  round = "rounded-xl",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  waiting: boolean;
  reduced: boolean;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className="absolute" style={rectStyle(rect)}>
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
            ? // A bare `border` with no colour resolves to `currentColor`, and
              // this page's text is near-white — which is how a sibling section
              // grew a white outline the theme never asked for. Callers set
              // `borderColor` only in their emphatic states, so the calm state
              // needs a themed floor here rather than at each call site.
              { ...style, borderColor: style?.borderColor ?? tint("cyan", 18) }
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
      initial={reduced ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i, lead) }}
    >
      {children}
    </motion.span>
  );
}

/**
 * The name of one of the three stages, in whichever place this field has room
 * for it: a reserved legend column beside the band on a wide field, or inline
 * above the band on a narrow one. Naming all three at once is what makes the
 * scene a FLOW rather than three unrelated rows, so the placement is a layout
 * decision and never a per-component one.
 */
export function BandLabel({
  layout,
  show,
  y,
  i = 0,
  reduced,
  children,
}: {
  layout: FieldLayout;
  show: boolean;
  y: number;
  i?: number;
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <Part
      show={show}
      i={i}
      reduced={reduced}
      className={`absolute block leading-snug ${ANNOTATION_DIM}`}
      style={
        layout.legendX === null
          ? { left: `${layout.band.x}%`, top: `${y}%` }
          : { left: `${layout.legendX}%`, top: `${y}%`, width: `${layout.legendW}%` }
      }
    >
      {children}
    </Part>
  );
}
