"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import SkeletonCard, { SkeletonChart } from "@/components/dashboard/SkeletonCard";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { type LeaderboardPersona } from "@/lib/mock-dashboard-data";

import { LeaderboardRadarCard } from "./leaderboard-page/LeaderboardRadarCard";
import { LeaderboardTable } from "./leaderboard-page/LeaderboardTable";
import { useLeaderboardData } from "./useLeaderboardData";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { personas, loading, error } = useLeaderboardData();
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

  // The top-ranked persona doubles as the benchmark; we overlay its profile
  // faintly whenever a lower-ranked agent is in focus so the gap is legible.
  const benchmark = personas[0];
  const isComparing = Boolean(selected && benchmark && selected.id !== benchmark.id);

  const radarData = useMemo(() => {
    if (!selected) return [];
    const m = selected.metrics;
    const b = benchmark?.metrics;
    const axes = [
      ["reliability", t.leaderboardPage.metrics.reliability],
      ["cost", t.leaderboardPage.metrics.cost],
      ["speed", t.leaderboardPage.metrics.speed],
      ["quality", t.leaderboardPage.metrics.quality],
      ["volume", t.leaderboardPage.metrics.volume],
    ] as const;
    return axes.map(([key, label]) => ({
      metric: label,
      value: m[key],
      benchmark: b?.[key],
    }));
  }, [selected, benchmark, t]);

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

      {error && <DashboardErrorBanner message={error} />}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-5" aria-busy="true">
          <SkeletonCard className="lg:col-span-3" lines={6} />
          <SkeletonChart className="lg:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <LeaderboardTable
            personas={personas}
            selectedId={selectedId}
            labels={{
              rank: t.leaderboardPage.rank,
              agent: t.dashboardUi.agent,
              composite: t.leaderboardPage.composite,
              delta: t.leaderboardPage.delta,
            }}
            onSelect={setPickedId}
          />
          <LeaderboardRadarCard
            selected={selected}
            benchmark={isComparing ? benchmark : undefined}
            data={radarData}
            title={t.leaderboardPage.radarTitle}
          />
        </div>
      )}
    </motion.div>
  );
}
