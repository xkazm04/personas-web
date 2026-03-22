"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { MOCK_EXEC_COMPARE, MOCK_ANNOTATIONS } from "@/lib/mock-dashboard-data";
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";

const annotationStyles: Record<ChartAnnotation["type"], { stroke: string; emoji: string }> = {
  deployment: { stroke: "#06b6d4", emoji: "\u{1F680}" },
  incident: { stroke: "#f43f5e", emoji: "\u26A0\uFE0F" },
  milestone: { stroke: "#34d399", emoji: "\u{1F3AF}" },
};

interface ExecPoint {
  date: string;
  Successes: number;
  Failures: number;
}

interface MergedExecPoint {
  date: string;
  Successes: number;
  Failures: number;
  PreviousTotal?: number;
}

function ExecCompareTooltipContent({
  active,
  payload,
  label,
  compare,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string }>;
  label?: string;
  compare: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => {
        let displayName = entry.dataKey;
        if (entry.dataKey === "PreviousTotal" && compare) displayName = "Previous Total";
        else if (entry.dataKey === "Successes") displayName = "Successes";
        else if (entry.dataKey === "Failures") displayName = "Failures";
        return (
          <p key={entry.dataKey} style={{ color: entry.color }} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {displayName}: <span className="font-medium">{entry.value}</span>
          </p>
        );
      })}
    </div>
  );
}

export default memo(function ExecChartWithCompare({
  data,
  compare,
}: {
  data: ExecPoint[];
  compare: boolean;
}) {
  const mergedData: MergedExecPoint[] = useMemo(() => {
    if (!compare) return data;
    const compareMap = new Map(MOCK_EXEC_COMPARE.map((c) => [c.date, c.previous]));
    return data.map((d) => ({
      ...d,
      PreviousTotal: compareMap.get(d.date),
    }));
  }, [data, compare]);

  if (!compare) {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<ExecCompareTooltipContent compare={false} />} />
          {MOCK_ANNOTATIONS.map((a) => {
            const style = annotationStyles[a.type];
            return (
              <ReferenceLine
                key={`${a.type}-${a.date}`}
                x={a.date}
                stroke={style.stroke}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `${style.emoji} ${a.label}`,
                  position: "top",
                  fill: style.stroke,
                  fontSize: 10,
                }}
              />
            );
          })}
          <Bar dataKey="Successes" stackId="exec" fill="#34d399" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Failures" stackId="exec" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={mergedData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<ExecCompareTooltipContent compare={true} />} />
        {MOCK_ANNOTATIONS.map((a) => {
          const style = annotationStyles[a.type];
          return (
            <ReferenceLine
              key={`${a.type}-${a.date}`}
              x={a.date}
              stroke={style.stroke}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{
                value: `${style.emoji} ${a.label}`,
                position: "top",
                fill: style.stroke,
                fontSize: 10,
              }}
            />
          );
        })}
        <Bar dataKey="Successes" stackId="exec" fill="#34d399" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Failures" stackId="exec" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="PreviousTotal"
          name="Previous Total"
          stroke="#a855f7"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});
