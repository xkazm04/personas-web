"use client";

import { useMemo } from "react";
import { DEMO_HOST } from "../board/host";
import { makeOperator } from "../board/operator";
import { useBoardSim, useToast } from "../board/useBoardRuntime";
import { useCommands } from "../board/useCommands";
import type { Packet } from "./Packets";
import { personasMonitorCopy } from "@/i18n/pending/personasMonitor";

/**
 * The city runs on the Board's own simulation and command plane, so the
 * console it opens is the Board's console, with working controls, and what
 * the console changes shows in the windows. Ticks while the tab is visible.
 */
export function useNightRuntime(scale: number, still: boolean, hidden: boolean) {
  const [sim, dispatch] = useBoardSim(scale, still, hidden, false);
  const commands = useCommands(dispatch, sim);
  const [toast, showToast] = useToast();

  const scoped = useMemo(() => sim.agents.slice(0, scale), [sim.agents, scale]);
  const byId = useMemo(() => new Map(scoped.map((a) => [a.id, a])), [scoped]);
  const scopedEvents = useMemo(
    () => sim.events.filter((e) => byId.has(e.agentId) && (e.toAgentId === null || byId.has(e.toAgentId))),
    [sim.events, byId],
  );
  // The newest message or handoff flies between its two windows (launched once per event).
  const packet = useMemo<Packet | null>(() => {
    const e = scopedEvents.find((x) => (x.kind === "message" || x.kind === "handoff") && x.toAgentId);
    return e ? { id: e.tsMs, from: e.agentId, to: e.toAgentId!, kind: e.kind as Packet["kind"] } : null;
  }, [scopedEvents]);
  const op = makeOperator({
    commands, toast: showToast, copy: personasMonitorCopy.board, hostName: DEMO_HOST.name, offline: false, simMs: sim.simMs,
  });

  return { sim, cmds: commands.cmds, toast, op, scoped, byId, scopedEvents, packet, hostName: DEMO_HOST.name };
}
