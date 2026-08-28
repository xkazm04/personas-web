"use client";

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

import { useChartAnimation } from "@/lib/chart-theme";

/**
 * The recharts half of LeaderboardRadarCard, split out so the card can defer it
 * with `next/dynamic({ ssr: false })`. Takes plain names/colours rather than
 * persona objects so it carries no dashboard-data import.
 */

/** One radar axis: the selected persona's value plus the benchmark overlay. */
export interface RadarDatum {
  metric: string;
  value: number;
  benchmark?: number;
}

export default function LeaderboardRadarChart({
  data,
  selectedName,
  selectedColor,
  benchmarkName,
  benchmarkColor,
}: {
  data: RadarDatum[];
  selectedName: string;
  selectedColor: string;
  /** The #1 persona, overlaid faintly when a lower-ranked agent is selected. */
  benchmarkName?: string;
  benchmarkColor?: string;
}) {
  const anim = useChartAnimation();
  const hasBenchmark = Boolean(benchmarkName && benchmarkColor);

  return (
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
        {hasBenchmark && (
          <Radar
            name={benchmarkName}
            dataKey="benchmark"
            stroke={benchmarkColor}
            fill={benchmarkColor}
            fillOpacity={0.05}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            {...anim}
          />
        )}
        <Radar
          name={selectedName}
          dataKey="value"
          stroke={selectedColor}
          fill={selectedColor}
          fillOpacity={0.32}
          strokeWidth={2}
          {...anim}
        />
        {hasBenchmark && (
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
  );
}
