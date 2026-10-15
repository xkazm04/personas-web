import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_LEARNED_MEMORIES } from "@/lib/mock-dashboard-data";
import { getKnowledgeMemories } from "@/lib/mockApi";
import type { EventStatus, PersonaEvent } from "@/lib/types";
import { MOCK_TIMINGS, runMockCommand } from "./mockCommandPlane";
import { learnedMemoryContent, learnedMemoryFromVerdict, type ResolvedReview } from "./reviewLearning";

/**
 * Parity with the desktop's review learning loop: `flip_status`,
 * ../personas/src-tauri/db/src/repos/communication/manual_reviews.rs (the
 * block after the atomic status flip, about lines 584-770; last commit
 * touching that file: fc5491b03a37dabb839f6d4188b1c193fb73b3c1). The expected
 * values below are copied from that code, not derived from web code: re-copy
 * them when the desktop changes.
 *
 *   team persona  -> team_memories: "Human {verdict}: {title}",
 *                    approved = decision / 7, rejected = constraint / 8,
 *                    dedup by (team_id, title), tags "human-review,{verdict}"
 *   solo, director-> approved: "Director coaching: {title}", learned / 5;
 *                    rejected: nothing
 *   solo, other   -> persona memory "Human {verdict}: {title}", learned / 5,
 *                    source_execution_id = the review's execution,
 *                    tags ["human-review", verdict]
 *   content       -> Human {verdict} the review "{title}"{: description}.
 *                    { Reviewer notes: {notes}.} Apply this decision to future work.
 */

const review: ResolvedReview = {
  title: "Proposed Incident Mitigation",
  description: "Restart the Redis pods",
  personaId: "p-0002-mock",
  executionId: "e-0002-mock",
  contextData: null,
};

describe("learnedMemoryFromVerdict mirrors flip_status", () => {
  it("content: title, description, trimmed notes, the closing instruction", () => {
    expect(learnedMemoryContent(review, "approved", "  canary first  ")).toBe(
      'Human approved the review "Proposed Incident Mitigation": Restart the Redis pods. Reviewer notes: canary first. Apply this decision to future work.',
    );
    expect(learnedMemoryContent({ ...review, description: null }, "rejected", "   ")).toBe(
      'Human rejected the review "Proposed Incident Mitigation". Apply this decision to future work.',
    );
  });

  it("solo persona: one persona memory citing the review's run, learned / 5, for approve and reject", () => {
    for (const verdict of ["approved", "rejected"] as const) {
      expect(learnedMemoryFromVerdict(review, verdict, "canary first")).toEqual({
        scope: "persona",
        personaId: "p-0002-mock",
        title: `Human ${verdict}: Proposed Incident Mitigation`,
        content: learnedMemoryContent(review, verdict, "canary first"),
        category: "learned",
        importance: 5,
        tags: ["human-review", verdict],
        sourceExecutionId: "e-0002-mock",
      });
    }
  });

  it("team persona: approved is a decision (7), rejected a constraint (8), deduped by title, no run", () => {
    const teamed = { ...review, teamId: "team-1" };
    expect(learnedMemoryFromVerdict(teamed, "approved", null)).toMatchObject({
      scope: "team",
      teamId: "team-1",
      title: "Human approved: Proposed Incident Mitigation",
      category: "decision",
      importance: 7,
      tags: "human-review,approved",
    });
    expect(learnedMemoryFromVerdict(teamed, "rejected", null)).toMatchObject({ category: "constraint", importance: 8 });
    expect(learnedMemoryFromVerdict(teamed, "approved", null, new Set(["Human approved: Proposed Incident Mitigation"]))).toBeNull();
    expect(learnedMemoryFromVerdict(teamed, "approved", null)).not.toHaveProperty("sourceExecutionId");
  });

  it("director verdict: approve writes coaching, reject writes nothing", () => {
    const director = { ...review, contextData: '{"source":"director","check":"x"}' };
    expect(learnedMemoryFromVerdict(director, "approved", null)).toMatchObject({
      scope: "persona",
      title: "Director coaching: Proposed Incident Mitigation",
      category: "learned",
      importance: 5,
      sourceExecutionId: "e-0002-mock",
    });
    expect(learnedMemoryFromVerdict(director, "rejected", null)).toBeNull();
  });
});

describe("the scripted desktop learns from a committed verdict", () => {
  const visible = { isHidden: () => false };
  const event = (status: EventStatus = "pending", sourceId: string | null = "e-0002-mock"): PersonaEvent => ({
    id: "ev-0004-mock",
    projectId: "p",
    eventType: "manual_review",
    sourceType: "execution",
    sourceId,
    targetPersonaId: "p-0002-mock",
    payload: JSON.stringify({ title: "Proposed Incident Mitigation", description: "Restart the Redis pods", severity: "critical" }),
    status,
    errorMessage: null,
    processedAt: null,
    useCaseId: null,
    createdAt: "2026-10-07T08:00:00.000Z",
    retryCount: 0,
  });
  const port = (events: PersonaEvent[]) => ({
    list: async () => events,
    update: async (id: string, body: { status: EventStatus }) => {
      const i = events.findIndex((e) => e.id === id);
      events[i] = { ...events[i], status: body.status };
      return events[i];
    },
  });
  const decide = (id: string, decision: string, notes: string | null, events: PersonaEvent[], onFixtureChange = () => {}) =>
    runMockCommand(
      { id, verb: "review_decide", personaId: "p-0002-mock", params: { reviewId: "ev-0004-mock", decision, notes } },
      () => {},
      { ...visible, reviews: port(events), onFixtureChange },
    );

  beforeEach(() => {
    vi.useFakeTimers();
    MOCK_LEARNED_MEMORIES.length = 0;
  });
  afterEach(() => {
    vi.useRealTimers();
    MOCK_LEARNED_MEMORIES.length = 0;
  });

  it("approve with notes: exactly one memory, citing the review's run, served first in Knowledge", async () => {
    const events = [event()];
    const changed = vi.fn();
    decide("rd1", "approved", "canary first", events, changed);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(1);
    expect(MOCK_LEARNED_MEMORIES[0]).toMatchObject({
      personaId: "p-0002-mock",
      title: "Human approved: Proposed Incident Mitigation",
      category: "learned",
      importance: 5,
      sourceExecutionId: "e-0002-mock",
      tags: '["human-review","approved"]',
    });
    expect(MOCK_LEARNED_MEMORIES[0].content).toContain("Reviewer notes: canary first.");
    expect(changed).toHaveBeenCalled();

    const read = getKnowledgeMemories();
    await vi.advanceTimersByTimeAsync(200);
    const [first] = await read;
    expect(first).toMatchObject({
      title: "Human approved: Proposed Incident Mitigation",
      persona: "Incident Responder",
      sourceExecutionId: "e-0002-mock",
      score: 5,
    });
  });

  it("reject: one memory with the rejected title", async () => {
    decide("rd2", "rejected", null, [event()]);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    expect(MOCK_LEARNED_MEMORIES.map((m) => m.title)).toEqual(["Human rejected: Proposed Incident Mitigation"]);
  });

  it("repeating the verdict, or deciding an already decided review, adds none", async () => {
    const events = [event()];
    decide("rd3", "approved", null, events);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    decide("rd4", "approved", null, events);
    decide("rd5", "rejected", null, events);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(1);

    MOCK_LEARNED_MEMORIES.length = 0;
    decide("rd6", "approved", null, [event("processed")]);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    expect(MOCK_LEARNED_MEMORIES).toHaveLength(0);
  });

  it("a review raised with no run learns a memory with no run (no chip, honestly)", async () => {
    decide("rd7", "approved", null, [event("pending", null)]);
    await vi.advanceTimersByTimeAsync(MOCK_TIMINGS.completedMs);
    expect(MOCK_LEARNED_MEMORIES[0].sourceExecutionId).toBeNull();
  });
});
