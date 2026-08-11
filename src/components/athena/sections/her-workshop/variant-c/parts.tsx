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
 * `Skin` is the important one: a box MOUNTED FOR THE WHOLE LOOP wearing two
 * faces — a dashed outline and the real panel — crossfading against each other
 * in place. Nothing ever appears or disappears, so nothing in the yard can
 * shove the line, and the outline that held a place is the same rect the place
 * ends up occupying. In this section that matters twice over: the work above
 * the line is made of the SAME atom and simply never receives `solid`, so "she
 * may not start this" is argued with the identical object every other panel is
 * made of, held one stage back.
 *
 * `Slot` places a skin in the field's percent space; `Cell` fills whatever
 * flex box its parent gives it, which is how the room inside a place you
 * opened is drawn without a second coordinate system.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a module is at, framer decides the cascade within it, and every
 * cascade finishes well inside one 900ms tick.
 *
 * `BREATH` is the closing beat's atom. Once the yard is finished the boundary
 * is the only thing in the frame still moving, and it moves on this — slow
 * enough to read as calm rather than as a pulse.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. Colour has to
 *  travel this way rather than through framer: every colour in this scene is a
 *  `color-mix()`, and framer cannot interpolate one. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

/** One slow shared cycle for the closing stillness. */
export const BREATH = { duration: 4.4, repeat: Infinity, ease: "easeInOut" } as const;

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

interface SkinProps {
  /** Morphs the outline into the real panel. */
  solid: boolean;
  /** Whether the outline should be visible at all yet. */
  waiting: boolean;
  reduced: boolean;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function Skin({
  solid,
  waiting,
  reduced,
  round = "rounded-xl",
  className = "",
  style,
  children,
}: SkinProps) {
  return (
    <>
      <motion.span
        className={`pointer-events-none absolute inset-0 border border-dashed ${round}`}
        style={{ borderColor: tint("cyan", 18), backgroundColor: tint("cyan", 3) }}
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
              { ...style, borderColor: style?.borderColor ?? tint("cyan", 20) }
            : BARE
        }
      >
        {solid && children}
      </div>
    </>
  );
}

/** A box placed in the field's percent space. */
export function Slot({ rect, ...skin }: SkinProps & { rect: Rect }) {
  return (
    <div className="absolute" style={rectStyle(rect)}>
      <Skin {...skin} />
    </div>
  );
}

/** A box that takes whatever room its flex parent gives it. */
export function Cell(skin: SkinProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <Skin {...skin} />
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
 *  thing here, on a piece of work and on a whole place alike. */
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
