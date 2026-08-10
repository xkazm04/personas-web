"use client";

import { type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { brandShadow, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import type { Point, Rect } from "../layout";

/**
 * The shell every module sits in: percent placement, the skeleton that holds
 * a module's rect before its moment, the spring-in that fills that rect, and
 * the target panel that glows while the brackets are locked on it.
 *
 * Reserving the rect is what keeps the build-as-you-go story composed rather
 * than sparse — and because every module is absolutely positioned from the
 * same percent rect, a reveal can never move anything else on the canvas.
 */

export const rectStyle = (r: Rect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`,
});

/** A module's reserved space before it exists: a dashed, wordless outline at
 *  the exact rect its real content will materialize into. */
export function GhostPanel({ rect, className = "" }: { rect: Rect; className?: string }) {
  return (
    <span
      className={`absolute rounded-xl border border-dashed ${className}`}
      style={{
        ...rectStyle(rect),
        borderColor: tint("cyan", 16),
        backgroundColor: tint("cyan", 3),
      }}
      aria-hidden="true"
    />
  );
}

/**
 * A module in its rect: the skeleton until `shown`, then the real content
 * springing in with a slight settle rotation. Pass `ghost={false}` for
 * modules that live inside another module's reserved rect (the connector
 * rows), so the canvas never draws a skeleton inside a skeleton.
 */
export function ModuleReveal({
  rect,
  shown,
  reduced,
  ghost = true,
  className = "",
  ghostClassName = "",
  style,
  children,
}: {
  rect: Rect;
  shown: boolean;
  reduced: boolean;
  ghost?: boolean;
  className?: string;
  ghostClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (!shown) {
    return ghost ? <GhostPanel rect={rect} className={ghostClassName} /> : null;
  }
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{ ...rectStyle(rect), ...style }}
      initial={reduced ? false : { opacity: 0, scale: 0.94, rotate: -0.8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
    >
      {children}
    </motion.div>
  );
}

/**
 * A setup target: it glows while the brackets are locked on it, and keeps a
 * quieter accent for the rest of the loop if the choice made there selected
 * it. The rest of the UI is never dimmed or blocked.
 *
 * Colors tween through a scoped CSS transition, never `transition-all` — the
 * reveal owns this element's transform and the two must not fight.
 */
export function TargetPanel({
  rect,
  shown,
  locked,
  selected = false,
  reduced,
  ghost = true,
  className = "",
  children,
}: {
  rect: Rect;
  shown: boolean;
  locked: boolean;
  selected?: boolean;
  reduced: boolean;
  ghost?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ModuleReveal
      rect={rect}
      shown={shown}
      reduced={reduced}
      ghost={ghost}
      className={`flex overflow-hidden rounded-xl border duration-500 transition-[background-color,border-color,box-shadow] ${
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
 *  arrives with the module it names — a label standing over a skeleton would
 *  be a word on the canvas before its moment. */
export function SectionLabel({
  at,
  w,
  text,
  hint,
  shown,
  reduced,
}: {
  at: Point;
  w: number;
  text: string;
  hint?: string;
  shown: boolean;
  reduced: boolean;
}) {
  if (!shown) return null;
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
        <span className="ml-auto hidden truncate text-base text-muted-dark sm:block">{hint}</span>
      )}
    </motion.div>
  );
}
