"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { CASES, TOOLS } from "../shared/catalog";
import { CHOOSE, CONSIDER, DOCK, NEED, SCAN } from "../shared/cycle";
import LabStage from "../shared/LabStage";
import { useCaseCopy } from "../shared/useCaseCopy";
import { useCaseCycle, type Beats } from "../shared/useCaseCycle";
import FieldLines from "./FieldLines";
import FieldTile, { type TileMode } from "./FieldTile";
import { FIELD, VIEW_H, VIEW_W, cq, px, py } from "./geometry";
import PersonaRing from "./PersonaRing";

const BEATS: Beats = [900, 900, 1800, 1000, 1500];

/**
 * V1 - Magnetic field. The persona stands in a ring of empty sockets; every
 * tool it could use floats in a field beside it. A need appears, its
 * candidates are pulled out of the crowd toward the persona while the rest
 * sink back, a beam sweeps across the options, locks on one, and that tool
 * flies into the next socket. Six needs, six sockets, then it loops.
 */
export default function UseCasesMagneticField() {
  const still = useStillMotion();
  const copy = useCaseCopy();
  const artRef = useRef<HTMLDivElement>(null);
  const pb = useCaseCycle(artRef, still, BEATS);
  const { phase, active, moving } = pb;
  const c = CASES[active];
  const considering = phase === CONSIDER || phase === SCAN;
  const sweepKey = `${pb.run}-${active}`;
  const usedTools = new Set(CASES.filter((_, i) => pb.docked[i] && i !== active).map((x) => x.chosen));

  return (
    <LabStage ar={VIEW_W / VIEW_H} artRef={artRef} pb={pb} copy={copy}>
      <FieldLines active={active} phase={phase} docked={pb.docked} moving={moving} scanMs={BEATS[SCAN]} sweepKey={sweepKey} />

      {FIELD.map((spot) => {
        const isChosen = spot.key === c.chosen;
        const k = c.candidates.indexOf(spot.key);
        let mode: TileMode = usedTools.has(spot.key) ? "used" : "idle";
        if (isChosen && phase === CHOOSE) mode = "chosen";
        else if (isChosen && phase === DOCK) mode = "used";
        else if (k >= 0 && considering) mode = "candidate";
        else if (mode === "idle" && phase !== NEED && phase !== DOCK) mode = "dim";
        const n = c.candidates.length;
        return (
          <FieldTile
            key={spot.key}
            spot={spot}
            tool={TOOLS[spot.key]}
            mode={mode}
            pulled={isChosen && phase === CHOOSE ? 1.5 : k >= 0 && considering ? 1 : 0}
            scan={k >= 0 && phase === SCAN ? { delay: ((2 * k) / (2 * n - 1)) * 0.92 * (BEATS[SCAN] / 1000), key: sweepKey } : null}
            moving={moving}
            drifting={pb.ticking && (mode === "idle" || mode === "used")}
            showName={isChosen && (phase === CHOOSE || phase === DOCK)}
          />
        );
      })}

      <PersonaRing docked={pb.docked} active={active} waiting={phase !== DOCK} moving={moving} name={copy.persona} />

      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: px(800), top: py(30) }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active}
            className="flex items-center gap-[0.6em] whitespace-nowrap rounded-full border border-brand-cyan/40 px-[1.1em] py-[0.45em] font-semibold text-foreground backdrop-blur-sm"
            style={{ fontSize: `max(16px, ${cq(22)})`, backgroundColor: tint("cyan", 9) }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: moving ? 0.3 : 0 }}
          >
            <span className="h-[0.5em] w-[0.5em] rounded-full" style={{ background: BRAND_VAR.cyan }} aria-hidden="true" />
            {copy.need(active)}
          </motion.p>
        </AnimatePresence>
      </div>
    </LabStage>
  );
}
