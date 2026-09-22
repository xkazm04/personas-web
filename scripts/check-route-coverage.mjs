#!/usr/bin/env node
/**
 * Static app-route → Playwright coverage.
 *
 * Reports the share of static `page.tsx` routes under `src/app` that are
 * exercised by at least one Playwright test. "Static" means dynamic segments
 * (`[slug]`, `[category]`) are dropped — those are covered by representative
 * fixtures, not one-per-value. A route counts as covered when it appears as a
 * `path:` entry in `e2e/smoke-routes.ts`, in that file's
 * `MUST_404_IN_PRODUCTION` list (a route we assert 404s is still exercised),
 * or as a `page.goto()` target in any `e2e/*.spec.ts`.
 *
 * Why a script rather than review. Next 16 prints no route table, and a new
 * marketing page can ship, get advertised, and never be smoke-tested without
 * anything failing. This mirrors the reasoning behind
 * `src/lib/sitemapRoutesHaveMetadata.test.ts`, but for e2e reach instead of
 * metadata. It backs the "static routes exercised by a Playwright test" KPI so
 * the number is reproducible by any tool, not reconstructed by hand.
 *
 * Output: a summary line to stdout ending in `= <pct>%`; uncovered routes are
 * listed on stderr (or pass `--list`). Exit code is always 0 — this is a
 * visibility meter, not a gate. Instrument-asserts on an empty route set so it
 * can never report "100%" when it actually scanned nothing.
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const APP_DIR = path.join(repoRoot, "src", "app");
const E2E_DIR = path.join(repoRoot, "e2e");

/** Recursively collect every `page.tsx` under src/app. */
function collectPages(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectPages(full, acc);
    else if (entry.name === "page.tsx") acc.push(full);
  }
  return acc;
}

/** page.tsx path → route path, with dynamic-segment routes dropped. */
function staticRoutes() {
  const routes = new Set();
  for (const page of collectPages(APP_DIR, [])) {
    const route =
      page
        .replace(/\\/g, "/")
        .replace(`${APP_DIR.replace(/\\/g, "/")}`, "")
        .replace(/\/page\.tsx$/, "") || "/";
    if (route.includes("[")) continue; // dynamic segment — not a static route
    routes.add(route);
  }
  return [...routes].sort();
}

/** Every route token exercised by the Playwright suite. */
function coveredRoutes() {
  const covered = new Set();

  const smokePath = path.join(E2E_DIR, "smoke-routes.ts");
  if (fs.existsSync(smokePath)) {
    const smoke = fs.readFileSync(smokePath, "utf8");
    for (const m of smoke.matchAll(/path:\s*["'`]([^"'`]+)["'`]/g)) covered.add(m[1]);
    const list = smoke.match(/MUST_404_IN_PRODUCTION\b[^=]*=\s*\[([^\]]*)\]/);
    if (list) for (const m of list[1].matchAll(/["'`]([^"'`]+)["'`]/g)) covered.add(m[1]);
  }

  if (fs.existsSync(E2E_DIR)) {
    for (const file of fs.readdirSync(E2E_DIR)) {
      if (!file.endsWith(".spec.ts")) continue;
      const src = fs.readFileSync(path.join(E2E_DIR, file), "utf8");
      for (const m of src.matchAll(/goto\(\s*[`'"]([^`'"]+)/g)) covered.add(m[1]);
    }
  }

  // Normalize away query strings and hash fragments.
  return new Set([...covered].map((s) => s.replace(/[?#].*$/, "")));
}

const routes = staticRoutes();
if (routes.length === 0) {
  console.error(
    "[route-coverage] BROKEN CHECKER: found 0 static page.tsx routes under src/app.\n" +
      "  A coverage meter that scans nothing cannot honestly report a percentage.",
  );
  process.exit(1);
}

const covered = coveredRoutes();
const missing = routes.filter((r) => !covered.has(r));
const hit = routes.length - missing.length;
const pct = (hit / routes.length) * 100;

const wantList = process.argv.includes("--list");
for (const r of missing) (wantList ? console.log : console.error)(`  uncovered: ${r}`);

console.log(
  `[route-coverage] ${hit}/${routes.length} static routes exercised by a Playwright test = ${pct.toFixed(1)}%`,
);
