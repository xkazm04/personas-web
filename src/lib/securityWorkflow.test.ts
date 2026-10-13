import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the shape of the supply-chain controls SECURITY.md claims are wired:
 * .github/workflows/security-scan.yml (Semgrep SAST, detect-secrets, CycloneDX
 * SBOM) and .github/dependabot.yml.
 *
 * The workflow only runs on GitHub, so this spec is what a local run can hold:
 * it fails when the triggers or the read-only token scope drift, when a job
 * loses its time budget, when a scanner floats off its exact version, when the
 * secret scan stops blocking, and when an action is used that no other
 * workflow already pins to the same commit SHA (a new action needs a person to
 * resolve and review its SHA).
 */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8").replace(/\r\n/g, "\n");

const WORKFLOW = read(".github/workflows/security-scan.yml");
const DEPENDABOT = read(".github/dependabot.yml");
const EXISTING_WORKFLOWS = [
  ".github/workflows/ci.yml",
  ".github/workflows/e2e-smoke.yml",
  ".github/workflows/ai-change-gate.yml",
  ".github/workflows/agent-rework.yml",
];

/** `uses:` values, comment included (`owner/action@sha # vX`). */
function usesLines(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/^\s*-?\s*uses:\s*(.+?)\s*$/gm)) out.push(m[1]);
  return out;
}

/** The text of one job, from its `  <name>:` header to the next job header. */
function jobSection(name: string): string {
  const jobs = WORKFLOW.split(/^jobs:\s*$/m)[1] ?? "";
  const start = jobs.search(new RegExp(`^  ${name}:\\s*$`, "m"));
  if (start === -1) return "";
  const rest = jobs.slice(start + 1);
  const next = rest.search(/^  [\w-]+:\s*$/m);
  return next === -1 ? rest : rest.slice(0, next);
}

describe(".github/workflows/security-scan.yml", () => {
  it("runs on push and pull_request to master", () => {
    expect(WORKFLOW).toMatch(/^on:\n  push:\n    branches: \[master\]\n  pull_request:\n    branches: \[master\]$/m);
  });

  it("gives the token read-only contents scope at the top level", () => {
    expect(WORKFLOW).toMatch(/^permissions:\n  contents: read$/m);
  });

  it("runs the sast, secrets and sbom jobs, each under a timeout", () => {
    for (const job of ["sast", "secrets", "sbom"]) {
      const section = jobSection(job);
      expect(section, `job ${job} is missing`).not.toBe("");
      expect(section, `job ${job} has no timeout-minutes`).toMatch(/^    timeout-minutes: \d+$/m);
    }
  });

  it("pins every scanner run through pipx to an exact version", () => {
    const runs = WORKFLOW.split("\n").filter((l) => l.includes("pipx run"));
    expect(runs.length).toBe(2);
    for (const line of runs) expect(line).toMatch(/--spec [\w-]+==\d+\.\d+\.\d+ /);
  });

  it("keeps the secret scan blocking", () => {
    const secrets = jobSection("secrets");
    expect(secrets).toContain("detect-secrets-hook");
    expect(secrets).not.toContain("continue-on-error");
  });

  it("generates a CycloneDX SBOM and uploads it", () => {
    const sbom = jobSection("sbom");
    expect(sbom).toContain("npm sbom --sbom-format cyclonedx");
    expect(sbom).toContain("path: sbom.cdx.json");
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

describe(".github/dependabot.yml", () => {
  it("is version 2 with weekly npm and github-actions updates at the root", () => {
    expect(DEPENDABOT).toMatch(/^version: 2$/m);
    for (const ecosystem of ["npm", "github-actions"]) {
      expect(DEPENDABOT).toMatch(
        new RegExp(`- package-ecosystem: ${ecosystem}\\n    directory: /\\n    schedule:\\n      interval: weekly`),
      );
    }
  });
});

describe("SECURITY.md", () => {
  it("names the workflow and config that run each control", () => {
    const security = read("SECURITY.md");
    expect(security).toContain("`.github/workflows/security-scan.yml`");
    expect(security).toContain("`.github/dependabot.yml`");
  });
});
