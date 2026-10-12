import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ciSteps, npmScriptsOf } from "../../scripts/verify.mjs";

/**
 * Pins scripts/verify.mjs, the one after-change command (docs/AI_HARNESS.md
 * "One command after a change"). It reads its steps from the `checks` job in
 * .github/workflows/ci.yml, so this spec checks the parse against the real file
 * and that every npm script it would call exists.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CI = fs.readFileSync(path.join(ROOT, ".github", "workflows", "ci.yml"), "utf8");
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };

describe("ciSteps", () => {
  it("reads the checks job only, drops setup, and splits at the build", () => {
    const yaml = [
      "jobs:",
      "  checks:",
      "    steps:",
      "      - uses: actions/checkout@abc # v1",
      "      - run: npm ci",
      "      - run: npm run typecheck",
      "      # - run: commented out",
      "      - run: npm run lint",
      "      - run: npm run build",
      "      - run: npm run check:bundle",
      "  e2e:",
      "    steps:",
      "      - run: npx playwright test",
    ].join("\n");
    expect(ciSteps(yaml)).toEqual({
      fast: ["npm run typecheck", "npm run lint"],
      full: ["npm run build", "npm run check:bundle"],
    });
  });

  it("finds nothing when there is no checks job", () => {
    expect(ciSteps("jobs:\n  other:\n    steps:\n      - run: npm test\n")).toEqual({ fast: [], full: [] });
  });

  it("matches the real ci.yml: typecheck first, the core gates fast, build and bundle full", () => {
    const { fast, full } = ciSteps(CI);
    expect(fast[0]).toBe("npm run typecheck");
    for (const gate of ["npm run lint", "npm run test:unit", "npm run check:i18n-coverage", "npm run check:i18n-encoding", "npm run check:guide-content"]) {
      expect(fast).toContain(gate);
    }
    expect(fast).not.toContain("npm ci");
    expect(full).toEqual(["npm run build", "npm run check:bundle"]);
  });

  it("calls only npm scripts that package.json declares", () => {
    const { fast, full } = ciSteps(CI);
    const names = npmScriptsOf([...fast, ...full]);
    expect(names.length).toBeGreaterThan(5);
    for (const name of names) expect(PKG.scripts, name).toHaveProperty([name]);
  });
});

describe("npmScriptsOf", () => {
  it("takes the script name and ignores arguments and non-npm commands", () => {
    expect(npmScriptsOf(["npm run sync:desktop-facts -- --check", 'node --test "scripts/i18n/*.test.mjs"', "npm run lint"])).toEqual([
      "sync:desktop-facts",
      "lint",
    ]);
  });
});
