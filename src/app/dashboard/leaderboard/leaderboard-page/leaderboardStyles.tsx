import { Medal, Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { LeaderboardTrend } from "@/lib/mock-dashboard-data";

export function compositeBand(score: number): {
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

export const medalStyle: Record<1 | 2 | 3, { color: string; bg: string }> = {
  1: { color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/40" },
  2: { color: "text-slate-200", bg: "bg-slate-400/15 border-slate-400/40" },
  3: { color: "text-orange-300", bg: "bg-orange-500/15 border-orange-500/40" },
};

export function TrendIcon({ trend }: { trend: LeaderboardTrend }) {
  if (trend === "up")
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === "down")
    return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-dark" />;
}

export function RankBadge({
  rank,
}: {
  rank: number;
}) {
  const medal =
    rank === 1 || rank === 2 || rank === 3
      ? medalStyle[rank as 1 | 2 | 3]
      : null;

  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold tabular-nums ${
        medal
          ? `${medal.bg} ${medal.color}`
          : "border-glass-hover bg-white/[0.03] text-muted-dark"
      }`}
    >
      {medal ? <Medal className="h-3 w-3" /> : rank}
    </span>
  );
}
