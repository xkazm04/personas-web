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
 *   node scripts/generate-guide-modules.mjs
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vitest = path.join(root, "node_modules", "vitest", "vitest.mjs");

const r = spawnSync(process.execPath, [vitest, "run", "src/lib/guide-modules-feed.test.ts"], {
  cwd: root,
  stdio: "inherit",
  // The feed must match production visibility: devOnly topics stay out.
  env: { ...process.env, GUIDE_MODULES_WRITE: "1", NEXT_PUBLIC_SHOW_DEV_GUIDE_TOPICS: "" },
});
process.exit(r.status ?? 1);
