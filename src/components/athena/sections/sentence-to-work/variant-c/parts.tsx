"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, stepDelay, type ModuleStage } from "@/components/athena/stage/stages";
import type { Rect } from "./layout";

/**
 * The atoms this field composes from: the box that morphs out of its own
 * ghost, and the small cascade pieces that fill it.
 *
 * The tick clock (`./data`) decides only which STAGE a block is in. The order
 * its pieces arrive inside that stage is framer's job, and every delay lands
 * well inside one 900ms tick — a stage reads as one gesture, never as a queue
 * the next beat has to wait for.
 *
 * A block's box is mounted for the entire loop. Ghost and glass are two skins
 * on ONE element, crossfading, so the placeholder visibly BECOMES the panel
 * rather than being swapped for it, and nothing on the field can ever move.
 * Everything the blocks contain is written so that mounting cannot shift what
 * is already there: columns fill top-down and rows hold their own height.
 */

const RISE = { opacity: 0, y: 5 } as const;
const SETTLED = { opacity: 1, y: 0 } as const;

/** Skin tweens ride a scoped CSS transition, never `transition-all` — the
 *  pieces composing inside own their own motion and must not fight it. */
const SKIN = "duration-700 transition-[background-color,border-color,opacity]";

/** Before its shell opens, a block wears no glass at all: the dashed ghost is
 *  the only thing standing in its rect. */
const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/**
 * A block of the field in its rect. `dim` quiets a block without removing it —
 * the panel holding your words stays on the field all night, just no longer
 * the thing being looked at.
 */
export function FieldBlock({
  rect,
  stage,
  reduced,
  dim = false,
  accent = false,
  className = "",
  children,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
  dim?: boolean;
  accent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const solid = atStage(stage, "shell");
  return (
    <div
      className={`absolute overflow-hidden rounded-2xl border border-glass bg-surface/45 backdrop-blur-sm ${SKIN} ${className}`}
      style={{
        ...rectStyle(rect),
        opacity: dim ? 0.55 : 1,
        ...(accent ? { borderColor: tint("cyan", 42), backgroundColor: tint("cyan", 7) } : null),
        ...(solid ? null : BARE),
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed"
        style={{ borderColor: tint("cyan", 14), backgroundColor: tint("cyan", 2) }}
        initial={false}
        animate={{ opacity: solid ? 0 : 1 }}
        transition={{ duration: reduced ? 0 : 0.6 }}
        aria-hidden="true"
      />
      {solid && children}
    </div>
  );
}

/** One piece of a stage: `i` is its place in the queue, `lead` offsets a whole
 *  group that trails the structure it shares a tick with. */
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

/** A check that DRAWS itself instead of popping — the signature of every
 *  commit beat in this field: your go, and each light settling. */
export function DrawCheck({
  reduced,
  className = "h-4 w-4",
  delay = 0.16,
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

/** An accent sweep across a block the instant something lands on it. Mounts
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
