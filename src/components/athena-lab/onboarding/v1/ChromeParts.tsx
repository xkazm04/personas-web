"use client";

import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";

/** Rim light: the window catches the stage's key light along its top edge,
 *  which is what lifts it off the void instead of sitting on it. */
export function RimLight() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-x-[10%] top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 70)}, transparent)` }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-x-[20%] -top-16 h-32 rounded-full blur-3xl"
        style={{ backgroundColor: tint("cyan", 7) }}
        aria-hidden="true"
      />
    </>
  );
}

/** A frame seam that DRAWS itself instead of being there — the window
 *  assembling around the workspace at the top of each loop. */
export function Seam({
  boot,
  reduced,
  axis,
  className,
}: {
  boot: number;
  reduced: boolean;
  axis: "x" | "y";
  className: string;
}) {
  return (
    <motion.span
      key={boot}
      className={`pointer-events-none absolute ${axis === "x" ? "origin-left" : "origin-top"} ${className}`}
      style={{ backgroundColor: "var(--border-glass)" }}
      initial={reduced ? false : { scaleX: axis === "x" ? 0 : 1, scaleY: axis === "y" ? 0 : 1 }}
      animate={{ scaleX: 1, scaleY: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.65, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
