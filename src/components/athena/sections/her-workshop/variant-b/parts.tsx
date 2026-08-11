"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The SURFACES this scene is assembled from. Its wiring lives next door in
 * `./ink`, which is a different kind of atom and a different argument.
 *
 * `Slot` is the shared one: a percent-placed box MOUNTED FOR THE WHOLE LOOP
 * that wears two skins — a dashed waiting outline and the real bench —
 * crossfading against each other. The box never appears or disappears, so a
 * bench solidifying can never move the cable already run to it, and the shop
 * floor's footprint is holding its shape before a single bench is up.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a bench is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 *
 * One hard rule runs through every file in this variant: framer cannot
 * interpolate `color-mix()`, and `tint()` returns exactly that. Colour changes
 * therefore ride SCOPED CSS transitions (`SKIN`), and framer is left with
 * transforms and opacity.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
export const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

/** What a lane's fill and a dial's ink move on: long enough to read as work
 *  progressing rather than as a value being set. */
export const CREEP_MS = 900;

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * A box in the field. `solid` morphs the waiting outline into the real bench;
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

/** A check that DRAWS itself instead of popping — the signature of a finished
 *  thing here, on a lane and on a standing order alike. */
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

/** A single quick bloom on the thing that just happened. One tick wide: a beat
 *  on this floor is a moment, not an event with a ceremony. */
export function Flare({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute -inset-2 rounded-full blur-md"
      style={{ backgroundColor: tint("cyan", 40) }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.5, 2] }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
