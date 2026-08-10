"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, brandShadow, tint } from "@/lib/brand-theme";
import { SPRING_POP } from "@/components/athena/stage/athena-tokens";
import type { Rect } from "./layout";

/**
 * The two things that sit ON TOP of the desk rather than in it: the brackets
 * that snap onto whatever she is working, and the rail in the window footer
 * that fills as each beat of the arc actually happens.
 *
 * Neither ever dims or blocks the rest of the UI — the app stays fully visible
 * and fully lit while she works one part of it.
 */

const CORNERS = [
  "-top-3 -left-3 border-t-2 border-l-2 rounded-tl",
  "-top-3 -right-3 border-t-2 border-r-2 rounded-tr",
  "-bottom-3 -left-3 border-b-2 border-l-2 rounded-bl",
  "-bottom-3 -right-3 border-b-2 border-r-2 rounded-br",
] as const;

/** Soft glowing ring + four crisp corner brackets snapping onto a target.
 *  Key the element by stop id so the snap replays at every stop. */
export function LockBrackets({ rect, reduced }: { rect: Rect; reduced: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
      initial={reduced ? false : { opacity: 0, scale: 1.18 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : SPRING_POP}
      aria-hidden="true"
    >
      <div
        className="absolute -inset-2 rounded-2xl border"
        style={{ borderColor: tint("cyan", 45), boxShadow: brandShadow("cyan", 28, 26) }}
      />
      {CORNERS.map((pos) => (
        <span
          key={pos}
          className={`absolute h-4 w-4 ${pos}`}
          style={{ borderColor: BRAND_VAR.cyan, filter: `drop-shadow(0 0 4px ${tint("cyan", 60)})` }}
        />
      ))}
    </motion.div>
  );
}

/** Segmented rail — one segment per beat of the arc, filling only when that
 *  beat has actually committed. (CSS transitions, not framer springs —
 *  color-mix values do not tween.) */
export function ProgressRail({ rail, reduced }: { rail: boolean[]; reduced: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
      {rail.map((filled, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${reduced ? "" : "transition-all duration-500"}`}
          style={{
            backgroundColor: filled ? BRAND_VAR.cyan : tint("cyan", 12),
            boxShadow: filled ? brandShadow("cyan", 10, 45) : undefined,
          }}
        />
      ))}
    </div>
  );
}
