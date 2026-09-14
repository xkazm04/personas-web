#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const gitDir = path.join(repoRoot, ".git");
const hooksDir = path.join(gitDir, "hooks");
const prePushHook = path.join(hooksDir, "pre-push");

if (!fs.existsSync(gitDir) || !fs.statSync(gitDir).isDirectory()) {
  process.exit(0);
}

fs.mkdirSync(hooksDir, { recursive: true });

// English copy gate (docs/i18n/style-en.md § Copy gate). The checker is a
// gitignored link to ai-registry, so a fresh clone or CI has none: the step
// skips LOUDLY rather than reading as a pass. Keep this marker string stable -
// the append branch below detects an installed step by it.
const COPY_GATE_MARKER = "native-copy/scripts/copy-check.mjs";
const copyGateStep = `
# personas-web English copy gate (native-copy, baseline ratchet)
if [ -f .claude/skills/${COPY_GATE_MARKER} ]; then
  npm run copy:check
else
  echo "pre-push: native-copy checker not installed - copy gate SKIPPED (run ai-registry/scripts/link-registry.mjs)" >&2
fi
`;

const hookBody = `#!/bin/sh
set -e

npm run check:i18n-coverage
npm run check:i18n-encoding
npm run check:guide-content
${copyGateStep}`;

const existing = fs.existsSync(prePushHook) ? fs.readFileSync(prePushHook, "utf8") : "";

if (existing === hookBody) {
  process.exit(0);
}

if (existing.trim().length === 0) {
  fs.writeFileSync(prePushHook, hookBody);
} else {
  // A hook already exists (possibly with user content) — append only what's
  // missing rather than overwriting.
  let marker = "";
  if (!existing.includes("npm run check:i18n-coverage")) {
    marker += "\n# personas-web i18n coverage check\nnpm run check:i18n-coverage\n";
  }
  if (!existing.includes("npm run check:i18n-encoding")) {
    marker += "\n# personas-web i18n encoding (mojibake) ratchet\nnpm run check:i18n-encoding\n";
  }
  if (!existing.includes("npm run check:guide-content")) {
    marker += "\n# personas-web guide catalog invariant\nnpm run check:guide-content\n";
  }
  if (!existing.includes(COPY_GATE_MARKER)) {
    marker += copyGateStep;
  }
  if (marker) fs.appendFileSync(prePushHook, marker);
}

try {
  fs.chmodSync(prePushHook, 0o755);
} catch {
  // Windows does not require executable bits for Git hooks.
}
