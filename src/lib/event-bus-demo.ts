export type QueueRouteSeed = {
  id: string;
  producerId: string;
  producerLabel: string;
  consumerId: string;
  consumerLabel: string;
  color: string;
  eventType: string;
  queueDepth: number;
  throughputEps: number;
  latencyMs: number;
};

export type QueueRouteMetric = QueueRouteSeed & {
  inFlight: number;
  pressure: number;
};

export type QueueTelemetrySnapshot = {
  source: string;
  timestamp: number;
  routes: QueueRouteMetric[];
  totalInFlight: number;
  totalBacklog: number;
};

export type QueueTelemetryAdapter = {
  source: string;
  subscribe: (onSnapshot: (snapshot: QueueTelemetrySnapshot) => void) => () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function withPressure(route: QueueRouteSeed): QueueRouteMetric {
  const queueDepth = sanitizeNonNegative(route.queueDepth);
  const latencyMs = sanitizeNonNegative(route.latencyMs);
  const throughputEps = sanitizeNonNegative(route.throughputEps);
  const pressure = clamp(queueDepth / 60 + latencyMs / 900, 0, 1);
  const inFlight = Math.max(1, Math.round(throughputEps / 10));
  return {
    ...route,
    queueDepth,
    latencyMs,
    throughputEps,
    inFlight,
    pressure,
  };
}

export function createSnapshot(source: string, routes: readonly QueueRouteSeed[]): QueueTelemetrySnapshot {
  const enriched = routes.map(withPressure);
  return {
    source,
    timestamp: Date.now(),
    routes: enriched,
    totalInFlight: enriched.reduce((sum, route) => sum + route.inFlight, 0),
    totalBacklog: enriched.reduce((sum, route) => sum + route.queueDepth, 0),
  };
}

export function createMockQueueTelemetryAdapter(
  seedRoutes: readonly QueueRouteSeed[],
  intervalMs = 1300,
): QueueTelemetryAdapter {
  return {
    source: "mock",
    subscribe(onSnapshot) {
      if (typeof window === "undefined") {
        return () => {};
      }

      let current = seedRoutes.map((route) => ({ ...route }));

      const emit = () => {
        const next = current.map((route) => {
          const queueDepth = clamp(route.queueDepth + Math.round((Math.random() - 0.42) * 8), 4, 72);
          const throughputEps = clamp(route.throughputEps + Math.round((Math.random() - 0.45) * 6), 6, 75);
          const latencyMs = clamp(route.latencyMs + Math.round((Math.random() - 0.48) * 90), 140, 980);
          return {
            ...route,
            queueDepth,
            throughputEps,
            latencyMs,
          };
        });

        current = next;
        onSnapshot(createSnapshot("mock", next));
      };

      emit();
      const timer = window.setInterval(emit, intervalMs);
      return () => window.clearInterval(timer);
    },
  };
}
