"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import type { FieldLayout } from "./layout";

/**
 * The one line in this scene that goes somewhere, and the fact that it does
 * not arrive.
 *
 * There are deliberately no other threads here. A sibling section already
 * argues in a fan of them, and repeating that vocabulary would turn this scene
 * into a second demonstration of how much she can set going. So the only
 * stroke that travels between two things is this one: her, reaching for a
 * piece of work that is not in the yard — and it draws to the boundary and
 * stops there, mid-gesture, with clear empty space between its end and the
 * thing it was reaching for. Nothing crosses. Nothing is refused on screen
 * either; there is no cross, no bar, no lock. She simply stops, and the line
 * she stopped at brightens where she touched it.
 *
 * The curve lives in the field's percent space with no aspect lock, which
 * stretches its stroke slightly on the vertical runs — on a hand-drawn-feeling
 * arc that reads as ink, which is why the fence itself is NOT drawn this way
 * (see ./Fence). The mark it ends at is HTML for the same reason: it sits on
 * the boundary, and anything sitting on that line has to be exact.
 */

export default function Reach({
  layout,
  reaching,
  stopped,
  reduced,
}: {
  layout: FieldLayout;
  reaching: boolean;
  stopped: boolean;
  reduced: boolean;
}) {
  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d={layout.reach}
          fill="none"
          stroke={tint("cyan", 52)}
          strokeWidth={0.3}
          strokeLinecap="round"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: reaching ? 1 : 0, opacity: stopped ? 0.6 : 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { pathLength: { duration: 0.7, ease: "easeOut" }, opacity: { duration: 0.6 } }
          }
        />

        {/* The gesture itself, once — it dies at the boundary and is not repeated */}
        {reaching && !stopped && !reduced && (
          <motion.path
            d={layout.reach}
            fill="none"
            stroke={BRAND_VAR.cyan}
            strokeWidth={0.7}
            strokeLinecap="round"
            initial={{ pathLength: 0.2, pathOffset: 0, opacity: 0 }}
            animate={{ pathLength: 0.2, pathOffset: [0, 0.8], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        )}
      </svg>

      {/* Where she touched it, the line firms up — and stays that way */}
      <motion.span
        className="pointer-events-none absolute h-[2.5px] w-24 -translate-x-1/2 -translate-y-1/2 rounded-full sm:w-32"
        style={{
          left: `${layout.stop.x}%`,
          top: `${layout.stop.y}%`,
          background: `linear-gradient(90deg, transparent, ${BRAND_VAR.cyan}, transparent)`,
        }}
        initial={false}
        animate={{ opacity: stopped ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        aria-hidden="true"
      />

      {/* The mark left on the boundary */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${layout.stop.x}%`, top: `${layout.stop.y}%` }}
        aria-hidden="true"
      >
        {stopped && !reduced && (
          <motion.span
            className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: tint("cyan", 40) }}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}
        <motion.span
          className="block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: BRAND_VAR.cyan, boxShadow: brandShadow("cyan", 10, 70) }}
          initial={false}
          animate={{ opacity: stopped ? 1 : 0, scale: stopped ? 1 : 0.3 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </>
  );
}
