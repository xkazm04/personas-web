import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FEATURE_IDS } from "./feature-ids";

/**
 * Keeps docs/api/openapi.json joined to the handlers it describes.
 *
 * The threat model says who may call a route; the OpenAPI file says what to
 * send it. Both are only useful while complete, so this fails when a
 * `route.ts` has no path entry (or an entry outlives its route), when a path's
 * operations differ from the HTTP verbs the handler exports, and when an
 * allowlist the schema publishes (feature ids, boost tiers, waitlist
 * platforms, the voter id pattern) no longer matches the constant the handler
 * validates against.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const API_ROOT = path.join(REPO_ROOT, "src", "app", "api");
const VERBS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;

type Operation = Record<string, unknown>;
type PathItem = Partial<Record<Lowercase<(typeof VERBS)[number]>, Operation>> & { parameters?: unknown[] };
interface OpenApi {
  openapi: string;
  paths: Record<string, PathItem>;
  components: { schemas: Record<string, { enum?: unknown[]; pattern?: string }> };
}

const spec = JSON.parse(readFileSync(path.join(REPO_ROOT, "docs", "api", "openapi.json"), "utf8")) as OpenApi;
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

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

/** HTTP verbs a route module exports, as `export async function GET` or `export const GET`. */
function exportedVerbs(source: string): string[] {
  const found = new Set<string>();
  for (const m of source.matchAll(/^export\s+(?:async\s+)?(?:function|const)\s+([A-Z]+)\b/gm)) {
    if ((VERBS as readonly string[]).includes(m[1])) found.add(m[1].toLowerCase());
  }
  return [...found].sort();
}

/** Values of `const NAME = new Set([...])` in a source file. */
function setLiteral(source: string, name: string): unknown[] {
  const m = new RegExp(`const ${name} = new Set\\(\\[([^\\]]*)\\]\\)`).exec(source);
  if (!m) throw new Error(`${name} is no longer a Set literal; point this spec at its new shape`);
  return JSON.parse(`[${m[1]}]`) as unknown[];
}

const routes = routeFiles(API_ROOT).map((file) => ({ file, key: openApiPath(file) }));

describe("docs/api/openapi.json", () => {
  it("is an OpenAPI 3.1 document with paths", () => {
    expect(spec.openapi).toMatch(/^3\.1\./);
    expect(routes.length).toBeGreaterThan(0);
  });

  it("has a path entry for every route.ts and none for a deleted route", () => {
    const keys = routes.map((r) => r.key).sort();
    expect(Object.keys(spec.paths).sort()).toEqual(keys);
  });

  it.each(routes.map((r): [string, string] => [r.key, r.file]))("%s lists exactly the verbs its handler exports", (key, file) => {
    const documented = Object.keys(spec.paths[key] ?? {})
      .filter((k) => (VERBS as readonly string[]).includes(k.toUpperCase()))
      .sort();
    expect(documented).toEqual(exportedVerbs(readFileSync(file, "utf8")));
  });

  it("publishes the feature-id allowlist the handlers validate against", () => {
    expect(spec.components.schemas.FeatureId.enum).toEqual([...FEATURE_IDS]);
  });

  it("publishes the boost tiers feature-boosts accepts", () => {
    const tiers = setLiteral(read("src/app/api/feature-boosts/route.ts"), "ALLOWED_TIERS");
    expect(spec.components.schemas.BoostTier.enum).toEqual(tiers);
  });

  it("publishes the platforms the waitlist accepts", () => {
    const platforms = setLiteral(read("src/app/api/waitlist/route.ts"), "VALID_PLATFORMS");
    expect(spec.components.schemas.WaitlistPlatform.enum).toEqual(platforms);
  });

  it("publishes the voter id pattern isValidVoterId enforces", () => {
    const m = /const VOTER_ID_RE = \/(.+)\/;/.exec(read("src/lib/validation.ts"));
    expect(m, "VOTER_ID_RE moved; point this spec at it").not.toBeNull();
    expect(spec.components.schemas.VoterId.pattern).toBe(m?.[1]);
  });

  it("is linked from the threat model's route table", () => {
    expect(read("docs/threat-model.md")).toContain("`docs/api/openapi.json`");
  });
});
