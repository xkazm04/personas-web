import { DEMO_CREW } from "@/lib/demoCrew";
import { isTerminal } from "@/lib/commands/commandReducer";
import { mockRunExecutionId } from "@/lib/commands/mockCommandPlane";
import { onDemoFixtureChange } from "@/lib/demoFixtureSignal";
import { MOCK_EVENTS, MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import type { PersonaEvent } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useCommandStore } from "@/stores/commandStore";
import type { Severity } from "../fleet-data";
import { bridgeCrew, type CrewBridge, type CrewFixture, type CrewPorts, type CrewReview } from "./crewBridge";
import type { FleetWorld } from "./fleetWorld";

/* The crew bridge's data plane in the demo: the in-session fixtures the
   scripted desktop writes, and the command plane the phone uses. Every call
   is gated on the demo session, so a live tenant's stage stays local. */

const SEVERITIES: ReadonlySet<string> = new Set(["critical", "warning", "info"]);

function crewReview(e: PersonaEvent): CrewReview {
  let title = "";
  let severity: Severity = "critical";
  try {
    const p = JSON.parse(e.payload ?? "{}") as { title?: unknown; severity?: unknown };
    if (typeof p.title === "string") title = p.title;
    if (typeof p.severity === "string" && SEVERITIES.has(p.severity)) severity = p.severity as Severity;
  } catch {
    /* an unreadable payload reads as critical, like the review queue */
  }
  return { id: e.id, status: e.status === "processed" ? "approved" : e.status === "failed" ? "rejected" : "pending", title, severity };
}

export const demoCrewPorts: CrewPorts = {
  isDemo: () => useAuthStore.getState().isDemo,
  read: () =>
    DEMO_CREW.flatMap(({ personaId }): CrewFixture[] => {
      const p = MOCK_PERSONAS.find((x) => x.id === personaId);
      if (!p) return [];
      return [{
        personaId,
        enabled: p.enabled,
        reviews: MOCK_EVENTS.filter((e) => e.eventType === "manual_review" && e.targetPersonaId === personaId).map(crewReview),
        liveRuns: MOCK_EXECUTIONS.filter(
          (e) => e.personaId === personaId && e.id.startsWith("exec-") && (e.status === "queued" || e.status === "running"),
        ).map((e) => e.id),
      }];
    }),
  send: (verb, personaId, params) => useCommandStore.getState().send(verb, { personaId, deviceId: null, demo: true }, params),
  isOpen: (id) => {
    const c = useCommandStore.getState().inflight[id];
    return !!c && !isTerminal(c.status);
  },
  runExecutionId: mockRunExecutionId,
  onFixtureChange: onDemoFixtureChange,
};

const bridges = new WeakMap<FleetWorld, CrewBridge>();

/** The world's crew bridge, wired once (it then lives as long as the world). */
export function crewBridgeFor(world: FleetWorld, ports: CrewPorts = demoCrewPorts): CrewBridge {
  let b = bridges.get(world);
  if (!b) {
    b = bridgeCrew(world, ports);
    bridges.set(world, b);
  }
  return b;
}
