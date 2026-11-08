import { describe, expect, it } from "vitest";
import { createPageViewCounter } from "./page-view-counter";

function setup() {
  const seen: string[] = [];
  return { seen, counter: createPageViewCounter((p) => seen.push(p)) };
}

describe("page view counter", () => {
  it("counts each route once, not each render", () => {
    const { seen, counter } = setup();
    counter.route("/");
    counter.route("/");
    counter.route("/features");
    expect(seen).toEqual(["/", "/features"]);
  });

  it("does not double-count the first pageshow of a fresh load", () => {
    const { seen, counter } = setup();
    counter.route("/blog");
    counter.pageShow({ persisted: false });
    expect(seen).toEqual(["/blog"]);
  });

  it("counts a back/forward restoration as a view of the current route", () => {
    // A restored page resumes without re-running effects or changing the
    // pathname, so only the pageshow event can see the return.
    const { seen, counter } = setup();
    counter.route("/templates");
    counter.pageShow({ persisted: true });
    counter.pageShow({ persisted: true });
    expect(seen).toEqual(["/templates", "/templates", "/templates"]);
  });

  it("keeps route de-duplication after a restoration", () => {
    const { seen, counter } = setup();
    counter.route("/security");
    counter.pageShow({ persisted: true });
    counter.route("/security");
    counter.route("/legal");
    expect(seen).toEqual(["/security", "/security", "/legal"]);
  });

  it("counts nothing for a restoration before any route was seen", () => {
    const { seen, counter } = setup();
    counter.pageShow({ persisted: true });
    expect(seen).toEqual([]);
  });
});
