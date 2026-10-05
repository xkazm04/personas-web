import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { KNOWN_DIRECTIVES, lintDirectives } from "./directiveLint";
import { parseBlocks } from "./parseBlocks";

// The guide renderer used to drop unknown or malformed `:::` directives without
// a trace, and a malformed opener (`::: tip`, `:::tip Title`) or a stray `:::`
// closer never advanced the parse loop at all. lintDirectives mirrors the
// renderer's directive scan so `npm run check:guide-content` can fail on what
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

  it("lists exactly the directive names parseCustomBlock renders", () => {
    const src = readFileSync(path.join(__dirname, "parseCustomBlock.tsx"), "utf8");
    const dispatched = [...src.matchAll(/blockType === "([\w-]+)"/g)].map((m) => m[1]);
    const callouts = src.match(/\[((?:\s*"[\w-]+",?)+)\]\.includes\(blockType\)/)?.[1] ?? "";
    const calloutNames = [...callouts.matchAll(/"([\w-]+)"/g)].map((m) => m[1]);
    expect([...KNOWN_DIRECTIVES].sort()).toEqual([...dispatched, ...calloutNames].sort());
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
