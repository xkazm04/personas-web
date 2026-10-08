import { describe, expect, it } from "vitest";

import type { FeedbackMessage, MessageStatus, MessageThread } from "@/lib/mock-dashboard-data";
import { applyReadOverrides, withThreadsRead } from "./useThreadReadState";

function msg(id: string, threadId: string, status: MessageStatus, ts: string): FeedbackMessage {
  return {
    id,
    threadId,
    isThreadParent: id === threadId,
    persona: "p",
    personaColor: "#fff",
    timestamp: ts,
    subject: "s",
    status,
    payload: {},
    body: "b",
  } as unknown as FeedbackMessage;
}

function thread(id: string, latest: string, parent: MessageStatus, replies: MessageStatus[]): MessageThread {
  return {
    id,
    persona: "p",
    personaColor: "#fff",
    subject: "s",
    parent: msg(id, id, parent, latest),
    replies: replies.map((s, i) => msg(`${id}-r${i}`, id, s, latest)),
    latestTimestamp: latest,
    unreadCount: 0,
  } as unknown as MessageThread;
}

const older = thread("a", "2026-01-01T00:00:00Z", "unread", ["unread"]);
const newer = thread("b", "2026-02-01T00:00:00Z", "read", ["unread", "read"]);

describe("applyReadOverrides", () => {
  it("recomputes unreadCount and sorts newest first", () => {
    const out = applyReadOverrides([older, newer], new Map());
    expect(out.map((t) => t.id)).toEqual(["b", "a"]);
    expect(out.map((t) => t.unreadCount)).toEqual([1, 2]);
  });

  it("an override flips a message's status without mutating the input", () => {
    const out = applyReadOverrides([older], new Map<string, MessageStatus>([["a-r0", "read"]]));
    expect(out[0].replies[0].status).toBe("read");
    expect(out[0].unreadCount).toBe(1);
    expect(older.replies[0].status).toBe("unread");
  });

  it("marking threads read covers parents and replies", () => {
    const overrides = withThreadsRead(new Map(), [older, newer]);
    const out = applyReadOverrides([older, newer], overrides);
    expect(out.every((t) => t.unreadCount === 0)).toBe(true);
    expect(out.flatMap((t) => [t.parent, ...t.replies]).every((m) => m.status === "read")).toBe(true);
  });
});
