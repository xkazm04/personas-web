"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

import GradientText from "@/components/GradientText";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { type LeaderboardPersona } from "@/lib/mock-dashboard-data";

import { LeaderboardRadarCard } from "./leaderboard-page/LeaderboardRadarCard";
import { LeaderboardTable } from "./leaderboard-page/LeaderboardTable";
import { useLeaderboardData } from "./useLeaderboardData";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { personas } = useLeaderboardData();
  // null = no explicit pick yet → fall back to the top-ranked persona. This
  // keeps the selection valid as data loads / changes without a sync effect.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [fetchedAt] = useState(() => Date.now());

  const selected = useMemo<LeaderboardPersona | undefined>(() => {
    const picked =
      pickedId !== null
        ? personas.find((persona) => persona.id === pickedId)
        : undefined;
    return picked ?? personas[0];
  }, [personas, pickedId]);
  const selectedId = selected?.id ?? "";

  const radarData = useMemo(() => {
    if (!selected) return [];
    const metrics = selected.metrics;
    return [
      { metric: t.leaderboardPage.metrics.reliability, value: metrics.reliability },
      { metric: t.leaderboardPage.metrics.cost, value: metrics.cost },
      { metric: t.leaderboardPage.metrics.speed, value: metrics.speed },
      { metric: t.leaderboardPage.metrics.quality, value: metrics.quality },
      { metric: t.leaderboardPage.metrics.volume, value: metrics.volume },
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
        <LeaderboardTable
          personas={personas}
          selectedId={selectedId}
          labels={{
            rank: t.leaderboardPage.rank,
            agent: t.dashboardUi.agent,
            composite: t.leaderboardPage.composite,
          }}
          onSelect={setPickedId}
        />
        <LeaderboardRadarCard
          selected={selected}
          data={radarData}
          title={t.leaderboardPage.radarTitle}
        />
      </div>
    </motion.div>
  );
}
