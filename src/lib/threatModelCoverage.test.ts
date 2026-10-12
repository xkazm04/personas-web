import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps docs/threat-model.md joined to the code it describes.
 *
 * The threat model is the one page an agent checks a new API route against.
 * It is only useful while it is complete, so a `route.ts` added under
 * src/app/api/ without a row in the page's route table fails here, naming the
 * route. A row whose route was deleted fails too, and so does a link to a
 * decision record that no longer exists.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const API_ROOT = path.join(REPO_ROOT, "src", "app", "api");
const DOCS = path.join(REPO_ROOT, "docs");
const THREAT_MODEL = readFileSync(path.join(DOCS, "threat-model.md"), "utf8");

function routeDirs(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) routeDirs(full, out);
    else if (entry.name === "route.ts") {
      out.push(path.relative(API_ROOT, dir).replaceAll("\\", "/"));
    }
  }
  return out;
}

/** First-column route keys of the `## Routes` table, e.g. `votes`. */
function documentedRoutes(): string[] {
  const section = THREAT_MODEL.split(/^## Routes\s*$/m)[1]?.split(/^## /m)[0] ?? "";
  const keys: string[] = [];
  for (const line of section.split(/\r?\n/)) {
    const m = /^\|\s*`([^`]+)`\s*\|/.exec(line);
    if (m) keys.push(m[1]);
  }
  return keys;
}

describe("docs/threat-model.md", () => {
  const routes = routeDirs(API_ROOT).sort();
  const documented = documentedRoutes();

  it("finds API routes and a route table to compare", () => {
    expect(routes.length).toBeGreaterThan(0);
    expect(documented.length).toBeGreaterThan(0);
  });

  it("has a row for every route.ts under src/app/api", () => {
    const missing = routes.filter((r) => !documented.includes(r));
    expect(missing, "add a row to docs/threat-model.md § Routes for each").toEqual([]);
  });

  it("has no row for a route that no longer exists", () => {
    const stale = documented.filter((r) => !routes.includes(r));
    expect(stale, "remove these rows from docs/threat-model.md § Routes").toEqual([]);
  });

  it("links only decision records that exist", () => {
    const links = [...THREAT_MODEL.matchAll(/\]\((decisions\/[^)]+\.md)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(0);
    const broken = links.filter((l) => !existsSync(path.join(DOCS, l)));
    expect(broken).toEqual([]);
  });
});
