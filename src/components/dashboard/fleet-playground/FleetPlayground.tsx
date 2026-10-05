"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { DEFAULT_FLEET_SCALE, FLEET, FLEET_SCALES, type FleetScale } from "./fleet-data";
import StageLoading from "./StageLoading";

/* Each prototype is a client-only chunk: they carry the 130 KB demo fleet and
   their own artwork, none of which belongs in the route's first load. */
const BoardPrototype = dynamic(() => import("./board"), { ssr: false, loading: StageLoading });
const NightCity = dynamic(() => import("./night"), { ssr: false, loading: StageLoading });
const OfficeScene = dynamic(() => import("./night/Office"), { ssr: false, loading: StageLoading });

type View = "board" | "city" | "office";
const VIEWS: readonly View[] = ["board", "city", "office"];

/**
 * `/dashboard/playground`: the dashboard-fleet contest's winning ideas ported
 * into the site's theme, side by side. Board is variant 1 (the monitor,
 * relit); Night shift and Office are variant 2 (the fleet as a city, and one
 * team's building opened up). One scale control drives all three.
 */
export default function FleetPlayground() {
  const { t } = useTranslation();
  const copy = t.fleetPlayground;
  const [view, setView] = useState<View>("board");
  const [scale, setScale] = useState<FleetScale>(DEFAULT_FLEET_SCALE);
  const [teamId, setTeamId] = useState<string>(FLEET.agents[0].team);

  const openTeam = (id: string) => {
    setTeamId(id);
    setView("office");
  };

  const moveView = (delta: number) => {
    const next = VIEWS[(VIEWS.indexOf(view) + delta + VIEWS.length) % VIEWS.length];
    setView(next);
    document.getElementById(`fleet-view-${next}`)?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-foreground">
            <FlaskConical aria-hidden className="h-6 w-6 text-brand-cyan" />
            {copy.title}
            <span className="rounded-full border border-brand-amber/40 bg-brand-amber/10 px-2.5 py-0.5 text-xs font-medium text-brand-amber">
              {copy.demoBadge}
            </span>
            <span className="rounded-full border border-glass px-2.5 py-0.5 text-xs font-medium text-muted-dark">
              {copy.artBadge}
            </span>
          </h1>
          <p className="mt-1 max-w-3xl text-base text-muted-dark">{copy.lede}</p>
        </div>

        <div role="group" aria-label={copy.scaleLabel} className="flex items-center gap-1 rounded-full border border-glass p-0.5 text-sm">
          <span className="px-2 text-xs uppercase tracking-wider text-muted-dark">{copy.scaleLabel}</span>
          {FLEET_SCALES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={scale === n}
              onClick={() => setScale(n)}
              className={`rounded-full px-3 py-1 tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                scale === n ? "bg-brand-cyan/15 text-foreground" : "text-muted-dark hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </header>

      <div
        role="tablist"
        aria-label={copy.viewsLabel}
        className="flex flex-wrap gap-2"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); moveView(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); moveView(-1); }
        }}
      >
        {VIEWS.map((id) => (
          <button
            key={id}
            id={`fleet-view-${id}`}
            type="button"
            role="tab"
            aria-selected={view === id}
            aria-controls="fleet-stage"
            tabIndex={view === id ? 0 : -1}
            onClick={() => setView(id)}
            className={`flex flex-col items-start rounded-xl border px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
              view === id
                ? "border-brand-cyan/50 bg-brand-cyan/10 text-foreground"
                : "border-glass text-muted-dark hover:border-glass-hover hover:text-foreground"
            }`}
          >
            <span className="text-sm font-semibold">{copy.views[id]}</span>
            <span className="text-xs text-muted-dark">{copy.viewHints[id]}</span>
          </button>
        ))}
      </div>

      <section
        id="fleet-stage"
        role="tabpanel"
        aria-labelledby={`fleet-view-${view}`}
        className="relative h-[clamp(720px,calc(100dvh-7rem),960px)] overflow-hidden rounded-2xl border border-glass bg-background"
      >
        {view === "board" && <BoardPrototype scale={scale} />}
        {view === "city" && <NightCity scale={scale} onOpenTeam={openTeam} />}
        {view === "office" && (
          <OfficeScene scale={scale} teamId={teamId} onTeamChange={setTeamId} onBack={() => setView("city")} />
        )}
      </section>
    </div>
  );
}
