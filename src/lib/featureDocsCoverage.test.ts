import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DASHBOARD_VIEW_IDS } from "@/components/dashboard/spa/views";

/**
 * Keeps docs/features/ joined to the app it describes.
 *
 * INDEX.md promises one doc per navigable submodule, and CLAUDE.md tells an
 * agent to open that doc before touching the feature. The map is only useful
 * while it is complete, so this fails, naming the gap, when:
 *   - an INDEX link points at a doc that does not exist;
 *   - a doc exists under docs/features/<folder>/ but INDEX does not link it;
 *   - a dashboard view in DASHBOARD_VIEW_IDS has no INDEX row;
 *   - a page route under src/app has no feature doc that names it.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const FEATURES = path.join(REPO_ROOT, "docs", "features");
const APP_ROOT = path.join(REPO_ROOT, "src", "app");
const INDEX = readFileSync(path.join(FEATURES, "INDEX.md"), "utf8");

/** Top-level files that describe the tree rather than a submodule. */
const META_DOCS = new Set(["INDEX.md", "FINDINGS.md"]);

function walk(dir: string, match: (name: string) => boolean, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, match, out);
    else if (match(entry.name)) out.push(full);
  }
  return out;
}

const rel = (from: string, file: string) => path.relative(from, file).replaceAll("\\", "/");

/** `folder/doc.md` targets of the INDEX's markdown links. */
const indexLinks = [...INDEX.matchAll(/\]\(([^)\s]+\.md)\)/g)].map((m) => m[1]);

const featureDocs = walk(FEATURES, (n) => n.endsWith(".md"))
  .map((f) => rel(FEATURES, f))
  .filter((f) => !META_DOCS.has(f));

/**
 * Page routes as their first path segment (`/blog/[slug]` -> `blog`). Route
 * groups `(x)` are not segments. The root page is the homepage, documented by
 * marketing/homepage-hero.md.
 */
const pageSegments = [
  ...new Set(
    walk(APP_ROOT, (n) => n === "page.tsx")
      .map((f) => rel(APP_ROOT, path.dirname(f)).split("/").filter((s) => s && !/^\(.*\)$/.test(s)))
      .filter((segs) => segs.length > 0 && segs[0] !== "api")
      .map((segs) => segs[0]),
  ),
].sort();

describe("docs/features/INDEX.md", () => {
  it("finds docs, links and routes to compare", () => {
    expect(indexLinks.length).toBeGreaterThan(0);
    expect(featureDocs.length).toBeGreaterThan(0);
    expect(pageSegments.length).toBeGreaterThan(0);
  });

  it("links only docs that exist", () => {
    const broken = indexLinks.filter((l) => !existsSync(path.join(FEATURES, l)));
    expect(broken, "fix or remove these links in docs/features/INDEX.md").toEqual([]);
  });

  it("links every doc under docs/features/", () => {
    const orphans = featureDocs.filter((d) => !indexLinks.includes(d));
    expect(orphans, "add a row to docs/features/INDEX.md for each").toEqual([]);
  });

  it("has a row for every dashboard view", () => {
    const missing = DASHBOARD_VIEW_IDS.filter((id) => !INDEX.includes(`\`/dashboard/${id}\``));
    expect(missing, "add a dashboard/ row to docs/features/INDEX.md for each").toEqual([]);
  });
});

describe("every page route has a feature doc", () => {
  const bodies = featureDocs.map((d) => readFileSync(path.join(FEATURES, d), "utf8"));

  it.each(pageSegments)("/%s is named by a doc under docs/features/", (seg) => {
    const named = new RegExp("`/" + seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[`/]");
    expect(
      bodies.some((b) => named.test(b)),
      `no feature doc names \`/${seg}\`; write one or name the route in the doc that covers it`,
    ).toBe(true);
  });
});
