import dynamic from "next/dynamic";

import Deferred from "@/components/dashboard/arrival/Deferred";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { RadarDatum } from "@/components/dashboard/LeaderboardRadarChart";
import type { LeaderboardPersona } from "@/lib/mock-dashboard-data";

// recharts (+ d3) is a 344 KB chunk; importing it here put it in this route's
// first load. Deferred, it is fetched when the card mounts.
// T3 body: one named loader for dynamic() and the <Deferred> slot's `preload`,
// so the chunk downloads with the frame and the mount waits for the view's
// arrival queue. The slot owns the wait, so the chunk's `loading` is empty -
// the fixed 300px box below is the reservation.
const CHART_HEIGHT = 300;
const loadRadarChart = () => import("@/components/dashboard/LeaderboardRadarChart");
const LeaderboardRadarChart = dynamic(loadRadarChart, {
  ssr: false,
  loading: () => <div aria-hidden className="h-full w-full" />,
});

export type { RadarDatum };

export function LeaderboardRadarCard({
  selected,
  benchmark,
  data,
  title,
}: {
  selected?: LeaderboardPersona;
  /** The #1 persona, overlaid faintly when a lower-ranked agent is selected. */
  benchmark?: LeaderboardPersona;
  data: RadarDatum[];
  title: string;
}) {
  const selectedColor = selected?.color ?? BRAND_VAR.cyan;

  return (
    <div className="rounded-2xl border border-glass bg-white/[0.02] p-5 lg:col-span-2">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {selected && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-glass bg-white/[0.03] px-1.5 py-0.5 text-sm font-medium text-muted">
            <span className="h-2 w-2 rounded-full" style={{ background: selectedColor }} />
            {selected.name}
          </span>
        )}
      </div>
      <div className="w-full" style={{ height: CHART_HEIGHT }}>
        <Deferred className="h-full" minHeight={CHART_HEIGHT} order={0} preload={loadRadarChart}>
          <LeaderboardRadarChart
            data={data}
            selectedName={selected?.name ?? ""}
            selectedColor={selectedColor}
            benchmarkName={benchmark?.name}
            benchmarkColor={benchmark?.color}
          />
        </Deferred>
      </div>
    </div>
  );
}
