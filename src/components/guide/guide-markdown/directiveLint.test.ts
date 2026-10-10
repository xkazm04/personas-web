import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { KNOWN_DIRECTIVES, lintDirectives } from "./directiveLint";
import { parseBlocks } from "./parseBlocks";
import { parseGuide } from "./parseGuide";

// The guide renderer used to drop unknown or malformed `:::` directives without
// a trace, and a malformed opener (`::: tip`, `:::tip Title`) or a stray `:::`
// closer never advanced the parse loop at all. lintDirectives is the
// grammar's own diagnostics (parseGuide), so `npm run check:guide-content` can fail on what
// the page would silently lose.
const kinds = (md: string) => lintDirectives(md.split("\n")).map((i) => [i.line, i.kind]);

describe("lintDirectives", () => {
  it("accepts a known, closed directive", () => {
    expect(kinds(["intro", "", ":::tip", "Do the thing.", ":::", "", "outro"].join("\n"))).toEqual([]);
  });

  it("flags an unknown directive name", () => {
    expect(kinds([":::tipp", "typo", ":::"].join("\n"))).toEqual([[1, "unknown"]]);
  });

  it("flags a malformed opener", () => {
    expect(kinds(["::: tip", "x", ":::"].join("\n"))).toEqual([
      [1, "malformed"],
      [3, "stray-close"],
    ]);
    expect(kinds([":::tip Heads up", "x"].join("\n"))).toEqual([[1, "malformed"]]);
  });

  it("flags a stray closer", () => {
    expect(kinds(["para", ":::"].join("\n"))).toEqual([[2, "stray-close"]]);
  });

  it("flags a directive that never closes", () => {
    expect(kinds(["## A", ":::info", "swallows the rest", "## B"].join("\n"))).toEqual([[2, "unclosed"]]);
  });

  it("flags a closer that is really another opener (nesting is not supported)", () => {
    expect(kinds([":::tabs", "x", ":::tip", "y", ":::"].join("\n"))).toEqual([
      [3, "nested"],
      [5, "stray-close"],
    ]);
  });

  it("ignores ::: inside a top-level code fence", () => {
    expect(kinds(["```md", ":::whatever", ":::", "```"].join("\n"))).toEqual([]);
  });

  it("pins the closed vocabulary, and every known directive parses into a rendered block", () => {
    expect([...KNOWN_DIRECTIVES].sort()).toEqual([
      "callout-stack", "cards", "checklist", "cli", "code-compare", "compare", "diagram", "feature",
      "info", "keys", "steps", "success", "tabs", "tip", "usecases", "warning",
    ]);
    const sample: Record<string, string> = {
      steps: "1. **Go** - now", keys: "Ctrl+K - search", "callout-stack": "[tip] x", cards: "[available] T | d",
      tabs: "### Tab\nx", diagram: "[A] -> [B]",
    };
    for (const name of KNOWN_DIRECTIVES) {
      const { doc, diagnostics } = parseGuide(`:::${name}\n${sample[name] ?? "body"}\n:::`);
      expect(diagnostics, name).toEqual([]);
      expect(doc, name).toHaveLength(1);
      expect(parseBlocks([`:::${name}`, ...(sample[name] ?? "body").split("\n"), ":::"]), name).toHaveLength(1);
    }
  });
});

describe("parseBlocks on malformed directives", () => {
  it("terminates and keeps rendering the content after a malformed opener or stray closer", () => {
    const nodes = parseBlocks(["::: tip", "after one", "", ":::", "", "after two"]) as ReactElement[];
    const texts = nodes.map((n) => JSON.stringify((n.props as { children?: unknown }).children ?? ""));
    expect(texts.some((t) => t.includes("after one"))).toBe(true);
    expect(texts.some((t) => t.includes("after two"))).toBe(true);
  });
});

// A sync infinite loop cannot be interrupted by a vitest timeout, so the lines
// are handed over behind a read budget: a parse that stops advancing exhausts
// it and throws instead of stalling the worker.
function budgeted(lines: string[], budget = 10_000): string[] {
  let reads = 0;
  return new Proxy(lines, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && /^\d+$/.test(prop) && ++reads > budget) {
        throw new Error("parseBlocks stopped advancing (read budget exhausted)");
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

const MALFORMED_HEADINGS = ["##### Five deep", "#tag", "  # indented", "#", "######"];

describe("parseBlocks on malformed headings", () => {
  it.each(MALFORMED_HEADINGS)("terminates on %j and keeps it as text, with the content around it", (bad) => {
    const nodes = parseBlocks(budgeted(["before", "", bad, "after"])) as ReactElement[];
    const texts = nodes.map((n) => JSON.stringify((n.props as { children?: unknown }).children ?? ""));
    expect(texts.some((t) => t.includes("before"))).toBe(true);
    expect(texts.some((t) => t.includes("after"))).toBe(true);
    expect(texts.some((t) => t.includes(JSON.stringify(bad.trim()).slice(1, -1)))).toBe(true);
  });

  it("still renders a well-formed heading as a heading", () => {
    const nodes = parseBlocks(budgeted(["## Fine"])) as ReactElement[];
    expect(nodes).toHaveLength(1);
    expect((nodes[0].props as { rawText?: string }).rawText).toBe("Fine");
  });
});

describe("lintDirectives on malformed headings", () => {
  it("flags each heading the renderer cannot take as a heading", () => {
    for (const bad of MALFORMED_HEADINGS) {
      expect(kinds(["intro", bad].join("\n"))).toEqual([[2, "malformed-heading"]]);
    }
  });

  it("accepts h1-h4 and ignores # inside code fences and directive bodies", () => {
    expect(kinds(["# A", "## B", "### C", "#### D"].join("\n"))).toEqual([]);
    expect(kinds(["```bash", "#comment", "```"].join("\n"))).toEqual([]);
    expect(kinds([":::tabs", "### Tab", "#####", ":::"].join("\n"))).toEqual([]);
  });
});
