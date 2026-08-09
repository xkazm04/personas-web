"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { CALLOUTS } from "./data";
import { STAGE_W, STAGE_H, CALLOUT_GEOMETRY } from "./presence-geometry";

/**
 * Blueprint annotation layer — 3-4 spec-sheet callouts around the orb,
 * each tied by a thin SVG leader line to the exact part of the being it
 * describes. Leader lines draw in (pathLength) and labels pop with the
 * shared spring + a slight settle-rotation, staggered; everything replays
 * on scroll re-entry (shared REPLAY config).
 *
 * Below md the schematic collapses: no leader lines, callouts stack under
 * the orb as tick-marked rows (rendered by <CalloutList />).
 */

export function CalloutOverlay() {
  const reduced = useReducedMotion() ?? false;
  const cyan = BRAND_VAR.cyan;

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block">
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        {CALLOUT_GEOMETRY.map((g, i) => (
          <g key={g.id}>
            <motion.path
              d={g.path}
              fill="none"
              stroke={tint("cyan", 40)}
              strokeWidth="1"
              initial={reduced ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={REPLAY}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 + i * 0.16 }}
            />
            <motion.circle
              cx={g.anchor.x}
              cy={g.anchor.y}
              r={3}
              fill={cyan}
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              whileInView={{ opacity: 0.8, scale: 1 }}
              viewport={REPLAY}
              transition={{ ...SPRING_POP, delay: 0.5 + i * 0.16 }}
              style={{ transformBox: "view-box", transformOrigin: `${g.anchor.x}px ${g.anchor.y}px` }}
            />
          </g>
        ))}
      </svg>

      {CALLOUTS.map((c, i) => {
        const g = CALLOUT_GEOMETRY[i];
        return (
          <motion.div
            key={c.id}
            className={`absolute max-w-[150px] -translate-y-1/2 ${g.side === "left" ? "text-right" : "text-left"}`}
            style={g.labelStyle}
            initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: g.side === "left" ? -3 : 3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={REPLAY}
            transition={{ ...SPRING_POP, delay: 0.62 + i * 0.16 }}
          >
            <span className={`block ${ANNOTATION_DIM} text-[10px]`}>{c.label}</span>
            <span className={`mt-1 block ${ANNOTATION} normal-case tracking-normal`}>{c.fact}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Mobile collapse — the same facts as tick-marked rows under the orb. */
export function CalloutList({ ariaLabel }: { ariaLabel: string }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <ul aria-label={ariaLabel} className="mx-auto mt-6 grid w-full max-w-sm grid-cols-1 gap-3 px-6 md:hidden">
      {CALLOUTS.map((c, i) => (
        <motion.li
          key={c.id}
          className="flex items-baseline gap-3"
          initial={reduced ? false : { opacity: 0, x: -10, rotate: -2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={REPLAY}
          transition={{ ...SPRING_POP, delay: 0.2 + i * 0.12 }}
        >
          <span aria-hidden="true" className="h-px w-4 shrink-0 self-center" style={{ background: tint("cyan", 40) }} />
          <span className={`${ANNOTATION_DIM} text-[10px]`}>{c.label}</span>
          <span className={`${ANNOTATION} normal-case tracking-normal`}>{c.fact}</span>
        </motion.li>
      ))}
    </ul>
  );
}
