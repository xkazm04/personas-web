"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION, ANNOTATION_DIM, REPLAY, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import { CALLOUTS } from "./data";
import { STAGE_W, STAGE_H, CALLOUT_GEOMETRY } from "./presence-geometry";

/**
 * Blueprint annotation layer — four benefit callouts around the orb, each
 * tied by a thin SVG leader line to the part of the being that delivers
 * it. Leader lines draw in (pathLength) and labels pop with the
 * shared spring + a slight settle-rotation, staggered; everything replays
 * on scroll re-entry (shared REPLAY config).
 *
 * Type floor: nothing here renders below text-base (page-wide directive),
 * so the labels ride the ANNOTATION / ANNOTATION_DIM tokens unmodified and
 * the geometry hands each one a ~180px column to wrap inside. That column
 * only exists from lg up — below lg the schematic collapses: no leader
 * lines, callouts stack under the orb as tick-marked rows (<CalloutList />).
 */

export function CalloutOverlay() {
  const reduced = useReducedMotion() ?? false;
  const cyan = BRAND_VAR.cyan;

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
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
            className={`absolute -translate-y-1/2 break-words ${g.side === "left" ? "text-right" : "text-left"}`}
            style={g.labelStyle}
            initial={reduced ? false : { opacity: 0, scale: 0.85, rotate: g.side === "left" ? -3 : 3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={REPLAY}
            transition={{ ...SPRING_POP, delay: 0.62 + i * 0.16 }}
          >
            <span className={`block ${ANNOTATION_DIM}`}>{c.label}</span>
            <span className={`mt-1 block ${ANNOTATION} normal-case tracking-normal`}>{c.fact}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Below-lg collapse — the same facts as tick-marked rows under the orb.
 *  Label and fact stack rather than sharing a line: at the text-base floor
 *  a single row cannot hold both at 375px without wrapping mid-phrase. */
export function CalloutList({ ariaLabel }: { ariaLabel: string }) {
  const reduced = useReducedMotion() ?? false;

  return (
    <ul aria-label={ariaLabel} className="mx-auto mt-6 grid w-full max-w-md grid-cols-1 gap-4 px-6 lg:hidden">
      {CALLOUTS.map((c, i) => (
        <motion.li
          key={c.id}
          className="flex items-start gap-3"
          initial={reduced ? false : { opacity: 0, x: -10, rotate: -2 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={REPLAY}
          transition={{ ...SPRING_POP, delay: 0.2 + i * 0.12 }}
        >
          <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0" style={{ background: tint("cyan", 40) }} />
          <span className="min-w-0 break-words">
            <span className={`block ${ANNOTATION_DIM}`}>{c.label}</span>
            <span className={`mt-1 block ${ANNOTATION} normal-case tracking-normal`}>{c.fact}</span>
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
