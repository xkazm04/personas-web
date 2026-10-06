/**
 * The demo's desktop: a scripted stand-in for the real command round trip
 * (PHASE2-SPEC.md 6.3), so a visitor on mocks sees management work instead of
 * a 501. It answers like the desktop handler would - `executing` when it
 * claims the row, then `completed` with the verb's result - on realistic
 * timings, and writes the effect through to the in-session fixtures (the
 * `mockApi.updateEvent` precedent), so the next `listPersonas` agrees.
 *
 * Timers start only on a user action, and the plane refuses to start in a
 * hidden tab (the use-playground-simulation precedent, CLAUDE.md rule 3).
 */
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import type { CommandRowUpdate } from "./commandReducer";
import type { CommandVerb } from "./envelope";

/** pending at 0 -> executing (the desktop's claim) -> completed. */
export const MOCK_TIMINGS = { executingMs: 1200, completedMs: 2000 } as const;

export interface MockCommand {
  id: string;
  verb: CommandVerb;
  personaId: string;
  params: Record<string, unknown>;
}

export interface MockPlaneDeps {
  /** Defaults to `document.hidden`. */
  isHidden?: () => boolean;
}

/** Run the verb against the fixtures; returns the row the desktop would write. */
function execute(cmd: MockCommand): CommandRowUpdate {
  const idx = MOCK_PERSONAS.findIndex((p) => p.id === cmd.personaId);
  if (idx === -1) return { id: cmd.id, status: "failed", error_message: "not_found" };
  const persona = MOCK_PERSONAS[idx];

  if (cmd.verb === "pause_persona" || cmd.verb === "resume_persona") {
    const enabled = cmd.verb === "resume_persona";
    const changed = persona.enabled !== enabled;
    if (changed) MOCK_PERSONAS[idx] = { ...persona, enabled, updatedAt: new Date().toISOString() };
    return { id: cmd.id, status: "completed", result: { enabled, changed } };
  }

  if (cmd.verb === "cancel_execution") {
    const executionId = typeof cmd.params.executionId === "string" ? cmd.params.executionId : "";
    const ei = MOCK_EXECUTIONS.findIndex((e) => e.id === executionId && e.personaId === cmd.personaId);
    if (ei === -1) return { id: cmd.id, status: "failed", error_message: "not_found" };
    const exec = MOCK_EXECUTIONS[ei];
    const live = exec.status === "running" || exec.status === "queued";
    if (live) MOCK_EXECUTIONS[ei] = { ...exec, status: "cancelled" };
    return { id: cmd.id, status: "completed", result: { executionId, changed: live, wasQueued: exec.status === "queued" } };
  }

  // run_persona / chat_send have no scripted outcome yet: refuse honestly.
  return { id: cmd.id, status: "rejected", error_message: `unsupported_command_type: the demo desktop does not run ${cmd.verb}` };
}

/**
 * Start the simulated round trip. `onUpdate` receives each row change, the
 * same shape a Realtime UPDATE carries. Returns a cancel function. Throws
 * when the tab is hidden, so nothing is started that nobody can watch.
 */
export function runMockCommand(cmd: MockCommand, onUpdate: (row: CommandRowUpdate) => void, deps: MockPlaneDeps = {}): () => void {
  const hidden = deps.isHidden ?? (() => typeof document !== "undefined" && document.hidden);
  if (hidden()) throw new Error("hidden: the demo desktop does not start in a background tab");
  const claim = setTimeout(() => onUpdate({ id: cmd.id, status: "executing" }), MOCK_TIMINGS.executingMs);
  const finish = setTimeout(() => onUpdate(execute(cmd)), MOCK_TIMINGS.completedMs);
  return () => {
    clearTimeout(claim);
    clearTimeout(finish);
  };
}
