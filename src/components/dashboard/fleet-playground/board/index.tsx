"use client";

import { AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "@/i18n/useTranslation";
import { FLEET, type FleetScale } from "../fleet-data";
import Board, { computeLayout } from "./Board";
import Spotlight from "./Spotlight";
import TeamScene from "./TeamScene";
import AgentScene from "./AgentScene";
import Band from "./Band";
import NavRow from "./NavRow";
import { TEAM_BY_ID, fill } from "./model";
import { useArrival, useBoardSim, useSize, useToast } from "./useBoardRuntime";
import { useBoardNav } from "./useBoardNav";
import b from "./board.module.css";
import s from "./tiles.module.css";

/**
 * Variant 1 of the dashboard-fleet contest, "The Monitor, Relit": the desktop
 * Persona Monitor's ideas (state colour, attention badges, team bays, a
 * drawer, a usage strip) staged as a lit frame. A spotlight on the left holds
 * whatever is under attention; the board on the right holds the whole fleet.
 * Fleet -> team -> agent, each a composed scene with a way back.
 */
export default function BoardPrototype({ scale }: { scale: FleetScale }) {
  const { t } = useTranslation();
  const copy = t.fleetPlayground.board;
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const live = !still && !hidden;
  const arriving = useArrival(still);
  const stageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(mainRef);
  const [sim, dispatch] = useBoardSim(scale, still, hidden);
  const [toast, showToast] = useToast();

  const scope = sim.agents.slice(0, scale);
  const teams = FLEET.teams.filter((tm) => scope.some((a) => a.team === tm.id));
  const nav = useBoardNav({
    scope, scale, stageRef, still, toast: showToast, nobodyToast: copy.toasts.nobody,
    nextToast: (i, n, a) => fill(copy.toasts.next, { i: i + 1, n, callsign: a.callsign, name: a.name }),
  });
  const openAgent = nav.agentOpen ? scope.find((a) => a.id === nav.agentOpen) : undefined;
  const teamList = nav.teamOpen ? scope.filter((a) => a.team === nav.teamOpen) : [];
  const bayRect = nav.teamOpen ? computeLayout(teams, scope, width, height).bays[nav.teamOpen] : undefined;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-label={copy.label}
      className={`${b.root} ${still ? s.still : ""} relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 px-5 pb-4 pt-3 text-foreground`}
      onMouseMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        e.currentTarget.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      }}
    >
      <NavRow scope={scope} teamCount={teams.length} simMs={sim.simMs} copy={copy} nav={nav} />

      <div className="relative grid min-h-0 grid-cols-[minmax(300px,33%)_minmax(0,1fr)] gap-4">
        <Spotlight scope={scope} scale={scale} simMs={sim.simMs} events={sim.events} copy={copy} nav={nav} live={live} still={still} away={!!openAgent} />
        <div
          ref={mainRef}
          inert={!!openAgent}
          className={`relative min-h-0 transition-opacity duration-500 ${openAgent ? "pointer-events-none opacity-0" : ""}`}
        >
          <div
            inert={!!nav.teamOpen}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ${nav.teamOpen ? "pointer-events-none scale-[1.02] opacity-0" : ""}`}
          >
            <Board width={width} height={height} teams={teams} scope={scope} nav={nav} copy={copy} live={live} arriving={arriving} />
          </div>
          <AnimatePresence>
            {nav.teamOpen && bayRect && (
              <TeamScene
                key={nav.teamOpen}
                team={TEAM_BY_ID[nav.teamOpen]}
                list={teamList}
                from={bayRect}
                width={width}
                height={height}
                copy={copy}
                nav={nav}
                still={still}
                live={live}
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {openAgent && (
            <AgentScene
              key="agent"
              agent={openAgent}
              simMs={sim.simMs}
              events={sim.events}
              copy={copy}
              still={still}
              live={live}
              dispatch={dispatch}
              toast={showToast}
            />
          )}
        </AnimatePresence>
      </div>

      <Band scope={scope} simMs={sim.simMs} events={sim.events} copy={copy} nav={nav} live={live} />

      <div
        role="status"
        className={`pointer-events-none absolute left-1/2 top-12 z-20 -translate-x-1/2 rounded-xl bg-surface px-4 py-2 text-base text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--brand-cyan)_40%,transparent),0_12px_40px_rgb(0_0_0/0.3)] transition-opacity duration-300 ${
          toast ? "opacity-100" : "opacity-0"
        }`}
      >
        {toast?.text}
      </div>
    </div>
  );
}
