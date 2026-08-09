"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND_VAR, STATE_COLORS, brandShadow, tint } from "@/lib/brand-theme";
import {
  ANNOTATION,
  ANNOTATION_DIM,
  PANEL,
  REPLAY,
  SPRING_POP,
} from "@/components/athena/stage/athena-tokens";
import { COPY, MIGRATIONS } from "./data";
import { DESTS, TL } from "./ledger-geometry";

/**
 * The right column — where migrated content lands, per the doctrine's own
 * table: the small orb (its state glow absorbs the footer popover, and it
 * pulses once when the fleet toast arrives), the calm chat panel (gains a
 * durable ledger row), and the clicked surface itself (the failure renders
 * in place, under the button that caused it).
 *
 * Reduced motion gates `animate`/`whileInView` — the final composed state
 * renders statically: glow on, ledger row present, in-place error visible.
 */

/** Shared "reaction pops in when its migration lands" motion props. */
function landPop(reduced: boolean, delay: number) {
  return reduced
    ? {}
    : {
        initial: { opacity: 0, scale: 0.7, rotate: -3 },
        whileInView: { opacity: 1, scale: 1, rotate: 0 },
        viewport: REPLAY,
        transition: { ...SPRING_POP, delay },
      };
}

export default function Destinations() {
  const reduced = useReducedMotion() ?? false;
  const uid = useId();
  const cyan = BRAND_VAR.cyan;

  const at = (p: { x: number; y: number }) => ({
    left: `${p.x}%`,
    top: `${p.y}%`,
    x: "-50%",
    y: "-50%",
  });

  return (
    <>
      {/* Orb — footer popover became state glow; fleet toast adds a pulse */}
      <div className="absolute" style={at(DESTS.orb)}>
        <svg viewBox="0 0 160 160" className="h-[120px] w-[120px]" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-orbGlow`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={cyan} stopOpacity="0.5" />
              <stop offset="100%" stopColor={cyan} stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="80" cy="80" r="66"
            fill={`url(#${uid}-orbGlow)`}
            opacity={reduced ? 1 : undefined}
            initial={reduced ? false : { opacity: 0.25, scale: 0.9 }}
            whileInView={reduced ? undefined : { opacity: [0.25, 1, 0.85], scale: [0.9, 1.12, 1] }}
            viewport={REPLAY}
            transition={{ duration: 0.9, ease: "easeOut", delay: TL.land(0) }}
            style={{ transformBox: "view-box", transformOrigin: "80px 80px" }}
          />
          {/* One-shot pulse ring when the fleet toast arrives */}
          <motion.circle
            cx="80" cy="80" r="34"
            fill="none" stroke={cyan} strokeWidth="1.5"
            opacity={reduced ? 0 : undefined}
            initial={reduced ? false : { opacity: 0, scale: 1 }}
            whileInView={reduced ? undefined : { opacity: [0, 0.8, 0], scale: [1, 1.7, 1.9] }}
            viewport={REPLAY}
            transition={{ duration: 1.1, ease: "easeOut", delay: TL.land(1) }}
            style={{ transformBox: "view-box", transformOrigin: "80px 80px" }}
          />
          <circle
            cx="80" cy="80" r="26"
            fill={tint("cyan", 24)}
            stroke={tint("cyan", 60)}
            strokeWidth="1.5"
          />
        </svg>
        <motion.p
          {...landPop(reduced, TL.land(0) + 0.15)}
          className={`${ANNOTATION_DIM} -mt-2 text-center text-[10px]`}
        >
          {COPY.orbLabel} · {COPY.orbState}
        </motion.p>
      </div>

      {/* Chat panel — calm, plus the durable ledger row the fleet toast became */}
      <div className={`absolute w-[250px] max-w-[26%] ${PANEL} px-4 py-3`} style={at(DESTS.chat)}>
        <p className={`${ANNOTATION_DIM} text-[10px]`}>{COPY.chatTitle}</p>
        <p className="mt-2 text-xs leading-snug text-foreground/70">{COPY.chatIdle}</p>
        <motion.p
          {...landPop(reduced, TL.land(1) + 0.12)}
          className={`${ANNOTATION} mt-3 border-t border-glass pt-2 normal-case tracking-normal text-[11px]`}
        >
          {MIGRATIONS[1].landing}
        </motion.p>
      </div>

      {/* The clicked surface — the failure renders in place, under the button */}
      <div className={`absolute w-[220px] max-w-[24%] ${PANEL} px-4 py-3`} style={at(DESTS.tile)}>
        <span
          className="inline-block rounded-lg border border-glass px-3 py-1.5 text-xs font-semibold text-foreground"
          style={{ boxShadow: brandShadow("cyan", 16, 12) }}
        >
          {COPY.tileButton}
        </span>
        <motion.p
          {...landPop(reduced, TL.land(2) + 0.12)}
          className="mt-2 font-mono text-[11px]"
          style={{ color: STATE_COLORS.error }}
        >
          {MIGRATIONS[2].landing}
        </motion.p>
      </div>
    </>
  );
}
