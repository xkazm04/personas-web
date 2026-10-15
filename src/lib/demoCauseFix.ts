import { mutate } from "swr";

import { useResolvedCausesStore } from "@/stores/resolvedCausesStore";
import type { HealthActionKind } from "./mock-dashboard-data";
import { DEMO_THREAD_SNAPSHOTS } from "./mockApi";
import { emitTourSignal } from "./tourSignals";

/**
 * The demo's one write to an incident thread: fix its cause, or undo the fix.
 *
 * The fixed-cause slice changes first, so the synchronous readers (nav badges,
 * SLA, home triage) move at once. Then every thread-member SWR key gets its
 * new value written straight into the cache, not merely revalidated: a view
 * kept alive while hidden reads the cache when it is shown again, and one not
 * yet visited mounts on the settled value. A fetch that was already in flight
 * started before this write, so SWR discards its result.
 *
 * Demo-only: the only caller is the System Health action, which a real tenant
 * never sees (the page renders the live-unavailable state instead).
 */
export function fixCause(causeKey: string, kind: HealthActionKind, at: string): void {
  useResolvedCausesStore.getState().settle(causeKey, kind, at);
  writeThreadReads();
  emitTourSignal({ kind: "causeFixed", causeKey });
}

/** Reopens the thread: the outage is back on every route, as a reload would bring it. */
export function undoCauseFix(causeKey: string): void {
  useResolvedCausesStore.getState().reopen(causeKey);
  writeThreadReads();
}

function writeThreadReads(): void {
  for (const [key, snapshot] of Object.entries(DEMO_THREAD_SNAPSHOTS)) {
    const value = snapshot();
    if (value !== undefined) void mutate(key, value, { revalidate: false });
  }
}
