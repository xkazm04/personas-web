// node --test scripts/check-agent-commands.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  extractNodeScriptPaths,
  extractNpmRunNames,
  extractWorkflowRuns,
  findDrift,
  mentionsNpmScript,
} from "./check-agent-commands.mjs";

test("npm run names: deduplicated, trailing punctuation and args dropped", () => {
  const text = "Run `npm run lint`, then npm run check:bundle -- --update. Again: npm run lint.";
  assert.deepEqual(extractNpmRunNames(text), ["lint", "check:bundle"]);
});

test("a script name is not matched by a longer name sharing its prefix", () => {
  assert.equal(mentionsNpmScript("npm run test:unit:cov", "test:unit"), false);
  assert.equal(mentionsNpmScript("npm run test:unit # vitest", "test:unit"), true);
});

test("node script paths: literal paths only, globs and placeholders skipped", () => {
  const text = [
    "node scripts/check-agent-commands.mjs",
    'node --test "scripts/i18n/*.test.mjs"',
    "node --test scripts/check-sync-rows.test.mjs",
    "`node <registry>/scripts/link-registry.mjs`",
  ].join("\n");
  assert.deepEqual(extractNodeScriptPaths(text), [
    "scripts/check-agent-commands.mjs",
    "scripts/check-sync-rows.test.mjs",
  ]);
});

test("workflow runs: single-line commands, comments stripped, block scalars skipped", () => {
  const yaml = [
    "    steps:",
    "      - run: npm ci",
    "      - run: npm run lint  # ceiling",
    "      - name: multi",
    "        run: |",
    "          echo hi",
    '      - run: node --test "scripts/i18n/*.test.mjs"',
  ].join("\n");
  assert.deepEqual(extractWorkflowRuns(yaml), ["npm ci", "npm run lint", 'node --test "scripts/i18n/*.test.mjs"']);
});

const base = () => ({
  canonical: "CLAUDE.md",
  scripts: { lint: "eslint", "check:x": "node x.mjs" },
  fileExists: (p) => p === "scripts/real.mjs",
});

test("clean guidance and workflows report no drift", () => {
  const problems = findDrift({
    ...base(),
    docs: { "CLAUDE.md": 'npm run lint\nnpm run check:x\nnode scripts/real.mjs\nnode --test "a/*.mjs"' },
    workflows: {
      "ci.yml": '- run: npm ci\n- run: npm run lint\n- run: npx playwright test\n- run: node --test "a/*.mjs"',
    },
  });
  assert.deepEqual(problems, []);
});

test("a renamed script, a missing file and an unlisted CI step are each reported", () => {
  const problems = findDrift({
    ...base(),
    docs: { "CLAUDE.md": "npm run lint\nnpm run typecheck\nnode scripts/gone.mjs", "runbook.md": "npm run nope" },
    workflows: { "ci.yml": "- run: npm run check:x\n- run: node --test scripts/real.mjs\n- run: npm run missing" },
  });
  assert.equal(problems.length, 7);
  assert.ok(problems.some((p) => p.startsWith("CLAUDE.md:") && p.includes('no "typecheck" script')));
  assert.ok(problems.some((p) => p.startsWith("CLAUDE.md:") && p.includes("scripts/gone.mjs")));
  assert.ok(problems.some((p) => p.startsWith("runbook.md:") && p.includes('no "nope" script')));
  assert.ok(problems.some((p) => p.includes("npm run check:x") && p.includes("does not list")));
  assert.ok(problems.some((p) => p.includes("node --test scripts/real.mjs") && p.includes("does not list")));
  assert.ok(problems.some((p) => p.startsWith("ci.yml:") && p.includes('no "missing" script')));
  assert.ok(problems.some((p) => p.includes("npm run missing") && p.includes("does not list")));
});

test("the canonical doc is what CI steps are held against, not any doc", () => {
  const problems = findDrift({
    ...base(),
    docs: { "CLAUDE.md": "", "AI_HARNESS.md": "npm run lint" },
    workflows: { "ci.yml": "- run: npm run lint" },
  });
  assert.deepEqual(problems, ["ci.yml: runs `npm run lint`, which CLAUDE.md does not list"]);
});

test("main: a moved workflow directory fails, an existing empty one passes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cac-"));
  fs.mkdirSync(path.join(dir, ".claude"));
  fs.writeFileSync(path.join(dir, ".claude/CLAUDE.md"), "Run `npm run lint`.\n");
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ scripts: { lint: "x" } }));
  const run = () =>
    spawnSync(process.execPath, [fileURLToPath(new URL("./check-agent-commands.mjs", import.meta.url))], {
      cwd: dir,
      encoding: "utf8",
    });
  try {
    const missing = run();
    assert.equal(missing.status, 1);
    assert.match(missing.stderr, /directory not found/);
    fs.mkdirSync(path.join(dir, ".github/workflows"), { recursive: true });
    assert.equal(run().status, 0);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
