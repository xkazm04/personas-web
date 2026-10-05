import { describe, expect, it } from "vitest";
import { transitionKey } from "./PageTransition";

describe("PageTransition key", () => {
  it("keeps every dashboard view under one key", () => {
    expect(transitionKey("/dashboard/home")).toBe("/dashboard");
    expect(transitionKey("/dashboard/personas")).toBe("/dashboard");
    expect(transitionKey("/dashboard")).toBe("/dashboard");
  });

  it("remounts on every other route", () => {
    expect(transitionKey("/features")).toBe("/features");
    expect(transitionKey("/dashboards")).toBe("/dashboards");
  });
});
