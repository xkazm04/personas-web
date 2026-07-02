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

const hookBody = `#!/bin/sh
set -e

npm run check:i18n-coverage
npm run check:i18n-encoding
`;

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
  if (marker) fs.appendFileSync(prePushHook, marker);
}

try {
  fs.chmodSync(prePushHook, 0o755);
} catch {
  // Windows does not require executable bits for Git hooks.
}
