"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { stepDelay } from "../stages";

/**
 * The atoms of an INTRA-stage cascade, and of the commit beats.
 *
 * The tick clock (`../data`) decides which stage a module is in. These decide
 * the order its parts arrive inside that stage, so a stage is a cascade rather
 * than a block — every delay stays well under one tick (900ms), which is why
 * layering the whole scene cost the grid nothing.
 *
 * A part MOUNTS when its stage opens: modules are written so that mounting can
 * never move what is already there (columns fill top-down, fixed-width cells
 * and reserved rows hold their space), which keeps the frozen rect geometry —
 * and therefore the corner brackets — pixel-true throughout.
 *
 * Reduced motion collapses all of it: no initial state, no delay, no repeat.
 */

const RISE = { opacity: 0, y: 5 } as const;
const SETTLED = { opacity: 1, y: 0 } as const;

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
      initial={reduced ? false : RISE}
      animate={SETTLED}
      transition={reduced ? { duration: 0 } : { ...SPRING_POP, delay: stepDelay(i, lead) }}
    >
      {children}
    </motion.span>
  );
}

/** A check that DRAWS itself instead of popping — the signature of a commit
 *  beat here, on the template card and on the closing button alike. */
export function DrawCheck({
  reduced,
  className = "h-3.5 w-3.5",
  delay = 0.18,
}: {
  reduced: boolean;
  className?: string;
  delay?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
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

/** An accent sweep across a panel the instant a choice lands on it. Mounts
 *  with the commit and plays once; the loop's rewind re-arms it. */
export function Sheen({ on, reduced, delay = 0 }: { on: boolean; reduced: boolean; delay?: number }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12"
      style={{ background: `linear-gradient(90deg, transparent, ${tint("cyan", 26)}, transparent)` }}
      initial={{ x: "0%", opacity: 0 }}
      animate={{ x: "440%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: 0.85, delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

/** One bright beat washing over a row — "this just happened". */
export function Flash({ on, reduced }: { on: boolean; reduced: boolean }) {
  if (!on || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{ backgroundColor: tint("cyan", 24) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.1, times: [0, 0.22, 1], ease: "easeOut" }}
      aria-hidden="true"
    />
  );
}

/** The handshake mid-flight: an arc that spins until the tool answers. */
export function Spinner({ reduced, className = "h-3.5 w-3.5" }: { reduced: boolean; className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 0.9, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.35" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
