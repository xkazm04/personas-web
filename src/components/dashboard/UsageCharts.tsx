"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { AXIS_TICK, AXIS_TICK_LABEL, GRID_STROKE, useChartAnimation, ACTIVE_DOT, CHART_CURSOR_LINE, CHART_CURSOR_FILL } from "@/lib/chart-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { UsageTooltip } from "./usage-charts/UsageTooltip";
import type { AreaDatum, BarDatum, PersonaBarDatum, PieDatum } from "./usage-charts/usageChartTypes";

export function UsageInvocationsBarChart({
  barData,
  formatToolName,
}: {
  barData: BarDatum[];
  formatToolName: (name: string) => string;
}) {
  const anim = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          tick={AXIS_TICK_LABEL}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} cursor={CHART_CURSOR_FILL} />
        <Bar dataKey="invocations" radius={[0, 6, 6, 0]} {...anim}>
          {barData.map((entry, i) => (
            <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UsageDistributionPieChart({
  pieData,
  totalInvocations,
  formatToolName,
}: {
  pieData: PieDatum[];
  totalInvocations: number;
  formatToolName: (name: string) => string;
}) {
  const { t } = useTranslation();
  const anim = useChartAnimation();
  return (
    <>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              {...anim}
            >
              {pieData.map((entry, i) => (
                <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xl font-bold tabular-nums text-foreground">
              {totalInvocations}
            </p>
            <p className="text-sm text-muted-dark">{t.dashboardUi.totalLower}</p>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {pieData.slice(0, 5).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="flex-1 text-muted truncate">{entry.name}</span>
            <span className="tabular-nums text-muted-dark">{entry.value}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function UsageOverTimeAreaChart({
  areaData,
  topTools,
  formatToolName,
}: {
  areaData: AreaDatum[];
  topTools: string[];
  formatToolName: (name: string) => string;
}) {
  const anim = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={areaData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {topTools.map((tool, i) => (
            <linearGradient key={tool} id={`gradTool${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={0.2} />
              <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} cursor={CHART_CURSOR_LINE} />
        <Legend
          iconType="circle"
          iconSize={6}
          formatter={(value: string) => (
            <span className="text-sm text-muted-dark">{formatToolName(value)}</span>
          )}
        />
        {topTools.map((tool, i) => (
          <Area
            key={tool}
            type="monotone"
            dataKey={tool}
            stackId="1"
            stroke={CHART_COLORS[i]}
            strokeWidth={1.5}
            fill={`url(#gradTool${i})`}
            activeDot={ACTIVE_DOT}
            {...anim}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function UsageByPersonaBarChart({
  personaBarData,
  allToolNames,
  formatToolName,
}: {
  personaBarData: PersonaBarDatum[];
  allToolNames: string[];
  formatToolName: (name: string) => string;
}) {
  const anim = useChartAnimation();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={personaBarData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="name" tick={AXIS_TICK_LABEL} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} cursor={CHART_CURSOR_FILL} />
        <Legend
          iconType="circle"
          iconSize={6}
          formatter={(value: string) => (
            <span className="text-sm text-muted-dark">{formatToolName(value)}</span>
          )}
        />
        {allToolNames.map((tool, i) => (
          <Bar key={tool} dataKey={tool} stackId="usage" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} {...anim} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
