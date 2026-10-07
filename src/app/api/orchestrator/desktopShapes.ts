/**
 * Which orchestrator call shapes the desktop's management API serves.
 *
 * One entry per distinct (method, path pattern) that `src/lib/api.ts` sends
 * through `orchestratorFetch`; `${...}` segments are written `:param`. The
 * proxy does no path rewriting, so a shape is `desktop` only when the desktop
 * serves that exact method and path today. Routes are read from the personas
 * repo: `management_router` in `management_api.rs` and `/health` in `webhook.rs`.
 */
export type DesktopShape =
  | { served: "desktop"; desktopRoute: string }
  | { served: "not_on_desktop"; reason: string };

const NO_ROUTE = "no such route on the desktop";

export const DESKTOP_SHAPES: Record<string, DesktopShape> = {
  "GET /api/personas": { served: "desktop", desktopRoute: "GET /api/personas" },
  "GET /api/personas/:id": { served: "desktop", desktopRoute: "GET /api/personas/{persona_id}" },
  "DELETE /api/personas/:id": { served: "not_on_desktop", reason: `${NO_ROUTE} (persona delete)` },
  "GET /api/executions": { served: "desktop", desktopRoute: "GET /api/executions" },
  "GET /api/executions/:id": { served: "desktop", desktopRoute: "GET /api/executions/{id}" },
  "POST /api/executions/:id/cancel": {
    served: "not_on_desktop",
    reason: `${NO_ROUTE}; the desktop only cancels lab runs (POST /api/lab/cancel/{run_id})`,
  },
  "POST /api/execute": {
    served: "not_on_desktop",
    reason: "desktop serves POST /api/execute/{persona_id}, with the persona id in the path rather than the body",
  },
  "GET /api/events": { served: "not_on_desktop", reason: `${NO_ROUTE} (event list)` },
  "POST /api/events": { served: "not_on_desktop", reason: `${NO_ROUTE} (event create)` },
  "PUT /api/events/:id": { served: "not_on_desktop", reason: `${NO_ROUTE} (event update)` },
  "GET /api/personas/:id/subscriptions": { served: "not_on_desktop", reason: `${NO_ROUTE} (subscriptions)` },
  "POST /api/personas/:id/subscriptions": { served: "not_on_desktop", reason: `${NO_ROUTE} (subscriptions)` },
  "PUT /api/personas/:id/subscriptions/:id": { served: "not_on_desktop", reason: `${NO_ROUTE} (subscriptions)` },
  "DELETE /api/personas/:id/subscriptions/:id": { served: "not_on_desktop", reason: `${NO_ROUTE} (subscriptions)` },
  "GET /api/personas/:id/triggers": { served: "not_on_desktop", reason: `${NO_ROUTE} (triggers)` },
  "GET /health": { served: "desktop", desktopRoute: "GET /health" },
  "GET /api/status": { served: "not_on_desktop", reason: `${NO_ROUTE} (worker status)` },
  "GET /api/observability": { served: "not_on_desktop", reason: `${NO_ROUTE} (observability)` },
  "GET /api/usage": { served: "not_on_desktop", reason: `${NO_ROUTE} (usage analytics)` },
};

const PATTERNS = Object.keys(DESKTOP_SHAPES).map((key) => {
  const [method, path] = key.split(" ");
  return { key, method, segments: path.split("/").filter(Boolean) };
});

/** The table entry for a request, or null when the table does not know the shape. Query strings never reach here: callers pass path segments only. */
export function matchDesktopShape(method: string, path: string[]): DesktopShape | null {
  const m = method.toUpperCase();
  for (const p of PATTERNS) {
    if (p.method !== m || p.segments.length !== path.length) continue;
    if (p.segments.every((s, i) => (s.startsWith(":") ? path[i] !== "" : s === path[i]))) {
      return DESKTOP_SHAPES[p.key];
    }
  }
  return null;
}
