import { describe, expect, it } from "vitest";
import { filterEvents } from "./ActivityDrawer";
import { initSim } from "./sim";

const events = initSim(99).events;

describe("activity log filters", () => {
  it("all keeps everything (capped), newest first as given", () => {
    expect(filterEvents(events, "all", 500).length).toBe(events.length);
    expect(filterEvents(events, "all", 10).length).toBe(10);
  });

  it("each filter keeps only its kinds; commands lists no events", () => {
    expect(filterEvents(events, "attention").every((e) => e.kind === "run_failed" || e.kind === "review_requested")).toBe(true);
    expect(filterEvents(events, "messages").every((e) => e.kind === "message" || e.kind === "handoff")).toBe(true);
    expect(filterEvents(events, "runs").every((e) => e.kind === "run_completed" || e.kind === "self_heal")).toBe(true);
    expect(filterEvents(events, "commands")).toEqual([]);
  });
});
