"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "@/components/athena/stage/stages";
import { tint } from "@/lib/brand-theme";

/**
 * The atoms this scene is assembled from.
 *
 * `Drift` is the important one. Percentage transforms resolve against the
 * element's OWN box, so a layer that is exactly the field can carry a child
 * anywhere in the field with a transform and never touch layout — which is the
 * only way a light can be lifted out of the constellation and brought forward
 * without every other light shifting to make room.
 *
 * `Panel` is the second: a box that is MOUNTED FOR THE WHOLE LOOP and wears two
 * skins — a waiting outline and the real surface — crossfading against each
 * other. The report therefore SOLIDIFIES where it always was, instead of being
 * inserted into a field that then has to rearrange itself around it.
 *
 * Every state here names its own `borderColor`. A bare `border` resolves to
 * `currentColor`, which on this page is near-white, and that is how a previous
 * section shipped a white outline the theme never asked for.
 */

/** A field-sized layer whose transform carries whatever is inside it. */
export function Drift({
  dx,
  dy,
  reduced,
  className = "",
  children,
}: {
  dx: number;
  dy: number;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      initial={false}
      animate={{ x: `${dx}%`, y: `${dy}%` }}
      transition={
        reduced ? { duration: 0 } : { type: "spring", stiffness: 42, damping: 15, mass: 1 }
      }
    >
      {children}
    </motion.div>
  );
}

/** One part of a stage: `i` is its place in the queue, `lead` offsets a whole
 *  group. Every cascade finishes well inside one 900ms tick. */
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
 *  that has actually been put right. */
export function DrawCheck({
  reduced,
  className = "h-4 w-4",
  delay = 0.14,
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
        transition={reduced ? { duration: 0 } : { duration: 0.42, delay, ease: "easeOut" }}
      />
    </svg>
  );
}

/** Skin tweens ride a scoped transition, never `transition-all` — the parts
 *  composing inside own their own motion and must not fight it. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/**
 * A percent-placed box that becomes a surface. `waiting` decides whether the
 * outline is visible at all yet — before she has anything to say, an empty
 * frame would give away that a report is coming.
 */
export function Panel({
  rect,
  solid,
  waiting,
  reduced,
  className = "",
  style,
  children,
}: {
  rect: { x: number; y: number; w: number; h: number };
  solid: boolean;
  waiting: boolean;
  reduced: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed"
        style={{ borderColor: tint("cyan", 18), backgroundColor: tint("cyan", 3) }}
        initial={false}
        animate={{ opacity: waiting && !solid ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.45 }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 rounded-2xl border ${SKIN} ${className}`}
        style={solid ? { ...style, borderColor: style?.borderColor ?? tint("cyan", 22) } : BARE}
      >
        {solid && children}
      </div>
    </div>
  );
}

/** One bright pass over a surface the instant something lands on it. Mounts
 *  with the beat and plays once; the loop's rewind re-arms it. */
export function Sheen({ on, reduced, delay = 0 }: { on: boolean; reduced: boolean; delay?: number }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 24)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.9, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
