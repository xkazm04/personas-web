import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PersonaEvent } from "@/lib/types";

// Acceptance cases 4, 5, 7, 8 (challenge event-A): a retry re-queues the SAME
// row with its count on the row, the desktop's way
// (../personas db/src/repos/communication/events.rs:1086-1102).

const listEvents = vi.fn();
const publishEvent = vi.fn();
const updateEvent = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    listEvents: (...args: unknown[]) => listEvents(...args),
    publishEvent: (...args: unknown[]) => publishEvent(...args),
    updateEvent: (...args: unknown[]) => updateEvent(...args),
    listAllSubscriptions: vi.fn(async () => []),
  },
}));
vi.mock("swr", () => ({ mutate: vi.fn() }));

const store = await import("./eventStore");
const { useEventStore, ReplayLockedError } = store;

function deadLetter(overrides: Partial<PersonaEvent> = {}): PersonaEvent {
  return {
    id: "ev-dl",
    projectId: "p",
    eventType: "webhook_received",
    sourceType: "github",
    sourceId: "acme/frontend",
    targetPersonaId: null,
    payload: null,
    status: "dead_letter",
    errorMessage: "Handler timed out",
    processedAt: new Date(0).toISOString(),
    useCaseId: null,
    createdAt: new Date(0).toISOString(),
    retryCount: 1,
    ...overrides,
  } as PersonaEvent;
}

function seed(events: PersonaEvent[]) {
  useEventStore.setState({ events, eventIds: new Set(events.map((e) => e.id)) });
}

function row(id: string) {
  return useEventStore.getState().events.find((e) => e.id === id) as (PersonaEvent & { retryCount?: number | null }) | undefined;
}

beforeEach(() => {
  useEventStore.getState().reset();
  listEvents.mockReset();
  publishEvent.mockReset();
  updateEvent.mockReset();
  listEvents.mockImplementation(async () => []);
  updateEvent.mockImplementation(async (id: string, body: Record<string, unknown>) => ({ ...deadLetter({ id }), ...body }));
});

describe("replayEvent re-queues the same row (case 4)", () => {
  it("writes { status: pending, retryCount: n+1 } once and publishes nothing", async () => {
    const e = deadLetter({ retryCount: 1 });
    seed([e]);
    await useEventStore.getState().replayEvent(e);
    expect(updateEvent).toHaveBeenCalledTimes(1);
    expect(updateEvent).toHaveBeenCalledWith(e.id, { status: "pending", retryCount: 2 });
    expect(publishEvent).not.toHaveBeenCalled();
    expect(useEventStore.getState().events.map((x) => x.id)).toEqual([e.id]);
    expect(row(e.id)?.status).toBe("pending");
    expect(row(e.id)?.retryCount).toBe(2);
  });
});

describe("the manual retry budget mirrors the desktop (case 5)", () => {
  it("MAX_MANUAL_RETRIES is the desktop's 5", () => {
    expect((store as Record<string, unknown>).MAX_MANUAL_RETRIES).toBe(5);
  });

  it("a row at the cap rejects with ReplayLockedError and makes no api call", async () => {
    const e = deadLetter({ retryCount: 5 });
    seed([e]);
    await expect(useEventStore.getState().replayEvent(e)).rejects.toBeInstanceOf(ReplayLockedError);
    expect(updateEvent).not.toHaveBeenCalled();
    expect(publishEvent).not.toHaveBeenCalled();
    expect(row(e.id)).toEqual(e);
  });
});

describe("a poll landing mid-retry cannot turn the retry into a failure (case 7)", () => {
  it("keeps the in-flight row, never writes failed / dead_letter, and resolves", async () => {
    const e = deadLetter({ retryCount: 1 });
    seed([e]);
    let open!: () => void;
    const gate = new Promise<void>((resolve) => {
      open = resolve;
    });
    updateEvent.mockImplementation(async (id: string, body: Record<string, unknown>) => {
      await gate;
      return { ...e, id, ...body } as PersonaEvent;
    });
    publishEvent.mockImplementation(async () => {
      await gate;
      return deadLetter({ id: "ev-new", status: "pending" });
    });
    // The fetched snapshot predates the retry: the row still reads dead_letter.
    listEvents.mockImplementation(async () => [deadLetter({ retryCount: 1 })]);

    const replay = useEventStore.getState().replayEvent(e);
    await Promise.resolve();
    await useEventStore.getState().fetchEvents();
    open();
    await expect(replay).resolves.toBeUndefined();

    const landings = updateEvent.mock.calls.map((c) => (c[1] as { status: string }).status);
    expect(landings).not.toContain("failed");
    expect(landings).not.toContain("dead_letter");
  });
});

describe("the retry count left the browser (case 8)", () => {
  it("the storage register no longer names event-replay-retry-counts", async () => {
    const { STORAGE_REGISTER } = await import("@/data/storage-register");
    const names = STORAGE_REGISTER.flatMap((entry) => entry.names);
    expect(names).not.toContain("event-replay-retry-counts");
  });

  it("eventStore.ts no longer touches localStorage", () => {
    const src = readFileSync(path.resolve(__dirname, "eventStore.ts"), "utf8");
    expect(src).not.toMatch(/localStorage/);
  });
});
