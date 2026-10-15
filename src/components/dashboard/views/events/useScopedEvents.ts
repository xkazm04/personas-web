"use client";

import { useMemo } from "react";

import { scopeEvents } from "@/components/dashboard/scope/scopeProjections";
import { useDashboardScope } from "@/components/dashboard/scope/useDashboardScope";
import { scopeHidAll } from "@/lib/dashboardScope";
import { useEventStore } from "@/stores/eventStore";

/**
 * The event log in the scope bar's persona + window (by the event's target
 * persona and when it was published; an event aimed at no persona leaves the
 * list once a persona is chosen). `all` is the loaded log: "not served" is
 * judged on it. The bus visualization and the swimlane draw the live bus and
 * do not read the scope.
 */
export function useScopedEvents() {
  const all = useEventStore((s) => s.events);
  const scope = useDashboardScope();
  const events = useMemo(() => scopeEvents(all, scope), [all, scope]);
  return { all, events, scopeEmpty: scopeHidAll(all, events) };
}
