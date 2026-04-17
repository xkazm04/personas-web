"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swords, Trophy } from "lucide-react";
import { ARENA_ROUNDS } from "../data";

export default function ArenaTab() {
  const reduced = useReducedMotion() ?? false;
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
    if (reduced) return;
    const id = setInterval(() => {
      setCurrentRound((r) => (r + 1) % ARENA_ROUNDS.length);
      setPhase("fighting");
      const t = setTimeout(() => setPhase("result"), 900);
      return () => clearTimeout(t);
    }, 3400);
    return () => clearInterval(id);
  }, [reduced]);

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
    <div className="force-dark flex flex-col rounded-xl border border-foreground/[0.08] bg-background/80 backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-foreground/[0.06] px-5 py-3">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-brand-purple" />
          <span className="text-base font-mono font-semibold text-foreground uppercase tracking-wider">
            Prompt arena
          </span>
        </div>
        <div className="flex items-center gap-3 text-base font-mono">
          <span className="text-foreground/70">
            Round{" "}
            <span className="text-foreground tabular-nums font-semibold">
              {currentRound + 1}/{ARENA_ROUNDS.length}
            </span>
          </span>
        </div>
      </div>

      <div className="border-b border-foreground/[0.06] px-5 py-3 bg-foreground/[0.02]">
        <div className="text-base font-mono uppercase tracking-widest text-foreground/60 mb-1">
          Input
        </div>
        <div className="font-mono text-base text-foreground/90">&gt; {round.input}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
        {(["A", "B"] as const).map((side) => {
          const isWinner = phase === "result" && round.winner === side;
          const isLoser = phase === "result" && round.winner !== side;
          const score = side === "A" ? round.scoreA : round.scoreB;
          const color = side === "A" ? "#06b6d4" : "#a855f7";
          return (
            <motion.div
              key={`${side}-${currentRound}`}
              animate={{
                backgroundColor: isWinner
                  ? `${color}0e`
                  : isLoser
                    ? "rgba(244,63,94,0.04)"
                    : "rgba(255,255,255,0)",
              }}
              className="relative px-5 py-6 min-h-[160px] flex flex-col"
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
                    Version {side === "A" ? "v4.2" : "v4.3-challenger"}
                  </div>
                </div>
                {isWinner && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-base font-mono uppercase tracking-widest"
                    style={{ borderColor: color, color }}
                  >
                    <Trophy className="h-3 w-3" /> win
                  </motion.div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-3xl font-bold font-mono tabular-nums" style={{ color }}>
                  {phase === "fighting" ? "…" : score}
                </div>
                <div className="text-base font-mono uppercase tracking-widest text-foreground/60 mt-0.5">
                  fitness score
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
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-foreground/[0.06] px-5 py-3 text-base font-mono">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-cyan" />
            <span className="text-foreground/85">Version A</span>
            <span className="text-foreground font-semibold tabular-nums">{wins.A}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-purple" />
            <span className="text-foreground/85">Version B</span>
            <span className="text-foreground font-semibold tabular-nums">{wins.B}</span>
          </span>
        </span>
        <span className="text-foreground/60 uppercase tracking-wider">
          {phase === "fighting" ? "fighting…" : "round complete"}
        </span>
      </div>
    </div>
  );
}
