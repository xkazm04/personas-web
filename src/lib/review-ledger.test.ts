import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ManualReviewItem } from "./types";
import {
  COMMIT_WINDOW_MS,
  IDLE_LEDGER,
  countPending,
  overlay,
  applyConfirmed,
  transition,
  type LedgerState,
} from "./review-ledger";

const NOW = 1_700_000_000_000;

function row(id: string, status: ManualReviewItem["status"] = "pending"): ManualReviewItem {
  return {
    id,
    personaId: "p1",
    executionId: "",
    eventType: "manual_review",
    content: id,
    severity: "warning",
    status,
    reviewerNotes: null,
    createdAt: new Date(NOW - 60_000).toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    escalatedAt: null,
  };
}

function armed(ids: string[], verdict: "approved" | "rejected" = "approved", from: LedgerState = IDLE_LEDGER) {
  return transition(from, { type: "arm", ids, verdict, now: NOW });
}

describe("review ledger: arming", () => {
  it("arm from idle opens a window with an identity and defers the write", () => {
    const t = armed(["r1", "r2"]);
    expect(t.state.window).toMatchObject({ batchId: 1, ids: ["r1", "r2"], verdict: "approved" });
    expect(t.state.window?.deadline).toBe(NOW + COMMIT_WINDOW_MS);
    expect(t.effects.some((e) => e.type === "commit")).toBe(false);
    expect(t.effects).toEqual([{ type: "schedule", batchId: 1, deadline: NOW + COMMIT_WINDOW_MS }]);
  });

  it("a disjoint arm while a window is open commits the open batch first (flush-then-arm)", () => {
    const one = armed(["r1"]);
    const two = armed(["r3"], "rejected", one.state);
    const commitIdx = two.effects.findIndex((e) => e.type === "commit");
    const scheduleIdx = two.effects.findIndex((e) => e.type === "schedule");
    expect(two.effects[commitIdx]).toMatchObject({ type: "commit", batch: { batchId: 1, ids: ["r1"] } });
    expect(commitIdx).toBeLessThan(scheduleIdx);
    expect(two.state.window).toMatchObject({ batchId: 2, ids: ["r3"], verdict: "rejected" });
    expect(two.state.inFlight.map((b) => b.batchId)).toEqual([1]);
  });

  it("an overlapping arm is refused and changes nothing", () => {
    const one = armed(["r1", "r2"]);
    const two = armed(["r2"], "approved", one.state);
    expect(two.refused).toEqual({ reason: "overlap" });
    expect(two.state).toBe(one.state);
    expect(two.effects).toEqual([]);
  });

  it("an arm overlapping an in-flight commit is refused too (guard covers the commit, not just the window)", () => {
    const one = armed(["r1"]);
    const flushed = transition(one.state, { type: "flush" });
    const again = armed(["r1"], "rejected", flushed.state);
    expect(again.refused).toEqual({ reason: "overlap" });
  });

  it("retry is an arm through the same guard: it commits the open batch, never discards it", () => {
    const open = armed(["r1"]);
    const retry = armed(["r9"], "approved", open.state);
    expect(retry.effects).toContainEqual({ type: "commit", batch: open.state.window });
    expect(retry.refused).toBeUndefined();
  });

  it("rapid A, A, A: each new verdict commits the previous one, only the newest stays undoable", () => {
    let s = IDLE_LEDGER;
    const commits: number[] = [];
    for (const id of ["r1", "r2", "r3"]) {
      const t = armed([id], "approved", s);
      for (const e of t.effects) if (e.type === "commit") commits.push(e.batch.batchId);
      s = t.state;
    }
    expect(commits).toEqual([1, 2]);
    expect(s.window?.ids).toEqual(["r3"]);
    const undone = transition(s, { type: "undo", batchId: 3 });
    const rows = overlay([row("r1"), row("r2"), row("r3")], undone.state);
    expect(rows.map((r) => r.status)).toEqual(["approved", "approved", "pending"]);
  });

  it("an empty arm is refused", () => {
    expect(armed([]).refused).toEqual({ reason: "empty" });
  });
});

describe("review ledger: timer identity, undo, notes", () => {
  it("a stale expiry after undo is a no-op", () => {
    const open = armed(["r1"]);
    const undone = transition(open.state, { type: "undo", batchId: 1 });
    expect(undone.effects).toEqual([{ type: "cancelTimer", batchId: 1 }]);
    const stale = transition(undone.state, { type: "expire", batchId: 1 });
    expect(stale.effects).toEqual([]);
    expect(stale.state).toBe(undone.state);
  });

  it("notes armed with a rejection travel on the commit", () => {
    const open = transition(IDLE_LEDGER, {
      type: "arm",
      ids: ["r1"],
      verdict: "rejected",
      notes: { r1: "unsafe" },
      now: NOW,
    });
    const expired = transition(open.state, { type: "expire", batchId: 1 });
    const commit = expired.effects.find((e) => e.type === "commit");
    expect(commit).toMatchObject({ type: "commit", batch: { verdict: "rejected", notes: { r1: "unsafe" } } });
  });

  it("flush with nothing open does nothing", () => {
    expect(transition(IDLE_LEDGER, { type: "flush" }).effects).toEqual([]);
  });
});

describe("review ledger: overlay and settle", () => {
  it("a server response applied mid-window cannot repaint the verdict", () => {
    const open = armed(["r1"]);
    const rows = overlay([row("r1", "pending"), row("r2", "pending")], open.state);
    expect(rows[0].status).toBe("approved");
    expect(rows[0].resolvedBy).toBe("You");
    expect(countPending(rows)).toBe(1);
  });

  it("a partial failure returns only the failed id to pending and reports it for reselect", () => {
    const open = armed(["r1", "r2"]);
    const committing = transition(open.state, { type: "expire", batchId: 1 });
    const settled = transition(committing.state, { type: "settled", batchId: 1, failedIds: ["r2"] });
    expect(settled.state.window).toBeNull();
    expect(settled.state.inFlight).toEqual([]);
    expect(settled.settled?.failedIds).toEqual(["r2"]);
    expect(settled.settled?.okIds).toEqual(["r1"]);
    const base = applyConfirmed([row("r1"), row("r2")], settled.settled!.batch, settled.settled!.okIds);
    const rows = overlay(base, settled.state);
    expect(rows.map((r) => r.status)).toEqual(["approved", "pending"]);
  });

  it("a settle for an unknown batch is a no-op", () => {
    const t = transition(IDLE_LEDGER, { type: "settled", batchId: 7, failedIds: [] });
    expect(t.settled).toBeUndefined();
    expect(t.state).toBe(IDLE_LEDGER);
  });
});

// Source scans: one door for every verdict path, one pending-count formula.
const SRC = path.resolve(__dirname, "..");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : [];
  });
}

describe("review ledger: source scans", () => {
  it("no review surface or hook calls resolveReview( directly", () => {
    const files = [
      ...walk(path.join(SRC, "app/dashboard/reviews")),
      ...walk(path.join(SRC, "app/m/reviews")),
      path.join(SRC, "hooks/useReviewBulkActions.ts"),
    ];
    const offenders = files.filter((f) => /\bresolveReview\(/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });

  it("pendingReviewCount is assigned only in the review store", () => {
    const offenders = walk(SRC).filter(
      (f) => /pendingReviewCount:/.test(readFileSync(f, "utf8")) && !f.endsWith(path.join("stores", "reviewStore.ts")),
    );
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });
});
