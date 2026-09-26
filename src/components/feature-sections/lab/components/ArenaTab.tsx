"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { Swords, Check, X } from "lucide-react";
import { ARENA_ROUNDS } from "../data";
import type { ArenaSide } from "../ledger";
import { useTranslation } from "@/i18n/useTranslation";
import { fillTemplate } from "@/lib/fillTemplate";
import TabBackdrop from "./TabBackdrop";

/** Contender labels project from the version ledger (`arenaContenders`), so
 *  the arena and the version rail name — and rate — the same versions. */
export default function ArenaTab({
  contenders,
  liveId,
}: {
  contenders: Record<ArenaSide, string>;
  liveId: string;
}) {
  const { t } = useTranslation();
  const copy = t.labSection.arena;
  const reduced = useStillMotion();
  // Ambient round cycle: stop advancing rounds into a backgrounded tab.
  const tabHidden = usePageVisibility();
  const [currentRound, setCurrentRound] = useState(() =>
    reduced ? ARENA_ROUNDS.length - 1 : 0,
  );
  const [phase, setPhase] = useState<"fighting" | "result">(() =>
    reduced ? "result" : "fighting",
  );
  const [prevReduced, setPrevReduced] = useState(reduced);

  if (reduced !== prevReduced) {
    setPrevReduced(reduced);
    if (reduced) {
      setCurrentRound(ARENA_ROUNDS.length - 1);
      setPhase("result");
    }
  }

  useEffect(() => {
    if (reduced || tabHidden) return;
    const id = setInterval(() => {
      setCurrentRound((r) => (r + 1) % ARENA_ROUNDS.length);
      setPhase("fighting");
      const t = setTimeout(() => setPhase("result"), 900);
      return () => clearTimeout(t);
    }, 3400);
    return () => clearInterval(id);
  }, [reduced, tabHidden]);

  useEffect(() => {
    if (phase === "fighting" && !reduced) {
      const t = setTimeout(() => setPhase("result"), 900);
      return () => clearTimeout(t);
    }
  }, [phase, currentRound, reduced]);

  const round = ARENA_ROUNDS[currentRound];
  const wins = { A: 0, B: 0 };
  for (let i = 0; i <= currentRound; i++) {
    wins[ARENA_ROUNDS[i].winner]++;
  }

  return (
    <div className="relative flex flex-col rounded-xl border border-foreground/[0.10] bg-background/80 backdrop-blur-xl overflow-hidden stage:h-full">
      <TabBackdrop tab="arena" />
      <div className="relative flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3 stage:py-2">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-brand-purple" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            {copy.title}
          </span>
        </div>
        <div className="flex items-center gap-3 text-base font-mono">
          <span className="text-foreground/70">
            {copy.round}{" "}
            <span className="text-foreground tabular-nums font-semibold">{currentRound + 1}/{ARENA_ROUNDS.length}</span>
          </span>
        </div>
      </div>

      <div className="relative border-b border-foreground/[0.06] px-5 py-3 bg-foreground/[0.02] stage:flex stage:items-baseline stage:gap-3 stage:py-2">
        <div className="text-base font-mono uppercase tracking-widest text-foreground/60 mb-1 stage:mb-0 stage:shrink-0">
          {copy.input}
        </div>
        <div className="font-mono text-base text-foreground/90">&gt; {copy.inputs[round.input]}</div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 stage:min-h-0 stage:flex-1 divide-y sm:divide-y-0 sm:divide-x divide-foreground/[0.10]">
        {(["A", "B"] as const).map((side) => {
          const isWinner = phase === "result" && round.winner === side;
          const isLoser = phase === "result" && round.winner !== side;
          const score = side === "A" ? round.scoreA : round.scoreB;
          const color = side === "A" ? "#06b6d4" : "#a855f7";
          return (
            <div
              key={`${side}-${currentRound}`}
              className="relative px-5 py-6 min-h-[160px] stage:min-h-0 stage:py-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg font-mono font-bold text-base"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {side}
                  </div>
                  <div className="text-base font-mono text-foreground/70">
                    {fillTemplate(copy.version, { version: contenders[side] })}
                  </div>
                  {contenders[side] === liveId && (
                    <span className="text-base font-mono uppercase tracking-wider text-brand-emerald">
                      {t.labVersions.live}
                    </span>
                  )}
                </div>
                {isWinner && (
                  <motion.div
                    key={`win-${side}-${currentRound}`}
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    aria-label={fillTemplate(copy.winsAria, { version: side })}
                    className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-base font-mono uppercase tracking-widest"
                    style={{ borderColor: color, color }}
                  >
                    <motion.span
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                      className="inline-flex"
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                    {copy.win}
                  </motion.div>
                )}
                {isLoser && (
                  <motion.div
                    key={`lose-${side}-${currentRound}`}
                    initial={{ scale: 0, rotate: 20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    aria-label={fillTemplate(copy.losesAria, { version: side })}
                    className="flex items-center gap-1 rounded-full border border-brand-rose/60 px-2 py-0.5 text-base font-mono uppercase tracking-widest text-brand-rose/90"
                  >
                    <X className="h-3 w-3" strokeWidth={3} />
                    {copy.lose}
                  </motion.div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold font-mono tabular-nums [@container(min-height:26rem)]:text-5xl" style={{ color }}>
                  {phase === "fighting" ? "…" : score}
                </div>
                <div className="text-base font-mono uppercase tracking-widest text-foreground/60 mt-0.5">
                  {copy.fitnessScore}
                </div>
                <div className="mt-3 h-1 w-full rounded-full bg-foreground/[0.04] overflow-hidden">
                  <motion.div
                    key={`bar-${side}-${currentRound}`}
                    initial={{ width: 0 }}
                    animate={{ width: phase === "fighting" ? "50%" : `${score}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex items-center justify-between border-t border-foreground/[0.06] px-5 py-3 stage:py-2 text-base font-mono">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-cyan" />
            <span className="text-foreground/85">{fillTemplate(copy.version, { version: "A" })}</span>
            <span className="text-foreground font-semibold tabular-nums">{wins.A}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-purple" />
            <span className="text-foreground/85">{fillTemplate(copy.version, { version: "B" })}</span>
            <span className="text-foreground font-semibold tabular-nums">{wins.B}</span>
          </span>
        </span>
        <span className="text-foreground/60 uppercase tracking-wider">
          {phase === "fighting" ? copy.fighting : copy.roundComplete}
        </span>
      </div>
    </div>
  );
}
