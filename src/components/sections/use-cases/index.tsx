"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASES, TOOLS, brandTint } from "./shared/catalog";
import { CHOOSE, CONSIDER, DOCK, NEED, SCAN } from "./shared/cycle";
import CaseStage from "./shared/CaseStage";
import { useCaseCopy } from "./shared/useCaseCopy";
import { useCaseCycle, type Beats } from "./shared/useCaseCycle";
import PersonaHand from "./PersonaHand";
import Reel, { CELL, type ReelState } from "./Reel";
import { PAYLINE_ROW } from "./reels";

const BEATS: Beats = [900, 800, 1900, 900, 1300];
/** Layout in cqw of the art box. */
const HAND_W = 23;
const REELS_X = 25.5;
const GAP = 1.1;
const HEAD = 4.6;
const REEL_W = (100 - REELS_X - GAP * (CASES.length - 1)) / CASES.length;
const PAY_Y = HEAD + PAYLINE_ROW * CELL;

/**
 * One persona, many capabilities - "Slot reels" (winner of the 2026-10-05 landing review). Six reels, one per need, each loaded with the real tools
 * that could answer it. The need lights over its reel, the reel spins through
 * its options and stops with the chosen tool on the payline - which runs
 * straight into the persona's card, where the tool is dealt into its hand.
 * By the last reel the payline reads as the persona's whole toolkit.
 */
export default function UseCases() {
  const still = useStillMotion();
  const copy = useCaseCopy();
  const artRef = useRef<HTMLDivElement>(null);
  const pb = useCaseCycle(artRef, still, BEATS);
  const { phase, active, moving } = pb;

  const stateOf = (i: number): ReelState => {
    if (pb.docked[i]) return "locked";
    if (i !== active) return "waiting";
    if (phase === NEED) return "need";
    if (phase === CONSIDER) return "consider";
    if (phase === SCAN) return "spinning";
    return phase === CHOOSE ? "locked" : "waiting";
  };
  const reelCenter = (i: number) => REELS_X + i * (REEL_W + GAP) + REEL_W / 2;

  return (
    <CaseStage ar={100 / 40} artRef={artRef} pb={pb} copy={copy}>
      {/* payline: from the persona's card across every reel */}
      <div
        aria-hidden="true"
        className="absolute border-y border-brand-cyan/30 transition-[background,box-shadow] duration-700"
        style={{
          left: `${HAND_W - 1}cqw`,
          right: 0,
          top: `${PAY_Y}cqw`,
          height: `${CELL}cqw`,
          background: `linear-gradient(90deg, ${tint("cyan", pb.finale ? 26 : 14)}, ${tint("cyan", pb.finale ? 12 : 3)})`,
          boxShadow: pb.finale ? `0 0 3cqw ${tint("cyan", 22)}` : "none",
        }}
      />
      {phase === DOCK && moving && (
        <motion.span
          key={`${pb.run}-${active}`}
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ top: `${PAY_Y + CELL / 2 - 0.5}cqw`, height: "1cqw", width: "6cqw", background: `linear-gradient(90deg, transparent, ${brandTint(TOOLS[CASES[active].chosen], 80)}, transparent)` }}
          initial={{ left: `${reelCenter(active) - 3}cqw`, opacity: 1 }}
          animate={{ left: `${HAND_W - 6}cqw`, opacity: [1, 1, 0] }}
          transition={{ duration: 0.7, ease: "easeIn" }}
        />
      )}

      <div className="absolute inset-y-0 left-0" style={{ width: `${HAND_W}cqw` }}>
        <PersonaHand docked={pb.docked} moving={moving} name={copy.persona} description={copy.personaDescription} caption={copy.capabilities} />
      </div>

      <div className="absolute inset-y-0 right-0 flex" style={{ left: `${REELS_X}cqw`, gap: `${GAP}cqw` }}>
        {CASES.map((c, i) => (
          <Reel key={c.need} c={c} state={stateOf(i)} label={copy.need(i)} moving={moving} spinMs={BEATS[SCAN] * 0.95} />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{ left: `${HAND_W + 0.3}cqw`, top: `${PAY_Y + CELL / 2 - 0.6}cqw`, width: "1.2cqw", height: "1.2cqw", background: BRAND_VAR.cyan, boxShadow: `0 0 1.6cqw ${tint("cyan", 70)}` }}
      />
    </CaseStage>
  );
}
