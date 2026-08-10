"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The atoms this field is assembled from.
 *
 * `Slot` is the important one: a percent-placed box that is MOUNTED FOR THE
 * WHOLE LOOP and wears two skins — a dashed waiting outline and the real
 * plot — crossfading against each other. The box never appears or
 * disappears, so a plot solidifying can never nudge the field under a camera
 * that is about to fly across it.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a plot is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow,opacity]";

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
  tilt = 0,
  round = "rounded-xl",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  waiting: boolean;
  reduced: boolean;
  tilt?: number;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute"
      style={{ ...rectStyle(rect), transform: tilt ? `rotate(${tilt}deg)` : undefined }}
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

/** A check that DRAWS itself instead of popping — the signature of something
 *  attended to, on a plot and in the opened detail alike. */
export function DrawCheck({
  reduced,
  className = "h-4 w-4",
  delay = 0.12,
}: {
  reduced: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d="M5 12.5 10 17.5 19 7"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.4, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

/** An accent sweep the instant something lands. Mounts with the beat and
 *  plays once; the loop's rewind re-arms it. */
export function Sheen({ on, reduced, delay = 0 }: { on: boolean; reduced: boolean; delay?: number }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 26)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
