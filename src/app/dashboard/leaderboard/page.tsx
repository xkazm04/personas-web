"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Medal,
  Minus,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import GradientText from "@/components/GradientText";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { fadeUp, staggerContainer } from "@/lib/animations";
import {
  MOCK_LEADERBOARD,
  type LeaderboardPersona,
  type LeaderboardTrend,
} from "@/lib/mock-dashboard-data";
import { useTranslation } from "@/i18n/useTranslation";

function compositeBand(score: number): {
  text: string;
  bar: string;
  pill: string;
} {
  if (score >= 80)
    return {
      text: "text-emerald-400",
      bar: "bg-emerald-400/70",
      pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    };
  if (score >= 60)
    return {
      text: "text-cyan-400",
      bar: "bg-cyan-400/70",
      pill: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    };
  if (score >= 40)
    return {
      text: "text-amber-400",
      bar: "bg-amber-400/70",
      pill: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    };
  return {
    text: "text-rose-400",
    bar: "bg-rose-400/70",
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  };
}

const medalStyle: Record<1 | 2 | 3, { color: string; bg: string }> = {
  1: { color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/40" },
  2: { color: "text-slate-200", bg: "bg-slate-400/15 border-slate-400/40" },
  3: { color: "text-orange-300", bg: "bg-orange-500/15 border-orange-500/40" },
};

function TrendIcon({ trend }: { trend: LeaderboardTrend }) {
  if (trend === "up")
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === "down")
    return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-dark" />;
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_LEADERBOARD[0]?.id ?? "",
  );
  const [fetchedAt] = useState(() => Date.now());

  const selected = useMemo<LeaderboardPersona | undefined>(
    () => MOCK_LEADERBOARD.find((p) => p.id === selectedId),
    [selectedId],
  );

  const radarData = useMemo(() => {
    if (!selected) return [];
    const m = selected.metrics;
    return [
      { metric: t.leaderboardPage.metrics.reliability, value: m.reliability },
      { metric: t.leaderboardPage.metrics.cost, value: m.cost },
      { metric: t.leaderboardPage.metrics.speed, value: m.speed },
      { metric: t.leaderboardPage.metrics.quality, value: m.quality },
      { metric: t.leaderboardPage.metrics.volume, value: m.volume },
    ];
  }, [selected, t]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
          <Trophy className="h-5 w-5 text-amber-300" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">
              {t.leaderboardPage.title}
            </GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {t.leaderboardPage.subtitle}
          </p>
        </div>
        <StalenessIndicator fetchedAt={fetchedAt} className="mt-2" />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-glass bg-white/[0.02] p-3 lg:col-span-3"
        >
          <div className="grid grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 px-2 py-1.5 text-sm font-medium uppercase tracking-wider text-muted-dark">
            <span>{t.leaderboardPage.rank}</span>
            <span />
            <span>Agent</span>
            <span className="text-right">{t.leaderboardPage.composite}</span>
            <span className="text-right">Δ</span>
          </div>
          <div className="mt-1 space-y-1">
            {MOCK_LEADERBOARD.map((p, idx) => {
              const rank = (idx + 1) as 1 | 2 | 3 | number;
              const band = compositeBand(p.composite);
              const isSelected = p.id === selectedId;
              const medal = rank === 1 || rank === 2 || rank === 3
                ? medalStyle[rank as 1 | 2 | 3]
                : null;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`grid w-full grid-cols-[auto_auto_1fr_auto_auto] items-center gap-2 rounded-xl border px-2 py-2 text-left transition-all ${
                    isSelected
                      ? "border-brand-cyan/30 bg-brand-cyan/5"
                      : "border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold tabular-nums ${
                      medal
                        ? `${medal.bg} ${medal.color}`
                        : "border-glass-hover bg-white/[0.03] text-muted-dark"
                    }`}
                  >
                    {medal ? <Medal className="h-3 w-3" /> : rank}
                  </span>
                  <PersonaAvatar color={p.color} name={p.name} size="sm" />
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {p.name}
                    </span>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full ${band.bar}`}
                        style={{ width: `${p.composite}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-sm font-semibold tabular-nums ${band.pill}`}
                  >
                    {p.composite}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-sm tabular-nums ${
                      p.delta > 0
                        ? "text-emerald-400"
                        : p.delta < 0
                          ? "text-rose-400"
                          : "text-muted-dark"
                    }`}
                  >
                    <TrendIcon trend={p.trend} />
                    {p.delta > 0 ? "+" : ""}
                    {p.delta}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-glass bg-white/[0.02] p-5 lg:col-span-2"
        >
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {t.leaderboardPage.radarTitle}
            </h2>
            {selected && (
              <span className="rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted">
                {selected.name}
              </span>
            )}
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="75%">
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
      </div>
    </motion.div>
  );
}
