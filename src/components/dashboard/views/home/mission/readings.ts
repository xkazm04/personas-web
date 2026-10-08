/**
 * Mission Control's readings: eight dimensions of fleet health, each judged to
 * one verdict. Mirrors the desktop app's annunciator wall
 * (`features/overview/sub_missionControl/variants/shared/readings.ts`): the
 * same dimensions, order and verdict rules, over the web demo's data.
 *
 * Pure: no React, no clock. The hook that fills these lives beside it.
 */

import { ApiError } from "@/lib/api-error";

export const DIMENSION_IDS = [
  "outcomes",
  "agents",
  "queue",
  "recovery",
  "spend",
  "autonomy",
  "vault",
  "instruments",
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export function isDimensionId(value: string | null): value is DimensionId {
  return value !== null && (DIMENSION_IDS as readonly string[]).includes(value);
}

/**
 * - `pending` the source has not answered yet
 * - `failed` the source answered with an error
 * - `unmeasured` there is nothing to judge (no runs, or no source in this mode)
 * - `ok` steady · `watch` drifting · `act` broken · `yours` waiting on a human
 */
export type Verdict = "pending" | "failed" | "unmeasured" | "ok" | "watch" | "yours" | "act";

/** Verdicts that light a cell; the rest stay quiet. */
export const LIT_VERDICTS: ReadonlySet<Verdict> = new Set(["act", "watch", "yours"]);

export type Reading<T> =
  | { status: "pending" }
  | { status: "failed"; error: string }
  | { status: "unmeasured" }
  | { status: "ready"; value: T };

export interface Outcomes {
  /** Completed share of finished runs, 0-100; null with no finished runs. */
  successRate: number | null;
  runs: number;
  failed: number;
  /** Daily success fraction, 0-1, oldest first. */
  trace: number[];
}

export interface AgentHealth {
  /** Mean agent score, 0-100; null with no agents. */
  score: number | null;
  critical: number;
  degraded: number;
  healthy: number;
  /** Each agent's score, 0-100, worst first. */
  trace: number[];
}

export interface Queue {
  reviews: number;
  alerts: number;
  memory: number;
  reports: number;
  total: number;
}

export interface Recovery {
  open: number;
  /** Open issues where a circuit breaker paused the agent. */
  paused: number;
  autoFixed: number;
}

export interface Spend {
  total: number;
  /** Mean cost per day over the window. */
  perDay: number | null;
  anomalies: number;
  /** Daily cost, oldest first. */
  trace: number[];
}

export interface Autonomy {
  scheduled: number;
  /** Epoch ms of the soonest scheduled run, null when nothing is scheduled. */
  nextAtMs: number | null;
}

export interface Vault {
  /** Credentials past their rotation window. */
  overdue: number;
  /** Credentials with an access anomaly. */
  anomalies: number;
  events: number;
}

export interface Instruments {
  ok: number;
  total: number;
}

export interface MissionReadings {
  outcomes: Reading<Outcomes>;
  agents: Reading<AgentHealth>;
  queue: Reading<Queue>;
  recovery: Reading<Recovery>;
  spend: Reading<Spend>;
  autonomy: Reading<Autonomy>;
  vault: Reading<Vault>;
  instruments: Reading<Instruments>;
}

type Judges = { [K in DimensionId]: (value: ReadyValue<K>) => Verdict };
type ReadyValue<K extends DimensionId> = Extract<MissionReadings[K], { status: "ready" }>["value"];

const JUDGES: Judges = {
  outcomes: ({ successRate }) =>
    successRate === null ? "unmeasured" : successRate >= 90 ? "ok" : successRate >= 75 ? "watch" : "act",
  agents: ({ score, critical, degraded }) =>
    score === null ? "unmeasured" : critical > 0 ? "act" : degraded > 0 ? "watch" : "ok",
  queue: ({ total }) => (total > 0 ? "yours" : "ok"),
  recovery: ({ open, paused }) => (paused > 0 ? "act" : open > 0 ? "watch" : "ok"),
  spend: ({ anomalies }) => (anomalies > 0 ? "watch" : "ok"),
  autonomy: ({ scheduled }) => (scheduled > 0 ? "ok" : "watch"),
  vault: ({ overdue, anomalies }) => (anomalies > 0 ? "act" : overdue > 0 ? "watch" : "ok"),
  instruments: ({ ok, total }) => (ok < total ? "watch" : "ok"),
};

export function judge<K extends DimensionId>(id: K, reading: MissionReadings[K]): Verdict {
  if (reading.status !== "ready") return reading.status;
  return (JUDGES[id] as (value: ReadyValue<K>) => Verdict)(reading.value as ReadyValue<K>);
}

/**
 * The queue reading from the review source. A list the desktop plane does not
 * serve is "not measured", never a ready 0 that judges to an all-clear.
 */
export function queueReading(input: {
  settled: boolean;
  listNotServed: boolean;
  pendingReviews: number;
  extras: { alerts: number; memory: number; reports: number };
}): Reading<Queue> {
  if (!input.settled) return { status: "pending" };
  if (input.listNotServed) return { status: "unmeasured" };
  const { pendingReviews: reviews, extras } = input;
  return {
    status: "ready",
    value: { reviews, ...extras, total: reviews + extras.alerts + extras.memory + extras.reports },
  };
}

/** Share of finished runs that completed, as a whole percent. */
export function successPercent(completed: number, failed: number): number | null {
  const finished = completed + failed;
  return finished > 0 ? Math.round((completed / finished) * 100) : null;
}

/** Agent grade from a 0-100 score, on the desktop's composite-health cut-offs. */
export function gradeOf(score: number): "healthy" | "degraded" | "critical" {
  return score >= 80 ? "healthy" : score >= 60 ? "degraded" : "critical";
}

/** The plane answered 501: it does not serve this read (same rule as reviewStore and eventStore). */
export function isNotServed(error: unknown): boolean {
  return error instanceof ApiError && error.status === 501;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** One SWR query as a reading: a not-served read is unmeasured, any other error is failed. */
export function fromSwr<T, V>(data: T | undefined, error: unknown, map: (data: T) => V): Reading<V> {
  if (error) return isNotServed(error) ? { status: "unmeasured" } : { status: "failed", error: errorText(error) };
  if (data === undefined) return { status: "pending" };
  return { status: "ready", value: map(data) };
}

export type SourceKey = "observability" | "healing" | "reviews" | "routines";

export interface SourceState {
  key: SourceKey;
  status: "pending" | "ok" | "unserved" | "failed";
  error: string | null;
}

/** One source's state: a not-served read is unserved (no error text), any other error is failed. */
export function sourceOf(key: SourceKey, settled: boolean, error: unknown): SourceState {
  if (error) {
    return isNotServed(error) ? { key, status: "unserved", error: null } : { key, status: "failed", error: errorText(error) };
  }
  return { key, status: settled ? "ok" : "pending", error: null };
}

/**
 * Instruments from the per-source states. Sources the plane does not serve are
 * left out of ok/total; with none served the reading is unmeasured.
 */
export function instrumentsReading(sources: SourceState[]): Reading<Instruments> {
  if (sources.some((source) => source.status === "pending")) return { status: "pending" };
  const served = sources.filter((source) => source.status !== "unserved");
  if (served.length === 0) return { status: "unmeasured" };
  return { status: "ready", value: { ok: served.filter((source) => source.status === "ok").length, total: served.length } };
}

/** Open-alert count from a health-issue read; null (unknown) until it has answered, and after any error. */
export function openAlertValue(issues: { status: string }[] | undefined, failed: boolean): number | null {
  if (failed || issues === undefined) return null;
  return issues.filter((issue) => issue.status === "open").length;
}
