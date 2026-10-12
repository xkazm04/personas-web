import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins how the rework budget runs on PRs (.github/workflows/agent-rework.yml).
 * The budget itself is pinned by agentReworkBudget.test.ts, the meter by
 * agentRework.test.ts; this spec keeps the wiring honest: the workflow runs on
 * every PR to master, judges the script's default history window (so it needs
 * the full clone), annotates rather than blocks, and greps for the exact FLAG
 * prefix the script prints.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = fs.readFileSync(path.join(ROOT, ".github", "workflows", "agent-rework.yml"), "utf8");
const SCRIPT = fs.readFileSync(path.join(ROOT, "scripts", "report-agent-rework.mjs"), "utf8");

describe("agent-rework workflow", () => {
  it("runs on pull requests to master", () => {
    expect(WORKFLOW).toMatch(/^on:\s*\r?\n\s+pull_request:\s*\r?\n\s+branches: \[master\]/m);
  });

  it("checks out the full history the default window reads", () => {
    expect(WORKFLOW).toContain("fetch-depth: 0");
  });

  it("runs the meter over its default window, with no range of its own", () => {
    expect(WORKFLOW).toContain("node scripts/report-agent-rework.mjs --list");
    expect(WORKFLOW).not.toMatch(/report-agent-rework\.mjs[^\n]*\.\./);
  });

  it("annotates instead of blocking", () => {
    expect(WORKFLOW).not.toContain("--strict");
    expect(WORKFLOW).toContain("::warning title=Rework budget::");
  });

  it("greps for the FLAG prefix the script prints", () => {
    expect(SCRIPT).toContain("console.log(`  FLAG ${f.lane}: ${f.reason}`)");
    expect(WORKFLOW).toContain("grep '^  FLAG '");
  });
});
