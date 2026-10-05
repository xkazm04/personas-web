"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "@/i18n/useTranslation";
import { FLEET, type FleetScale } from "../fleet-data";
import FleetFrame from "../FleetFrame";
import NeedsYouRail from "../NeedsYouRail";
import { ATTENTION_COLOR, countAttention } from "../attention";
import Field, { computeLayout } from "./Field";
import TeamScene from "./TeamScene";
import AgentScene from "./AgentScene";
import TopStrip from "./TopStrip";
import BottomStrip from "./BottomStrip";
import { TEAM_BY_ID, fill } from "./model";
import { railItems } from "./copy";
import { useArrival, useBoardSim, useSize, useToast } from "./useBoardRuntime";
import { useBoardNav } from "./useBoardNav";
import b from "./board.module.css";
import s from "./tiles.module.css";

/** The shared attention colours, handed to the board's CSS as variables. */
const ATTENTION_VARS = {
  "--at-working": ATTENTION_COLOR.working,
  "--at-warning": ATTENTION_COLOR.warning,
  "--at-critical": ATTENTION_COLOR.critical,
} as CSSProperties;

/**
 * Variant 1 of the dashboard-fleet contest, "The Monitor, Relit", as a
 * full-frame real-time overview. L0 is the nine team bays edge to edge, every
 * agent a tile you can sort by eye (working lit, needs loud, resting ghosted,
 * off hatched); all text lives on the frame's edges and in a floating card.
 * Team (L1) and agent (L2) open inside the field, each with a way back.
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
  const bayRect = nav.teamOpen ? computeLayout(teams, scope, width, height).bays[nav.teamOpen] : undefined;
  const deep = !!(openAgent || nav.teamOpen);

  const main = (
    <div ref={mainRef} className="absolute inset-0">
      <div inert={deep} className={`absolute inset-0 transition-[opacity,transform] duration-500 ${deep ? "pointer-events-none scale-[1.02] opacity-0" : ""}`}>
        <Field width={width} height={height} teams={teams} scope={scope} nav={nav} copy={copy} live={live} arriving={arriving} />
      </div>
      <AnimatePresence>
        {nav.teamOpen && bayRect && (
          <TeamScene
            key={nav.teamOpen}
            covered={!!openAgent}
            team={TEAM_BY_ID[nav.teamOpen]}
            list={scope.filter((a) => a.team === nav.teamOpen)}
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
      <AnimatePresence>
        {openAgent && (
          <AgentScene key="agent" agent={openAgent} simMs={sim.simMs} events={sim.events} copy={copy} still={still} live={live} dispatch={dispatch} toast={showToast} />
        )}
      </AnimatePresence>
      <div
        role="status"
        className={`pointer-events-none absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-xl bg-surface px-4 py-2 text-base text-foreground shadow-[inset_0_0_0_1px_var(--border-glass-strong),0_12px_40px_rgb(0_0_0/0.3)] transition-opacity duration-300 ${toast ? "opacity-100" : "opacity-0"}`}
      >
        {toast?.text}
      </div>
    </div>
  );

  return (
    <div
      ref={stageRef}
      className={`${b.root} ${still ? s.still : ""} h-full text-foreground`}
      style={ATTENTION_VARS}
      onMouseMove={(e) => {
        if (still) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        e.currentTarget.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      }}
    >
      <FleetFrame
        label={copy.label}
        top={<TopStrip counts={countAttention(scope)} scope={scope} simMs={sim.simMs} copy={copy} nav={nav} />}
        main={main}
        rail={
          <NeedsYouRail
            items={railItems(scope, sim.simMs, sim.events, copy)}
            activeId={nav.att?.type === "agent" ? nav.att.id : null}
            onHover={(id) => (id ? nav.attend({ type: "agent", id }) : nav.unattend())}
            onSelect={(id) => nav.openAgent(id, document.activeElement as HTMLElement | null)}
          />
        }
        bottom={<BottomStrip scope={scope} simMs={sim.simMs} events={sim.events} copy={copy} nav={nav} live={live} />}
      />
    </div>
  );
}
