"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Medal } from "lucide-react";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { fadeUp } from "@/lib/animations";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";
import { compositeBand, medalStyle, TrendIcon } from "./leaderboardStyles";
import { dimensionScore, type RankDimension } from "./leaderboardRank";

const RING = { size: 60, stroke: 6 };
const RADIUS = (RING.size - RING.stroke) / 2;
const CIRC = 2 * Math.PI * RADIUS;

/** Circular score gauge; sweeps to `value`% on mount unless reduced-motion. */
function ScoreRing({ value }: { value: number }) {
  const reduced = useReducedMotion() ?? false;
  const pct = Math.max(0, Math.min(100, value));
  const offset = CIRC * (1 - pct / 100);
  const band = compositeBand(value);

  return (
    <div className="relative" style={{ width: RING.size, height: RING.size }}>
      <svg width={RING.size} height={RING.size} viewBox={`0 0 ${RING.size} ${RING.size}`}>
        <circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={RING.stroke}
        />
        <motion.circle
          className={band.text}
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING.stroke}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          transform={`rotate(-90 ${RING.size / 2} ${RING.size / 2})`}
          initial={{ strokeDashoffset: reduced ? offset : CIRC }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduced ? 0 : 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-base font-bold tabular-nums ${band.text}`}>
        {pct}
      </span>
    </div>
  );
}

/**
 * Top-3 podium that re-ranks by the selected dimension. The leader (#1) sits
 * slightly raised with a gold ring; clicking any card selects that persona so
 * the radar below updates. Web counterpart to the desktop overview's podium.
 */
export function LeaderboardPodium({
  top,
  dim,
  selectedId,
  onSelect,
}: {
  top: LeaderboardPersona[];
  dim: RankDimension;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-3">
      {top.map((persona, index) => {
        const rank = (index + 1) as 1 | 2 | 3;
        const medal = medalStyle[rank];
        const isSelected = persona.id === selectedId;
        return (
          <button
            key={persona.id}
            type="button"
            onClick={() => onSelect(persona.id)}
            className={`relative flex flex-col items-center gap-2.5 rounded-2xl border p-5 text-center transition-colors focus-ring focus-visible:ring-offset-0 ${
              isSelected
                ? "border-brand-cyan/40 bg-brand-cyan/5"
                : "border-glass bg-white/[0.02] hover:bg-white/[0.03]"
            } ${rank === 1 ? "sm:-translate-y-2" : ""}`}
          >
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm font-bold tabular-nums ${medal.bg} ${medal.color}`}
            >
              <Medal className="h-3 w-3" />
              {rank}
            </span>
            <PersonaAvatar color={persona.color} name={persona.name} size="lg" />
            <span className="max-w-full truncate text-sm font-semibold text-foreground">
              {persona.name}
            </span>
            <ScoreRing value={dimensionScore(persona, dim)} />
            <span className="flex items-center gap-1 text-sm tabular-nums text-muted-dark">
              <TrendIcon trend={persona.trend} />
              {persona.delta > 0 ? "+" : ""}
              {persona.delta}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
