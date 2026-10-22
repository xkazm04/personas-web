#!/usr/bin/env node
// Advertised-command drift check.
//
// Agents learn this repo's commands from .claude/CLAUDE.md (canonical), docs/AI_HARNESS.md
// and docs/runbooks/*.md. Nothing tied those words to what actually runs: a renamed
// package.json script, or a CI gate that never made it into the command block, left the
// guidance wrong and every gate green. This check holds two directions:
//
//   1. every `npm run <name>` the guidance names is a real package.json script, and every
//      `node <path>.mjs` it names is a real file;
//   2. every step the CI workflows run (except `npm ci` and `npx` tool installs) is named in
//      CLAUDE.md, so the command block lists every gate an agent's change must pass.
//
// The command block stays hand-written (its comments are curated); this check catches drift
// instead of generating it. Run: `node scripts/check-agent-commands.mjs`.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const NPM_RUN = /\bnpm run ([A-Za-z0-9:_.-]*[A-Za-z0-9_-])/g;
// A literal script path after `node` / `node --test`. Globs and placeholders such as
// `<registry>/...` do not match, on purpose: they are not checkable paths.
const NODE_SCRIPT = /\bnode\s+(?:--test\s+)?"?([\w.-]+(?:\/[\w.-]+)*\.m?js)(?=["'`\s)]|$)/gm;
const WORKFLOW_RUN = /^\s*(?:-\s+)?run:\s*(.+?)\s*$/gm;

/** Script names in every `npm run <name>` of a text, deduplicated, in order. */
export function extractNpmRunNames(text) {
  return [...new Set([...text.matchAll(NPM_RUN)].map((m) => m[1]))];
}

/** Relative script paths in every `node <path>` / `node --test <path>` of a text. */
export function extractNodeScriptPaths(text) {
  return [...new Set([...text.matchAll(NODE_SCRIPT)].map((m) => m[1]))];
}

/** Single-line `run:` commands of a workflow. Block scalars (`|`, `>`) are not parsed. */
export function extractWorkflowRuns(yamlText) {
  return [...yamlText.matchAll(WORKFLOW_RUN)]
    .map((m) => m[1].replace(/\s+#.*$/, ""))
    .filter((cmd) => !/^[|>][-+]?$/.test(cmd));
}

/** True when `text` names `npm run <name>` exactly (not a longer script sharing the prefix). */
export function mentionsNpmScript(text, name) {
  return extractNpmRunNames(text).includes(name);
}

/**
 * Drift findings. `docs` maps a doc path to its text; `canonical` is the path of the doc
 * that must list every CI step; `workflows` maps a workflow path to its text.
 */
export function findDrift({ docs, canonical, scripts, workflows, fileExists }) {
  const problems = [];
  for (const [doc, text] of Object.entries(docs)) {
    for (const name of extractNpmRunNames(text)) {
      if (!Object.hasOwn(scripts, name)) {
        problems.push(`${doc}: names \`npm run ${name}\`, but package.json has no "${name}" script`);
      }
    }
    for (const file of extractNodeScriptPaths(text)) {
      if (!fileExists(file)) problems.push(`${doc}: names \`node ${file}\`, but that file does not exist`);
    }
  }
  const canonicalText = docs[canonical] ?? "";
  for (const [workflow, text] of Object.entries(workflows)) {
    for (const cmd of extractWorkflowRuns(text)) {
      if (cmd === "npm ci" || cmd.startsWith("npx ")) continue;
      const npm = /^npm run ([A-Za-z0-9:_.-]*[A-Za-z0-9_-])/.exec(cmd);
      if (npm) {
        if (!Object.hasOwn(scripts, npm[1])) {
          problems.push(`${workflow}: runs \`npm run ${npm[1]}\`, but package.json has no "${npm[1]}" script`);
        }
        if (!mentionsNpmScript(canonicalText, npm[1])) {
          problems.push(`${workflow}: runs \`npm run ${npm[1]}\`, which ${canonical} does not list`);
        }
      } else if (!canonicalText.includes(cmd)) {
        problems.push(`${workflow}: runs \`${cmd}\`, which ${canonical} does not list`);
      }
    }
  }
  return problems;
}

function readDir(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => path.posix.join(dir, f));
}

function main() {
  const root = process.cwd();
  const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
  const canonical = ".claude/CLAUDE.md";
  const docPaths = [canonical, "docs/AI_HARNESS.md", ...readDir("docs/runbooks", ".md")];
  const docs = Object.fromEntries(
    docPaths.filter((p) => fs.existsSync(path.join(root, p))).map((p) => [p, read(p)]),
  );
  const workflowDir = ".github/workflows";
  const workflows = Object.fromEntries(
    readDir(workflowDir, ".yml").map((p) => [p, read(p)]),
  );
  const { scripts = {} } = JSON.parse(read("package.json"));
  const problems = findDrift({
    docs,
    canonical,
    scripts,
    workflows,
    fileExists: (rel) => fs.existsSync(path.join(root, rel)),
  });
  // An absent directory is a moved path, not an empty lane: passing over it checks no workflow at all.
  if (!fs.existsSync(path.join(root, workflowDir))) {
    problems.push(`${workflowDir}: directory not found, so no workflow was checked`);
  }
  if (problems.length) {
    console.error(`check-agent-commands: ${problems.length} drift finding(s)`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `check-agent-commands: ok (${Object.keys(docs).length} docs, ${Object.keys(workflows).length} workflows)`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
