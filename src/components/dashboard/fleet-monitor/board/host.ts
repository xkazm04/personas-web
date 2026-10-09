import { hash, mulberry32, type SimAgent } from "./model";

/* ── The computer the fleet runs on ─────────────────────────────────
 *
 * Personas runs on the operator's own PC; this page manages it from afar. The
 * board therefore always says which machine it is looking at, whether that
 * machine is answering, and how much room it has left. In the demo the machine
 * is simulated like the fleet (same name as the phone layout's demo desktop),
 * and every number here is derived from the board's own simulation, so it is
 * deterministic and moves with the agents it describes.
 */

export type HostStatus = "online" | "offline";

export const DEMO_HOST = {
  name: "Studio PC",
  platform: "Windows",
  memTotalGb: 32,
  /** How long ago the demo desktop was seen when `?desktop=offline` (as the phone's). */
  offlineAgoMs: 7 * 60_000,
} as const;

/** Concurrent runs the machine allows, per demo fleet size. */
export const SLOT_CAPACITY: Record<number, number> = { 10: 5, 30: 8, 99: 24 };

export function slotCapacity(scale: number): number {
  return SLOT_CAPACITY[scale] ?? Math.max(4, Math.ceil(scale / 4));
}

export interface HostReading {
  status: HostStatus;
  name: string;
  platform: string;
  /** Since the machine last reported (its heartbeat); offline: since it was last seen. */
  beatAgeMs: number;
  /** Round trip of the last report, ms; null offline. */
  latencyMs: number | null;
  slotsUsed: number;
  slotsTotal: number;
  queued: number;
  /** Null offline: a load the machine has not reported is not shown as a number. */
  cpuPct: number | null;
  memUsedGb: number | null;
  memTotalGb: number;
  /** Agents switched off (paused) in scope. */
  paused: number;
}

/**
 * The host as the board shows it. Pure: `beatAt` is the sim time of the
 * machine's last report, so the heartbeat age and the jitter on its load are
 * functions of sim time, never of the wall clock.
 */
export function readHost(scope: readonly SimAgent[], scale: number, simMs: number, beatAt: number, status: HostStatus): HostReading {
  const running = scope.filter((a) => a.state === "running").length;
  const queued = scope.filter((a) => a.state === "queued" && a.enabled).length;
  const paused = scope.filter((a) => !a.enabled).length;
  const base = { status, name: DEMO_HOST.name, platform: DEMO_HOST.platform, slotsUsed: running, slotsTotal: slotCapacity(scale), queued, paused, memTotalGb: DEMO_HOST.memTotalGb };
  if (status === "offline") return { ...base, beatAgeMs: DEMO_HOST.offlineAgoMs, latencyMs: null, cpuPct: null, memUsedGb: null };
  const r = mulberry32(hash(`beat${beatAt}`));
  const cpu = 6 + running * (62 / Math.max(1, slotCapacity(scale))) + (r() - 0.5) * 6;
  const mem = 7.8 + running * 0.42 + r() * 0.6;
  return {
    ...base,
    beatAgeMs: Math.max(0, simMs - beatAt),
    latencyMs: Math.round(22 + r() * 26),
    cpuPct: Math.round(Math.min(99, Math.max(1, cpu))),
    memUsedGb: Math.round(Math.min(DEMO_HOST.memTotalGb, mem) * 10) / 10,
  };
}
