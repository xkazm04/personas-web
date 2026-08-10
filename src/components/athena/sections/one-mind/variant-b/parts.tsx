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
 * panel — crossfading against each other. The box never appears or
 * disappears, so a conversation solidifying can never move the port its line
 * is attached to, which is the whole reason a line drawn eighteen seconds
 * later still lands on the right words.
 *
 * `Part` owns the order things arrive INSIDE a stage: the tick clock decides
 * which stage a conversation is at, framer decides the cascade within it, and
 * every cascade finishes well inside one 900ms tick.
 */

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. Slow, because
 *  a conversation receding into last week should not read as a state change. */
const SKIN = "duration-700 transition-[background-color,border-color,box-shadow,opacity]";

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** A box in the field. `solid` flips the waiting outline into the real thing. */
export function Slot({
  rect,
  solid,
  reduced,
  round = "rounded-2xl",
  className = "",
  style,
  children,
}: {
  rect: Rect;
  solid: boolean;
  reduced: boolean;
  round?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="absolute" style={rectStyle(rect)}>
      <motion.span
        className={`pointer-events-none absolute inset-0 border border-dashed ${round}`}
        style={{ borderColor: tint("cyan", 16), backgroundColor: tint("cyan", 3) }}
        initial={false}
        animate={{ opacity: solid ? 0 : 1 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 border ${round} ${SKIN} ${className}`}
        style={
          solid
            ? // A bare `border` with no colour resolves to `currentColor`, and
              // this page's text is near-white — which is how sibling sections
              // grew white outlines the theme never asked for. Callers set
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

/** An accent sweep the instant something lands. Mounts with the beat and
 *  plays once; the loop's rewind re-arms it. */
export function Sheen({ on, reduced, delay = 0 }: { on: boolean; reduced: boolean; delay?: number }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 22)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

/** The pool of light a conversation sits in. It is the section's clock: full
 *  while you are in it, low once the days have moved on, and equal on all
 *  three at the end — because they were never really apart. */
export function Pool({ rect, level, reduced }: { rect: Rect; level: number; reduced: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute ${reduced ? "" : "transition-opacity duration-1000"}`}
      style={{
        ...rectStyle(rect),
        opacity: level,
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${tint("cyan", 17)}, transparent 72%)`,
      }}
      aria-hidden="true"
    />
  );
}
