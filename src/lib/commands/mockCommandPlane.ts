/**
 * The demo's desktop: a scripted stand-in for the real command round trip
 * (PHASE2-SPEC.md 6.3), so a visitor on mocks sees management work instead of
 * a 501. It answers like the desktop handler would - `executing` when it
 * claims the row, then `completed` with the verb's result - on realistic
 * timings, and writes the effect through to the in-session fixtures (the
 * `mockApi.updateEvent` precedent), so the next `listPersonas` /
 * `listExecutions` agrees.
 *
 * Timers start only on a user action, and the plane refuses to start in a
 * hidden tab (the use-playground-simulation precedent, CLAUDE.md rule 3).
 */
import { MOCK_EXECUTIONS, MOCK_PERSONAS } from "@/lib/mockData";
import type { GlobalExecution } from "@/lib/types";
import type { CommandRowUpdate } from "./commandReducer";
import type { CommandVerb } from "./envelope";

/** pending at 0 -> executing (the desktop's claim) -> completed. */
export const MOCK_TIMINGS = { executingMs: 1200, completedMs: 2000 } as const;

/**
 * A run's execution, from the moment the run command completes (it is written
 * `queued` then): running 1 s later, completed 8 s after it was queued.
 */
export const MOCK_RUN_TIMINGS = { runningMs: 1000, completedMs: 8000 } as const;

/** What the scripted run costs and returns (demo data, like the fixtures). */
const MOCK_RUN_COST_USD = 0.0124;

export interface MockCommand {
  id: string;
  verb: CommandVerb;
  personaId: string;
  params: Record<string, unknown>;
}

export interface MockPlaneDeps {
  /** Defaults to `document.hidden`. */
  isHidden?: () => boolean;
  /** Called after every write to the fixtures, so the stores can re-read them. */
  onFixtureChange?: () => void;
}

/** The id of the execution a mock run creates: derived from the command, so a resend cannot run twice. */
export function mockRunExecutionId(commandId: string): string {
  return `exec-${commandId}`;
}

type Schedule = (fn: () => void, ms: number) => void;

/** Move a fixture execution on, only from the status it is expected to be in (a cancel may have landed first). */
function advance(executionId: string, from: GlobalExecution["status"], patch: (e: GlobalExecution) => Partial<GlobalExecution>): boolean {
  const i = MOCK_EXECUTIONS.findIndex((e) => e.id === executionId);
  if (i === -1 || MOCK_EXECUTIONS[i].status !== from) return false;
  MOCK_EXECUTIONS[i] = { ...MOCK_EXECUTIONS[i], ...patch(MOCK_EXECUTIONS[i]) };
  return true;
}

/** Run the verb against the fixtures; returns the row the desktop would write. */
function execute(cmd: MockCommand, schedule: Schedule, changed: () => void): CommandRowUpdate {
  const idx = MOCK_PERSONAS.findIndex((p) => p.id === cmd.personaId);
  if (idx === -1) return { id: cmd.id, status: "failed", error_message: "not_found" };
  const persona = MOCK_PERSONAS[idx];

  if (cmd.verb === "pause_persona" || cmd.verb === "resume_persona") {
    const enabled = cmd.verb === "resume_persona";
    const flipped = persona.enabled !== enabled;
    if (flipped) {
      MOCK_PERSONAS[idx] = { ...persona, enabled, updatedAt: new Date().toISOString() };
      changed();
    }
    return { id: cmd.id, status: "completed", result: { enabled, changed: flipped } };
  }

  if (cmd.verb === "cancel_execution") {
    const executionId = typeof cmd.params.executionId === "string" ? cmd.params.executionId : "";
    const ei = MOCK_EXECUTIONS.findIndex((e) => e.id === executionId);
    if (ei === -1) return { id: cmd.id, status: "failed", error_message: "not_found: execution" };
    const exec = MOCK_EXECUTIONS[ei];
    // The desktop's owner check (verify_execution_owner): the execution must be this persona's.
    if (exec.personaId !== cmd.personaId) {
      return { id: cmd.id, status: "failed", error_message: "forbidden: execution belongs to another persona" };
    }
    const live = exec.status === "running" || exec.status === "queued";
    if (live) {
      const now = new Date();
      const started = exec.startedAt ? Date.parse(exec.startedAt) : NaN;
      MOCK_EXECUTIONS[ei] = {
        ...exec,
        status: "cancelled",
        completedAt: now.toISOString(),
        durationMs: Number.isFinite(started) ? Math.max(0, now.getTime() - started) : exec.durationMs,
      };
      changed();
    }
    return { id: cmd.id, status: "completed", result: { executionId, changed: live, wasQueued: exec.status === "queued" } };
  }

  if (cmd.verb === "run_persona") {
    const executionId = mockRunExecutionId(cmd.id);
    if (!MOCK_EXECUTIONS.some((e) => e.id === executionId)) {
      const now = new Date().toISOString();
      const prompt = typeof cmd.params.prompt === "string" ? cmd.params.prompt : null;
      MOCK_EXECUTIONS.unshift({
        id: executionId,
        personaId: persona.id,
        triggerId: null,
        useCaseId: null,
        status: "queued",
        inputData: prompt,
        outputData: null,
        claudeSessionId: null,
        modelUsed: "claude-sonnet-4-5-20250929",
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        errorMessage: null,
        durationMs: null,
        retryOfExecutionId: null,
        retryCount: 0,
        startedAt: null,
        completedAt: null,
        createdAt: now,
        personaName: persona.name,
        personaIcon: persona.icon ?? undefined,
        personaColor: persona.color ?? undefined,
      });
      changed();
      schedule(() => {
        if (advance(executionId, "queued", () => ({ status: "running", startedAt: new Date().toISOString() }))) changed();
      }, MOCK_RUN_TIMINGS.runningMs);
      schedule(() => {
        const done = advance(executionId, "running", (e) => {
          const end = new Date();
          const started = e.startedAt ? Date.parse(e.startedAt) : NaN;
          return {
            status: "completed",
            completedAt: end.toISOString(),
            durationMs: Number.isFinite(started) ? Math.max(0, end.getTime() - started) : null,
            costUsd: MOCK_RUN_COST_USD,
            inputTokens: 2100,
            outputTokens: 640,
            outputData: "Run finished on the demo computer.",
          };
        });
        if (done) changed();
      }, MOCK_RUN_TIMINGS.completedMs);
    }
    return { id: cmd.id, status: "completed", result: { executionId } };
  }

  // chat_send and the queue verbs have no scripted outcome yet: refuse honestly.
  return { id: cmd.id, status: "rejected", error_message: `unsupported_command_type: the demo desktop does not run ${cmd.verb}` };
}

/**
 * Start the simulated round trip. `onUpdate` receives each row change, the
 * same shape a Realtime UPDATE carries. Returns a cancel function that stops
 * every timer the command started, including a run's execution lifecycle.
 * Throws when the tab is hidden, so nothing is started that nobody can watch.
 */
export function runMockCommand(cmd: MockCommand, onUpdate: (row: CommandRowUpdate) => void, deps: MockPlaneDeps = {}): () => void {
  const hidden = deps.isHidden ?? (() => typeof document !== "undefined" && document.hidden);
  if (hidden()) throw new Error("hidden: the demo desktop does not start in a background tab");
  const changed = deps.onFixtureChange ?? (() => {});
  const timers: ReturnType<typeof setTimeout>[] = [];
  const schedule: Schedule = (fn, ms) => {
    timers.push(setTimeout(fn, ms));
  };
  schedule(() => onUpdate({ id: cmd.id, status: "executing" }), MOCK_TIMINGS.executingMs);
  schedule(() => onUpdate(execute(cmd, schedule, changed)), MOCK_TIMINGS.completedMs);
  return () => {
    for (const t of timers) clearTimeout(t);
  };
}
