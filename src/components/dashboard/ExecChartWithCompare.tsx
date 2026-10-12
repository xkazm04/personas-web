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
import type { ChartAnnotation } from "@/lib/mock-dashboard-data";
import type { ComparePoint } from "./CostChartWithCompare";
import {
  AXIS_TICK,
  GRID_STROKE,
  SERIES,
  CHART_TOOLTIP_CLASS,
  useChartAnimation,
  ACTIVE_DOT,
  CHART_CURSOR_FILL,
} from "@/lib/chart-theme";

const annotationStyles: Record<ChartAnnotation["type"], { stroke: string; emoji: string }> = {
  deployment: { stroke: SERIES.cyan, emoji: "\u{1F680}" },
  incident: { stroke: SERIES.rose, emoji: "\u26A0\uFE0F" },
  milestone: { stroke: SERIES.emerald, emoji: "\u{1F3AF}" },
};

const CHART_MARGIN = { top: 8, right: 8, left: -20, bottom: 0 };

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
    <div className={CHART_TOOLTIP_CLASS}>
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
  previousSeries = [],
  annotations = [],
}: {
  data: ExecPoint[];
  compare: boolean;
  /** Previous-period overlay. Empty in real mode so no fabricated prior-period
   *  total is drawn over genuine execution data. */
  previousSeries?: ComparePoint[];
  /** Timeline annotations (deploys/incidents). Empty in real mode. */
  annotations?: ChartAnnotation[];
}) {
  const anim = useChartAnimation();
  const compareMap = useMemo(
    () => new Map(previousSeries.map((c) => [c.date, c.previous])),
    [previousSeries],
  );
  const showPrevious = compare && previousSeries.length > 0;
  const mergedData: MergedExecPoint[] = useMemo(() => {
    if (!showPrevious) return data;
    return data.map((d) => ({
      ...d,
      PreviousTotal: compareMap.get(d.date),
    }));
  }, [data, showPrevious, compareMap]);

  // Grid, axes, tooltip, annotations and the stacked bars are identical in both
  // shapes; only the chart type and the previous-period line differ. Recharts
  // reads its children by type, so they stay direct elements (an array), not a
  // wrapper component.
  const series = [
    <CartesianGrid key="grid" strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />,
    <XAxis key="x" dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />,
    <YAxis key="y" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />,
    <Tooltip key="tooltip" content={<ExecCompareTooltipContent compare={showPrevious} />} cursor={CHART_CURSOR_FILL} />,
    ...annotations.map((a) => {
      const style = annotationStyles[a.type];
      return (
        <ReferenceLine
          key={`${a.type}-${a.date}`}
          x={a.date}
          stroke={style.stroke}
          strokeDasharray="4 4"
          strokeOpacity={0.5}
          label={{ value: `${style.emoji} ${a.label}`, position: "top", fill: style.stroke, fontSize: 10 }}
        />
      );
    }),
    <Bar key="successes" dataKey="Successes" stackId="exec" fill={SERIES.emerald} radius={[0, 0, 0, 0]} {...anim} />,
    <Bar key="failures" dataKey="Failures" stackId="exec" fill={SERIES.rose} radius={[4, 4, 0, 0]} {...anim} />,
  ];

  if (!showPrevious) {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={CHART_MARGIN}>
          {series}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={mergedData} margin={CHART_MARGIN}>
        {series}
        <Line
          type="monotone"
          dataKey="PreviousTotal"
          name="Previous Total"
          stroke={SERIES.violet}
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          activeDot={ACTIVE_DOT}
          {...anim}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});
