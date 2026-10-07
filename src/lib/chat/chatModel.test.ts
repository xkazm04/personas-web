import { describe, expect, it } from "vitest";
import type { InflightCommand } from "@/lib/commands/commandReducer";
import type { PersonaExecutionStatus } from "@/lib/types";
import {
  CHAT_MESSAGE_MAX_BYTES,
  REPLY_WAIT_MS,
  chatErrorKind,
  chatSendParams,
  deriveTranscript,
  draftSessionId,
  mapChatMessageRow,
  mapChatSessionRow,
  mergeMessages,
  openTurns,
  sendsForThread,
  sortMessages,
  sortSessions,
  type ChatMessage,
  type ChatSend,
  type ChatSession,
} from "./chatModel";

const T0 = Date.parse("2026-10-06T12:00:00.000Z");
const at = (s: number) => new Date(T0 + s * 1000).toISOString();

function msg(id: string, role: "user" | "assistant", s: number, content = id, executionId: string | null = null): ChatMessage {
  return { id, deviceId: "dev", threadKind: "athena", personaId: "athena", sessionId: "default", role, content, executionId, createdAt: at(s) };
}

function session(sessionId: string, updatedS: number, pinned = false): ChatSession {
  return {
    sessionId,
    deviceId: "dev",
    threadKind: "athena",
    personaId: "athena",
    title: sessionId,
    chatMode: null,
    origin: "user",
    pinned,
    createdAt: at(0),
    updatedAt: at(updatedS),
  };
}

function send(localId: string, sentS: number, message: string, over: Partial<ChatSend> = {}): ChatSend {
  return {
    localId,
    commandId: `cmd-${localId}`,
    localError: null,
    threadKind: "athena",
    personaId: "athena",
    deviceId: "dev",
    sessionId: "default",
    draftKey: null,
    message,
    sentAt: T0 + sentS * 1000,
    ...over,
  };
}

function cmd(id: string, status: InflightCommand["status"], result: Record<string, unknown> | null = null, error: string | null = null): InflightCommand {
  return { id, verb: "chat_send", personaId: "athena", status, result, error, requestedAt: T0, expiresAt: T0 + 60_000 };
}

const noRuns = () => undefined;

describe("chatModel: ordering", () => {
  it("sorts messages oldest first, the user turn before its reply on a tie, then by id", () => {
    const sorted = sortMessages([msg("r", "assistant", 5), msg("b", "user", 1), msg("u", "user", 5), msg("a", "user", 1)]);
    expect(sorted.map((m) => m.id)).toEqual(["a", "b", "u", "r"]);
  });

  it("sorts threads pinned first, then by latest activity", () => {
    const sorted = sortSessions([session("old", 10), session("new", 50), session("pin", 1, true)]);
    expect(sorted.map((s) => s.sessionId)).toEqual(["pin", "new", "old"]);
  });

  it("merges a fresh page by id: the fresh row wins and order holds", () => {
    const merged = mergeMessages([msg("a", "user", 1, "old text"), msg("b", "assistant", 2)], [msg("a", "user", 1, "masked"), msg("c", "user", 3)]);
    expect(merged.map((m) => [m.id, m.content])).toEqual([
      ["a", "masked"],
      ["b", "b"],
      ["c", "c"],
    ]);
  });

  it("drops rows the schema would refuse instead of inventing a kind or role", () => {
    const base = { device_id: "d", id: "m", persona_id: "athena", session_id: "s", content: "x", execution_id: null, created_at: at(0) };
    expect(mapChatMessageRow({ ...base, thread_kind: "athena", role: "system" })).toBeNull();
    expect(mapChatMessageRow({ ...base, thread_kind: "team", role: "user" })).toBeNull();
    expect(mapChatMessageRow({ ...base, thread_kind: "athena", role: "assistant", content: null })?.content).toBe("");
    expect(
      mapChatSessionRow({
        device_id: "d",
        thread_kind: "persona",
        session_id: "s",
        persona_id: "p",
        title: null,
        chat_mode: "ops",
        origin: null,
        pinned: null,
        created_at: at(0),
        updated_at: at(1),
      }),
    ).toMatchObject({ threadKind: "persona", pinned: false, chatMode: "ops" });
  });
});

describe("chatModel: send params", () => {
  it("trims, keeps the contract's key order, and refuses empty or over-8 KB messages", () => {
    expect(JSON.stringify(chatSendParams(null, "  hi  "))).toBe('{"sessionId":null,"message":"hi"}');
    expect(chatSendParams("default", "   ")).toBeNull();
    expect(chatSendParams("s", "a".repeat(CHAT_MESSAGE_MAX_BYTES))).not.toBeNull();
    expect(chatSendParams("s", "a".repeat(CHAT_MESSAGE_MAX_BYTES + 1))).toBeNull();
    // Bytes, not characters: 2731 three-byte characters are 8193 bytes.
    expect(chatSendParams("s", "€".repeat(2731))).toBeNull();
  });
});

describe("chatModel: optimistic sends merged with the synced transcript", () => {
  const history = [msg("h1", "user", -3600, "earlier"), msg("h2", "assistant", -3590, "answer")];

  it("a pending send is an optimistic bubble, sending", () => {
    const s = send("1", 0, "hello");
    const view = deriveTranscript({ messages: history, sends: [s], inflight: { [s.commandId!]: cmd(s.commandId!, "pending") }, runStatus: noRuns, now: T0 });
    expect(view.messages.map((m) => m.id)).toEqual(["h1", "h2"]);
    expect(view.turns).toMatchObject([{ phase: "sending", userMessageId: null }]);
  });

  it("a send whose plane has not answered yet (no command id) is sending too", () => {
    const s = send("1", 0, "hello", { commandId: null });
    expect(deriveTranscript({ messages: [], sends: [s], inflight: {}, runStatus: noRuns, now: T0 }).turns[0].phase).toBe("sending");
  });

  it("completed, user message synced (by userMessageId), no reply yet: thinking, and the bubble is the synced message", () => {
    const s = send("1", 0, "hello");
    const synced = [...history, msg("u1", "user", 1, "hello")];
    const inflight = { [s.commandId!]: cmd(s.commandId!, "completed", { sessionId: "default", userMessageId: "u1" }) };
    const view = deriveTranscript({ messages: synced, sends: [s], inflight, runStatus: noRuns, now: T0 + 5_000 });
    expect(view.turns).toMatchObject([{ phase: "thinking", userMessageId: "u1" }]);
  });

  it("the synced user message is matched by text when the result names none (Athena may report null)", () => {
    const s = send("1", 0, "hello");
    const synced = [...history, msg("u1", "user", 2, "hello")];
    const inflight = { [s.commandId!]: cmd(s.commandId!, "executing") };
    const view = deriveTranscript({ messages: synced, sends: [s], inflight, runStatus: noRuns, now: T0 });
    expect(view.turns[0]).toMatchObject({ phase: "sending", userMessageId: "u1" });
  });

  it("an old message with the same text is not mistaken for the send", () => {
    const s = send("1", 0, "earlier");
    const view = deriveTranscript({ messages: history, sends: [s], inflight: { [s.commandId!]: cmd(s.commandId!, "pending") }, runStatus: noRuns, now: T0 });
    expect(view.turns[0].userMessageId).toBeNull();
  });

  it("two sends with the same text claim one synced message each, in order", () => {
    const a = send("a", 0, "again");
    const b = send("b", 10, "again");
    const synced = [msg("u1", "user", 1, "again"), msg("u2", "user", 11, "again")];
    const inflight = { [a.commandId!]: cmd(a.commandId!, "executing"), [b.commandId!]: cmd(b.commandId!, "executing") };
    const view = deriveTranscript({ messages: synced, sends: [b, a], inflight, runStatus: noRuns, now: T0 });
    expect(view.turns.map((t) => [t.send.localId, t.userMessageId])).toEqual([
      ["a", "u1"],
      ["b", "u2"],
    ]);
  });

  it("the reply after the user message ends the turn: done, nothing drawn", () => {
    const s = send("1", 0, "hello");
    const synced = [...history, msg("u1", "user", 1, "hello"), msg("a1", "assistant", 4, "hi there")];
    const inflight = { [s.commandId!]: cmd(s.commandId!, "completed", { sessionId: "default", userMessageId: "u1" }) };
    const view = deriveTranscript({ messages: synced, sends: [s], inflight, runStatus: noRuns, now: T0 + 5_000 });
    expect(view.turns[0].phase).toBe("done");
    expect(openTurns(view)).toEqual([]);
  });

  it("persona chat: thinking while the run is queued or running, the reply matched by executionId", () => {
    const s = send("1", 0, "status?", { threadKind: "persona", personaId: "p1" });
    const inflight = { [s.commandId!]: cmd(s.commandId!, "completed", { sessionId: "default", userMessageId: "u1", executionId: "e1" }) };
    const runs: Record<string, PersonaExecutionStatus> = { e1: "running" };
    const synced = [msg("u1", "user", 1, "status?")];
    expect(deriveTranscript({ messages: synced, sends: [s], inflight, runStatus: (id) => runs[id], now: T0 + 10 * 60_000 }).turns[0].phase).toBe(
      "thinking",
    );
    // The run completed: still thinking until the reply syncs (2-5 s later).
    runs.e1 = "completed";
    expect(deriveTranscript({ messages: synced, sends: [s], inflight, runStatus: (id) => runs[id], now: T0 + 5_000 }).turns[0].phase).toBe("thinking");
    const replied = [...synced, msg("a1", "assistant", 0, "all green", "e1")];
    expect(deriveTranscript({ messages: replied, sends: [s], inflight, runStatus: (id) => runs[id], now: T0 + 5_000 }).turns[0].phase).toBe("done");
  });

  it("persona chat: a run that ends otherwise is noReply with its status", () => {
    const s = send("1", 0, "status?", { threadKind: "persona", personaId: "p1" });
    const inflight = { [s.commandId!]: cmd(s.commandId!, "completed", { sessionId: "default", userMessageId: "u1", executionId: "e1" }) };
    for (const status of ["failed", "cancelled"] as const) {
      const view = deriveTranscript({ messages: [msg("u1", "user", 1, "status?")], sends: [s], inflight, runStatus: () => status, now: T0 });
      expect(view.turns[0]).toMatchObject({ phase: "noReply", runStatus: status });
    }
  });

  it("no reply long after the turn started reads waiting, not thinking forever", () => {
    const s = send("1", 0, "hello");
    const inflight = { [s.commandId!]: cmd(s.commandId!, "completed", { sessionId: "default", userMessageId: null }) };
    const turn = (now: number) => deriveTranscript({ messages: [], sends: [s], inflight, runStatus: noRuns, now }).turns[0].phase;
    expect(turn(T0 + REPLY_WAIT_MS)).toBe("thinking");
    expect(turn(T0 + REPLY_WAIT_MS + 1)).toBe("waiting");
  });

  it("failed, refused, expired, or never sent: failed with the reason, and no synced message is claimed", () => {
    const synced = [msg("u1", "user", 1, "hello")];
    const cases: [InflightCommand["status"], string | null][] = [
      ["failed", "chat_sync_off"],
      ["rejected", "controller_not_paired"],
      ["expired", "expired: desktop did not pick it up"],
    ];
    for (const [status, error] of cases) {
      const s = send("1", 0, "hello");
      const view = deriveTranscript({ messages: synced, sends: [s], inflight: { [s.commandId!]: cmd(s.commandId!, status, null, error) }, runStatus: noRuns, now: T0 });
      expect(view.turns[0]).toMatchObject({ phase: "failed", commandStatus: status, error, userMessageId: null });
    }
    const local = send("2", 0, "hello", { commandId: null, localError: "no_device" });
    expect(deriveTranscript({ messages: [], sends: [local], inflight: {}, runStatus: noRuns, now: T0 }).turns[0]).toMatchObject({
      phase: "failed",
      error: "no_device",
    });
  });
});

describe("chatModel: which sends a thread view shows", () => {
  it("a new-chat draft follows the thread its command created", () => {
    const d = send("d", 0, "new topic", { sessionId: null, draftKey: "draft-1" });
    const other = send("o", 1, "elsewhere", { sessionId: "other" });
    const pending = { [d.commandId!]: cmd(d.commandId!, "executing") };
    expect(draftSessionId([d, other], pending, "draft-1")).toBeNull();
    expect(sendsForThread([d, other], pending, { threadKind: "athena", personaId: "athena", sessionId: null, draftKey: "draft-1" })).toEqual([d]);

    const done = { [d.commandId!]: cmd(d.commandId!, "completed", { sessionId: "t-9", userMessageId: "u" }) };
    expect(draftSessionId([d, other], done, "draft-1")).toBe("t-9");
    // Opened later from the list, the same thread still shows the send.
    expect(sendsForThread([d, other], done, { threadKind: "athena", personaId: "athena", sessionId: "t-9", draftKey: null })).toEqual([d]);
    expect(sendsForThread([d, other], done, { threadKind: "athena", personaId: "athena", sessionId: "other", draftKey: null })).toEqual([other]);
  });

  it("a persona's thread never shows Athena's sends", () => {
    const a = send("a", 0, "x", { sessionId: "s" });
    expect(sendsForThread([a], {}, { threadKind: "persona", personaId: "p1", sessionId: "s", draftKey: null })).toEqual([]);
  });
});

describe("chatModel: the desktop's error tokens", () => {
  it("maps every contract token, with or without detail, and falls back to other", () => {
    expect(chatErrorKind("failed", "chat_sync_off")).toBe("chat_sync_off");
    expect(chatErrorKind("failed", "athena_off")).toBe("athena_off");
    expect(chatErrorKind("failed", "empty_message")).toBe("empty_message");
    expect(chatErrorKind("failed", "message_too_long")).toBe("message_too_long");
    expect(chatErrorKind("failed", "bad_params: sessionId")).toBe("bad_params");
    expect(chatErrorKind("failed", "not_found: session")).toBe("not_found");
    // M21: the refusal is gone on both sides; an older desktop's token reads as a plain failure.
    expect(chatErrorKind("failed", "persona_paused")).toBe("other");
    expect(chatErrorKind("rejected", "controller_not_paired")).toBe("not_paired");
    expect(chatErrorKind("rejected", "controller_revoked")).toBe("not_paired");
    expect(chatErrorKind("rejected", "unsupported_command_type: chat_send for personas")).toBe("unsupported");
    expect(chatErrorKind("failed", "no_device")).toBe("no_device");
    expect(chatErrorKind("expired", "expired: desktop did not pick it up")).toBe("expired");
    expect(chatErrorKind("expired", null)).toBe("expired");
    expect(chatErrorKind("failed", "bad_signature")).toBe("other");
    expect(chatErrorKind("failed", null)).toBe("other");
  });
});
