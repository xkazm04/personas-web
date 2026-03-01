"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ClipboardCheck,
  Zap,
  TrendingUp,
  Bot,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import StatusBadge from "@/components/dashboard/StatusBadge";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

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
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

interface StatBadgeProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: "cyan" | "purple" | "emerald" | "amber";
  href?: string;
}

function StatBadge({ icon: Icon, label, value, accent, href }: StatBadgeProps) {
  const colorMap = {
    cyan: "border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
    purple: "border-purple-500/20 bg-purple-500/8 text-purple-400",
    emerald: "border-emerald-500/20 bg-emerald-500/8 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/8 text-amber-400",
  };

  const content = (
    <div
      className={`group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all hover:scale-[1.02] ${colorMap[accent]}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-bold tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-dark">{label}</span>
      </div>
      {href && (
        <ArrowUpRight className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function DashboardHomePage() {
  const user = useAuthStore((s) => s.user);
  const personas = useDashboardStore((s) => s.personas);
  const executions = useDashboardStore((s) => s.executions);
  const pendingReviewCount = useDashboardStore((s) => s.pendingReviewCount);
  const health = useDashboardStore((s) => s.health);
  const dailyMetrics = useDashboardStore((s) => s.dailyMetrics);
  const fetchExecutions = useDashboardStore((s) => s.fetchExecutions);
  const fetchReviews = useDashboardStore((s) => s.fetchReviews);
  const fetchObservability = useDashboardStore((s) => s.fetchObservability);

  useEffect(() => {
    void fetchExecutions();
    void fetchReviews();
    void fetchObservability();
  }, [fetchExecutions, fetchReviews, fetchObservability]);

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const recentExecs = useMemo(
    () => executions.slice(0, 12),
    [executions],
  );

  const stats = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter((e) => e.status === "completed").length;
    const running = executions.filter(
      (e) => e.status === "running" || e.status === "queued",
    ).length;
    return {
      total,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      running,
      activeAgents: personas.filter((p) => p.enabled).length,
    };
  }, [executions, personas]);

  const chartData = useMemo(
    () =>
      dailyMetrics.map((d) => ({
        date: d.date.slice(5), // MM-DD
        Executions: d.executions,
        Errors: d.failures,
      })),
    [dailyMetrics],
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Greeting */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          <GradientText>
            {getGreeting()}, {displayName}
          </GradientText>
        </h1>
        <p className="mt-1 text-sm text-muted-dark">
          Here&apos;s what&apos;s happening with your agents
        </p>
      </motion.div>

      {/* Quick stat badges */}
      <motion.div
        variants={fadeUp}
        className="mb-8 flex flex-wrap gap-3"
      >
        <StatBadge
          icon={ClipboardCheck}
          label="pending reviews"
          value={pendingReviewCount}
          accent="amber"
          href="/dashboard/reviews"
        />
        <StatBadge
          icon={Zap}
          label="total executions"
          value={stats.total}
          accent="cyan"
          href="/dashboard/executions"
        />
        <StatBadge
          icon={TrendingUp}
          label="success rate"
          value={`${stats.successRate}%`}
          accent="emerald"
          href="/dashboard/observability"
        />
        <StatBadge
          icon={Bot}
          label="active agents"
          value={stats.activeAgents}
          accent="purple"
          href="/dashboard/agents"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <GlowCard accent="cyan" className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-brand-cyan" />
              <h2 className="text-sm font-semibold text-foreground">
                Recent Activity
              </h2>
              {stats.running > 0 && (
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/8 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                  {stats.running} running
                </span>
              )}
            </div>

            {recentExecs.length === 0 ? (
              <p className="text-xs text-muted-dark py-8 text-center">
                No executions yet. Execute an agent to see activity here.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {recentExecs.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-white/[0.03]"
                  >
                    <PersonaAvatar
                      icon={exec.personaIcon}
                      color={exec.personaColor}
                      name={exec.personaName}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {exec.personaName ?? exec.personaId.slice(0, 8)}
                      </p>
                      <p className="text-[10px] text-muted-dark">
                        {relativeTime(exec.startedAt ?? exec.createdAt)}
                        {exec.durationMs && ` · ${(exec.durationMs / 1000).toFixed(1)}s`}
                        {exec.costUsd > 0 && ` · $${exec.costUsd.toFixed(4)}`}
                      </p>
                    </div>
                    <StatusBadge status={exec.status} />
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </motion.div>

        {/* Traffic & Errors Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <GlowCard accent="purple" className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-purple" />
                <h2 className="text-sm font-semibold text-foreground">
                  Traffic & Errors
                </h2>
              </div>
              <span className="text-[11px] text-muted-dark">Last 14 days</span>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-xs text-muted-dark">
                No data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradExec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradErr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="Executions"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#gradExec)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Errors"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#gradErr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Legend */}
            <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-dark">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Executions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Errors
              </span>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* Quick links row */}
      <motion.div variants={fadeUp} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Agents", desc: `${personas.length} deployed`, icon: Bot, href: "/dashboard/agents", accent: "cyan" as const },
          { label: "Observability", desc: "Metrics & health", icon: Activity, href: "/dashboard/observability", accent: "emerald" as const },
          { label: "Usage Analytics", desc: "Tool utilization", icon: TrendingUp, href: "/dashboard/usage", accent: "purple" as const },
          { label: "Settings", desc: `${health?.workers.total ?? 0} workers`, icon: Activity, href: "/dashboard/settings", accent: "amber" as const },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <GlowCard
              accent={link.accent}
              className="p-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]`}>
                  <link.icon className="h-4 w-4 text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {link.label}
                  </p>
                  <p className="text-[11px] text-muted-dark">{link.desc}</p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-muted-dark opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </GlowCard>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
