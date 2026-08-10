"use client";

import { motion } from "framer-motion";
import { type BrandKey, tint } from "@/lib/brand-theme";

/**
 * The two marks a commit beat leaves.
 *
 * Both exist so that "this happened" is a MOMENT rather than a boolean: a
 * check that draws itself the way a hand would, and a single accent sweep
 * across the panel it landed on. They live apart from `./parts` because those
 * are the atoms the scene is BUILT from, and these are the atoms it is
 * PUNCTUATED with — and because both take an accent: in this section the
 * commit is amber, the same colour as the thing being resolved.
 */

/** A check that DRAWS itself instead of popping. */
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

/** An accent sweep across a panel the instant something lands on it. Mounts
 *  with the beat and plays once; the loop's rewind re-arms it. */
export function Sheen({
  on,
  reduced,
  accent = "cyan",
  delay = 0,
}: {
  on: boolean;
  reduced: boolean;
  accent?: BrandKey;
  delay?: number;
}) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint(accent, 26)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}
