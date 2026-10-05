"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { DEFAULT_FLEET_SCALE, FLEET_SCALES, type FleetScale } from "./fleet-data";
import StageLoading from "./StageLoading";

/* Each prototype is a client-only chunk: they carry the 130 KB demo fleet and
   their own artwork, none of which belongs in the route's first load. */
const BoardPrototype = dynamic(() => import("./board"), { ssr: false, loading: StageLoading });
const NightCity = dynamic(() => import("./night"), { ssr: false, loading: StageLoading });
const OfficeScene = dynamic(() => import("./night/Office"), { ssr: false, loading: StageLoading });

type View = "board" | "city" | "office";
const VIEWS: readonly View[] = ["board", "city", "office"];

/**
 * `/dashboard/playground`: the dashboard-fleet contest's prototypes ported
 * into the site's theme. Board is variant 1 (the monitor, relit); Night shift
 * and Office are variant 2 (the fleet as a city, and its office floor). One
 * thin toolbar row; the stage takes the rest of the viewport, edge to edge
 * (the dashboard layout drops its padding for this route).
 */
export default function FleetPlayground() {
  const { t } = useTranslation();
  const copy = t.fleetPlayground;
  const [view, setView] = useState<View>("board");
  const [scale, setScale] = useState<FleetScale>(DEFAULT_FLEET_SCALE);
  /** Office's open team; null shows the whole office floor (its L0). */
  const [teamId, setTeamId] = useState<string | null>(null);

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
    // 4.25rem is the dashboard navbar; the stage keeps a usable floor on short screens.
    <div className="flex h-[calc(100dvh-4.25rem)] min-h-[700px] flex-col">
      <header className="flex h-12 flex-none items-center gap-4 border-b border-glass px-4">
        <h1 className="flex items-center gap-2 text-base font-semibold text-foreground" title={copy.lede}>
          <FlaskConical aria-hidden className="h-4 w-4 text-brand-cyan" />
          {copy.title}
        </h1>
        <span className="rounded-full border border-brand-amber/40 bg-brand-amber/10 px-2 py-0.5 text-xs font-medium text-brand-amber">
          {copy.demoBadge}
        </span>
        <span className="hidden rounded-full border border-glass px-2 py-0.5 text-xs font-medium text-muted-dark xl:inline">
          {copy.artBadge}
        </span>

        <div
          role="tablist"
          aria-label={copy.viewsLabel}
          className="ml-2 flex gap-1"
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
              title={copy.viewHints[id]}
              onClick={() => {
                if (id === "office" && view !== "office") setTeamId(null);
                setView(id);
              }}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                view === id ? "bg-brand-cyan/15 text-foreground" : "text-muted-dark hover:text-foreground"
              }`}
            >
              {copy.views[id]}
            </button>
          ))}
        </div>

        <div role="group" aria-label={copy.scaleLabel} className="ml-auto flex items-center gap-0.5 rounded-full border border-glass p-0.5 text-sm">
          <span className="px-2 text-xs uppercase tracking-wider text-muted-dark">{copy.scaleLabel}</span>
          {FLEET_SCALES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={scale === n}
              onClick={() => setScale(n)}
              className={`rounded-full px-2.5 py-0.5 tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
                scale === n ? "bg-brand-cyan/15 text-foreground" : "text-muted-dark hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </header>

      <section
        id="fleet-stage"
        role="tabpanel"
        aria-labelledby={`fleet-view-${view}`}
        className="relative min-h-0 flex-1 overflow-hidden bg-background"
      >
        {view === "board" && <BoardPrototype scale={scale} />}
        {view === "city" && <NightCity scale={scale} onOpenTeam={openTeam} />}
        {view === "office" && (
          <OfficeScene scale={scale} teamId={teamId} onTeamChange={setTeamId} />
        )}
      </section>
    </div>
  );
}
