import { describe, expect, it } from "vitest";
import { DEMO_LANDING, demoEntryTarget } from "./demoEntry";
import { DASHBOARD_TOUR_STEPS } from "./tour-script";
import { viewSignalFor } from "./tourSignals";

describe("/demo routing", () => {
  it("lands on the Board, with or without the tour", () => {
    expect(demoEntryTarget("")).toBe("/dashboard/personas");
    expect(demoEntryTarget("?tour=1")).toBe("/dashboard/personas?tour=1");
    expect(demoEntryTarget("?seed=7&tour=1")).toBe("/dashboard/personas?seed=7&tour=1");
  });

  it("the dashboard tour starts where /demo lands, so its first step needs no navigation", () => {
    expect(DASHBOARD_TOUR_STEPS[0].route).toBe(DEMO_LANDING);
    expect(demoEntryTarget("?tour=1").split("?")[0]).toBe(DASHBOARD_TOUR_STEPS[0].route);
  });
});

describe("view signals", () => {
  it("names the view and its focus (?focus= or Mission Control's ?dim=)", () => {
    expect(viewSignalFor("/dashboard/home?dim=queue")).toEqual({ kind: "view", view: "home", focus: "queue" });
    expect(viewSignalFor("/dashboard/executions?focus=exec-1")).toEqual({ kind: "view", view: "executions", focus: "exec-1" });
    expect(viewSignalFor("/dashboard/reviews")).toEqual({ kind: "view", view: "reviews", focus: null });
    expect(viewSignalFor("/features")).toBeNull();
  });
});
