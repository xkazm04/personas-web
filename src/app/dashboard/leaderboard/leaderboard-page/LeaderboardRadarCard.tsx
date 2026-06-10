import { motion } from "framer-motion";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { fadeUp } from "@/lib/animations";
import { BRAND_VAR } from "@/lib/brand-theme";
import { useChartAnimation } from "@/lib/chart-theme";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

/** One radar axis: the selected persona's value plus the benchmark overlay. */
export interface RadarDatum {
  metric: string;
  value: number;
  benchmark?: number;
}

export function LeaderboardRadarCard({
  selected,
  benchmark,
  data,
  title,
}: {
  selected?: LeaderboardPersona;
  /** The #1 persona, overlaid faintly when a lower-ranked agent is selected. */
  benchmark?: LeaderboardPersona;
  data: RadarDatum[];
  title: string;
}) {
  const anim = useChartAnimation();
  const selectedColor = selected?.color ?? BRAND_VAR.cyan;

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-glass bg-white/[0.02] p-5 lg:col-span-2"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {selected && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: selectedColor }} />
            {selected.name}
          </span>
        )}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="72%">
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
            {/* Benchmark (#1) drawn first so it sits behind the selection. */}
            {benchmark && (
              <Radar
                name={benchmark.name}
                dataKey="benchmark"
                stroke={benchmark.color}
                fill={benchmark.color}
                fillOpacity={0.05}
                strokeWidth={1.5}
                strokeDasharray="4 3"
                {...anim}
              />
            )}
            <Radar
              name={selected?.name ?? ""}
              dataKey="value"
              stroke={selectedColor}
              fill={selectedColor}
              fillOpacity={0.32}
              strokeWidth={2}
              {...anim}
            />
            {benchmark && (
              <Legend
                iconType="line"
                iconSize={12}
                wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
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
