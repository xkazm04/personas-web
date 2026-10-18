"use client";

import { motion } from "framer-motion";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import type { Round } from "../../types";

/*
 * One strain's petri dish. Each trial seeds one colony on the dish's ring;
 * once scored, the colony grows to its score. The colony that won its trial
 * glows (the surviving trait); the one that lost it fades to an outline.
 */

const S = 220;
const C = S / 2;
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Colony size from score: 70 reads small, 100 fills its slot. */
const colonyScale = (score: number) => Math.min(1, Math.max(0.35, 0.35 + ((score - 70) / 30) * 0.65));

export type ColonyState = "future" | "incubating" | "won" | "lost";

export default function ArenaDish({
  side,
  color,
  rounds,
  states,
  current,
  running,
  still,
}: {
  side: "A" | "B";
  color: BrandKey;
  rounds: readonly Round[];
  states: readonly ColonyState[];
  current: number;
  running: boolean;
  still: boolean;
}) {
  const n = rounds.length;
  const slot = (i: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: r2(C + Math.cos(a) * 62), y: r2(C + Math.sin(a) * 62) };
  };
  const spring = still ? { duration: 0 } : { type: "spring" as const, stiffness: 160, damping: 15 };

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full" aria-hidden fill="none">
      <circle cx={C} cy={C} r={104} fill={tint(color, 6)} stroke="var(--foreground)" strokeOpacity={0.3} strokeWidth={1.6} />
      <circle cx={C} cy={C} r={98} stroke="var(--foreground)" strokeOpacity={0.1} strokeWidth={1} />
      <circle cx={C} cy={C} r={62} stroke={tint(color, 30)} strokeDasharray="2 5" />
      {/* a glint on the glass */}
      <path d={`M${C - 74} ${C - 52} A 90 90 0 0 1 ${C - 30} ${C - 88}`} stroke="var(--foreground)" strokeOpacity={0.18} strokeWidth={3} strokeLinecap="round" />

      {rounds.map((r, i) => {
        const { x, y } = slot(i);
        const st = states[i];
        const score = side === "A" ? r.scoreA : r.scoreB;
        const grown = st === "won" || st === "lost";
        const isCurrent = i === current;
        return (
          <g key={r.id}>
            <circle cx={x} cy={y} r={22} stroke="var(--foreground)" strokeOpacity={isCurrent ? 0.45 : 0.16} strokeDasharray="2 4" />
            {st === "won" && (
              <motion.circle
                cx={x}
                cy={y}
                r={26}
                stroke={BRAND_VAR[color]}
                strokeWidth={2}
                initial={still ? false : { opacity: 0, scale: 0.6 }}
                animate={running && isCurrent ? { opacity: [0.35, 0.95, 0.35], scale: 1 } : { opacity: 0.75, scale: 1 }}
                transition={running && isCurrent ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : spring}
              />
            )}
            <motion.circle
              cx={x}
              cy={y}
              r={20}
              initial={false}
              animate={{
                scale: grown ? colonyScale(score) : st === "incubating" ? 0.25 : 0,
                opacity: st === "future" ? 0 : st === "lost" ? 0.55 : 1,
              }}
              transition={spring}
              fill={st === "lost" ? "transparent" : tint(color, st === "incubating" ? 40 : 70)}
              stroke={st === "lost" ? "var(--foreground)" : BRAND_VAR[color]}
              strokeOpacity={st === "lost" ? 0.55 : 1}
              strokeWidth={st === "lost" ? 2 : 1.5}
              strokeDasharray={st === "lost" ? "3 3" : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
