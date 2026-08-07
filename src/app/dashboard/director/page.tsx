"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import SkeletonCard, { SkeletonChart } from "@/components/dashboard/SkeletonCard";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { useTranslation } from "@/i18n/useTranslation";
import { fadeUp, staggerContainer } from "@/lib/animations";

import { CoachingTable } from "./director-page/CoachingTable";
import { DirectorKpiGrid } from "./director-page/DirectorKpiGrid";
import { MomentumStrip } from "./director-page/MomentumStrip";
import { ScoreDistributionCard } from "./director-page/ScoreDistributionCard";
import { ValueBreakdownCard } from "./director-page/ValueBreakdownCard";
import { VerdictFeedCard } from "./director-page/VerdictFeedCard";
import type { RosterFacet } from "./director-page/directorMeta";
import { useDirectorData } from "./useDirectorData";

/**
 * Director — the coaching command center. Portfolio scorecard (value rate,
 * avg verdict, cost per value, scope), momentum buckets, value breakdown,
 * score distribution, per-agent verdict history, and the recent coaching
 * feed. One roster facet is active at a time (momentum chip, score band, or
 * attention flag); re-clicking clears it. Demo-only — mirrors the desktop
 * overview's Director tab on mock data.
 */
export default function DirectorPage() {
  const { t } = useTranslation();
  const lp = t.directorPage;
  const { portfolio, verdicts, isLoading, error, retry } = useDirectorData();
  const [facet, setFacet] = useState<RosterFacet | null>(null);
  // Snapshot the clock once per mount: attention flags and staleness are
  // stable for the life of the page (React 19 purity — no Date.now in render).
  const [now] = useState(() => Date.now());

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeUp} className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10">
          <Clapperboard className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{lp.title}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">{lp.subtitle}</p>
        </div>
        <div className="mt-2 flex items-center gap-3">
          {portfolio && (
            <span className="text-sm tabular-nums text-muted-dark">
              {lp.periodLabel.replace("{n}", String(portfolio.periodDays))}
            </span>
          )}
          <StalenessIndicator fetchedAt={now} />
        </div>
      </motion.div>

      {error && !portfolio && <DashboardErrorBanner message={error} onRetry={retry} />}

      {isLoading || !portfolio ? (
        <div className="space-y-6" aria-busy="true">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonChart />
            <SkeletonChart />
          </div>
          <SkeletonCard lines={5} />
        </div>
      ) : (
        <>
          <motion.div variants={fadeUp}>
            <DirectorKpiGrid portfolio={portfolio} />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6">
            <MomentumStrip roster={portfolio.roster} facet={facet} onFacetChange={setFacet} />
          </motion.div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <ValueBreakdownCard
                breakdown={portfolio.breakdown}
                total={portfolio.assessedExecutions}
              />
              <ScoreDistributionCard
                distribution={portfolio.scoreDistribution}
                avgScore={portfolio.avgScore}
                facet={facet}
                onFacetChange={setFacet}
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <VerdictFeedCard verdicts={verdicts} />
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="mt-6">
            <CoachingTable
              roster={portfolio.roster}
              now={now}
              facet={facet}
              onFacetChange={setFacet}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
