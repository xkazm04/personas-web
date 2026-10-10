import { describe, it, expect } from "vitest";

// The parsers and the drift diff live in the zero-dependency node script that
// writes the snapshot, so the script and this spec read the desktop the same way
// (the scripts/i18n/guide-source.mjs precedent).
import { parseMemoryCategories, parseCellKeys, diffFacts } from "../../../scripts/sync-desktop-facts.mjs";
import snapshot from "./desktop-facts.json";
import { MEMORY_CATEGORIES, CELL_KEYS } from "./index";

// ── Fixtures: verbatim excerpts of the desktop sources (../personas) ─────────
// CRLF on purpose for one of them: a Windows checkout with autocrlf hands the
// script CRLF text, and the parse must not care.

const MEMORY_RS = [
  "use super::contract::{ValidationError, ValidationRule};",
  "",
  "pub const IMPORTANCE_MIN: i32 = 1;",
  "pub const IMPORTANCE_MAX: i32 = 5;",
  "pub const MEMORY_CATEGORIES: &[&str] = &[",
  '    "fact",',
  '    "preference",',
  '    "instruction",',
  '    "context",',
  '    "learned",',
  '    "constraint",',
  "];",
  "",
  "pub fn validate_importance(value: i32) -> Vec<ValidationError> {",
].join("\r\n");

const DIMENSION_MAPPING_TS = `
export const DIMENSION_TO_CELL: Record<string, string[]> = {
  notifications: ["messages"],
  events: ["events"],
};

/** The canonical set of matrix cell keys. */
export const ALL_CELL_KEYS = [
  "use-cases",
  "connectors",
  "triggers",
  "human-review",
  "memory",
  "error-handling",
  "messages",
  "events",
] as const;

/** Union type of valid cell keys. */
export type CellKey = (typeof ALL_CELL_KEYS)[number];
`;

describe("desktop facts: parsers over the desktop's own sources", () => {
  it("parseMemoryCategories reads MEMORY_CATEGORIES from validation/memory.rs", () => {
    expect(parseMemoryCategories(MEMORY_RS)).toEqual(["fact", "preference", "instruction", "context", "learned", "constraint"]);
  });

  it("parseCellKeys reads ALL_CELL_KEYS from dimensionMapping.ts, order preserved", () => {
    expect(parseCellKeys(DIMENSION_MAPPING_TS)).toEqual([
      "use-cases",
      "connectors",
      "triggers",
      "human-review",
      "memory",
      "error-handling",
      "messages",
      "events",
    ]);
  });

  it("a source the parser cannot read throws instead of yielding an empty list", () => {
    expect(() => parseMemoryCategories("pub const OTHER: &[&str] = &[];")).toThrow();
    expect(() => parseCellKeys("export const SOMETHING_ELSE = [] as const;")).toThrow();
  });
});

describe("desktop facts: drift diff", () => {
  const snap = { memoryCategories: snapshot.memoryCategories, cellKeys: snapshot.cellKeys };

  it("an extra live category is drift", () => {
    const live = { ...snap, memoryCategories: [...snap.memoryCategories, "goal"] };
    expect(diffFacts(snap, live)).toMatchObject({ added: ["goal"], removed: [], ok: false });
  });

  it("an identical live read is clean", () => {
    expect(diffFacts(snap, { memoryCategories: [...snap.memoryCategories], cellKeys: [...snap.cellKeys] })).toMatchObject({ ok: true });
  });

  it("a reorder of the cell keys is drift (order is part of the fact)", () => {
    const cellKeys = [...snap.cellKeys];
    [cellKeys[4], cellKeys[6]] = [cellKeys[6], cellKeys[4]];
    expect(diffFacts(snap, { ...snap, cellKeys })).toMatchObject({ ok: false, added: [], removed: [], reordered: ["cellKeys"] });
  });

  it("no desktop checkout (live = null) skips, and a skip is not a failure", () => {
    expect(diffFacts(snap, null)).toMatchObject({ skipped: true, ok: true });
  });
});

describe("desktop facts: the typed module and the showcase follow the snapshot", () => {
  it("index.ts literals equal the generated snapshot", () => {
    expect([...MEMORY_CATEGORIES]).toEqual(snapshot.memoryCategories);
    expect([...CELL_KEYS]).toEqual(snapshot.cellKeys);
  });
});
