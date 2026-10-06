"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";

/**
 * The section's marks — the lines it joins things with, and the one accent it
 * closes on. Kept beside `./parts` rather than inside it because these two are
 * a different kind of atom: `./parts` builds SURFACES, this file builds INK.
 *
 * `Rule` is why there is no SVG thread layer in this section. Every line in
 * the frame — the hairline from a kept thing back up to the day it came out
 * of, the rail the one recalled thing travels along, the boundaries between
 * days — is a percent-placed box that GROWS from one end on the compositor. A
 * scene whose claim is "this came from that day, and you can still see which"
 * should not draw its joins inside a viewBox that stretches its own strokes.
 */

/**
 * A line that draws itself from one end. `origin` is the end it grows from, so
 * a source hairline can climb from the shelf back up toward the talk it came
 * out of — the join is made in the direction the claim runs.
 */
export function Rule({
  origin,
  drawn,
  reduced,
  delay = 0,
  duration = 0.55,
  center = false,
  className = "",
  color,
  left,
  top,
  width,
  height,
}: {
  origin: "left" | "top" | "bottom";
  drawn: boolean;
  reduced: boolean;
  delay?: number;
  duration?: number;
  /** Sit the line ON its coordinate rather than to the right of it. */
  center?: boolean;
  /** Extra classes — the recall route passes a scoped colour transition here,
   *  because its ink cools once it has arrived and framer must never be the
   *  thing tweening a `color-mix()`. */
  className?: string;
  color: string;
  left: string;
  top: string;
  width: string;
  height: string;
}) {
  const grow = origin === "left" ? { scaleX: drawn ? 1 : 0 } : { scaleY: drawn ? 1 : 0 };
  const rest = origin === "left" ? { scaleX: 0 } : { scaleY: 0 };
  return (
    <motion.span
      className={`pointer-events-none absolute ${className}`}
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: color,
        transformOrigin:
          origin === "left" ? "left center" : origin === "top" ? "center top" : "center bottom",
        x: center ? "-50%" : 0,
      }}
      initial={reduced ? false : rest}
      animate={grow}
      transition={reduced ? { duration: 0 } : { duration, ease: "easeOut", delay: drawn ? delay : 0 }}
      aria-hidden="true"
    />
  );
}

/**
 * The closing beat. Mounts for a single tick and washes the panel it is inside
 * with one shared accent — the shelf, every kept thing and every written
 * account get the identical element at the identical instant, which is the
 * whole point: separate surfaces, one thing moving them.
 */
export function Wash({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ backgroundColor: tint("cyan", 26) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0] }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      aria-hidden="true"
    />
  );
}

/**
 * A single quick bloom. One tick wide and small on purpose: her night is
 * cheap, and a scene that spent a long luxurious animation on it would be
 * telling the opposite of the truth.
 */
export function Bloom({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute -inset-3 rounded-full blur-md"
      style={{ backgroundColor: tint("cyan", 40) }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 2.1] }}
      transition={{ duration: 0.75, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
