import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import CompareToggle from "@/components/dashboard/CompareToggle";
import { fadeUp } from "@/lib/animations";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

function PersonaChip({ persona }: { persona: LeaderboardPersona }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: persona.color }}
      />
      {persona.name}
    </span>
  );
}

export function LeaderboardRadarCard({
  primary,
  compare,
  data,
  title,
  comparing,
  onToggleCompare,
  compareLabel,
  versusLabel,
}: {
  primary?: LeaderboardPersona;
  compare?: LeaderboardPersona;
  data: { metric: string; a: number; b?: number }[];
  title: string;
  comparing: boolean;
  onToggleCompare: () => void;
  compareLabel: string;
  versusLabel: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-5 lg:col-span-2"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="ml-auto">
          <CompareToggle
            enabled={comparing}
            onToggle={onToggleCompare}
            label={compareLabel}
          />
        </div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {primary && <PersonaChip persona={primary} />}
        {comparing && compare && (
          <>
            <span className="text-sm font-medium uppercase tracking-wider text-muted-dark">
              {versusLabel}
            </span>
            <PersonaChip persona={compare} />
          </>
        )}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name={primary?.name}
              dataKey="a"
              stroke={primary?.color ?? "#06b6d4"}
              fill={primary?.color ?? "#06b6d4"}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            {comparing && compare && (
              <Radar
                name={compare.name}
                dataKey="b"
                stroke={compare.color}
                fill={compare.color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "rgba(10,15,26,0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                fontSize: 12,
                backdropFilter: "blur(6px)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
