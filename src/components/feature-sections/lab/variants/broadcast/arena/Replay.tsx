"use client";

import { motion } from "framer-motion";
import { Rewind } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import type { ArenaSide } from "../../../ledger";
import { CAPS, SLANT, FreehandRing, Plate } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { DECIDER, FINAL, MARGINS, ROUNDS, WINNER } from "./match";
import { SIDE_TONE } from "./Scorebug";

/**
 * The instant replay of the deciding moment: the round in which the match
 * winner reached a majority, re-run with the telestrator ringing the score
 * that clinched it.
 */
export default function Replay({ contenders, moving }: { contenders: Record<ArenaSide, string>; moving: boolean }) {
  const c = broadcastCopy.arena;
  const a = labSectionCopy.arena;
  const r = ROUNDS[DECIDER];
  const tone = SIDE_TONE[WINNER];
  const loser: ArenaSide = WINNER === "A" ? "B" : "A";
  const margin = Math.abs(MARGINS[DECIDER]);
  return (
    <motion.div
      className="relative flex h-full flex-col justify-center gap-2 overflow-hidden p-4 stage:py-2.5"
      initial={moving ? { clipPath: "polygon(0 0, 0 0, -20% 100%, 0 100%)" } : false}
      animate={{ clipPath: "polygon(0 0, 120% 0, 100% 100%, 0 100%)" }}
      transition={beat(moving, 0.6)}
      style={{ background: `repeating-linear-gradient(0deg, ${tint("amber", 4)} 0 2px, transparent 2px 5px)` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Plate tone="amber" solid>
          <Rewind className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          {c.replayTitle}
        </Plate>
        <span className={`${CAPS} text-base text-foreground`}>{fillTemplate(c.decided, { n: r.id })}</span>
        <span className="text-base text-foreground/85">
          <span className="font-semibold uppercase tracking-wider text-foreground/70">{a.input} </span>
          {a.inputs[r.input]}
        </span>
      </div>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
        {([WINNER, loser] as const).map((side) => {
          const score = side === "A" ? r.scoreA : r.scoreB;
          const win = side === WINNER;
          return (
            <div key={side} className="flex flex-col">
              <span className={`${SLANT} text-sm`} style={{ color: BRAND_VAR[SIDE_TONE[side]] }}>
                {contenders[side]}
              </span>
              <span className="relative inline-block">
                {win && <FreehandRing tone="amber" drawn moving={moving} delay={0.6} />}
                <span className={`relative font-mono font-black italic tabular-nums leading-none ${win ? "text-5xl" : "text-3xl"}`} style={{ color: win ? BRAND_VAR[tone] : "color-mix(in srgb, var(--foreground) 70%, transparent)" }}>
                  {score}
                </span>
              </span>
            </div>
          );
        })}
        <span className="font-mono text-base tabular-nums text-foreground/70">{fillTemplate(c.margin, { margin })}</span>
        <motion.span
        className={`${SLANT} text-2xl`}
        style={{ color: BRAND_VAR[tone] }}
        initial={moving ? { opacity: 0, x: -16 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={beat(moving, 0.45, 1.1)}
      >
        {fillTemplate(c.clinch, { version: contenders[WINNER], a: FINAL[WINNER], b: FINAL[loser] })}
        </motion.span>
      </div>
    </motion.div>
  );
}
