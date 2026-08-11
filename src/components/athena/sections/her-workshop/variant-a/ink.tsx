"use client";

import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";

/**
 * The section's LIGHT. Kept beside `./parts` rather than inside it because
 * these are a different kind of atom: `./parts` builds the surfaces that stay,
 * this file builds the things that happen to them and then are gone.
 *
 * `Pass` and `Ping` are one gesture split in two — the band that crosses the
 * wall, and what a screen does as the band goes over it. Their timings are
 * budgeted together against a single 900ms beat: the far column has to be lit
 * before the beat is out, or the pass stops reading as one hand moving and
 * starts reading as a walk down a queue, which is the one thing this section
 * must never look like.
 *
 * Everything here mounts for exactly the beat it belongs to and plays once. The
 * loop's rewind re-arms them, and reduced motion drops them entirely — none of
 * them carries information a still frame needs.
 */

/** Her pass: one band, the full height of the wall, crossing it once. */
export function Pass({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-[14%] w-[14%] blur-sm"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 34)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "814%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.82, ease: "linear" }}
      aria-hidden="true"
    />
  );
}

/** What one screen does as the pass reaches it. `at` is how far across the wall
 *  it sits, so a whole column lights together and the last column is lit well
 *  inside the same beat as the first. */
export function Ping({ on, at, reduced }: { on: boolean; at: number; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ backgroundColor: tint("cyan", 14), boxShadow: brandShadow("cyan", 16, 40) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.4, delay: at * 0.6, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

/** A check that DRAWS itself instead of popping — the signature of a finished
 *  thing here, on a screen and in the announcement alike. */
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

/** The accent sweep the announcement lands on. It wears the job's own colour,
 *  because the thing arriving is that job finishing and nothing else. */
export function Sheen({ on, reduced, delay = 0 }: { on: boolean; reduced: boolean; delay?: number }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("purple", 28)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
