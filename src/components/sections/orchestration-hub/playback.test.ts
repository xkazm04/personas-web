import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  initialPlayback,
  reducePlayback as reduce,
  nextDeadline,
  MIN_RESUME_MS,
  type PlaybackState,
  type PlaybackAction,
} from "./playback";
import { TRIGGERS, AUTO_CYCLE_MS } from "./data";

/**
 * Contract for the orchestration hub's playback machine (playback.ts).
 *
 * The hub plays itself, but the visitor owns it: selecting or stepping is a
 * STOP that only Play lifts; hover and focus are transient HOLDS that the
 * machine lifts on its own; a user resume starts a fresh interval while a
 * machine resume spends the time it had banked (floored, so a resume never
 * flips the slide the instant a hold ends).
 */

const N = TRIGGERS.length;
const start = (still = false) => initialPlayback(N, { still, now: 0, intervalMs: AUTO_CYCLE_MS });
const run = (s: PlaybackState, ...actions: PlaybackAction[]) => actions.reduce(reduce, s);

describe("autoplay", () => {
  it("starts playing at the first trigger and advances on a due tick, wrapping 9 -> 0", () => {
    const s = start();
    expect(s).toMatchObject({ mode: "playing", active: 0 });
    expect(reduce(s, { type: "TICK", now: s.nextAt - 1 }).active).toBe(0);
    const s1 = reduce(s, { type: "TICK", now: s.nextAt });
    expect(s1.active).toBe(1);
    const at9 = { ...s, active: 9 };
    expect(reduce(at9, { type: "TICK", now: at9.nextAt }).active).toBe(0);
  });
});

describe("a stop is the visitor's, and open-ended", () => {
  it("USER_PAUSE stops; no later TICK moves the active trigger", () => {
    const s = reduce(start(), { type: "USER_PAUSE" });
    expect(s.mode).toBe("stopped");
    for (const now of [9_600, 19_200, 60_000, 10_000_000]) {
      expect(reduce(s, { type: "TICK", now })).toMatchObject({ mode: "stopped", active: 0 });
    }
  });

  it("SELECT while playing takes control: the selection sticks at every later tick", () => {
    const s = reduce(start(), { type: "SELECT", index: 3 });
    expect(s).toMatchObject({ active: 3, mode: "stopped" });
    for (const now of [9_600, 19_200, 19_201, 60_000, 10_000_000]) {
      expect(reduce(s, { type: "TICK", now })).toMatchObject({ active: 3, mode: "stopped" });
    }
  });

  it("hover never re-arms a user stop (transient and explicit are stored apart)", () => {
    const s = run(
      start(),
      { type: "USER_PAUSE" },
      { type: "POINTER_ENTER", now: 1_000 },
      { type: "POINTER_LEAVE", now: 2_000 },
    );
    expect(s.mode).toBe("stopped");
    expect(run(s, { type: "FOCUS_IN", now: 3_000 }, { type: "FOCUS_OUT", now: 4_000 }).mode).toBe("stopped");
    expect(run(s, { type: "SYSTEM_HOLD", now: 3_000 }, { type: "SYSTEM_RELEASE", now: 4_000 }).mode).toBe(
      "stopped",
    );
  });

  it("USER_PLAY begins a fresh interval, not a remainder", () => {
    const s = run(start(), { type: "USER_PAUSE" }, { type: "USER_PLAY", now: 5_000 });
    expect(s.mode).toBe("playing");
    expect(s.nextAt).toBe(5_000 + AUTO_CYCLE_MS);
  });

  it("NEXT at 9 wraps to 0, PREV at 0 wraps to 9, and both stop", () => {
    const at9 = run(start(), { type: "SELECT", index: 9 }, { type: "USER_PLAY", now: 0 });
    expect(reduce(at9, { type: "NEXT" })).toMatchObject({ active: 0, mode: "stopped" });
    expect(reduce(start(), { type: "PREV" })).toMatchObject({ active: 9, mode: "stopped" });
  });

  it("reduced motion starts stopped, and Previous/Next still reach all 10 triggers", () => {
    const s = start(true);
    expect(s.mode).toBe("stopped");
    const seen = new Set<number>([s.active]);
    let cur = s;
    for (let i = 0; i < N; i++) {
      cur = reduce(cur, { type: "NEXT" });
      seen.add(cur.active);
    }
    expect(seen.size).toBe(N);
    expect(cur.active).toBe(0);
    expect(reduce(s, { type: "PREV" }).active).toBe(N - 1);
  });

  it("PREFER_STILL (the preference arriving after hydration) stops a playing hub", () => {
    expect(reduce(start(), { type: "PREFER_STILL" }).mode).toBe("stopped");
  });
});

describe("transient holds are the machine's", () => {
  it("focus holds while it stays, then resumes with the banked remainder", () => {
    const held = reduce(start(), { type: "FOCUS_IN", now: 2_000 });
    expect(held.mode).toBe("held");
    for (const now of [9_600, 50_000]) expect(reduce(held, { type: "TICK", now }).active).toBe(0);
    const resumed = reduce(held, { type: "FOCUS_OUT", now: 50_000 });
    expect(resumed.mode).toBe("playing");
    expect(resumed.nextAt).toBe(50_000 + (AUTO_CYCLE_MS - 2_000));
  });

  it("the banked remainder is floored so a resume never flips the slide at once", () => {
    const resumed = run(start(), { type: "FOCUS_IN", now: 9_000 }, { type: "FOCUS_OUT", now: 20_000 });
    expect(resumed.mode).toBe("playing");
    expect(resumed.nextAt).toBe(20_000 + MIN_RESUME_MS);
    expect(MIN_RESUME_MS).toBe(1_000);
  });

  it("a hold needs every holder gone: focus out under a system hold stays held", () => {
    const s = run(start(), { type: "FOCUS_IN", now: 1_000 }, { type: "SYSTEM_HOLD", now: 1_500 });
    expect(reduce(s, { type: "FOCUS_OUT", now: 2_000 }).mode).toBe("held");
    expect(run(s, { type: "FOCUS_OUT", now: 2_000 }, { type: "SYSTEM_RELEASE", now: 3_000 }).mode).toBe("playing");
  });
});

describe("guards", () => {
  it("a pointer hold with no POINTER_LEAVE self-expires (no touch wedge)", () => {
    const s = reduce(start(), { type: "POINTER_ENTER", now: 1_000 });
    expect(s.mode).toBe("held");
    expect(s.holdUntil).not.toBeNull();
    const until = s.holdUntil as number;
    expect(reduce(s, { type: "TICK", now: until - 1 }).mode).toBe("held");
    expect(reduce(s, { type: "TICK", now: until }).mode).toBe("playing");
    expect(nextDeadline(s)).toBe(until);
  });

  it("nextDeadline: playing -> nextAt; stopped -> none", () => {
    const s = start();
    expect(nextDeadline(s)).toBe(s.nextAt);
    expect(nextDeadline(reduce(s, { type: "USER_PAUSE" }))).toBeNull();
  });

  it("every trigger the Athena tour clicks exists, and HubNode keeps data-trigger-id", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const tour = readFileSync(path.resolve(here, "../../../lib/tour-script.ts"), "utf8");
    const clicked = [...tour.matchAll(/data-trigger-id="([\w-]+)"/g)].map((m) => m[1]);
    expect(clicked).toEqual(["schedule", "event", "polling", "webhook"]);
    const ids = TRIGGERS.map((t) => t.id);
    for (const id of clicked) expect(ids).toContain(id);
    expect(readFileSync(path.join(here, "HubNode.tsx"), "utf8")).toContain("data-trigger-id");
  });

  it("the trigger catalog keeps its 10 entries in order", () => {
    expect(TRIGGERS.map((t) => t.id)).toHaveLength(10);
    expect(TRIGGERS[0].id).toBe("schedule");
  });
});
