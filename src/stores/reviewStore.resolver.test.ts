import { beforeEach, describe, expect, it, vi } from "vitest";
import { en } from "@/i18n/en";
import {
  AUTO_APPROVE_NOTE,
  RESOLVED_BY_REVIEWER,
  RESOLVED_BY_SYSTEM,
  resolverLabel,
} from "@/lib/review-display";

// Who resolved a review, end to end through the demo data plane: the store
// talks to the real in-session mock (`mockApi`), so a write, the next poll and
// the parse back are all exercised. Before this, `resolveReview` (the
// escalation's immediate write) stamped the REVIEWER, so a review the system
// auto-approved read "by you"; and a human verdict read "by System" after the
// next poll, because nothing persisted who gave it.
//
// Demo mode routes the real `api` proxy to `mockApi` (mocking `@/lib/api` with
// mockApi itself would deadlock: mockApi imports ApiError from it).
vi.mock("@/stores/authStore", () => ({ useAuthStore: { getState: () => ({ isDemo: true }) } }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));
vi.mock("@/stores/personaStore", () => ({ usePersonaStore: { getState: () => ({ personas: [] }) } }));

const { mockApi } = await import("@/lib/mockApi");
const { useReviewStore } = await import("./reviewStore");
const store = () => useReviewStore.getState();

const byTitle = (title: string) => {
  const row = store().reviews.find((r) => r.content.startsWith(title));
  expect(row, title).toBeDefined();
  return row!;
};

async function settled() {
  await vi.waitFor(() => {
    expect(store().ledger.window).toBeNull();
    expect(store().ledger.inFlight).toHaveLength(0);
  });
}

beforeEach(async () => {
  useReviewStore.getState().reset();
  await store().fetchReviews();
});

describe("review resolver identity survives the write and the next poll", () => {
  it("an escalation auto-approve resolves as the system, not as you", async () => {
    // ev5: info severity, 24 h old, past the default 8 h auto_approve SLA.
    const title = "Publish Weekly Insights to Slack";
    expect(byTitle(title).status).toBe("pending");
    useReviewStore.setState({ escalationEnabled: true });
    await store().checkEscalations();

    const row = byTitle(title);
    expect(row.status).toBe("approved");
    expect(row.reviewerNotes).toBe(AUTO_APPROVE_NOTE);
    expect(row.resolvedBy).toBe(RESOLVED_BY_SYSTEM);
    expect(resolverLabel(row.resolvedBy!, en.reviewsPage)).toBe(en.reviewsPage.resolver.system);

    await store().fetchReviews();
    expect(byTitle(title).resolvedBy).toBe(RESOLVED_BY_SYSTEM);
    expect(byTitle(title).reviewerNotes).toBe(AUTO_APPROVE_NOTE);
  });

  it("a human approve through decide() reads 'you', before and after the next poll", async () => {
    const title = "Revoke Leaked Deploy Token";
    const id = byTitle(title).id;
    store().decide([id], "approved");
    expect(byTitle(title).resolvedBy).toBe(RESOLVED_BY_REVIEWER);
    store().flushDecisions();
    await settled();

    expect(byTitle(title).status).toBe("approved");
    expect(byTitle(title).resolvedBy).toBe(RESOLVED_BY_REVIEWER);

    await store().fetchReviews();
    const row = byTitle(title);
    expect(row.status).toBe("approved");
    expect(row.resolvedBy).toBe(RESOLVED_BY_REVIEWER);
    expect(resolverLabel(row.resolvedBy!, en.reviewsPage)).toBe(en.reviewsPage.resolver.you);
  });

  it("a human reject keeps its notes and its resolver through the poll", async () => {
    const title = "Override Failing Check on Dependency Bump";
    const id = byTitle(title).id;
    store().setDraft(id, "flaky is not green");
    store().decide([id], "rejected");
    store().flushDecisions();
    await settled();
    await store().fetchReviews();
    const row = byTitle(title);
    expect(row.status).toBe("rejected");
    expect(row.reviewerNotes).toBe("flaky is not green");
    expect(row.resolvedBy).toBe(RESOLVED_BY_REVIEWER);
  });

  it("guard: a feed event already decided with no recorded resolver reads as the system", () => {
    // ev6 is seeded `processed` with no resolver in its payload.
    const row = byTitle("Send Standup Digest Email");
    expect(row.status).toBe("approved");
    expect(row.resolvedBy).toBe(RESOLVED_BY_SYSTEM);
  });

  it("guard: undo writes nothing and leaves the row unresolved", async () => {
    const title = "Add Two Repositories to the Digest";
    const id = byTitle(title).id;
    store().decide([id], "approved");
    store().undoDecision();
    await settled();
    await store().fetchReviews();
    const row = byTitle(title);
    expect(row.status).toBe("pending");
    expect(row.resolvedBy).toBeNull();
    const stored = (await mockApi.listEvents({ eventType: "manual_review" })).find((e) => e.id === id);
    expect(stored?.status).toBe("pending");
  });
});
