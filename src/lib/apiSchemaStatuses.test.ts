import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Holds the responses in docs/api/openapi.json to the statuses the handlers
 * actually send.
 *
 * apiSchemaCoverage.test.ts joins paths, verbs and allowlists. It does not see
 * responses, so a handler could start answering 409 or 502 while the schema
 * still lists only 200 and 500, and an agent writing a caller would never
 * handle it. This fails when a route.ts sends a literal `status: NNN` that no
 * operation on its path documents.
 *
 * One direction only: a documented status a handler sends through a shared
 * helper (rate limits, body-size guards) has no literal in route.ts, so the
 * schema may list more than this spec can see.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const API_ROOT = path.join(REPO_ROOT, "src", "app", "api");
const VERBS = ["get", "post", "put", "delete", "patch", "head", "options"];

type PathItem = Record<string, unknown>;
const spec = JSON.parse(readFileSync(path.join(REPO_ROOT, "docs", "api", "openapi.json"), "utf8")) as {
  paths: Record<string, PathItem>;
};

function routeFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) routeFiles(full, out);
    else if (entry.name === "route.ts") out.push(full);
  }
  return out;
}

/** `src/app/api/executions/[id]/stream/route.ts` -> `/api/executions/{id}/stream`. */
function openApiPath(file: string): string {
  const rel = path.relative(API_ROOT, path.dirname(file)).replaceAll("\\", "/");
  return "/api/" + rel.replace(/\[(?:\.\.\.)?([^\]]+)\]/g, "{$1}");
}

/** Every `status: NNN` literal in a handler, as in `{ status: 400 }`. */
function sentStatuses(source: string): string[] {
  const found = new Set<string>();
  for (const m of source.matchAll(/\bstatus:\s*(\d{3})\b/g)) found.add(m[1]);
  return [...found].sort();
}

/** Response keys documented on any operation of a path. */
function documentedStatuses(item: PathItem | undefined): Set<string> {
  const out = new Set<string>();
  for (const verb of VERBS) {
    const op = item?.[verb] as { responses?: Record<string, unknown> } | undefined;
    for (const code of Object.keys(op?.responses ?? {})) out.add(code);
  }
  return out;
}

const routes = routeFiles(API_ROOT).map((file) => ({ file, key: openApiPath(file) }));

describe("docs/api/openapi.json responses", () => {
  it("finds route handlers that send literal statuses", () => {
    expect(routes.some((r) => sentStatuses(readFileSync(r.file, "utf8")).length > 0)).toBe(true);
  });

  it.each(routes.map((r): [string, string] => [r.key, r.file]))("%s documents every status its handler sends", (key, file) => {
    const documented = documentedStatuses(spec.paths[key]);
    const undocumented = sentStatuses(readFileSync(file, "utf8")).filter((code) => !documented.has(code));
    expect(undocumented, `${key}: add these to its responses in docs/api/openapi.json`).toEqual([]);
  });
});
