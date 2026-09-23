import { create } from "zustand";
import * as Sentry from "@sentry/nextjs";
import { api } from "@/lib/api";
import { usePersonaStore } from "./personaStore";
import type {
  Persona,
  PersonaEvent,
  ManualReviewItem,
  ReviewSeverity,
  ReviewStatus,
  EscalationPolicy,
} from "@/lib/types";
import {
  IDLE_LEDGER,
  applyConfirmed,
  countPending,
  overlay,
  transition,
  type LedgerBatch,
  type LedgerEffect,
  type LedgerEvent,
  type LedgerState,
  type RefusalReason,
  type Verdict,
} from "@/lib/review-ledger";
import { AUTO_APPROVE_NOTE, RESOLVED_BY_REVIEWER, RESOLVED_BY_SYSTEM } from "@/lib/review-display";
import { DEFAULT_ESCALATION_POLICY, escalationDue, validateEscalationPolicy } from "@/lib/review-sla";

export { DEFAULT_ESCALATION_POLICY };

const REVIEW_SEVERITIES: Set<string> = new Set<string>(["critical", "warning", "info"]);
let reviewFetchSeq = 0;

function isReviewSeverity(v: unknown): v is ReviewSeverity {
  return typeof v === "string" && REVIEW_SEVERITIES.has(v);
}

function toReviewStatus(eventStatus: string): ReviewStatus {
  if (eventStatus === "processed") return "approved";
  if (eventStatus === "failed") return "rejected";
  return "pending";
}

function parseManualReview(
  event: PersonaEvent,
  personaMap: Map<string, Persona>,
): ManualReviewItem | null {
  if (event.eventType !== "manual_review") return null;
  const p = event.targetPersonaId ? personaMap.get(event.targetPersonaId) : undefined;
  // Fail-loud defaults: if JSON.parse throws or payload.severity is missing
  // or invalid, we promote the review to "critical" and tag parseError. The
  // old behavior defaulted to "info" — under DEFAULT_ESCALATION_POLICY that
  // silently widens the SLA to 8h and routes the row to auto_approve, so a
  // malformed payload of a real critical event would be quietly waved through.
  let content = "";
  let severity: ReviewSeverity = "critical";
  let reviewerNotes: string | null = null;
  let recordedResolver: string | null = null;
  let parseError = false;
  try {
    const payload = JSON.parse(event.payload ?? "{}");
    content = payload.title
      ? `${payload.title}\n${payload.description ?? ""}`
      : (payload.content ?? "");
    if (isReviewSeverity(payload.severity)) {
      severity = payload.severity;
    } else {
      parseError = true;
    }
    reviewerNotes = payload.reviewerNotes ?? null;
    if (typeof payload.resolvedBy === "string" && payload.resolvedBy) recordedResolver = payload.resolvedBy;
  } catch {
    content = event.payload ?? "";
    parseError = true;
  }
  const status = toReviewStatus(event.status);
  return {
    id: event.id,
    personaId: event.targetPersonaId ?? "",
    executionId: event.sourceId ?? "",
    eventType: event.eventType,
    content,
    severity,
    status,
    reviewerNotes,
    createdAt: event.createdAt,
    resolvedAt: event.processedAt,
    // Who the write recorded (writeVerdict); a verdict the feed reports with no
    // recorded resolver was not given here, so it reads as the system's.
    resolvedBy: status !== "pending" ? (recordedResolver ?? RESOLVED_BY_SYSTEM) : null,
    escalatedAt: null,
    personaName: p?.name,
    personaIcon: p?.icon ?? undefined,
    personaColor: p?.color ?? undefined,
    parseError: parseError || undefined,
  };
}

// ---------------------------------------------------------------------------
// Escalation policy — persisted in localStorage
// ---------------------------------------------------------------------------

const ESCALATION_POLICY_KEY = "review-escalation-policy";

// The policy's defaults and its field validator (including the SLA >= urgency
// threshold invariant) live in src/lib/review-sla.ts, the one SLA rule. Every
// policy that enters the store passes through it.

function loadEscalationPolicy(): EscalationPolicy {
  let raw: string | null;
  try {
    raw = localStorage.getItem(ESCALATION_POLICY_KEY);
  } catch {
    return DEFAULT_ESCALATION_POLICY;
  }
  if (!raw) return DEFAULT_ESCALATION_POLICY;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    Sentry.captureMessage(
      "reviewStore: escalation policy in localStorage is not valid JSON; using defaults",
      {
        level: "warning",
        tags: { scope: "reviewStore", reason: "policy-parse-error" },
      },
    );
    return DEFAULT_ESCALATION_POLICY;
  }
  if (!parsed || typeof parsed !== "object") {
    Sentry.captureMessage(
      "reviewStore: escalation policy in localStorage is not an object; using defaults",
      {
        level: "warning",
        tags: { scope: "reviewStore", reason: "policy-shape-error" },
        extra: { storedType: Array.isArray(parsed) ? "array" : typeof parsed },
      },
    );
    return DEFAULT_ESCALATION_POLICY;
  }
  const { policy, rejections } = validateEscalationPolicy(parsed);
  if (rejections.length > 0) {
    Sentry.captureMessage(
      "reviewStore: escalation policy in localStorage failed field validation; rejected fields fell back to defaults",
      {
        level: "warning",
        tags: { scope: "reviewStore", reason: "policy-field-validation" },
        extra: { rejections },
      },
    );
  }
  return policy;
}

function saveEscalationPolicy(policy: EscalationPolicy): void {
  localStorage.setItem(ESCALATION_POLICY_KEY, JSON.stringify(policy));
}

// ---------------------------------------------------------------------------
// Escalation concurrency guards
// ---------------------------------------------------------------------------

// Auto-approve / auto-escalate is a persistent server-side write, so duplicate
// firings produce duplicate audit-log rows and duplicate webhook deliveries.
// Two layers of defense:
//   1. `escalationsInFlight` — per-id Set so a single tab can't re-enter the
//      same id if checkEscalations is called again before the resolve resolves.
//   2. `navigator.locks.request("review-escalations", { ifAvailable: true })`
//      — only one tab in the same origin owns the pass at a time. Other tabs
//      get a null lock and bail without scanning.
//   3. `escalationRunning` — per-tab guard so a poll tick that completes
//      faster than the previous escalation pass won't re-enter overlap.
const escalationsInFlight = new Set<string>();
let escalationRunning = false;

const ESCALATION_LOCK_NAME = "review-escalations";

async function withCrossTabLock<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T | undefined> {
  // Web Locks: ifAvailable returns immediately with null when another tab
  // already holds the lock — we then skip rather than queueing.
  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return await navigator.locks.request(
      name,
      { ifAvailable: true, mode: "exclusive" },
      async (lock) => {
        if (!lock) return undefined;
        return await fn();
      },
    );
  }
  return await fn();
}

// ---------------------------------------------------------------------------
// Decision ledger plumbing — the store owns the one commit timer
// ---------------------------------------------------------------------------

// Cap concurrent PATCHes so a 100-item bulk approve doesn't thunder against the
// orchestrator. Workers share a cursor so each id is claimed exactly once.
const COMMIT_CONCURRENCY = 6;
let windowTimer: { batchId: number; handle: ReturnType<typeof setTimeout> } | null = null;

/**
 * The one verdict write. `resolvedBy` travels in the metadata with the notes,
 * so the next poll reads back who resolved the review (`parseManualReview`).
 */
function writeVerdict(id: string, status: Verdict, resolvedBy: string, notes?: string) {
  return api.updateEvent(id, {
    status: status === "approved" ? "processed" : "failed",
    metadata: JSON.stringify(notes ? { reviewerNotes: notes, resolvedBy } : { resolvedBy }),
  });
}

/** The only place `reviews` and `pendingReviewCount` are derived. */
function derive(baseReviews: ManualReviewItem[], ledger: LedgerState) {
  const reviews = overlay(baseReviews, ledger);
  return { baseReviews, ledger, reviews, pendingReviewCount: countPending(reviews) };
}

export interface CommitResult {
  batchId: number;
  total: number;
  successCount: number;
  failedIds: string[];
  status: Verdict;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface ReviewState {
  /** Server rows with the ledger's verdicts painted over them (`overlay`). */
  reviews: ManualReviewItem[];
  /** Last server truth, before the overlay. */
  baseReviews: ManualReviewItem[];
  reviewsLoading: boolean;
  pendingReviewCount: number;
  ledger: LedgerState;
  /** Reviewer-note drafts keyed by review id; every verdict path carries them. */
  drafts: Record<string, string>;
  /** Progress of an in-flight multi-row commit. */
  commitProgress: { batchId: number; done: number; total: number; failed: number } | null;
  /** Last commit that had failures (retry toast + reselect). */
  lastResult: CommitResult | null;
  /** Last refused arm; shown on the open undo toast. */
  refusal: { reason: RefusalReason; batchId: number | null } | null;
  escalationPolicy: EscalationPolicy;
  escalationEnabled: boolean;
  fetchReviews: () => Promise<void>;
  /** The one door for every human verdict: opens a 5 s undoable window.
   *  Returns false when the ledger refused the arm (see `refusal`). */
  decide: (ids: string[], verdict: Verdict) => boolean;
  undoDecision: () => void;
  /** Teardown: commit the open window now (unmount, pagehide, sign-out). */
  flushDecisions: () => void;
  setDraft: (id: string, text: string) => void;
  dismissResult: () => void;
  /** Immediate write for machine actors (escalation). Humans go through `decide`. */
  resolveReview: (id: string, status: Verdict, notes?: string) => Promise<void>;
  setEscalationPolicy: (policy: EscalationPolicy) => void;
  setEscalationEnabled: (enabled: boolean) => void;
  checkEscalations: () => Promise<void>;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => {
  function dispatch(event: LedgerEvent): boolean {
    const t = transition(get().ledger, event);
    if (t.refused) {
      set({ refusal: { reason: t.refused.reason, batchId: get().ledger.window?.batchId ?? null } });
      return false;
    }
    if (t.state === get().ledger) return true;
    let base = get().baseReviews;
    if (t.settled) {
      const { batch, okIds, failedIds } = t.settled;
      base = applyConfirmed(base, batch, okIds);
      // A fetch that left before the server had this write would repaint it.
      reviewFetchSeq++;
      set((s) => {
        const drafts = { ...s.drafts };
        for (const id of okIds) delete drafts[id];
        return {
          drafts,
          commitProgress: s.commitProgress?.batchId === batch.batchId ? null : s.commitProgress,
          lastResult: failedIds.length
            ? { batchId: batch.batchId, total: batch.ids.length, successCount: okIds.length, failedIds, status: batch.verdict }
            : s.lastResult,
        };
      });
    }
    set({ ...derive(base, t.state), refusal: event.type === "arm" ? null : get().refusal });
    for (const e of t.effects) runEffect(e);
    return true;
  }

  function runEffect(e: LedgerEffect) {
    if (e.type === "schedule") {
      if (windowTimer) clearTimeout(windowTimer.handle);
      const handle = setTimeout(() => {
        windowTimer = null;
        dispatch({ type: "expire", batchId: e.batchId });
      }, Math.max(0, e.deadline - Date.now()));
      windowTimer = { batchId: e.batchId, handle };
    } else if (e.type === "cancelTimer") {
      if (windowTimer?.batchId === e.batchId) {
        clearTimeout(windowTimer.handle);
        windowTimer = null;
      }
    } else {
      void commit(e.batch);
    }
  }

  async function commit(batch: LedgerBatch) {
    const { ids, batchId } = batch;
    const failed: string[] = [];
    let done = 0;
    let cursor = 0;
    if (ids.length > 1) set({ commitProgress: { batchId, done, total: ids.length, failed: 0 } });
    const worker = async () => {
      while (cursor < ids.length) {
        const id = ids[cursor++];
        try {
          await writeVerdict(id, batch.verdict, RESOLVED_BY_REVIEWER, batch.notes[id]);
        } catch {
          failed.push(id);
        } finally {
          done++;
          if (get().commitProgress?.batchId === batchId) {
            set({ commitProgress: { batchId, done, total: ids.length, failed: failed.length } });
          }
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(COMMIT_CONCURRENCY, ids.length) }, worker));
    dispatch({ type: "settled", batchId, failedIds: failed });
  }

  return {
    reviews: [],
    baseReviews: [],
    reviewsLoading: false,
    pendingReviewCount: 0,
    ledger: IDLE_LEDGER,
    drafts: {},
    commitProgress: null,
    lastResult: null,
    refusal: null,
    escalationPolicy: DEFAULT_ESCALATION_POLICY,
    escalationEnabled: typeof window !== "undefined" && localStorage.getItem("review-escalation-enabled") === "true",
    fetchReviews: async () => {
      // No pause flag: the response is overlaid with the ledger at the point it
      // is applied, so a poll (even one already in flight when a window opened)
      // cannot repaint a pending verdict.
      const seq = ++reviewFetchSeq;
      set({ reviewsLoading: true });
      try {
        const events = await api.listEvents({ eventType: "manual_review", limit: 100 });
        const personas = usePersonaStore.getState().personas;
        const personaMap = new Map(personas.map((p) => [p.id, p]));
        const reviews = events
          .map((e) => parseManualReview(e, personaMap))
          .filter((r): r is ManualReviewItem => r !== null);
        if (seq === reviewFetchSeq) {
          set((s) => derive(reviews, s.ledger));
        }
      } catch {
        // leave stale
      } finally {
        if (seq === reviewFetchSeq) {
          set({ reviewsLoading: false });
        }
      }
    },
    decide: (ids, verdict) => {
      const drafts = get().drafts;
      const notes: Record<string, string> = {};
      for (const id of ids) if (drafts[id]?.trim()) notes[id] = drafts[id];
      return dispatch({ type: "arm", ids, verdict, notes, now: Date.now() });
    },
    undoDecision: () => {
      const w = get().ledger.window;
      if (w) dispatch({ type: "undo", batchId: w.batchId });
    },
    flushDecisions: () => {
      dispatch({ type: "flush" });
    },
    setDraft: (id, text) => set((s) => ({ drafts: { ...s.drafts, [id]: text } })),
    dismissResult: () => set({ lastResult: null }),
    resolveReview: async (id, status, notes) => {
      // Only machine actors call this (escalation); the verdict is the system's.
      await writeVerdict(id, status, RESOLVED_BY_SYSTEM, notes);
      const resolvedAt = new Date().toISOString();
      set((s) =>
        derive(
          s.baseReviews.map((r) =>
            r.id === id ? { ...r, status, resolvedAt, resolvedBy: RESOLVED_BY_SYSTEM, reviewerNotes: notes ?? r.reviewerNotes } : r,
          ),
          s.ledger,
        ),
      );
    },
    setEscalationPolicy: (next) => {
      // Same validator as the localStorage load: an SLA shorter than its
      // urgency threshold (or any invalid field) falls back to the default.
      const { policy } = validateEscalationPolicy(next);
      saveEscalationPolicy(policy);
      set({ escalationPolicy: policy });
    },
    setEscalationEnabled: (enabled) => {
      localStorage.setItem("review-escalation-enabled", String(enabled));
      set({ escalationEnabled: enabled });
    },
    reset: () => {
      // A decision made before sign-out is still the operator's: commit it
      // rather than drop it, then forget the rows.
      get().flushDecisions();
      // Bump the seq so any in-flight fetch from the previous user can't write back.
      reviewFetchSeq++;
      // Preserve escalationPolicy/escalationEnabled — those are browser-level prefs,
      // not user data, and are also persisted in localStorage.
      set({ ...derive([], get().ledger), reviewsLoading: false, drafts: {}, lastResult: null, refusal: null });
    },
  checkEscalations: async () => {
    if (escalationRunning) return;
    if (!get().escalationEnabled) return;
    // Skip in background tabs entirely — no point burning CPU scanning a list
    // the user isn't watching, and any other foreground tab will run anyway.
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    escalationRunning = true;
    try {
      await withCrossTabLock(ESCALATION_LOCK_NAME, async () => {
        const { reviews, escalationPolicy, resolveReview } = get();
        const now = Date.now();
        for (const review of reviews) {
          // One SLA rule (review-sla.ts). A row inside the undo window is
          // non-pending in the overlay, so a human verdict beats the machine.
          if (!escalationDue(review, escalationPolicy, now)) continue;
          if (escalationsInFlight.has(review.id)) continue;
          const rule = escalationPolicy[review.severity];

          escalationsInFlight.add(review.id);
          try {
            if (rule.action === "auto_approve") {
              // Awaited so the next iteration can't re-pick a still-pending row,
              // and so escalationsInFlight covers the whole API round-trip.
              await resolveReview(review.id, "approved", AUTO_APPROVE_NOTE);
            } else if (rule.action === "escalate") {
              const escalatedAt = new Date().toISOString();
              set((s) =>
                derive(
                  s.baseReviews.map((r) => (r.id === review.id ? { ...r, escalatedAt } : r)),
                  s.ledger,
                ),
              );
            }
          } finally {
            escalationsInFlight.delete(review.id);
          }
        }
      });
    } finally {
      escalationRunning = false;
    }
  },
  };
});

// Hydrate escalation policy from localStorage on client, and commit any open
// decision window when the page goes away (flush-on-teardown).
if (typeof window !== "undefined") {
  useReviewStore.setState({ escalationPolicy: loadEscalationPolicy() });
  window.addEventListener("pagehide", () => useReviewStore.getState().flushDecisions());
}
