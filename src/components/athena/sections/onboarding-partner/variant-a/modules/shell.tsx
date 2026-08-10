"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { atStage, type ModuleStage } from "../stages";
import type { Point, Rect } from "../layout";

/**
 * The shell every module composes inside: percent placement, the ghost that
 * holds a module's rect, and the moment that ghost SOLIDIFIES into the panel.
 *
 * The box is mounted for the whole loop — ghost and panel are two skins on ONE
 * element, crossfading — so the ghost visibly BECOMES the panel instead of
 * being replaced by it, and a reveal can never move anything on the canvas.
 * Everything inside then composes stage by stage (see `./parts`).
 */

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** Skin tweens ride a scoped CSS transition, never `transition-all` — the
 *  parts composing inside own their own motion and must not fight it. */
const SKIN = "duration-500 transition-[background-color,border-color,box-shadow]";

/** Before `shell`, the box wears no panel skin at all: the dashed ghost
 *  overlay is the only thing visible in the rect. */
const BARE: CSSProperties = {
  borderColor: "transparent",
  backgroundColor: "transparent",
  boxShadow: "none",
};

/**
 * A module in its rect. `from` is the stage at which its frame solidifies —
 * `shell` for panels, `body` for rows that live inside another module's panel
 * and should arrive with the content cascade rather than with the frame.
 * `lead` staggers sibling frames (connector rows building one after another).
 */
export function ModuleReveal({
  rect,
  stage,
  reduced,
  from = "shell",
  ghost = true,
  lead = 0,
  className = "",
  style,
  children,
}: {
  rect: Rect;
  stage: ModuleStage;
  reduced: boolean;
  from?: ModuleStage;
  ghost?: boolean;
  lead?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const solid = atStage(stage, from);
  return (
    <div
      className={`absolute ${SKIN} ${className}`}
      style={{
        ...rectStyle(rect),
        transitionDelay: reduced ? "0ms" : `${Math.round(lead * 1000)}ms`,
        ...style,
        ...(solid ? null : BARE),
      }}
    >
      {ghost && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl border border-dashed"
          style={{ borderColor: tint("cyan", 16), backgroundColor: tint("cyan", 3) }}
          initial={false}
          animate={{ opacity: solid ? 0 : 1 }}
          transition={{ duration: reduced ? 0 : 0.55, delay: reduced ? 0 : lead }}
          aria-hidden="true"
        />
      )}
      {solid && children}
    </div>
  );
}

/**
 * A setup target: it glows while the brackets are locked on it, and keeps a
 * quieter accent for the rest of the loop if the choice made there selected
 * it. The rest of the UI is never dimmed or blocked.
 */
export function TargetPanel({
  rect,
  stage,
  locked,
  selected = false,
  reduced,
  from,
  ghost = true,
  lead = 0,
  className = "",
  children,
}: {
  rect: Rect;
  stage: ModuleStage;
  locked: boolean;
  selected?: boolean;
  reduced: boolean;
  from?: ModuleStage;
  ghost?: boolean;
  lead?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ModuleReveal
      rect={rect}
      stage={stage}
      reduced={reduced}
      from={from}
      ghost={ghost}
      lead={lead}
      className={`flex overflow-hidden rounded-xl border ${
        locked || selected ? "border-glass-hover" : "border-glass"
      } ${className}`}
      style={{
        borderColor: selected ? tint("cyan", 50) : undefined,
        backgroundColor: locked ? tint("cyan", 8) : selected ? tint("cyan", 4) : undefined,
        boxShadow: locked
          ? brandShadow("cyan", 22, 24)
          : selected
            ? brandShadow("cyan", 14, 14)
            : undefined,
      }}
    >
      {children}
    </ModuleReveal>
  );
}

/** Content header: section name on the left, a live hint on the right. It
 *  arrives with its module's SHELL — the frame and the word that names it are
 *  one gesture, laid down while she is still crossing to the module. */
export function SectionLabel({
  at,
  w,
  text,
  hint,
  show,
  reduced,
}: {
  at: Point;
  w: number;
  text: string;
  hint?: string;
  show: boolean;
  reduced: boolean;
}) {
  if (!show) return null;
  return (
    <motion.div
      className="absolute flex items-baseline gap-2"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${w}%` }}
      initial={reduced ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
    >
      <span className={`${ANNOTATION_DIM} normal-case`}>{text}</span>
      {hint && (
        <motion.span
          className="ml-auto hidden truncate text-base text-muted-dark sm:block"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { duration: 0.4, delay: 0.22 }}
        >
          {hint}
        </motion.span>
      )}
    </motion.div>
  );
}
