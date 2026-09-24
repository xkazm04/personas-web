/**
 * What one Performance View lane shows, derived from a route's telemetry.
 *
 * Pure so the derivation is pinned by `figures.test.ts`. Delivery time is the
 * simulated latency itself, in ms: it used to be printed as a percentage of an
 * arbitrary 600 ms ceiling, which told a visitor nothing and read "100%" for
 * every latency from 600 ms up to the feed's 980 ms maximum.
 */

/** Queue depth at which the lane's fill bar reads full. */
const QUEUE_DEPTH_FULL = 50;
/** Smallest fill, so an almost-empty queue still shows a sliver. */
const QUEUE_FILL_FLOOR_PCT = 8;

export interface LaneFigures {
  queueDepth: number;
  deliveryMs: number;
  eps: number;
  /** Width of the queue-depth fill bar, 8-100. */
  queueFillPct: number;
}

function sanitize(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function laneFigures(metric: { queueDepth: number; latencyMs: number; eps: number }): LaneFigures {
  const queueDepth = sanitize(metric.queueDepth);
  const depthRatio = Math.min(1, queueDepth / QUEUE_DEPTH_FULL);
  return {
    queueDepth,
    deliveryMs: Math.round(sanitize(metric.latencyMs)),
    eps: sanitize(metric.eps),
    queueFillPct: Math.max(depthRatio * 100, QUEUE_FILL_FLOOR_PCT),
  };
}
