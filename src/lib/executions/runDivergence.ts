// Pure run-lineage helpers behind "why did this fail when the last one
// passed?". No React, no I/O: the modal (and a fixture test) feed them the
// runs already on screen. The baseline REASON is always returned alongside the
// baseline, because a baseline for a different job would point at a false
// cause and the operator must be able to see why this one was picked.

import type { PersonaExecution } from "@/lib/types";

export type BaselineReason =
  | "retry-parent"
  | "same-trigger"
  | "same-use-case"
  | "persona-last-completed";

export interface BaselinePick {
  baseline: PersonaExecution;
  reason: BaselineReason;
  /**
   * Set when `run` is not a failure at all (cancelled, still running...), so
   * the UI can say "cancelled, not failed" instead of implying a regression.
   */
  caveat: "not-failed" | null;
}

const runTime = (r: PersonaExecution): number => {
  const ms = Date.parse(r.startedAt ?? r.createdAt);
  return Number.isNaN(ms) ? 0 : ms;
};

/**
 * Pick the nearest comparable good run, in order of how strongly it is the
 * same job: the retry ancestor, the same trigger, the same use case, then the
 * persona's last completed run. Only completed runs of the SAME persona that
 * started before `run` qualify, newest first. Returns null when none exist.
 */
export function pickBaseline(
  run: PersonaExecution,
  runs: readonly PersonaExecution[],
): BaselinePick | null {
  const caveat = run.status === "failed" ? null : "not-failed";
  const byId = new Map(runs.map((r) => [r.id, r]));
  const isGood = (r: PersonaExecution) =>
    r.status === "completed" && r.id !== run.id && r.personaId === run.personaId;
  const pick = (reason: BaselineReason, baseline: PersonaExecution | undefined) =>
    baseline ? ({ baseline, reason, caveat } satisfies BaselinePick) : null;

  // 1. Retry chain: walk to the nearest completed ancestor (guard cycles).
  const seen = new Set<string>([run.id]);
  let parentId = run.retryOfExecutionId;
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = byId.get(parentId);
    if (!parent) break;
    if (isGood(parent)) return pick("retry-parent", parent);
    parentId = parent.retryOfExecutionId;
  }

  const t = runTime(run);
  const newestFirst = runs
    .filter((r) => isGood(r) && runTime(r) <= t)
    .sort((a, b) => runTime(b) - runTime(a));

  return (
    (run.triggerId &&
      pick("same-trigger", newestFirst.find((r) => r.triggerId === run.triggerId))) ||
    (run.useCaseId &&
      pick("same-use-case", newestFirst.find((r) => r.useCaseId === run.useCaseId))) ||
    pick("persona-last-completed", newestFirst[0])
  );
}

export interface NumberDelta {
  a: number;
  b: number;
  diff: number;
  /** a / b, or null when b is 0 (no meaningful ratio). */
  ratio: number | null;
}

export interface RunComparison {
  inputTokens: NumberDelta;
  outputTokens: NumberDelta;
  costUsd: NumberDelta;
  retryCount: NumberDelta;
  /** Null when either side has no duration yet (running/queued). */
  durationMs: NumberDelta | null;
  model: { a: string | null; b: string | null; changed: boolean };
}

const delta = (a: number, b: number): NumberDelta => ({
  a,
  b,
  diff: a - b,
  ratio: b === 0 ? null : a / b,
});

/** Deltas of run `a` (the one being debugged) against baseline `b`. */
export function compareRuns(a: PersonaExecution, b: PersonaExecution): RunComparison {
  return {
    inputTokens: delta(a.inputTokens, b.inputTokens),
    outputTokens: delta(a.outputTokens, b.outputTokens),
    costUsd: delta(a.costUsd, b.costUsd),
    retryCount: delta(a.retryCount, b.retryCount),
    durationMs:
      a.durationMs == null || b.durationMs == null ? null : delta(a.durationMs, b.durationMs),
    model: { a: a.modelUsed, b: b.modelUsed, changed: a.modelUsed !== b.modelUsed },
  };
}

export interface Divergence {
  /** 1-based line number of the first differing line. */
  line: number;
  a: string | null;
  b: string | null;
}

/** First line where two outputs differ, or null when they are identical. */
export function firstDivergence(
  outA: string | null | undefined,
  outB: string | null | undefined,
): Divergence | null {
  const la = (outA ?? "").split(/\r?\n/);
  const lb = (outB ?? "").split(/\r?\n/);
  const n = Math.max(la.length, lb.length);
  for (let i = 0; i < n; i++) {
    if (la[i] !== lb[i]) return { line: i + 1, a: la[i] ?? null, b: lb[i] ?? null };
  }
  return null;
}
