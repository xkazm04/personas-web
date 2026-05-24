"use client";

import Link from "next/link";
import { ChevronRight, Minus, Trophy, TrendingDown, TrendingUp } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import PersonaAvatar from "@/components/dashboard/PersonaAvatar";
import { healthScoreColor } from "@/components/dashboard/healthScoreColor";
import { useTranslation } from "@/i18n/useTranslation";
import { MOCK_LEADERBOARD, type LeaderboardTrend } from "@/lib/mock-dashboard-data";

const MEDALS = [
  { label: "1st", className: "border-amber-500/30 bg-amber-500/15 text-amber-400" },
  { label: "2nd", className: "border-slate-400/30 bg-slate-300/15 text-slate-300" },
  { label: "3rd", className: "border-orange-600/30 bg-orange-600/15 text-orange-400" },
];

const TREND: Record<LeaderboardTrend, { Icon: React.ElementType; color: string }> = {
  up: { Icon: TrendingUp, color: "text-emerald-400" },
  flat: { Icon: Minus, color: "text-muted-dark" },
  down: { Icon: TrendingDown, color: "text-rose-400" },
};

/**
 * Top-performers snapshot: the leaderboard's top three personas with medal,
 * trend, and composite score. The web counterpart to the desktop overview's
 * TopPerformersWidget. MOCK_LEADERBOARD is pre-sorted by composite desc.
 */
export function TopPerformersCard() {
  const { t } = useTranslation();
  const top = MOCK_LEADERBOARD.slice(0, 3);

  return (
    <GlowCard accent="amber" className="h-full p-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">{t.dashboard.home.topPerformers.title}</h2>
        <Link
          href="/dashboard/leaderboard"
          className="ml-auto flex items-center gap-0.5 text-sm text-muted-dark transition-colors hover:text-foreground focus-ring focus-visible:ring-offset-0"
        >
          {t.dashboard.leaderboard}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {top.map((entry, index) => {
          const medal = MEDALS[index];
          const trend = TREND[entry.trend];
          const TrendIcon = trend.Icon;
          const scoreColor = healthScoreColor(entry.composite).text;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
            >
              <span
                className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border text-sm font-bold ${medal.className}`}
              >
                {medal.label}
              </span>
              <PersonaAvatar color={entry.color} name={entry.name} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {entry.name}
              </span>
              <TrendIcon className={`h-3.5 w-3.5 flex-shrink-0 ${trend.color}`} />
              <span className={`flex-shrink-0 text-base font-bold tabular-nums ${scoreColor}`}>
                {entry.composite}
              </span>
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
}
