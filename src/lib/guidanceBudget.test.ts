import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A line budget for the canonical session guidance.
 *
 * `.claude/CLAUDE.md` is read in full at every session start; a rule added to
 * it costs every session, and rules late in a long file compete with
 * everything above them. The budget is a ratchet: lower BUDGET when a section
 * moves out, never raise it to fit a new one. Policy and the candidate
 * sections to move out: docs/decisions/2026-10-13-session-guidance-size-budget.md.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const BUDGET = 260;
const COMMANDS_WITHIN = 40;

const lines = readFileSync(path.join(ROOT, ".claude", "CLAUDE.md"), "utf8")
  .replace(/\r\n/g, "\n")
  .replace(/\n$/, "")
  .split("\n");

describe(".claude/CLAUDE.md stays within its size budget", () => {
  it(`is at most ${BUDGET} lines`, () => {
    expect(
      lines.length,
      "move detail into a scoped CLAUDE.md or a linked doc; see docs/decisions/2026-10-13-session-guidance-size-budget.md",
    ).toBeLessThanOrEqual(BUDGET);
  });

  it(`keeps the Commands section in the first ${COMMANDS_WITHIN} lines`, () => {
    const at = lines.indexOf("## Commands");
    expect(at).toBeGreaterThanOrEqual(0);
    expect(at).toBeLessThan(COMMANDS_WITHIN);
  });
});
