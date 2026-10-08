/**
 * What one persona row on the phone shows, and the params its actions send
 * (PHASE2-SPEC.md 6.2, 2.2). Pure: executions and commands are passed in, so
 * the derivation is testable and nothing here reads a clock or a store.
 */
import type { PersonaExecution } from "@/lib/types";
import type { InflightCommand } from "./commandReducer";

/**
 * - `paused`: `enabled = false`. Wins over running: pause is the row's primary
 *   control and must read back unambiguously; a run it did not stop (pause
 *   never cancels one, spec 1.1) is flagged beside it (`liveExecutionId`).
 * - `running`: an execution of the persona is queued or running.
 * - `failed`: the newest finished run failed.
 * - `idle`: none of the above.
 */
export type PersonaRowState = "running" | "paused" | "failed" | "idle";

export interface PersonaRow {
  state: PersonaRowState;
  /** The newest queued/running execution: what "Cancel run" stops. */
  liveExecutionId: string | null;
}

const LIVE_STATUSES: ReadonlySet<PersonaExecution["status"]> = new Set(["queued", "running"]);

export function isLiveExecution(e: Pick<PersonaExecution, "status">): boolean {
  return LIVE_STATUSES.has(e.status);
}

function createdMs(e: PersonaExecution): number {
  const ms = Date.parse(e.createdAt);
  return Number.isFinite(ms) ? ms : 0;
}

/** One persona's runs, newest first, at most `limit`. */
export function personaRuns(executions: readonly PersonaExecution[], personaId: string, limit = 10): PersonaExecution[] {
  return executions
    .filter((e) => e.personaId === personaId)
    .sort((a, b) => createdMs(b) - createdMs(a))
    .slice(0, limit);
}

/**
 * The execution a completed cancel reported as stopped, if that command is the
 * persona's latest. The row stops showing it as live at once; the synced
 * execution becomes the truth when it arrives (the pause precedent, spec 2.4).
 */
export function reportedCancelledId(latest: InflightCommand | null): string | null {
  if (!latest || latest.verb !== "cancel_execution" || latest.status !== "completed") return null;
  const id = latest.result?.executionId;
  return typeof id === "string" ? id : null;
}

/**
 * Derive the row from the persona's on/off state (already reconciled with its
 * latest command, `displayEnabled`) and its runs, newest first.
 */
export function derivePersonaRow(input: {
  enabled: boolean;
  runs: readonly PersonaExecution[];
  cancelledId?: string | null;
}): PersonaRow {
  const { enabled, runs, cancelledId = null } = input;
  const live = runs.find((e) => isLiveExecution(e) && e.id !== cancelledId) ?? null;
  const finished = runs.find((e) => !isLiveExecution(e) || e.id === cancelledId) ?? null;
  const lastFailed = finished !== null && finished.id !== cancelledId && finished.status === "failed";
  const state: PersonaRowState = !enabled ? "paused" : live ? "running" : lastFailed ? "failed" : "idle";
  return { state, liveExecutionId: live?.id ?? null };
}

/**
 * The desktop re-reads executions created within the last 24 h on every sync
 * pass (spec 1.2); a status change on an older one never reaches the mirror.
 */
export const EXECUTION_REREAD_WINDOW_MS = 24 * 60 * 60_000;

/** True when cancelling this run would not show on the phone (it began before the re-read window). */
export function isBeyondSyncWindow(e: Pick<PersonaExecution, "createdAt">, now: number): boolean {
  const ms = Date.parse(e.createdAt);
  return Number.isFinite(ms) && now - ms > EXECUTION_REREAD_WINDOW_MS;
}

/** The longest prompt the phone sends with a run (characters). */
export const RUN_PROMPT_MAX = 8000;

/** `run_persona` params (spec 2.2): the trimmed prompt, or null when it is empty or too long. */
export function runParams(prompt: string): { prompt: string } | null {
  const trimmed = prompt.trim();
  if (trimmed.length === 0 || trimmed.length > RUN_PROMPT_MAX) return null;
  return { prompt: trimmed };
}

/** `cancel_execution` params (spec 2.2). */
export function cancelParams(executionId: string): { executionId: string } {
  return { executionId };
}
