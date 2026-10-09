"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Bot } from "lucide-react";
import { DEFAULT_FLEET_SCALE, FLEET_SCALES, type FleetScale } from "@/components/dashboard/fleet-monitor/fleet-data";
import StageLoading from "@/components/dashboard/fleet-monitor/StageLoading";
import Deferred from "@/components/dashboard/arrival/Deferred";
import { useIsMobile } from "@/hooks/useIsMobile";
import PhonePersonas from "./phone/PhonePersonas";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

/* Each view is a client-only chunk: they carry the 130 KB demo fleet and
   their own artwork, none of which belongs in the dashboard's first load.
   The loaders are named so the stage's <Deferred> can start the default
   view's download while the frame paints (fetch early, mount late). */
const loadBoard = () => import("@/components/dashboard/fleet-monitor/board");
const loadNightCity = () => import("@/components/dashboard/fleet-monitor/night");

/** The chunk gap inside the stage: held, and shown only after the ghost delay. */
function StageGap() {
  return (
    <div className="dash-ghost h-full">
      <StageLoading />
    </div>
  );
}

const BoardView = dynamic(loadBoard, { ssr: false, loading: StageGap });
const NightCity = dynamic(loadNightCity, { ssr: false, loading: StageGap });

type View = "board" | "city";
const VIEWS: readonly View[] = ["board", "city"];

/**
 * `/dashboard/personas`. At phone width it is agent management (the persona
 * list with Pause/Resume, PLAN M13: a phone layout of this view, not a new
 * route); from 768 px up it is the fleet stage below, unchanged. The view is
 * client-only (next/dynamic ssr:false), so choosing by media query cannot
 * mismatch a server render.
 */
export default function PersonasView() {
  const phone = useIsMobile();
  return phone ? <PhonePersonas /> : <PersonasStage />;
}

/**
 * The desktop stage: the dashboard's main view, every persona in the fleet
 * on one screen. Board (every agent in team bays, drill-down to team and
 * agent) is the working view; Night shift (the fleet as a city) runs on the
 * Board's simulation and opens the same hover card and agent console. One thin toolbar row; the stage takes the rest
 * of the viewport, edge to edge (the view is full-bleed in `spa/views.ts`).
 */
function PersonasStage() {
  const copy = personasMonitorCopy;
  const [view, setView] = useState<View>("board");
  const [scale, setScale] = useState<FleetScale>(DEFAULT_FLEET_SCALE);

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
          <Bot aria-hidden className="h-4 w-4 text-brand-cyan" />
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
              onClick={() => setView(id)}
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
        {/* T3: the stage body mounts on the view's first deep turn; the
            toolbar above is T0 and paints at once. The section already fills
            the remaining height, so the slot reserves it all. */}
        <Deferred className="h-full" minHeight="100%" order={0} preload={loadBoard}>
          {view === "board" && <BoardView scale={scale} onView={setView} onScale={setScale} />}
          {view === "city" && <NightCity scale={scale} />}
        </Deferred>
      </section>
    </div>
  );
}
