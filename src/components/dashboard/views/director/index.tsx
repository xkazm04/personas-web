"use client";

import { useState } from "react";
import { Clapperboard, CloudOff } from "lucide-react";

import GradientText from "@/components/GradientText";
import DashboardErrorBanner from "@/components/dashboard/DashboardErrorBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import StalenessIndicator from "@/components/dashboard/StalenessIndicator";
import { ARRIVE, arriveAt } from "@/components/dashboard/arrival/arrive";
import { useTranslation } from "@/i18n/useTranslation";

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
 * overview's Director tab on mock data; a real (non-demo) session sees an
 * empty state instead.
 *
 * Loading follows the tier standard (docs/features/dashboard/loading-orchestration.md):
 * the header (T0) and every card's chrome (T1, CSS cascade) paint at once,
 * even before the snapshot lands; values fill the chrome (T2, delayed ghosts
 * while nothing is held); the histogram and the coaching rows are deep (T3)
 * `<Deferred>` slots.
 */
export default function DirectorPage() {
  const { t } = useTranslation();
  const lp = t.directorPage;
  const { portfolio, verdicts, isLoading, error, retry, liveUnavailable } = useDirectorData();
  const [facet, setFacet] = useState<RosterFacet | null>(null);
  // Snapshot the clock once per mount: attention flags and staleness are
  // stable for the life of the page (React 19 purity — no Date.now in render).
  const [now] = useState(() => Date.now());
  // Ghosts only on a cold load; a failed fetch keeps the chrome, empty.
  const ghost = isLoading && !portfolio;
  // Mounted without data (SWR cache cold): T2 values enter when they land.
  // A warm mount has nothing to settle — the section cascade is the entrance.
  const [settle] = useState(() => !portfolio);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
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
          {!liveUnavailable && <StalenessIndicator fetchedAt={now} />}
        </div>
      </div>

      {error && !portfolio && <DashboardErrorBanner message={error} onRetry={retry} />}

      {liveUnavailable ? (
        <div className={ARRIVE} style={arriveAt(0)}>
          <EmptyState
            icon={CloudOff}
            title={t.dashboardUi.liveUnavailableTitle}
            description={t.dashboardUi.liveUnavailableDescription}
          />
        </div>
      ) : (
        <div aria-busy={ghost || undefined}>
          <div className={ARRIVE} style={arriveAt(0)}>
            <DirectorKpiGrid portfolio={portfolio} ghost={ghost} settle={settle} />
          </div>

          <div className={`${ARRIVE} mt-6`} style={arriveAt(1)}>
            <MomentumStrip roster={portfolio?.roster ?? null} facet={facet} onFacetChange={setFacet} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className={`${ARRIVE} flex flex-col gap-6`} style={arriveAt(2)}>
              <ValueBreakdownCard
                breakdown={portfolio?.breakdown ?? null}
                total={portfolio?.assessedExecutions ?? 0}
                ghost={ghost}
                settle={settle}
              />
              <ScoreDistributionCard
                distribution={portfolio?.scoreDistribution ?? null}
                avgScore={portfolio?.avgScore ?? null}
                facet={facet}
                onFacetChange={setFacet}
              />
            </div>
            <div className={ARRIVE} style={arriveAt(3)}>
              <VerdictFeedCard verdicts={portfolio ? verdicts : null} ghost={ghost} settle={settle} />
            </div>
          </div>

          <div className={`${ARRIVE} mt-6`} style={arriveAt(4)}>
            <CoachingTable
              roster={portfolio?.roster ?? null}
              now={now}
              facet={facet}
              onFacetChange={setFacet}
            />
          </div>
        </div>
      )}
    </div>
  );
}
