#!/usr/bin/env node
/**
 * Regenerates public/guide/modules/v1.json, the published module -> topics
 * feed (TOPIC_MODULE_MAP inverted; see src/lib/guide-modules-feed.ts).
 *
 * The feed is built from TypeScript registries that use the `@/` alias, so
 * rather than re-implement a loader this runs the repo's own test runner on
 * the feed's test file in write mode. The same file then asserts the result,
 * so a successful run is also a passing contract check.
 *
 *   node scripts/generate-guide-modules.mjs           # regenerate the feed
 *   node scripts/generate-guide-modules.mjs --check   # fail if the committed feed is stale (no writes)
 *
 * Write mode never touches the committed file until the feed is complete and
 * has passed its contract. The test writes to `<cwd>/public/guide/modules/v1.json`,
 * so it runs with a scratch directory as its cwd; only after vitest exits 0 is
 * the scratch feed moved over the real one, atomically (scripts/atomic-write.mjs).
 * A failed or interrupted run leaves the committed feed exactly as it was —
 * a feed captured mid-write is how a follow-up commit was once needed.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "./atomic-write.mjs";

const FEED_REL = path.join("public", "guide", "modules", "v1.json");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vitest = path.join(root, "node_modules", "vitest", "vitest.mjs");
const check = process.argv.slice(2).includes("--check");

function runFeedTest(cwd, write) {
  const r = spawnSync(
    process.execPath,
    [vitest, "run", "--root", root, "--config", path.join(root, "vitest.config.ts"), "src/lib/guide-modules-feed.test.ts"],
    {
      cwd,
      stdio: "inherit",
      // The feed must match production visibility: devOnly topics stay out.
      env: { ...process.env, GUIDE_MODULES_WRITE: write ? "1" : "", NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS: "" },
    },
  );
  return r.status ?? 1;
}

if (check) {
  // Without GUIDE_MODULES_WRITE the test compares the committed feed against a
  // fresh build and fails on any difference.
  process.exit(runFeedTest(root, false));
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "guide-modules-"));
try {
  const status = runFeedTest(scratch, true);
  if (status !== 0) {
    console.error("generate-guide-modules: feed contract failed; the committed feed was not touched.");
    process.exitCode = status;
  } else {
    writeFileAtomic(path.join(root, FEED_REL), fs.readFileSync(path.join(scratch, FEED_REL)));
    console.log(`generate-guide-modules: wrote ${FEED_REL.split(path.sep).join("/")}`);
  }
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
