import { describe, expect, it } from "vitest";

import { GUIDE_CONTENT } from "@/data/guide/content";
import { buildBodyIndex } from "@/lib/guide-body-index";
import { searchBodyIndex, searchResultHref } from "@/lib/guide-search";

import { extractHeadings, extractSections } from "./extractHeadings";

// Search lands on the passage: a body hit carries the id of the section it is
// in. Sections are sliced from the same tree the renderer and the TOC read, so
// every anchor search produces is an id the page really renders.
const md = (...lines: string[]) => lines.join("\n");
// A real, visible topic: searchBodyIndex resolves the topic and drops unknown ids.
const TOPIC = "installing-personas";
const hit = (body: string, query: string) => searchBodyIndex(buildBodyIndex({ [TOPIC]: body }), query, [], 5)[0];

describe("extractSections", () => {
  const content = md("intro", "# A", "para x", "## B", "foo baseline", "");

  it("slices the tree at its headings: a preamble, then one section per heading", () => {
    const sections = extractSections(content);
    expect(sections.map((s) => ({ id: s.id, body: s.body }))).toEqual([
      { id: null, body: "intro" },
      { id: "a", body: "para x" },
      { id: "b", body: "foo baseline" },
    ]);
  });

  it("projects to exactly the TOC: the heading fields of the sections with an id", () => {
    const projected = extractSections(content)
      .filter((s) => s.id !== null)
      .map(({ body: _body, ...heading }) => heading);
    expect(projected).toEqual(extractHeadings(content));
  });
});

describe("searchBodyIndex - section anchors", () => {
  it("a body hit carries its section's anchor and title, and the excerpt comes from that section", () => {
    const result = hit(md("intro", "# A", "para x", "## B", "foo baseline", ""), "baseline");
    expect(result).toMatchObject({ anchor: "b", sectionTitle: "B" });
    expect(result.topic.id).toBe(TOPIC);
    expect(result.excerpt).toContain("foo baseline");
    expect(result.excerpt).not.toContain("para x");
  });

  it("GUARD: a hit before the first heading has no anchor, so the reader lands at the top", () => {
    const result = hit(md("the needle is here", "## Later", "other text"), "needle");
    expect(result.topic.id).toBe(TOPIC);
    expect(result.anchor).toBeUndefined();
  });

  it("duplicate headings: the hit under the second 'Setup' anchors to setup-2, as the renderer ids it", () => {
    const body = md("## Setup", "x", "## Setup", "needle");
    expect(hit(body, "needle").anchor).toBe("setup-2");
    expect(extractHeadings(body).map((h) => h.id)).toEqual(["setup", "setup-2"]);
  });

  it("directive bodies belong to their enclosing section; tab labels never start one", () => {
    const body = md(
      "## Configure",
      ":::tabs",
      "### Windows",
      "tabneedle in a tab",
      "### Mac",
      "other",
      ":::",
      ":::steps",
      "1. **Open** stepneedle here",
      ":::",
      "## Next",
      "done",
    );
    expect(hit(body, "tabneedle").anchor).toBe("configure");
    expect(hit(body, "stepneedle").anchor).toBe("configure");
    expect(extractSections(body).map((s) => s.id)).toEqual(["configure", "next"]);
  });
});

describe("searchResultHref", () => {
  it("adds #anchor when the hit has one, and no trailing '#' when it does not", () => {
    const base = { category: { id: "testing" }, topic: { id: "prompt-lab" } };
    expect(searchResultHref({ ...base, anchor: "b" })).toBe("/guide/testing/prompt-lab#b");
    expect(searchResultHref(base)).toBe("/guide/testing/prompt-lab");
  });
});

describe("anchor parity over the EN corpus", () => {
  it("every anchor the section index can produce is a heading id the page renders", () => {
    const index = buildBodyIndex(GUIDE_CONTENT);
    const anchored = index.filter((e) => e.anchor !== undefined);
    expect(anchored.length).toBeGreaterThan(100);
    for (const entry of anchored) {
      const ids = new Set(extractHeadings(GUIDE_CONTENT[entry.topicId]).map((h) => h.id));
      expect(ids.has(entry.anchor!), `${entry.topicId}#${entry.anchor}`).toBe(true);
    }
  });
});
