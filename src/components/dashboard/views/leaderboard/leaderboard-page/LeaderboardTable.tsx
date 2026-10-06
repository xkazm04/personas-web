import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { trendColor } from "@/components/dashboard/trendColor";
import { fadeUp } from "@/lib/animations";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

import { LeaderboardSortHeader } from "./LeaderboardSortHeader";
import { RankBadge, TrendIcon, compositeBand } from "./leaderboardStyles";
import {
  defaultDirFor,
  rankByComposite,
  sortPersonas,
  type LeaderboardSortField,
  type SortDir,
} from "./leaderboardSort";

export function LeaderboardTable({
  personas,
  selectedId,
  compareId = "",
  labels,
  onSelect,
}: {
  personas: LeaderboardPersona[];
  selectedId: string;
  compareId?: string;
  labels: {
    rank: string;
    agent: string;
    composite: string;
    delta: string;
    sortBy: string;
  };
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const [sortField, setSortField] = useState<LeaderboardSortField>("composite");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const ranks = useMemo(() => rankByComposite(personas), [personas]);
  const ordered = useMemo(
    () => sortPersonas(personas, sortField, sortDir),
    [personas, sortField, sortDir],
  );

  function handleSort(field: LeaderboardSortField) {
    if (field === sortField) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(defaultDirFor(field));
    }
  }

  const sortProps = { sortField, sortDir, sortByLabel: labels.sortBy, onSort: handleSort };

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-3 lg:col-span-3"
    >
      <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 px-2 py-1.5 text-sm font-medium uppercase tracking-wider text-muted-dark">
        <span>{labels.rank}</span>
        <span />
        <LeaderboardSortHeader field="name" label={labels.agent} {...sortProps} />
        <LeaderboardSortHeader field="composite" label={labels.composite} align="right" {...sortProps} />
        <LeaderboardSortHeader field="delta" label={labels.delta} align="right" {...sortProps} />
      </div>
      <div className="mt-1 space-y-1">
        {ordered.map((persona) => {
          const rank = ranks.get(persona.id) ?? 0;
          const band = compositeBand(persona.composite);
          const isSelected = persona.id === selectedId;
          const isCompare = !isSelected && persona.id === compareId;

          return (
            <motion.button
              key={persona.id}
              layout={reduce ? false : "position"}
              type="button"
              onClick={() => onSelect(persona.id)}
              className={`grid w-full grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 rounded-xl border px-2 py-2 text-left transition-colors ${
                isSelected
                  ? "border-brand-cyan/30 bg-brand-cyan/5"
                  : isCompare
                    ? "border-amber-500/30 bg-amber-500/5"
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
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
