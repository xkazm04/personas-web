/**
 * Review decision ledger — the pure transition table behind every human review
 * verdict (detail buttons, keyboard a/r, focus flow on /dashboard and /m, bulk
 * toolbar, bulk retry). `useReviewStore` holds the state, owns the one timer and
 * executes the effects; nothing here touches React, timers or the network.
 *
 *   idle ──arm──▶ window (5 s, undoable) ──expire/flush──▶ in flight ──settled──▶ idle
 *                    └──undo──▶ idle
 *
 * Invariants (registry: batch-undo-commit-window):
 * - One open window. An arm whose ids are disjoint from everything pending
 *   commits the open window first (flush-then-arm: acting again is the signal
 *   the earlier verdict was meant), so rapid A, A, A in focus mode leaves each
 *   earlier verdict committed and only the newest one undoable. An arm that
 *   overlaps the window or an in-flight commit is refused — never queued.
 * - A window is never discarded with its payload: expiry, flush and a newer
 *   arm all commit it; only `undo` drops it.
 * - Timer events carry the batch id, so a stale expiry is a no-op.
 * - `overlay()` is applied wherever server rows are written into the store, so
 *   no response — including one already in flight when the window opened — can
 *   repaint a pending verdict. `countPending(overlay(...))` is the only
 *   pending-count formula.
 *
 * The machine is generic over its verdict (`V`, default the review queue's
 * `Verdict`), so another surface can reuse it with its own verbs: the Events
 * dead letter arms `"retry" | "discard"` (eventStore.ts) and paints its rows
 * with `overlayWith`. Only types were widened; the review queue's behaviour is
 * unchanged and review-ledger.test.ts is its guard.
 */
import { RESOLVED_BY_REVIEWER } from "./review-display";
import type { ManualReviewItem } from "./types";

export type Verdict = "approved" | "rejected";

export const COMMIT_WINDOW_MS = 5000;

export interface LedgerBatch<V extends string = Verdict> {
  batchId: number;
  ids: readonly string[];
  verdict: V;
  /** Reviewer notes per id, carried to the write. */
  notes: Readonly<Record<string, string>>;
  armedAt: number;
  /** Epoch ms at which the window commits; the undo toast displays it. */
  deadline: number;
}

export interface LedgerState<V extends string = Verdict> {
  window: LedgerBatch<V> | null;
  inFlight: readonly LedgerBatch<V>[];
  nextBatchId: number;
}

export const IDLE_LEDGER: LedgerState = { window: null, inFlight: [], nextBatchId: 1 };

export type LedgerEvent<V extends string = Verdict> =
  | { type: "arm"; ids: readonly string[]; verdict: V; notes?: Readonly<Record<string, string>>; now: number }
  | { type: "undo"; batchId: number }
  | { type: "expire"; batchId: number }
  /** Teardown (unmount, pagehide, sign-out): commit the open window now. */
  | { type: "flush" }
  | { type: "settled"; batchId: number; failedIds: readonly string[] };

export type LedgerEffect<V extends string = Verdict> =
  | { type: "commit"; batch: LedgerBatch<V> }
  | { type: "schedule"; batchId: number; deadline: number }
  | { type: "cancelTimer"; batchId: number };

export type RefusalReason = "overlap" | "empty";

export interface Transition<V extends string = Verdict> {
  state: LedgerState<V>;
  effects: LedgerEffect<V>[];
  refused?: { reason: RefusalReason };
  /** Present on a `settled` that matched an in-flight batch. */
  settled?: { batch: LedgerBatch<V>; okIds: string[]; failedIds: string[] };
}

function commitWindow<V extends string>(state: LedgerState<V>): Transition<V> {
  const w = state.window;
  if (!w) return { state, effects: [] };
  return {
    state: { ...state, window: null, inFlight: [...state.inFlight, w] },
    effects: [{ type: "cancelTimer", batchId: w.batchId }, { type: "commit", batch: w }],
  };
}

export function transition<V extends string = Verdict>(state: LedgerState<V>, event: LedgerEvent<V>): Transition<V> {
  switch (event.type) {
    case "arm": {
      const ids = [...new Set(event.ids)];
      if (ids.length === 0) return { state, effects: [], refused: { reason: "empty" } };
      const busy = new Set(pendingIds(state));
      if (ids.some((id) => busy.has(id))) return { state, effects: [], refused: { reason: "overlap" } };
      const flushed = commitWindow(state);
      const notes: Record<string, string> = {};
      for (const id of ids) {
        const note = event.notes?.[id];
        if (note) notes[id] = note;
      }
      const batch: LedgerBatch<V> = {
        batchId: state.nextBatchId,
        ids,
        verdict: event.verdict,
        notes,
        armedAt: event.now,
        deadline: event.now + COMMIT_WINDOW_MS,
      };
      return {
        state: { ...flushed.state, window: batch, nextBatchId: state.nextBatchId + 1 },
        effects: [...flushed.effects, { type: "schedule", batchId: batch.batchId, deadline: batch.deadline }],
      };
    }
    case "undo":
      if (state.window?.batchId !== event.batchId) return { state, effects: [] };
      return { state: { ...state, window: null }, effects: [{ type: "cancelTimer", batchId: event.batchId }] };
    case "expire":
      if (state.window?.batchId !== event.batchId) return { state, effects: [] };
      return commitWindow(state);
    case "flush":
      return commitWindow(state);
    case "settled": {
      const batch = state.inFlight.find((b) => b.batchId === event.batchId);
      if (!batch) return { state, effects: [] };
      const failed = new Set(event.failedIds);
      return {
        state: { ...state, inFlight: state.inFlight.filter((b) => b !== batch) },
        effects: [],
        settled: {
          batch,
          okIds: batch.ids.filter((id) => !failed.has(id)),
          failedIds: batch.ids.filter((id) => failed.has(id)),
        },
      };
    }
  }
}

/** Every id the ledger currently holds a verdict for (open window + in flight). */
export function pendingIds<V extends string>(state: LedgerState<V>): string[] {
  const batches = state.window ? [...state.inFlight, state.window] : state.inFlight;
  return batches.flatMap((b) => b.ids);
}

function applyBatch(row: ManualReviewItem, batch: LedgerBatch): ManualReviewItem {
  return {
    ...row,
    status: batch.verdict,
    resolvedAt: new Date(batch.armedAt).toISOString(),
    resolvedBy: RESOLVED_BY_REVIEWER,
    reviewerNotes: batch.notes[row.id] ?? row.reviewerNotes,
  };
}

/** Server rows with every ledger verdict painted over them. */
export function overlay(rows: readonly ManualReviewItem[], state: LedgerState): ManualReviewItem[] {
  return overlayWith(rows, state, applyBatch);
}

/** `overlay` for any row type: `apply` paints one batch's verdict onto a row. */
export function overlayWith<R extends { id: string }, V extends string>(
  rows: readonly R[],
  state: LedgerState<V>,
  apply: (row: R, batch: LedgerBatch<V>) => R,
): R[] {
  const byId = new Map<string, LedgerBatch<V>>();
  for (const b of state.inFlight) for (const id of b.ids) byId.set(id, b);
  if (state.window) for (const id of state.window.ids) byId.set(id, state.window);
  if (byId.size === 0) return [...rows];
  return rows.map((r) => {
    const b = byId.get(r.id);
    return b ? apply(r, b) : r;
  });
}

/** Server rows after a settled commit: the acknowledged ids take the verdict. */
export function applyConfirmed(
  rows: readonly ManualReviewItem[],
  batch: LedgerBatch,
  okIds: readonly string[],
): ManualReviewItem[] {
  const ok = new Set(okIds);
  return rows.map((r) => (ok.has(r.id) ? applyBatch(r, batch) : r));
}

/**
 * A verdict the plane confirmed in this tab. On a command plane (M20) the
 * command completes once the desktop applied it, and the synced row follows a
 * sync pass later; a refetch in between must not repaint the row pending.
 * It also remembers who decided, which the synced mirror does not carry.
 */
export interface ConfirmedVerdict {
  verdict: Verdict;
  resolvedBy: string;
  notes: string | null;
  /** Epoch ms of the confirmation. */
  at: number;
}

export type ConfirmedMap = Readonly<Record<string, ConfirmedVerdict>>;

/** How long a still-pending mirror row is taken for lag rather than the truth. */
export const MIRROR_LAG_MS = 120_000;

/**
 * Fetched rows reconciled with this tab's confirmed verdicts: a row still
 * pending within the lag allowance shows the verdict; a row that agrees keeps
 * who decided it; a row decided otherwise, or pending past the allowance, is
 * the truth and its echo is dropped. Returns the same map when nothing dropped.
 */
export function reconcileConfirmed(
  rows: readonly ManualReviewItem[],
  confirmed: ConfirmedMap,
  now: number,
): { rows: ManualReviewItem[]; confirmed: ConfirmedMap } {
  if (Object.keys(confirmed).length === 0) return { rows: [...rows], confirmed };
  let kept: Record<string, ConfirmedVerdict> | null = null;
  const drop = (id: string) => {
    kept ??= { ...confirmed };
    delete kept[id];
  };
  const out = rows.map((r) => {
    const echo = confirmed[r.id];
    if (!echo) return r;
    if (r.status === echo.verdict) return { ...r, resolvedBy: echo.resolvedBy };
    if (r.status === "pending" && now - echo.at < MIRROR_LAG_MS) {
      return {
        ...r,
        status: echo.verdict,
        resolvedAt: new Date(echo.at).toISOString(),
        resolvedBy: echo.resolvedBy,
        reviewerNotes: echo.notes ?? r.reviewerNotes,
      };
    }
    drop(r.id);
    return r;
  });
  return { rows: out, confirmed: kept ?? confirmed };
}

export function countPending(rows: readonly ManualReviewItem[]): number {
  return rows.filter((r) => r.status === "pending").length;
}
