/**
 * The guided tour's signal bus: what the visitor just did, as typed facts.
 *
 * The dashboard tour advances on the visitor's own actions (a step's
 * `advanceOn`, `tour-script.ts`). Nothing here holds state or invents any: each
 * signal is emitted where the thing already happens -
 *
 * - `verdict`    `reviewStore` commits a review verdict (its 5 s undo window has
 *                closed; an undone verdict never commits, so never signals)
 * - `command`    a Board command lands on the fleet's machine and is applied
 *                (`fleet-monitor/world/fleetWorld.ts`; a refused one does not signal)
 * - `view`       the dashboard SPA navigates (`spa/navigate.tsx`)
 * - `causeFixed` a demo incident thread's cause is fixed (`lib/demoCauseFix.ts`)
 *
 * Emitting with no listener is a no-op, so the emitters cost nothing outside a
 * tour. Import-free on purpose: stores and the stage world import it.
 */

export type TourSignal =
  | { kind: "verdict"; reviewId: string; verdict: "approved" | "rejected"; executionId: string | null }
  | { kind: "command"; verb: string; agentId: string | null }
  /** `focus` is the view's own focus parameter: `?focus=` (a row, a check) or Mission Control's `?dim=`. */
  | { kind: "view"; view: string; focus: string | null }
  | { kind: "causeFixed"; causeKey: string };

type Listener = (signal: TourSignal) => void;

const listeners = new Set<Listener>();

export function emitTourSignal(signal: TourSignal): void {
  for (const listener of [...listeners]) listener(signal);
}

/** Listen for signals; returns the unsubscribe. */
export function onTourSignal(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The `view` signal a dashboard href produces, or null outside `/dashboard/<view>`. */
export function viewSignalFor(href: string): TourSignal | null {
  const [path, query = ""] = href.split("?");
  const m = /^\/dashboard\/([\w-]+)\/?$/.exec(path);
  if (!m) return null;
  const params = new URLSearchParams(query);
  return { kind: "view", view: m[1], focus: params.get("focus") ?? params.get("dim") };
}
