"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type CSSProperties } from "react";
import { useStillMotion } from "@/hooks/useStillMotion";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import FleetFrame from "../FleetFrame";
import NeedsYouRail from "../NeedsYouRail";
import { ATTENTION_COLOR } from "../attention";
import { FLEET, type FleetScale } from "../fleet-data";
import { useStableHandler } from "../useStableHandler";
import AgentScene from "../board/AgentScene";
import Toast from "../board/Toast";
import b from "../board/board.module.css";
import tiles from "../board/tiles.module.css";
import type { Att } from "./Building";
import CityField from "./CityField";
import { layoutCity } from "./city-layout";
import Legend from "./Legend";
import { meters } from "./Moon";
import { railItems } from "./rail";
import { ranked } from "./rank";
import { BottomStrip, TopStrip } from "./Strips";
import { useFieldSize } from "./useFieldSize";
import { useNightRuntime } from "./useNightRuntime";
import s from "./night.module.css";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

/** The Board's attention colours, for the console and hover card it shares. */
const ATTENTION_VARS = {
  "--at-working": ATTENTION_COLOR.working,
  "--at-warning": ATTENTION_COLOR.warning,
  "--at-critical": ATTENTION_COLOR.critical,
} as CSSProperties;

/**
 * Variant 2, "Night Shift": the fleet as a small city at night. Each team is a
 * building drawn for its trade, each agent a window in the shared state
 * language; every window that needs you lights a beacon on its roof and a row
 * in the rail. It runs on the Board's simulation and command plane and shares
 * its nested layers: hovering a window floats the Board's agent card, clicking
 * a window (or a rail row) opens the agent's console over the city, and a
 * building pins its team card (Esc or a click on the sky unpins). Demo fleet,
 * stylised illustration.
 */
export default function NightCity({ scale }: { scale: FleetScale }) {
  const copy = personasMonitorCopy.city;
  const boardCopy = personasMonitorCopy.board;
  const still = useStillMotion();
  const hidden = usePageVisibility();
  const live = !still && !hidden;
  const { sim, cmds, toast, op, scoped, byId, scopedEvents, packet, hostName } = useNightRuntime(scale, still, hidden);
  const fieldRef = useRef<HTMLDivElement>(null);
  const field = useFieldSize(fieldRef);

  const [hover, setHover] = useState<Att>(null);
  const [focus, setFocus] = useState<Att>(null);
  const [pinned, setPinned] = useState<Att>(null);
  const [agentOpen, setAgentOpen] = useState<string | null>(null);
  const [legend, setLegend] = useState(false);
  const legendBtn = useRef<HTMLButtonElement>(null);
  const origin = useRef<HTMLElement | null>(null);

  const L = useMemo(() => (field.w && field.h ? layoutCity(scoped, FLEET.teams, field.w, field.h) : null), [scoped, field.w, field.h]);
  const queue = useMemo(() => ranked(scoped), [scoped]);
  const items = useMemo(() => railItems(copy, queue, sim.simMs), [copy, queue, sim.simMs]);
  const usage = meters(sim.simMs);
  const openAgent = agentOpen ? byId.get(agentOpen) : undefined;
  // Hover wins while it lasts; the pinned card comes back when it ends.
  const att = hover ?? focus ?? pinned;
  const attAgentId = att?.kind === "agent" ? att.id : null;

  /** Open an agent's console over the city; Escape hands focus back to whatever opened it. */
  const showAgent = useStableHandler((id: string) => {
    if (!agentOpen) origin.current = document.activeElement as HTMLElement | null;
    setHover(null);
    setFocus(null);
    setAgentOpen(id);
    window.setTimeout(() => {
      fieldRef.current?.parentElement?.querySelector<HTMLElement>("[data-agent-act], [data-agent-title]")?.focus({ preventScroll: true });
    }, still ? 0 : 380);
  });
  const closeAgent = () => {
    setAgentOpen(null);
    const o = origin.current;
    if (o?.isConnected) window.setTimeout(() => o.focus({ preventScroll: true }), 0);
  };
  const pinTeam = useCallback((id: string) => setPinned({ kind: "team", id }), []);
  const unpin = useCallback(() => setPinned(null), []);
  /** The console's ‹ › and J / K: the city's reading order, building by building. */
  const stepAgent = (delta: number) => {
    if (!agentOpen || !L) return;
    const order = L.teams.flatMap((bx) => bx.mem.map((a) => a.id));
    const i = order.indexOf(agentOpen);
    if (i >= 0 && order.length > 1) setAgentOpen(order[(i + delta + order.length) % order.length]);
  };

  // A smaller fleet can drop the open agent: close it rather than show a ghost.
  const [prevScale, setPrevScale] = useState(scale);
  if (scale !== prevScale) {
    setPrevScale(scale);
    if (agentOpen && !scoped.some((a) => a.id === agentOpen)) setAgentOpen(null);
  }

  // N walks everyone who needs you, most urgent first (in the console too);
  // Escape closes the legend, then the console, then unpins the card.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (e.ctrlKey || e.metaKey || e.altKey || tag === "INPUT" || tag === "TEXTAREA") return;
    if (document.querySelector('[aria-modal="true"]')) return;
    if (e.key === "Escape" && legend) {
      e.preventDefault();
      setLegend(false);
      legendBtn.current?.focus();
    } else if (e.key === "Escape" && agentOpen) {
      e.preventDefault();
      closeAgent();
    } else if (e.key === "Escape" && pinned) {
      e.preventDefault();
      setPinned(null);
    } else if ((e.key === "n" || e.key === "N") && queue.length) {
      e.preventDefault();
      const cur = queue.findIndex((a) => a.id === (agentOpen ?? attAgentId));
      const next = queue[(cur + 1) % queue.length].id;
      if (agentOpen) setAgentOpen(next);
      else document.getElementById(`ns-w-${next}`)?.focus({ preventScroll: true });
    } else if (agentOpen && (e.key === "j" || e.key === "k")) {
      e.preventDefault();
      stepAgent(e.key === "j" ? 1 : -1);
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const main = (
    <div className="absolute inset-0">
      <div
        ref={fieldRef}
        inert={!!openAgent}
        className={`${s.sky} ${still ? s.still : ""} absolute inset-0 overflow-hidden transition-[opacity,transform] duration-500 ${openAgent ? "pointer-events-none scale-[1.02] opacity-0" : ""}`}
      >
        {L && (
          <CityField
            L={L} scale={scale} copy={copy} boardCopy={boardCopy} still={still} live={live} att={att} byId={byId} meters={usage}
            procs={FLEET.systemProcesses} packet={packet} cmds={cmds} hostName={hostName} pinned={pinned}
            setHover={setHover} setFocus={setFocus} openAgent={showAgent} pinTeam={pinTeam} unpin={unpin}
          />
        )}
        {legend && <Legend copy={copy} still={still} />}
      </div>
      <AnimatePresence>
        {openAgent && (
          <AgentScene
            key="agent" agent={openAgent} simMs={sim.simMs} events={sim.events} copy={boardCopy} still={still} live={live}
            op={op} cmds={cmds} hostName={hostName} onStep={stepAgent}
          />
        )}
      </AnimatePresence>
      <Toast toast={toast} />
    </div>
  );

  return (
    <div className={`${s.theme} ${b.tokens} ${still ? tiles.still : ""} h-full`} style={ATTENTION_VARS}>
      <FleetFrame
        label={copy.label}
        top={<TopStrip copy={copy} agents={scoped} meters={usage} legend={legend} legendRef={legendBtn} onLegend={() => setLegend((v) => !v)} />}
        main={main}
        rail={<NeedsYouRail items={items} activeId={attAgentId} onHover={(id) => setHover(id ? { kind: "agent", id } : null)} onSelect={showAgent} />}
        bottom={<BottomStrip copy={copy} events={scopedEvents} byId={byId} procs={FLEET.systemProcesses} simMs={sim.simMs} />}
      />
    </div>
  );
}
