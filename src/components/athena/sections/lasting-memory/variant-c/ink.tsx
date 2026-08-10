"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";

/**
 * The section's marks — the lines it measures with, and the one accent it
 * closes on. Kept beside `./parts` rather than inside it because these two are
 * a different kind of atom: `./parts` builds SURFACES, this file builds INK.
 *
 * `Rule` is why there is no SVG thread layer in this section. Every line in
 * the frame — marker stems, bracket spans, bracket caps — is a percent-placed
 * box that GROWS from one end on the compositor. A scene whose whole claim is
 * "these two lengths are equal" cannot afford to draw its measurements inside
 * a viewBox that stretches its own strokes.
 */

/**
 * A line that draws itself from one end. `origin` is the end it grows from, so
 * a bracket's caps can rise back toward the seam while its span runs left to
 * right — the bracket closes around the reading rather than being stamped on
 * top of it.
 */
export function Rule({
  origin,
  drawn,
  reduced,
  delay = 0,
  centerX = false,
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
  /** Sit the line ON its coordinate rather than to the right of it. */
  centerX?: boolean;
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
      className="pointer-events-none absolute"
      style={{
        left,
        top,
        width,
        height,
        backgroundColor: color,
        transformOrigin:
          origin === "left" ? "left center" : origin === "top" ? "center top" : "center bottom",
        x: centerX ? "-50%" : 0,
      }}
      initial={reduced ? false : rest}
      animate={grow}
      transition={
        reduced ? { duration: 0 } : { duration: 0.55, ease: "easeOut", delay: drawn ? delay : 0 }
      }
      aria-hidden="true"
    />
  );
}

/**
 * The closing beat. Mounts for a single tick and washes the panel it is inside
 * with one shared accent — the seam and both accounts get the identical
 * element at the identical instant, which is the whole point: separate
 * surfaces, one thing moving them.
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
