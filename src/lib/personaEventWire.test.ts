import { describe, expect, it } from "vitest";
import { MOCK_EVENTS } from "./mockData";
import { parseStreamEvent, toPersonaEvent } from "./personaEventWire";

// The orchestrator's SSE `event` message, as the web reads it. The schema is
// owned upstream; this case is the consumer's pin. When the orchestrator
// changes the shape on purpose, change this case and personaEventWire.ts in
// the same commit and note it under "Schema mismatch" in
// docs/degraded-dependencies.md.
const WIRE_EVENT = {
  id: "ev-0001",
  projectId: "proj-1",
  eventType: "webhook_received",
  sourceType: "github",
  sourceId: "acme/frontend",
  targetPersonaId: "p-0001",
  payload: '{"action":"opened"}',
  status: "pending",
  errorMessage: null,
  processedAt: null,
  useCaseId: null,
  createdAt: "2026-10-13T10:00:00.000Z",
  retryCount: 0,
};

describe("toPersonaEvent - the pinned SSE event contract", () => {
  it("accepts the canonical wire event unchanged", () => {
    expect(toPersonaEvent(WIRE_EVENT)).toEqual(WIRE_EVENT);
  });

  it("reads the desktop success terminals as processed", () => {
    expect(toPersonaEvent({ ...WIRE_EVENT, status: "delivered" })?.status).toBe("processed");
    expect(toPersonaEvent({ ...WIRE_EVENT, status: "completed" })?.status).toBe("processed");
  });

  it("reads absent nullable fields and retryCount as null, not empty or zero", () => {
    const { sourceId: _s, payload: _p, retryCount: _r, ...rest } = WIRE_EVENT;
    const event = toPersonaEvent(rest);
    expect(event?.sourceId).toBeNull();
    expect(event?.payload).toBeNull();
    expect(event?.retryCount).toBeNull();
  });

  it("rejects a missing or renamed required field", () => {
    for (const key of ["id", "projectId", "eventType", "sourceType", "createdAt"] as const) {
      const rest: Record<string, unknown> = { ...WIRE_EVENT };
      const value = rest[key];
      delete rest[key];
      expect(toPersonaEvent(rest), key).toBeNull();
      // snake_case is the desktop's column name; the stream speaks camelCase.
      const snake = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
      if (snake !== key) expect(toPersonaEvent({ ...rest, [snake]: value }), snake).toBeNull();
    }
  });

  it("rejects an unknown status and a mistyped field", () => {
    expect(toPersonaEvent({ ...WIRE_EVENT, status: "done" })).toBeNull();
    expect(toPersonaEvent({ ...WIRE_EVENT, status: undefined })).toBeNull();
    expect(toPersonaEvent({ ...WIRE_EVENT, payload: { action: "opened" } })).toBeNull();
    expect(toPersonaEvent({ ...WIRE_EVENT, retryCount: "1" })).toBeNull();
    expect(toPersonaEvent({ ...WIRE_EVENT, retryCount: -1 })).toBeNull();
    expect(toPersonaEvent({ ...WIRE_EVENT, id: "" })).toBeNull();
  });

  it("rejects non-objects", () => {
    for (const raw of [null, undefined, "ev-0001", 42, [WIRE_EVENT]]) {
      expect(toPersonaEvent(raw)).toBeNull();
    }
  });

  it("accepts every demo event, so mocks and the live stream share one shape", () => {
    for (const e of MOCK_EVENTS) {
      const read = toPersonaEvent(JSON.parse(JSON.stringify(e)));
      expect(read?.id, e.id).toBe(e.id);
      expect(read?.status, e.id).toBe(e.status);
    }
  });
});

describe("parseStreamEvent - one SSE data line", () => {
  it("parses a well-formed message", () => {
    expect(parseStreamEvent(JSON.stringify(WIRE_EVENT))?.id).toBe("ev-0001");
  });

  it("drops a message that is not JSON", () => {
    expect(parseStreamEvent("{not json")).toBeNull();
    expect(parseStreamEvent("")).toBeNull();
  });
});
