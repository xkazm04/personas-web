"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Wrench,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDashboardStore } from "@/stores/dashboardStore";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatToolName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const CHART_COLORS = [
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
  "#34d399",
  "#fbbf24",
  "#3b82f6",
  "#ec4899",
  "#f97316",
];

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#0f0f1a]/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 text-muted-dark">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          {formatToolName(entry.name)}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function InsightBadge({ text }: { text: string }) {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-purple-500/15 bg-purple-500/5 px-3 py-2 text-[11px] text-purple-300">
      <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-400" />
      <span>{text}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsagePage() {
  const toolUsage = useDashboardStore((s) => s.toolUsage);
  const toolUsageOverTime = useDashboardStore((s) => s.toolUsageOverTime);
  const toolUsageByPersona = useDashboardStore((s) => s.toolUsageByPersona);
  const loading = useDashboardStore((s) => s.usageLoading);
  const fetchUsage = useDashboardStore((s) => s.fetchUsage);

  useEffect(() => {
    void fetchUsage();
  }, [fetchUsage]);

  // Bar chart data: sorted by invocations desc
  const barData = useMemo(
    () =>
      [...toolUsage]
        .sort((a, b) => b.invocations - a.invocations)
        .map((t) => ({
          name: formatToolName(t.toolName),
          invocations: t.invocations,
          fill: CHART_COLORS[toolUsage.indexOf(t) % CHART_COLORS.length],
        })),
    [toolUsage],
  );

  // Pie chart data
  const pieData = useMemo(
    () =>
      toolUsage.map((t, i) => ({
        name: formatToolName(t.toolName),
        value: t.invocations,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [toolUsage],
  );

  const totalInvocations = useMemo(
    () => toolUsage.reduce((acc, t) => acc + t.invocations, 0),
    [toolUsage],
  );

  // Stacked area data
  const areaData = useMemo(() => {
    const topTools = [...toolUsage]
      .sort((a, b) => b.invocations - a.invocations)
      .slice(0, 5)
      .map((t) => t.toolName);

    return toolUsageOverTime.map((d) => {
      const row: Record<string, string | number> = { date: d.date.slice(5) };
      topTools.forEach((tool) => {
        row[tool] = d.tools[tool] ?? 0;
      });
      return row;
    });
  }, [toolUsageOverTime, toolUsage]);

  const topTools = useMemo(
    () =>
      [...toolUsage]
        .sort((a, b) => b.invocations - a.invocations)
        .slice(0, 5)
        .map((t) => t.toolName),
    [toolUsage],
  );

  // Per-persona bar data
  const personaBarData = useMemo(
    () =>
      toolUsageByPersona.map((p) => {
        const row: Record<string, string | number> = { name: p.personaName };
        Object.entries(p.tools).forEach(([tool, count]) => {
          row[formatToolName(tool)] = count;
        });
        return row;
      }),
    [toolUsageByPersona],
  );

  const allToolNames = useMemo(() => {
    const names = new Set<string>();
    toolUsageByPersona.forEach((p) =>
      Object.keys(p.tools).forEach((t) => names.add(formatToolName(t))),
    );
    return Array.from(names);
  }, [toolUsageByPersona]);

  // Insight text
  const insight = useMemo(() => {
    if (toolUsage.length < 2) return null;
    const top = toolUsage[0];
    const second = toolUsage[1];
    if (!top || !second) return null;
    const ratio = (top.invocations / second.invocations).toFixed(1);
    return `${formatToolName(top.toolName)} is used ${ratio}x more than ${formatToolName(second.toolName)}, making it your most utilized tool integration.`;
  }, [toolUsage]);

  if (loading && toolUsage.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-dark" />
      </div>
    );
  }

  if (toolUsage.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText>Usage Analytics</GradientText>
          </h1>
        </motion.div>
        <EmptyState
          icon={BarChart3}
          title="No usage data"
          description="Tool usage analytics will appear here once agents start running executions"
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>Usage Analytics</GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Tool utilization patterns across your agent fleet
        </p>
      </motion.div>

      {/* Top row: invocations bar + distribution pie */}
      <div className="grid gap-6 lg:grid-cols-5 mb-8">
        {/* Tool invocations ranking */}
        <GlowCard accent="cyan" variants={fadeUp} className="p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-brand-cyan" />
            Tool Invocations
          </h3>
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
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="invocations" radius={[0, 6, 6, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {insight && <InsightBadge text={insight} />}
        </GlowCard>

        {/* Distribution pie */}
        <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-purple" />
            Distribution
          </h3>
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
                <Tooltip
                  formatter={(value) => String(value)}
                  contentStyle={{
                    background: "rgba(15,15,26,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {totalInvocations}
                </p>
                <p className="text-[10px] text-muted-dark">total</p>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-2 space-y-1.5">
            {pieData.slice(0, 5).map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="flex-1 text-muted truncate">{entry.name}</span>
                <span className="tabular-nums text-muted-dark">{entry.value}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Middle: Usage over time */}
      <GlowCard accent="emerald" variants={fadeUp} className="p-5 mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-400" />
          Usage Over Time
          <span className="text-[11px] text-muted-dark font-normal ml-auto">Last 14 days</span>
        </h3>
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
            <Tooltip content={<ChartTooltipContent />} />
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
      </GlowCard>

      {/* Bottom: Per-persona usage */}
      <GlowCard accent="amber" variants={fadeUp} className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-amber-400" />
          Tool Usage by Agent
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={personaBarData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              iconType="circle"
              iconSize={6}
              formatter={(value: string) => (
                <span className="text-[10px] text-muted-dark">{value}</span>
              )}
            />
            {allToolNames.map((tool, i) => (
              <Bar key={tool} dataKey={tool} stackId="persona" fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </GlowCard>
    </motion.div>
  );
}
