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
import { ChartTooltipContent } from "@/components/dashboard/ObservabilityCharts";

interface BarDatum {
  name: string;
  invocations: number;
}

interface PieDatum {
  name: string;
  value: number;
  color?: string;
}

interface AreaDatum {
  [key: string]: string | number;
}

interface PersonaBarDatum {
  [key: string]: string | number;
}

interface UsageTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatToolName: (name: string) => string;
}

function UsageTooltip({ active, payload, label, formatToolName }: UsageTooltipProps) {
  return (
    <ChartTooltipContent
      active={active}
      payload={payload}
      label={label}
      nameFormatter={formatToolName}
    />
  );
}

export function UsageInvocationsBarChart({
  barData,
  formatToolName,
}: {
  barData: BarDatum[];
  formatToolName: (name: string) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} />
        <Bar dataKey="invocations" radius={[0, 6, 6, 0]}>
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
            <p className="text-[10px] text-muted-dark">total</p>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {pieData.slice(0, 5).map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-[11px]">
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} />
        <Legend
          iconType="circle"
          iconSize={6}
          formatter={(value: string) => (
            <span className="text-[10px] text-muted-dark">{formatToolName(value)}</span>
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
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={personaBarData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<UsageTooltip formatToolName={formatToolName} />} />
        <Legend
          iconType="circle"
          iconSize={6}
          formatter={(value: string) => (
            <span className="text-[10px] text-muted-dark">{formatToolName(value)}</span>
          )}
        />
        {allToolNames.map((tool, i) => (
          <Bar key={tool} dataKey={tool} stackId="usage" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
