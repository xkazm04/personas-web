"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { CASES } from "../shared/catalog";
import { CHOOSE, CONSIDER, SCAN } from "../shared/cycle";
import LabStage from "../shared/LabStage";
import PersonaBust from "../shared/PersonaBust";
import { useCaseCopy } from "../shared/useCaseCopy";
import { useCaseCycle, type Beats } from "../shared/useCaseCycle";
import Cables from "./Cables";
import { BUST, SOCKET_X, VIEW_H, VIEW_W, cq, px, py, socketY } from "./geometry";
import PatchBay from "./PatchBay";

const BEATS: Beats = [900, 800, 1900, 1000, 1500];

/**
 * V3 - Patch bay. The persona is a panel with six empty output sockets; the
 * board beside it is a rack of real tool jacks. Each need lights a socket,
 * its rack wakes, a cable slides out and probes the jacks one by one, then
 * seats in the chosen tool with a spark and carries a pulse home. By the end
 * the persona is wired to six tools - one wiring diagram of what it can do.
 */
export default function UseCasesPatchBay() {
  const still = useStillMotion();
  const copy = useCaseCopy();
  const artRef = useRef<HTMLDivElement>(null);
  const pb = useCaseCycle(artRef, still, BEATS);
  const { phase, active, moving } = pb;
  const lit = phase === CONSIDER || phase === SCAN || phase === CHOOSE;
  const plugged = CASES.map((_, i) => pb.docked[i] || (i === active && phase === CHOOSE));
  const count = pb.docked.filter(Boolean).length;

  return (
    <LabStage ar={VIEW_W / VIEW_H} artRef={artRef} pb={pb} copy={copy}>
      <PatchBay active={active} lit={lit} plugged={plugged} moving={moving} />
      <Cables active={active} phase={phase} docked={pb.docked} moving={moving} ticking={pb.ticking} scanMs={BEATS[SCAN]} liveKey={`${pb.run}-${active}`} />

      <div className="absolute" style={{ left: px(BUST.x), top: py(BUST.y), width: cq(BUST.w), height: cq(BUST.h) }}>
        <PersonaBust flashKey={count} moving={moving} lit={0.25 + (0.75 * count) / CASES.length} className="h-full w-full" />
      </div>
      <p
        className="absolute -translate-x-1/2 whitespace-nowrap font-semibold text-foreground"
        style={{ left: px(BUST.x + BUST.w / 2), top: py(BUST.y + BUST.h + 18), fontSize: `max(16px, ${cq(18)})` }}
      >
        {copy.persona}
      </p>

      {CASES.map((c, i) => {
        const shown = pb.docked[i] || i === active;
        const current = i === active && !pb.docked[i];
        return (
          <motion.p
            key={c.need}
            className="absolute -translate-y-1/2 whitespace-nowrap text-right font-semibold"
            style={{ right: px(VIEW_W - SOCKET_X + 26), top: py(socketY(i)), fontSize: `max(14px, ${cq(17)})` }}
            initial={false}
            animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : 12, color: current ? "var(--brand-cyan)" : "var(--foreground)" }}
            transition={{ duration: moving ? 0.35 : 0 }}
          >
            {copy.need(i)}
          </motion.p>
        );
      })}
    </LabStage>
  );
}
