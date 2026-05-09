import { create } from "zustand";
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
  let content = "";
  let severity: ReviewSeverity = "info";
  let reviewerNotes: string | null = null;
  try {
    const payload = JSON.parse(event.payload ?? "{}");
    content = payload.title
      ? `${payload.title}\n${payload.description ?? ""}`
      : (payload.content ?? "");
    severity = isReviewSeverity(payload.severity) ? payload.severity : "info";
    reviewerNotes = payload.reviewerNotes ?? null;
  } catch {
    content = event.payload ?? "";
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
    resolvedBy: status !== "pending" ? "System" : null,
    escalatedAt: null,
    personaName: p?.name,
    personaIcon: p?.icon ?? undefined,
    personaColor: p?.color ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Escalation policy — persisted in localStorage
// ---------------------------------------------------------------------------

const ESCALATION_POLICY_KEY = "review-escalation-policy";

export const DEFAULT_ESCALATION_POLICY: EscalationPolicy = {
  critical: { slaMinutes: 30, action: "escalate" },
  warning: { slaMinutes: 240, action: "escalate" },
  info: { slaMinutes: 480, action: "auto_approve" },
};

function loadEscalationPolicy(): EscalationPolicy {
  try {
    const raw = localStorage.getItem(ESCALATION_POLICY_KEY);
    if (!raw) return DEFAULT_ESCALATION_POLICY;
    return { ...DEFAULT_ESCALATION_POLICY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ESCALATION_POLICY;
  }
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
// Store
// ---------------------------------------------------------------------------

interface ReviewState {
  reviews: ManualReviewItem[];
  reviewsLoading: boolean;
  pendingReviewCount: number;
  escalationPolicy: EscalationPolicy;
  escalationEnabled: boolean;
  /** When true, automatic polling consumers (e.g. ReviewsSplitPane's usePolling)
   *  must skip fetching. Set during the optimistic-undo window so a server poll
   *  doesn't overwrite the local optimistic state and produce a status flicker. */
  pollPaused: boolean;
  fetchReviews: () => Promise<void>;
  resolveReview: (id: string, status: "approved" | "rejected", notes?: string) => Promise<void>;
  setEscalationPolicy: (policy: EscalationPolicy) => void;
  setEscalationEnabled: (enabled: boolean) => void;
  setPollPaused: (paused: boolean) => void;
  checkEscalations: () => Promise<void>;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  reviewsLoading: false,
  pendingReviewCount: 0,
  escalationPolicy: DEFAULT_ESCALATION_POLICY,
  escalationEnabled: typeof window !== "undefined" && localStorage.getItem("review-escalation-enabled") === "true",
  pollPaused: false,
  fetchReviews: async () => {
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
        set({
          reviews,
          pendingReviewCount: reviews.filter((r) => r.status === "pending").length,
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
  resolveReview: async (id, status, notes) => {
    const mappedStatus = status === "approved" ? "processed" : "failed";
    await api.updateEvent(id, {
      status: mappedStatus,
      metadata: notes ? JSON.stringify({ reviewerNotes: notes }) : undefined,
    });
    set((s) => {
      const wasPending = s.reviews.find((r) => r.id === id)?.status === "pending";
      return {
        reviews: s.reviews.map((r) =>
          r.id === id ? { ...r, status, resolvedAt: new Date().toISOString(), resolvedBy: "You" } : r,
        ),
        pendingReviewCount: wasPending ? s.pendingReviewCount - 1 : s.pendingReviewCount,
      };
    });
  },
  setEscalationPolicy: (policy) => {
    saveEscalationPolicy(policy);
    set({ escalationPolicy: policy });
  },
  setEscalationEnabled: (enabled) => {
    localStorage.setItem("review-escalation-enabled", String(enabled));
    set({ escalationEnabled: enabled });
  },
  setPollPaused: (paused) => set({ pollPaused: paused }),
  reset: () => {
    // Bump the seq so any in-flight fetch from the previous user can't write back.
    reviewFetchSeq++;
    // Preserve escalationPolicy/escalationEnabled — those are browser-level prefs,
    // not user data, and are also persisted in localStorage.
    set({
      reviews: [],
      reviewsLoading: false,
      pendingReviewCount: 0,
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
          if (review.status !== "pending") continue;
          if (review.escalatedAt) continue;
          if (escalationsInFlight.has(review.id)) continue;

          const rule = escalationPolicy[review.severity];
          if (rule.action === "none") continue;

          const ageMs = now - new Date(review.createdAt).getTime();
          const slaMs = rule.slaMinutes * 60_000;
          if (ageMs < slaMs) continue;

          escalationsInFlight.add(review.id);
          try {
            if (rule.action === "auto_approve") {
              // Awaited so the next iteration can't re-pick a still-pending row,
              // and so escalationsInFlight covers the whole API round-trip.
              await resolveReview(review.id, "approved", "Auto-approved: SLA expired");
            } else if (rule.action === "escalate") {
              set((s) => ({
                reviews: s.reviews.map((r) =>
                  r.id === review.id ? { ...r, escalatedAt: new Date().toISOString() } : r,
                ),
              }));
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
}));

// Hydrate escalation policy from localStorage on client
if (typeof window !== "undefined") {
  useReviewStore.setState({ escalationPolicy: loadEscalationPolicy() });
}
