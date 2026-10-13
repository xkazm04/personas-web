import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the blocking SAST job: .github/workflows/sast-trust-boundary.yml running
 * Semgrep over .github/semgrep-trust-boundary.yml.
 *
 * The workflow only runs on GitHub, so this spec is what a local run can hold:
 * it fails when the job stops blocking (continue-on-error, or no --error), when
 * the triggers or the read-only token scope drift, when Semgrep floats off its
 * exact version, when a rule is dropped from the ruleset, and when an action is
 * used that no other workflow already pins to the same commit SHA.
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");

const WORKFLOW = read(".github/workflows/sast-trust-boundary.yml");
const RULES = read(".github/semgrep-trust-boundary.yml");
const EXISTING_WORKFLOWS = [
  ".github/workflows/ci.yml",
  ".github/workflows/e2e-smoke.yml",
  ".github/workflows/ai-change-gate.yml",
  ".github/workflows/agent-rework.yml",
  ".github/workflows/security-scan.yml",
];

/** `uses:` values, comment included (`owner/action@sha # vX`). */
function usesLines(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/^\s*-?\s*uses:\s*(.+?)\s*$/gm)) out.push(m[1]);
  return out;
}

describe(".github/workflows/sast-trust-boundary.yml", () => {
  it("runs on push and pull_request to master", () => {
    expect(WORKFLOW).toMatch(/^on:\n  push:\n    branches: \[master\]\n  pull_request:\n    branches: \[master\]$/m);
  });

  it("gives the token read-only contents scope at the top level", () => {
    expect(WORKFLOW).toMatch(/^permissions:\n  contents: read$/m);
  });

  it("runs the semgrep job under a timeout", () => {
    expect(WORKFLOW).toMatch(/^  semgrep:$/m);
    expect(WORKFLOW).toMatch(/^    timeout-minutes: \d+$/m);
  });

  it("blocks: the scan fails on a finding and nothing swallows the failure", () => {
    expect(WORKFLOW).not.toContain("continue-on-error");
    const scans = WORKFLOW.split("\n").filter((l) => l.includes("semgrep scan"));
    expect(scans.length).toBe(1);
    expect(scans[0]).toContain("--config .github/semgrep-trust-boundary.yml");
    expect(scans[0]).toContain(" --error ");
    expect(scans[0]).toMatch(/--spec semgrep==\d+\.\d+\.\d+ /);
  });

  it("uses only actions another workflow already pins to the same commit SHA", () => {
    const pinned = new Set(EXISTING_WORKFLOWS.flatMap((file) => usesLines(read(file))));
    const uses = usesLines(WORKFLOW);
    expect(uses.length).toBeGreaterThan(0);
    for (const use of uses) {
      expect(use).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40} # v[\d.]+$/);
      expect(pinned.has(use), `${use} is not pinned by an existing workflow`).toBe(true);
    }
  });
});

describe(".github/semgrep-trust-boundary.yml", () => {
  const ids = Array.from(RULES.matchAll(/^  - id: ([\w-]+)$/gm), (m) => m[1]);

  it("keeps every trust-boundary rule", () => {
    expect(ids).toEqual([
      "service-role-key-outside-server-modules",
      "service-role-key-public-prefix",
      "dynamic-code-evaluation",
      "child-process-in-api-route",
    ]);
  });

  it("reports every rule at ERROR severity", () => {
    const severities = Array.from(RULES.matchAll(/^    severity: (\w+)$/gm), (m) => m[1]);
    expect(severities).toEqual(ids.map(() => "ERROR"));
  });

  it("exempts only the two server modules the service_role convention names", () => {
    const rule = RULES.split("\n  - id: ")[1] ?? "";
    const excluded = Array.from(rule.matchAll(/^        - "(.+)"$/gm), (m) => m[1]);
    expect(excluded).toEqual(["**/lib/server/env.ts", "**/lib/supabase-admin.ts", "*.test.ts"]);
  });
});
