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

import { fadeUp } from "@/lib/animations";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

export function LeaderboardRadarCard({
  selected,
  data,
  title,
}: {
  selected?: LeaderboardPersona;
  data: { metric: string; value: number }[];
  title: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-5 lg:col-span-2"
    >
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {selected && (
          <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted">
            {selected.name}
          </span>
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
              dataKey="value"
              stroke={selected?.color ?? "#06b6d4"}
              fill={selected?.color ?? "#06b6d4"}
              fillOpacity={0.3}
              strokeWidth={2}
            />
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
