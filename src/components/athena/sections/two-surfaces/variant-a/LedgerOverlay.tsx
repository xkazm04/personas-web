"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tint } from "@/lib/brand-theme";
import {
  ANNOTATION,
  ANNOTATION_DIM,
  REPLAY,
  SPRING_POP,
} from "@/components/athena/stage/athena-tokens";
import { COPY, MIGRATIONS } from "./data";
import { FLIGHTS, STAGE_H, STAGE_W, TL } from "./ledger-geometry";

/**
 * The ledger annotation layer — the hero's leader-line + mono idiom applied
 * to flight paths: a thin bezier traces each surface's migration while it
 * flies, and a changelog-entry label ("footer popover → orb state · deleted")
 * pops at the midpoint. After the last landing, a "deleted by doctrine"
 * stamp settles over the emptied left column.
 *
 * Reduced motion: lines fully drawn, labels visible — the composed ledger.
 * Below md the schematic collapses; <MigrationList /> renders the same
 * entries as tick-marked rows instead.
 */

export function LedgerOverlay() {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {FLIGHTS.map((f, i) => (
          <motion.path
            key={f.id}
            d={f.path}
            fill="none"
            stroke={tint("cyan", 40)}
            strokeWidth="1"
            strokeDasharray="1 4"
            vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
            viewport={REPLAY}
            transition={{ duration: 0.8, ease: "easeOut", delay: TL.draw(i) }}
          />
        ))}
      </svg>

      {/* Changelog-entry labels, one per flight, at the path midpoints */}
      {MIGRATIONS.map((m, i) => (
        <motion.p
          key={m.id}
          className={`absolute max-w-[220px] -translate-x-1/2 text-center ${ANNOTATION_DIM} text-[10px] normal-case tracking-[0.08em]`}
          style={FLIGHTS[i].label}
          initial={reduced ? false : { opacity: 0, scale: 0.8, rotate: i % 2 ? 2 : -2 }}
          whileInView={reduced ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          viewport={REPLAY}
          transition={{ ...SPRING_POP, delay: TL.label(i) }}
        >
          {m.entry}
        </motion.p>
      ))}

      {/* Closing stamp over the emptied noise column */}
      <motion.p
        className={`absolute left-[17%] top-[46%] -translate-x-1/2 -translate-y-1/2 ${ANNOTATION} text-[11px]`}
        initial={reduced ? false : { opacity: 0, scale: 0.7, rotate: -4 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1, rotate: -2 }}
        viewport={REPLAY}
        transition={{ ...SPRING_POP, delay: TL.close }}
      >
        {COPY.deletedStamp}
      </motion.p>
    </div>
  );
}

/** Mobile collapse — the same ledger entries as tick-marked rows. */
export function MigrationList() {
  const reduced = useReducedMotion() ?? false;

  return (
    <ul
      aria-label={COPY.ledgerAria}
      className="mx-auto mt-8 grid w-full max-w-sm grid-cols-1 gap-3 px-6 md:hidden"
    >
      {MIGRATIONS.map((m, i) => (
        <motion.li
          key={m.id}
          className="flex items-baseline gap-3"
          initial={reduced ? false : { opacity: 0, x: -10, rotate: -2 }}
          whileInView={reduced ? undefined : { opacity: 1, x: 0, rotate: 0 }}
          viewport={REPLAY}
          transition={{ ...SPRING_POP, delay: 0.15 + i * 0.12 }}
        >
          <span
            aria-hidden="true"
            className="h-px w-4 shrink-0 self-center"
            style={{ background: tint("cyan", 40) }}
          />
          <span className={`${ANNOTATION} normal-case tracking-normal text-[11px]`}>{m.entry}</span>
        </motion.li>
      ))}
    </ul>
  );
}
