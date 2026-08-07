"use client";

import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import {
  AXIS_TICK,
  AXIS_TICK_LABEL,
  CHART_CURSOR_FILL,
  CHART_TOOLTIP_CLASS,
  GRID_STROKE,
  useChartAnimation,
} from "@/lib/chart-theme";
import type { DirectorScoreBand } from "@/lib/mock-dashboard-data";

import { scoreTone, type RosterFacet } from "./directorMeta";

function DistributionTooltip({
  active,
  payload,
  label,
  agentsLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
  agentsLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={CHART_TOOLTIP_CLASS}>
      <p className="text-muted-dark">
        {label}/5 · <span className="font-medium text-foreground">
          {agentsLabel.replace("{count}", String(payload[0].value))}
        </span>
      </p>
    </div>
  );
}

/**
 * Score distribution — how the latest 0–5 verdicts spread across the coaching
 * scope, always six bands. Clicking a band filters the coaching table to
 * agents at that score; the header pill carries the portfolio mean. Desktop
 * parity: the Director tab's ScoreDistribution histogram.
 */
export function ScoreDistributionCard({
  distribution,
  avgScore,
  facet,
  onFacetChange,
}: {
  distribution: DirectorScoreBand[];
  avgScore: number | null;
  facet: RosterFacet | null;
  onFacetChange: (facet: RosterFacet | null) => void;
}) {
  const { t } = useTranslation();
  const lp = t.directorPage.distribution;
  const anim = useChartAnimation();
  const hasScores = distribution.some((band) => band.count > 0);
  const selectedScore = facet?.type === "score" ? facet.score : null;

  return (
    <GlowCard accent="purple" className="flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-purple-400" />
        <h2 className="text-base font-semibold text-foreground">{lp.title}</h2>
        {avgScore !== null && (
          <span className="ml-auto rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-sm font-medium tabular-nums text-purple-300">
            {lp.avgLabel} {avgScore.toFixed(1)}
          </span>
        )}
      </div>

      {!hasScores ? (
        <p className="flex flex-1 items-center justify-center py-8 text-sm text-muted-dark">
          {lp.empty}
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distribution} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="score" tick={AXIS_TICK_LABEL} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              content={<DistributionTooltip agentsLabel={lp.agents} />}
              cursor={CHART_CURSOR_FILL}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer"
              onClick={(item) => {
                const band = (item as { payload?: DirectorScoreBand }).payload;
                if (!band || band.count === 0) return;
                onFacetChange(
                  selectedScore === band.score ? null : { type: "score", score: band.score },
                );
              }}
              {...anim}
            >
              {distribution.map((band) => (
                <Cell
                  key={band.score}
                  fill={scoreTone(band.score).series}
                  fillOpacity={
                    selectedScore === null ? 0.75 : selectedScore === band.score ? 0.95 : 0.25
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </GlowCard>
  );
}
