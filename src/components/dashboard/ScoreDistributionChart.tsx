"use client";

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

import {
  AXIS_TICK,
  AXIS_TICK_LABEL,
  CHART_CURSOR_FILL,
  CHART_TOOLTIP_CLASS,
  GRID_STROKE,
  useChartAnimation,
} from "@/lib/chart-theme";

/**
 * The recharts half of ScoreDistributionCard, split out so the card can defer
 * it with `next/dynamic({ ssr: false })`. Bands arrive with their fill colour
 * already resolved, so this stays free of director-page imports and can sit
 * with the other deferred charts.
 */

export interface ScoreBand {
  score: number;
  count: number;
  fill: string;
}

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

export default function ScoreDistributionChart({
  bands,
  selectedScore,
  onSelectScore,
  agentsLabel,
}: {
  bands: ScoreBand[];
  selectedScore: number | null;
  onSelectScore: (score: number) => void;
  agentsLabel: string;
}) {
  const anim = useChartAnimation();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={bands} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="score" tick={AXIS_TICK_LABEL} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          content={<DistributionTooltip agentsLabel={agentsLabel} />}
          cursor={CHART_CURSOR_FILL}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          className="cursor-pointer"
          onClick={(item) => {
            const band = (item as { payload?: ScoreBand }).payload;
            if (!band || band.count === 0) return;
            onSelectScore(band.score);
          }}
          {...anim}
        >
          {bands.map((band) => (
            <Cell
              key={band.score}
              fill={band.fill}
              fillOpacity={
                selectedScore === null ? 0.75 : selectedScore === band.score ? 0.95 : 0.25
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
