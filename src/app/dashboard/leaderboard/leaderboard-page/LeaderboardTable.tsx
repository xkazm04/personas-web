import { motion } from "framer-motion";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { trendColor } from "@/components/dashboard/trendColor";
import { fadeUp } from "@/lib/animations";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

import { RankBadge, TrendIcon, compositeBand } from "./leaderboardStyles";

export function LeaderboardTable({
  personas,
  selectedId,
  labels,
  onSelect,
}: {
  personas: LeaderboardPersona[];
  selectedId: string;
  labels: { rank: string; agent: string; composite: string };
  onSelect: (id: string) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-3 lg:col-span-3"
    >
      <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 px-2 py-1.5 text-sm font-medium uppercase tracking-wider text-muted-dark">
        <span>{labels.rank}</span>
        <span />
        <span>{labels.agent}</span>
        <span className="text-right">{labels.composite}</span>
        <span className="text-right">Delta</span>
      </div>
      <div className="mt-1 space-y-1">
        {personas.map((persona, index) => {
          const rank = index + 1;
          const band = compositeBand(persona.composite);
          const isSelected = persona.id === selectedId;

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onSelect(persona.id)}
              className={`grid w-full grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all ${
                isSelected
                  ? "border-brand-cyan/30 bg-brand-cyan/5"
                  : "border-transparent hover:bg-white/[0.03]"
              }`}
            >
              <RankBadge rank={rank} />
              <PersonaAvatar color={persona.color} name={persona.name} size="sm" />
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {persona.name}
                </span>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full ${band.bar}`}
                    style={{ width: `${persona.composite}%` }}
                  />
                </div>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-sm font-semibold tabular-nums ${band.pill}`}
              >
                {persona.composite}
              </span>
              <span
                className={`flex items-center gap-1 text-sm tabular-nums ${trendColor(
                  persona.delta,
                  { neutralAtZero: true },
                )}`}
              >
                <TrendIcon trend={persona.trend} />
                {persona.delta > 0 ? "+" : ""}
                {persona.delta}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
