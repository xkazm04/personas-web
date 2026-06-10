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
  const [comparing, setComparing] = useState(false);
  const [compareId, setCompareId] = useState<string | null>(null);
  const [fetchedAt] = useState(() => Date.now());

  const selected = useMemo<LeaderboardPersona | undefined>(() => {
    const picked =
      pickedId !== null
        ? personas.find((persona) => persona.id === pickedId)
        : undefined;
    return picked ?? personas[0];
  }, [personas, pickedId]);
  const selectedId = selected?.id ?? "";

  // In compare mode, fall back to the next-best persona so there is always a
  // head-to-head opponent without forcing an extra click.
  const compareSelected = useMemo<LeaderboardPersona | undefined>(() => {
    if (!comparing) return undefined;
    const explicit =
      compareId !== null
        ? personas.find((persona) => persona.id === compareId)
        : undefined;
    return explicit ?? personas.find((persona) => persona.id !== selectedId);
  }, [comparing, compareId, personas, selectedId]);
  const compareSelectedId = compareSelected?.id ?? "";

  // While comparing, a row click pins the opponent; otherwise it picks primary.
  const handleSelect = (id: string) => {
    if (comparing) {
      if (id !== selectedId) setCompareId(id);
    } else {
      setPickedId(id);
    }
  };

  const radarData = useMemo(() => {
    const a = selected?.metrics;
    const b = compareSelected?.metrics;
    const axes: { key: keyof LeaderboardPersona["metrics"]; label: string }[] = [
      { key: "reliability", label: t.leaderboardPage.metrics.reliability },
      { key: "cost", label: t.leaderboardPage.metrics.cost },
      { key: "speed", label: t.leaderboardPage.metrics.speed },
      { key: "quality", label: t.leaderboardPage.metrics.quality },
      { key: "volume", label: t.leaderboardPage.metrics.volume },
    ];
    return axes.map(({ key, label }) => ({
      metric: label,
      a: a ? a[key] : 0,
      ...(b ? { b: b[key] } : {}),
    }));
  }, [selected, compareSelected, t]);

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
          compareId={comparing ? compareSelectedId : ""}
          labels={{
            rank: t.leaderboardPage.rank,
            agent: t.dashboardUi.agent,
            composite: t.leaderboardPage.composite,
            delta: t.leaderboardPage.delta,
            sortBy: t.leaderboardPage.sortBy,
          }}
          onSelect={handleSelect}
        />
        <LeaderboardRadarCard
          primary={selected}
          compare={compareSelected}
          data={radarData}
          title={t.leaderboardPage.radarTitle}
          comparing={comparing}
          onToggleCompare={() => setComparing((on) => !on)}
          compareLabel={t.leaderboardPage.compare}
          versusLabel={t.leaderboardPage.versus}
        />
      </div>
    </motion.div>
  );
}
