"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, useState, type CSSProperties } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { FLEET, type FleetScale } from "../fleet-data";
import FleetFrame from "../FleetFrame";
import NeedsYouRail from "../NeedsYouRail";
import { ATTENTION_COLOR, countAttention } from "../attention";
import Field, { computeLayout } from "./Field";
import TeamScene from "./TeamScene";
import AgentScene from "./AgentScene";
import TopStrip from "./TopStrip";
import BottomStrip from "./BottomStrip";
import { TEAM_BY_ID, fill, orderInBay } from "./model";
import { NO_FOCUS, inFocus, isFocusing, matchesQuery, type FocusFilter } from "./focus";
import { railItems } from "./copy";
import HostCard, { OfflineBanner } from "./HostCard";
import Toast from "./Toast";
import { readHost } from "./host";
import { useArrival, useBoardSim, useHostStatus, useSize, useToast } from "./useBoardRuntime";
import { isOpen, useCommands } from "./useCommands";
import FleetPauseDialog from "./FleetPauseDialog";
import { makeOperator } from "./operator";
import { useBoardNav } from "./useBoardNav";
import b from "./board.module.css";
import s from "./tiles.module.css";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

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
  const copy = personasMonitorCopy.board;
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const hostStatus = useHostStatus();
  const offline = hostStatus === "offline";
  const live = !still && !hidden && !offline;
  const arriving = useArrival(still);
  const stageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(mainRef);
  const [sim, dispatch] = useBoardSim(scale, still, hidden, offline);
  const [toast, showToast] = useToast();
  const commands = useCommands(dispatch);
  const [confirmPause, setConfirmPause] = useState(false);
  const [focus, setFocus] = useState<FocusFilter>(NO_FOCUS);

  const scope = sim.agents.slice(0, scale);
  const teams = FLEET.teams.filter((tm) => scope.some((a) => a.team === tm.id));
  const nav = useBoardNav({
    scope, scale, stageRef, still, toast: showToast, nobodyToast: copy.toasts.nobody,
    nextToast: (i, n, a) => fill(copy.toasts.next, { i: i + 1, n, callsign: a.callsign, name: a.name }),
  });
  const openAgent = nav.agentOpen ? scope.find((a) => a.id === nav.agentOpen) : undefined;
  const bayRect = nav.teamOpen ? computeLayout(teams, scope, width, height).bays[nav.teamOpen] : undefined;
  const deep = !!(openAgent || nav.teamOpen);
  const host = readHost(scope, scale, sim.simMs, sim.beatAt, hostStatus);
  const op = makeOperator({ commands, toast: showToast, copy, hostName: host.name, offline });
  // Find and focus: what matches, in the field's reading order (Enter opens the first).
  const focusing = isFocusing(focus);
  const reading = teams.flatMap((t) => orderInBay(scope.filter((a) => a.team === t.id)));
  const matches = focusing ? reading.filter((a) => inFocus(a, focus, copy)) : reading;
  const matchIds = focusing ? new Set(matches.map((a) => a.id)) : null;
  const railScope = focus.query.trim() ? scope.filter((a) => matchesQuery(a, focus.query, copy)) : scope;

  const main = (
    <div className="absolute inset-0 flex flex-col">
      {offline && <OfflineBanner host={host} copy={copy} />}
      <div ref={mainRef} className="relative min-h-0 flex-1">
        <div inert={deep} className={`absolute inset-0 transition-[opacity,transform,filter] duration-500 ${deep ? "pointer-events-none scale-[1.02] opacity-0" : ""} ${offline ? "saturate-[.4]" : ""}`}>
          <Field width={width} height={height} teams={teams} scope={scope} nav={nav} copy={copy} live={live} arriving={arriving} cmds={commands.cmds} hostName={host.name} matchIds={matchIds} />
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
            <AgentScene key="agent" agent={openAgent} simMs={sim.simMs} events={sim.events} copy={copy} still={still} live={live} op={op} cmds={commands.cmds} hostName={host.name} onStep={nav.stepAgent} />
          )}
        </AnimatePresence>
        <Toast toast={toast} />
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
        top={<TopStrip counts={countAttention(scope)} scope={scope} simMs={sim.simMs} copy={copy} nav={nav} host={host} focus={focus} onFocus={setFocus} matches={matches} />}
        main={main}
        rail={
          <>
            <HostCard
              host={host}
              copy={copy}
              live={live}
              fleetPaused={(sim.fleetPaused ?? []).filter((id) => scope.some((a) => a.id === id && !a.enabled)).length}
              pending={commands.cmds.find((c) => c.agentId === null && isOpen(c))}
              onPauseAll={() => setConfirmPause(true)}
              onResumeAll={() => op.resumeAll((sim.fleetPaused ?? []).length)}
            />
            <NeedsYouRail
              items={railItems(railScope, sim.simMs, sim.events, copy)}
              total={railScope === scope ? undefined : countAttention(scope).needs}
              emptyText={railScope === scope ? undefined : personasMonitorCopy.rail.emptyFiltered}
              activeId={nav.att?.type === "agent" ? nav.att.id : null}
              onHover={(id) => (id ? nav.attend({ type: "agent", id }) : nav.unattend())}
              onSelect={(id) => nav.openAgent(id, document.activeElement as HTMLElement | null)}
            />
          </>
        }
        bottom={<BottomStrip scope={scope} simMs={sim.simMs} events={sim.events} copy={copy} nav={nav} live={live} offline={offline} />}
      />
      <FleetPauseDialog open={confirmPause} onClose={() => setConfirmPause(false)} scope={scope} hostName={host.name} copy={copy} onConfirm={op.pauseAll} />
    </div>
  );
}
