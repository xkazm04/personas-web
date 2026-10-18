"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { fillTemplate } from "@/lib/fillTemplate";
import { labSectionCopy } from "@/i18n/pending/labSection";
import type { ArenaSide } from "../../../ledger";
import { CAPS, SLANT, Plate } from "../Frame";
import { beat } from "../useOnAir";
import { broadcastCopy } from "../copy";
import { ROUNDS } from "./match";
import { SIDE_TONE } from "./Scorebug";

/**
 * One round on air: the input as a lower third, then one lane per side. On
 * the result beat the score lands, the bar wipes to it and the winner's stamp
 * drops in; the loser's lane dims.
 */
export default function Matchup({ round, result, review, contenders, moving }: { round: number; result: boolean; review: boolean; contenders: Record<ArenaSide, string>; moving: boolean }) {
  const r = ROUNDS[round];
  const a = labSectionCopy.arena;
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4 stage:py-2.5">
      <motion.div
        key={`lt-${round}`}
        className="flex flex-wrap items-center gap-2"
        initial={moving ? { clipPath: "inset(0 100% 0 0)" } : false}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={beat(moving, 0.5)}
      >
        <Plate tone="purple" solid>
          {review ? fillTemplate(broadcastCopy.arena.review, { n: r.id }) : `${a.round} ${r.id}`}
        </Plate>
        <span className="text-sm font-semibold uppercase tracking-wider text-foreground/70">{a.input}</span>
        <span className="text-base font-medium text-foreground">{a.inputs[r.input]}</span>
      </motion.div>

      {(["A", "B"] as const).map((side) => {
        const score = side === "A" ? r.scoreA : r.scoreB;
        const tone = SIDE_TONE[side];
        const won = r.winner === side;
        return (
          <motion.div
            key={side}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border px-3 py-1.5"
            style={{ borderColor: result && won ? tint(tone, 60) : "var(--border-glass)", background: result && won ? tint(tone, 10) : "transparent" }}
            initial={false}
            animate={{ opacity: result && !won ? 0.75 : 1 }}
            transition={beat(moving, 0.3)}
          >
            <span className="font-mono text-4xl font-black italic leading-none tabular-nums" style={{ color: BRAND_VAR[tone] }}>
              {result ? score : "––"}
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`${SLANT} truncate text-base`} style={{ color: BRAND_VAR[tone] }}>
                  {fillTemplate(a.version, { version: contenders[side] })}
                </span>
                <span className="hidden truncate text-sm uppercase tracking-wider text-foreground/70 sm:inline">{a.fitnessScore}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-sm bg-foreground/[0.06]">
                <motion.div
                  key={`bar-${round}`}
                  className="h-full w-full origin-left -skew-x-12"
                  style={{ background: BRAND_VAR[tone] }}
                  initial={moving ? { scaleX: 0 } : false}
                  animate={{ scaleX: result ? score / 100 : 0.06 }}
                  transition={beat(moving, 0.7)}
                />
              </div>
            </div>
            <motion.span
              key={`stamp-${round}`}
              aria-label={fillTemplate(won ? a.winsAria : a.losesAria, { version: contenders[side] })}
              className={`${CAPS} inline-flex items-center gap-1 rounded-sm border-2 px-1.5 text-sm`}
              style={{ borderColor: won ? BRAND_VAR[tone] : BRAND_VAR.rose, color: won ? BRAND_VAR[tone] : BRAND_VAR.rose }}
              initial={false}
              animate={{ opacity: result ? 1 : 0, scale: result ? 1 : 1.6, rotate: result ? -6 : 0 }}
              transition={moving ? { type: "spring", stiffness: 380, damping: 18, delay: 0.45 } : { duration: 0 }}
            >
              {won ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
              {won ? a.win : a.lose}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
