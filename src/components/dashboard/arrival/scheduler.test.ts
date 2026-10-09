import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArrivalQueue, FIRST_LEAD_MS, SLOT_GAP_MS } from "./scheduler";

// Node has no requestIdleCallback, so the queue falls back to a 16ms timer, and
// the fake clock runs the zero-delay gap timer at 1ms. Each release therefore
// lands one idle hop after its gap.
const IDLE_HOP = 17;

describe("ArrivalQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("releases nothing until the view has painted and the lead has passed", () => {
    const queue = new ArrivalQueue();
    const released: string[] = [];
    queue.enqueue(0, () => released.push("a"));
    vi.advanceTimersByTime(1000);
    expect(released).toEqual([]);

    queue.openAfterPaint();
    vi.advanceTimersByTime(FIRST_LEAD_MS - 1);
    expect(released).toEqual([]);
    vi.advanceTimersByTime(1 + IDLE_HOP);
    expect(released).toEqual(["a"]);
  });

  it("releases one slot per gap, lowest order first, ties in registration order", () => {
    const queue = new ArrivalQueue();
    const released: string[] = [];
    queue.enqueue(2, () => released.push("late"));
    queue.enqueue(0, () => released.push("first"));
    queue.enqueue(1, () => released.push("second-a"));
    queue.enqueue(1, () => released.push("second-b"));
    queue.openAfterPaint();

    vi.advanceTimersByTime(FIRST_LEAD_MS + IDLE_HOP);
    expect(released).toEqual(["first"]);
    vi.advanceTimersByTime(SLOT_GAP_MS + IDLE_HOP);
    expect(released).toEqual(["first", "second-a"]);
    vi.advanceTimersByTime(SLOT_GAP_MS + IDLE_HOP);
    expect(released).toEqual(["first", "second-a", "second-b"]);
    vi.advanceTimersByTime(SLOT_GAP_MS + IDLE_HOP);
    expect(released).toEqual(["first", "second-a", "second-b", "late"]);
  });

  it("drops a cancelled slot and pauses while the view is hidden", () => {
    const queue = new ArrivalQueue();
    const released: string[] = [];
    const cancel = queue.enqueue(0, () => released.push("gone"));
    queue.enqueue(1, () => released.push("kept"));
    cancel();

    const close = queue.openAfterPaint();
    close(); // hidden before the lead elapsed
    vi.advanceTimersByTime(1000);
    expect(released).toEqual([]);

    queue.openAfterPaint(); // shown again
    vi.advanceTimersByTime(FIRST_LEAD_MS + IDLE_HOP);
    expect(released).toEqual(["kept"]);
  });
});
