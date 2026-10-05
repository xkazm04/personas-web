"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { needsYou, topSeverity, type FleetAgent, type FleetScale } from "../fleet-data";
import { getSnapshot, simStep, subscribe, type NightState } from "./nightStore";

/** Lower is more urgent: failed, waiting, critical review, draft, warning, info. */
export function rankOf(a: FleetAgent): number {
  const sev = topSeverity(a);
  if (a.state === "failed") return 0;
  if (a.state === "input_required") return 1;
  if (sev === "critical") return 2;
  if (a.state === "draft_ready") return 3;
  if (sev === "warning") return 4;
  if (sev === "info") return 5;
  return 9;
}

const oldestReview = (a: FleetAgent) => a.reviews.reduce((m, r) => Math.max(m, r.ageMin), 0);

/** Everyone who needs you, most urgent first; ties go to the oldest review. */
export function ranked(agents: FleetAgent[]): FleetAgent[] {
  return agents
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => needsYou(a))
    .sort((x, y) => rankOf(x.a) - rankOf(y.a) || oldestReview(y.a) - oldestReview(x.a) || x.i - y.i)
    .map(({ a }) => a);
}

export interface NightView extends NightState {
  /** The first `scale` agents: what this view shows. */
  scoped: FleetAgent[];
  byId: Map<string, FleetAgent>;
  /** Events whose agents are both in scope, newest first. */
  scopedEvents: NightState["events"];
}

/**
 * Subscribes to the shared Night Shift state and, while mounted in a visible
 * tab, ticks the simulation every few seconds. The data keeps moving under
 * reduced motion (it is information, not motion); only the animations stop.
 */
export function useNightSim(scale: FleetScale): NightView {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const hidden = usePageVisibility();

  useEffect(() => {
    if (hidden) return;
    let last = performance.now();
    let timer = 0;
    const loop = () => {
      timer = window.setTimeout(() => {
        const now = performance.now();
        simStep(scale, Math.min(8000, now - last));
        last = now;
        loop();
      }, 2600 + ((performance.now() * 7) % 1400));
    };
    loop();
    return () => window.clearTimeout(timer);
  }, [scale, hidden]);

  return useMemo(() => {
    const scoped = state.agents.slice(0, scale);
    const ids = new Set(scoped.map((a) => a.id));
    return {
      ...state,
      scoped,
      byId: new Map(state.agents.map((a) => [a.id, a])),
      scopedEvents: state.events.filter((e) => ids.has(e.agentId) && (e.toAgentId === null || ids.has(e.toAgentId))),
    };
  }, [state, scale]);
}
