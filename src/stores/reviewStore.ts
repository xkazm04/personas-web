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
  reconcileConfirmed,
  transition,
  type ConfirmedMap,
  type LedgerBatch,
  type LedgerEffect,
  type LedgerEvent,
  type LedgerState,
  type RefusalReason,
  type Verdict,
} from "@/lib/review-ledger";
import { AUTO_APPROVE_NOTE, RESOLVED_BY_REVIEWER, RESOLVED_BY_SYSTEM } from "@/lib/review-display";
import { DEFAULT_ESCALATION_POLICY, escalationDue, validateEscalationPolicy } from "@/lib/review-sla";
import { reviewCommandOutcome } from "@/lib/commands/reviewDecide";

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
  let deviceId: string | null = null;
  let deskOnly = false;
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
    // The sync mirror carries the desktop that raised the review (supabaseApi.reviewToEvent).
    if (typeof payload.deviceId === "string" && payload.deviceId) deviceId = payload.deviceId;
    if (payload.deskOnly === true) deskOnly = true;
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
    deviceId,
    deskOnly: deskOnly || undefined,
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

// Storage can throw (blocked site data, private mode); the prefs then live in
// memory for the session rather than breaking the toggle that set them.
function saveEscalationPolicy(policy: EscalationPolicy): void {
  try {
    localStorage.setItem(ESCALATION_POLICY_KEY, JSON.stringify(policy));
  } catch {
    /* in-memory only */
  }
}

const ESCALATION_ENABLED_KEY = "review-escalation-enabled";

function loadEscalationEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ESCALATION_ENABLED_KEY) === "true";
  } catch {
    return false;
  }
}

function saveEscalationEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ESCALATION_ENABLED_KEY, String(enabled));
  } catch {
    /* in-memory only */
  }
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
// A machine verdict that did not go through (no paired phone, desktop offline)
// is not resent on every 30 s pass: each attempt would be another command.
const ESCALATION_RETRY_MS = 5 * 60_000;
const escalationRetryAt = new Map<string, number>();

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

/** A verdict command that ended without applying (spec 2.3): its desktop reason. */
class VerdictCommandError extends Error {
  constructor(readonly reason: string) {
    super(reason);
    this.name = "VerdictCommandError";
  }
}

/** Lazy and loaded once: commandStore loads the command planes on first use. */
let commandStoreModule: Promise<typeof import("@/stores/commandStore")> | null = null;
function loadCommandStore() {
  commandStoreModule ??= import("@/stores/commandStore");
  return commandStoreModule;
}

/** The fields of a review a verdict needs on every plane. */
type VerdictTarget = Pick<ManualReviewItem, "id" | "personaId" | "deviceId">;

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
  /** On a command plane (M20): the `review_decide` each review's verdict was sent as, for its chip. */
  reviewCommands: Record<string, string>;
  /** Verdicts the plane confirmed in this tab, held over a lagging mirror (`reconcileConfirmed`). */
  confirmed: ConfirmedMap;
  /** The last machine verdict (escalation) that did not go through, shown, never swallowed. */
  escalationFailure: { reviewId: string; reason: string } | null;
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
        const at = Date.now();
        const confirmed = { ...s.confirmed };
        for (const id of okIds) {
          confirmed[id] = { verdict: batch.verdict, resolvedBy: RESOLVED_BY_REVIEWER, notes: batch.notes[id] ?? null, at };
        }
        return {
          drafts,
          confirmed,
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

  /**
   * The one verdict write, on whichever plane `api` is: the orchestrator
   * answers with the updated event (the write is done), a command plane (the
   * live mirror, the demo's scripted desktop) with a `review_decide` to follow
   * until it settles (M20). Throws when the verdict did not apply.
   */
  async function writeVerdict(review: VerdictTarget, status: Verdict, resolvedBy: string, notes?: string): Promise<void> {
    const ack = await api.decideReview({
      reviewId: review.id,
      personaId: review.personaId,
      deviceId: review.deviceId ?? null,
      decision: status,
      notes: notes?.trim() ? notes : null,
      resolvedBy,
    });
    if (!("commandId" in ack)) return;
    set((s) => ({ reviewCommands: { ...s.reviewCommands, [review.id]: ack.commandId } }));
    const { settleCommand } = await loadCommandStore();
    const outcome = reviewCommandOutcome(await settleCommand(ack.commandId));
    if (!outcome.ok) throw new VerdictCommandError(outcome.reason);
  }

  /** The row a verdict is about; a row gone from the list still sends (the desktop answers `not_found`). */
  function verdictTarget(id: string): VerdictTarget {
    return get().baseReviews.find((r) => r.id === id) ?? { id, personaId: "", deviceId: null };
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
          await writeVerdict(verdictTarget(id), batch.verdict, RESOLVED_BY_REVIEWER, batch.notes[id]);
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
    reviewCommands: {},
    confirmed: {},
    escalationFailure: null,
    escalationPolicy: DEFAULT_ESCALATION_POLICY,
    escalationEnabled: loadEscalationEnabled(),
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
          set((s) => {
            const fresh = reconcileConfirmed(reviews, s.confirmed, Date.now());
            return { ...derive(fresh.rows, s.ledger), confirmed: fresh.confirmed };
          });
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
      await writeVerdict(verdictTarget(id), status, RESOLVED_BY_SYSTEM, notes);
      const at = Date.now();
      const resolvedAt = new Date(at).toISOString();
      set((s) => ({
        ...derive(
          s.baseReviews.map((r) =>
            r.id === id ? { ...r, status, resolvedAt, resolvedBy: RESOLVED_BY_SYSTEM, reviewerNotes: notes ?? r.reviewerNotes } : r,
          ),
          s.ledger,
        ),
        confirmed: { ...s.confirmed, [id]: { verdict: status, resolvedBy: RESOLVED_BY_SYSTEM, notes: notes ?? null, at } },
      }));
    },
    setEscalationPolicy: (next) => {
      // Same validator as the localStorage load: an SLA shorter than its
      // urgency threshold (or any invalid field) falls back to the default.
      const { policy } = validateEscalationPolicy(next);
      saveEscalationPolicy(policy);
      set({ escalationPolicy: policy });
    },
    setEscalationEnabled: (enabled) => {
      saveEscalationEnabled(enabled);
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
      escalationRetryAt.clear();
      set({
        ...derive([], get().ledger),
        reviewsLoading: false,
        drafts: {},
        lastResult: null,
        refusal: null,
        reviewCommands: {},
        confirmed: {},
        escalationFailure: null,
      });
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
          if ((escalationRetryAt.get(review.id) ?? 0) > now) continue;
          const rule = escalationPolicy[review.severity];

          escalationsInFlight.add(review.id);
          try {
            if (rule.action === "auto_approve") {
              // Awaited so the next iteration can't re-pick a still-pending row,
              // and so escalationsInFlight covers the whole API round-trip.
              try {
                await resolveReview(review.id, "approved", AUTO_APPROVE_NOTE);
                escalationRetryAt.delete(review.id);
                if (get().escalationFailure?.reviewId === review.id) set({ escalationFailure: null });
              } catch (err) {
                // A machine verdict that did not apply (on a command plane: no
                // paired phone, the desktop offline or refusing) is shown, and
                // retried only after a cool-down.
                escalationRetryAt.set(review.id, Date.now() + ESCALATION_RETRY_MS);
                const reason = err instanceof VerdictCommandError ? err.reason : err instanceof Error ? err.message : "unknown";
                set({ escalationFailure: { reviewId: review.id, reason } });
              }
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
