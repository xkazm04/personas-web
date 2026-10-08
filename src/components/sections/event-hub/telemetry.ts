import { createMockQueueTelemetryAdapter, type QueueRouteSeed } from "@/lib/event-bus-demo";
import { EXTENDED_TOOLS, TOOL_MAP } from "@/lib/tool-catalogue";

/** The four hub routes of the live section (same ids, tools and seed figures). */
function route(producerId: string, consumerId: string, queueDepth: number, throughputEps: number, latencyMs: number): QueueRouteSeed {
  const producer = TOOL_MAP.get(producerId)!;
  const consumer = TOOL_MAP.get(consumerId)!;
  return {
    id: `${producerId}-${consumerId}`,
    producerId,
    producerLabel: producer.name,
    consumerId,
    consumerLabel: consumer.name,
    color: producer.color,
    eventType: `${producerId}.event`,
    queueDepth,
    throughputEps,
    latencyMs,
  };
}

export const ROUTE_SEEDS: readonly QueueRouteSeed[] = [
  route("gmail", "jira", 34, 28, 420),
  route("slack", "drive", 21, 36, 310),
  route("github", "figma", 12, 19, 260),
  route("calendar", "stripe", 48, 14, 520),
];

export const hubTelemetry = createMockQueueTelemetryAdapter(ROUTE_SEEDS, 1400);

/** Orbit members: every route endpoint, then the live swarm's featured tools. */
export const ORBIT_TOOLS = (() => {
  const ids = new Set<string>();
  for (const r of ROUTE_SEEDS) ids.add(r.producerId).add(r.consumerId);
  for (const t of EXTENDED_TOOLS) if (t.swarmFeatured) ids.add(t.id);
  return [...ids].map((id) => TOOL_MAP.get(id)!).filter(Boolean);
})();

/** Lane figures, sanitised the way the live section's figures.ts does. */
export function laneFigures(r: { queueDepth: number; latencyMs: number; throughputEps: number }) {
  const safe = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);
  const depth = Math.round(safe(r.queueDepth));
  return {
    depth,
    deliveryMs: Math.round(safe(r.latencyMs)),
    eps: Math.round(safe(r.throughputEps)),
    fillPct: Math.max(8, Math.min(100, (depth / 50) * 100)),
  };
}

/** A brand colour pulled toward the theme's ink so it reads on any theme. */
export const ink = (color: string, pct = 70) => `color-mix(in srgb, ${color} ${pct}%, var(--foreground))`;
