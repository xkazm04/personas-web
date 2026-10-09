"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { FLEET, type FleetScale } from "../fleet-data";
import FleetFrame from "../FleetFrame";
import { ATTENTION_COLOR, countAttention } from "../attention";
import Field, { computeLayout } from "./Field";
import TopStrip from "./TopStrip";
import BottomStrip from "./BottomStrip";
import BoardScenes from "./BoardScenes";
import ActivityDrawer from "./ActivityDrawer";
import JustIn from "./JustIn";
import { fill, queueOf } from "./model";
import { NO_FOCUS, focusView, type FocusFilter } from "./focus";
import { railItems } from "./copy";
import { OfflineBanner } from "./HostCard";
import BoardRail from "./BoardRail";
import FleetList from "./FleetList";
import Toast from "./Toast";
import { readHost } from "./host";
import { useArrival, useBoardSim, useHostStatus, useJustIn, useSize, useTitleBadge, useToast } from "./useBoardRuntime";
import { isOpen, useCommands } from "./useCommands";
import FleetPauseDialog from "./FleetPauseDialog";
import CommandPalette from "./CommandPalette";
import ShortcutMap from "./ShortcutMap";
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
interface BoardProps {
  scale: FleetScale;
  /** The shell's view and scale, for the command palette. */
  onView?: (v: "board" | "city") => void;
  onScale?: (n: FleetScale) => void;
}

export default function BoardPrototype({ scale, onView, onScale }: BoardProps) {
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
  const [palette, setPalette] = useState(false);
  const [triage, setTriage] = useState(false);
  const [layout, setLayout] = useState<"field" | "list">("field");
  const [activity, setActivity] = useState(false);
  const [alertsOn, setAlertsOn] = useState(true);
  const [keysOpen, setKeysOpen] = useState(false);

  // Memoised so a render that is not a tick (a layer opening, a toggle) reuses
  // the layout, and memoised tiles see the same places.
  const scope = useMemo(() => sim.agents.slice(0, scale), [sim.agents, scale]);
  const teams = useMemo(() => FLEET.teams.filter((tm) => scope.some((a) => a.team === tm.id)), [scope]);
  const fieldLayout = useMemo(() => computeLayout(teams, scope, width, height), [teams, scope, width, height]);
  const nav = useBoardNav({
    scope, scale, stageRef, still, toast: showToast, nobodyToast: copy.toasts.nobody,
    nextToast: (i, n, a) => fill(copy.toasts.next, { i: i + 1, n, callsign: a.callsign, name: a.name }),
    onTriage: () => startTriage(),
    onLayout: () => setLayout((l) => (l === "field" ? "list" : "field")),
    onActivity: () => setActivity((v) => !v),
    onShortcuts: () => setKeysOpen(true),
  });
  function startTriage() {
    nav.closeAgent(false);
    nav.closeTeam(false);
    setActivity(false);
    setTriage(true);
  }
  const openAgentFrom = (id: string) => {
    setActivity(false);
    nav.openAgent(id, null);
  };
  const counts = countAttention(scope);
  const deep = !!(nav.agentOpen || nav.teamOpen || triage);
  const host = readHost(scope, scale, sim.simMs, sim.beatAt, hostStatus);
  const op = makeOperator({ commands, toast: showToast, copy, hostName: host.name, offline, simMs: sim.simMs });
  const fv = focusView(scope, teams.map((t) => t.id), focus, copy);
  const fleetPaused = (sim.fleetPaused ?? []).filter((id) => scope.some((a) => a.id === id && !a.enabled)).length;
  const justIn = useJustIn(queueOf(scope).map((a) => a.id), alertsOn && !offline);
  useTitleBadge(counts.needs);

  const main = (
    <div className="absolute inset-0 flex flex-col">
      {offline && <OfflineBanner host={host} copy={copy} />}
      <div ref={mainRef} className="relative min-h-0 flex-1">
        <div inert={deep} className={`absolute inset-0 transition-[opacity,transform,filter] duration-500 ${deep ? "pointer-events-none scale-[1.02] opacity-0" : ""} ${offline ? "saturate-[.4]" : ""}`}>
          {layout === "field" ? (
            <Field width={width} height={height} teams={teams} layout={fieldLayout} nav={nav} copy={copy} live={live} arriving={arriving} cmds={commands.cmds} hostName={host.name} matchIds={fv.matchIds} />
          ) : (
            <FleetList agents={fv.matches} copy={copy} op={op} cmds={commands.cmds} hostName={host.name} onOpen={nav.openAgent} onTeam={(t) => setFocus({ ...focus, query: t })} />
          )}
        </div>
        <BoardScenes
          scope={scope} nav={nav} bayRect={nav.teamOpen ? fieldLayout.bays[nav.teamOpen] : undefined}
          width={width} height={height} simMs={sim.simMs} events={sim.events} copy={copy} still={still} live={live}
          op={op} cmds={commands.cmds} hostName={host.name} triage={triage} onTriageClose={() => setTriage(false)}
        />
        {!deep && <JustIn alerts={justIn.alerts} scope={scope} copy={copy} onOpen={(id) => { justIn.clear(); openAgentFrom(id); }} onDismiss={justIn.dismiss} />}
        <AnimatePresence>
          {activity && (
            <ActivityDrawer key="activity" events={sim.events} scope={scope} cmds={commands.cmds} simMs={sim.simMs} copy={copy} hostName={host.name} still={still} onClose={() => setActivity(false)} onOpenAgent={openAgentFrom} />
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
        top={<TopStrip counts={counts} scope={scope} simMs={sim.simMs} copy={copy} nav={nav} host={host} focus={focus} onFocus={setFocus} matches={fv.matches} onPalette={() => setPalette(true)} layout={layout} onLayout={setLayout} onShortcuts={() => setKeysOpen(true)} />}
        main={main}
        rail={
          <BoardRail
            host={host} copy={copy} live={live} nav={nav} fleetPaused={fleetPaused}
            pendingFleet={commands.cmds.find((c) => c.agentId === null && isOpen(c))}
            items={railItems(fv.railScope, sim.simMs, sim.events, copy)}
            total={fv.narrowed ? counts.needs : undefined}
            onPauseAll={() => setConfirmPause(true)} onResumeAll={() => op.resumeAll(fleetPaused)} onTriage={startTriage}
          />
        }
        bottom={<BottomStrip scope={scope} simMs={sim.simMs} events={sim.events} copy={copy} nav={nav} live={live} offline={offline} expanded={activity} onToggle={() => setActivity((v) => !v)} alerts={alertsOn} onAlerts={() => setAlertsOn((v) => !v)} />}
      />
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        deps={{
          scope, teams, copy, hostName: host.name, offline, fleetPaused, scale, onView, onScale,
          openAgent: openAgentFrom, openTeam: (id) => nav.openTeam(id, null), agentVerb: (v, a) => op[v](a),
          nextNeeds: nav.nextNeeds, startTriage, pauseAll: () => setConfirmPause(true), resumeAll: () => op.resumeAll(fleetPaused),
          showPile: (p) => setFocus({ query: "", piles: [p] }), clearFocus: () => setFocus(NO_FOCUS), toggleActivity: () => setActivity((v) => !v),
        }}
      />
      <ShortcutMap open={keysOpen} onClose={() => setKeysOpen(false)} copy={copy} />
      <FleetPauseDialog open={confirmPause} onClose={() => setConfirmPause(false)} scope={scope} hostName={host.name} copy={copy} onConfirm={op.pauseAll} />
    </div>
  );
}
