import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDemoChannel, demoSeedFromUrl, FIRST_REVIEW_AT_MS, mulberry32 } from "./demoRealtime";
import { MOCK_EVENTS } from "./mockData";
import { registerSyncedBindings } from "@/hooks/syncedRealtimeBindings";

describe("demoRealtime", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    for (let i = MOCK_EVENTS.length - 1; i >= 0; i--) if (MOCK_EVENTS[i].id.startsWith("ev-demo-review-")) MOCK_EVENTS.splice(i, 1);
  });

  function run(seed: number, hidden = () => false) {
    const seen: { table: string; payload: any }[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const ch = createDemoChannel({ seed, isHidden: hidden });
    registerSyncedBindings(ch, {
      onTableChange: (table, payload) => seen.push({ table, payload }),
      onCommandUpdate: () => {},
      onControllerUpdate: () => {},
    });
    return { seen, stop: ch.start() };
  }

  it("emits one pending review INSERT at 20s through the production bindings and adds it to the fixtures", () => {
    const { seen, stop } = run(1);
    vi.advanceTimersByTime(FIRST_REVIEW_AT_MS - 1000);
    expect(seen).toHaveLength(0);
    vi.advanceTimersByTime(1000);
    stop();
    expect(seen).toHaveLength(1);
    expect(seen[0].table).toBe("synced_manual_reviews");
    expect(seen[0].payload.eventType).toBe("INSERT");
    expect(seen[0].payload.new.status).toBe("pending");
    expect(MOCK_EVENTS.some((e) => e.id === seen[0].payload.new.id)).toBe(true);
  });

  it("pauses while the tab is hidden and delivers on return", () => {
    let hidden = true;
    const { seen, stop } = run(1, () => hidden);
    vi.advanceTimersByTime(60_000);
    expect(seen).toHaveLength(0);
    hidden = false;
    vi.advanceTimersByTime(FIRST_REVIEW_AT_MS);
    stop();
    expect(seen).toHaveLength(1);
  });

  it("is deterministic per seed", () => {
    expect(mulberry32(7)()).toBe(mulberry32(7)());
    expect(demoSeedFromUrl("?seed=42")).toBe(42);
    expect(demoSeedFromUrl("")).toBe(1);
  });
});
