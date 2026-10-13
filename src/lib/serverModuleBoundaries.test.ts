import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The import directions around `src/lib/server`, the server-only helpers (env,
 * request parsing, rate limiting, the JSON file store) that only API routes use.
 *
 * moduleBoundaries.test.ts holds the layer rules (app is the leaf, lib does not
 * import UI, API routes stay off UI, client state and demo data). It does not
 * say who may reach `src/lib/server`, what that folder may reach, or that the
 * demo mocks stay clear of server code. Those are the edges that erode the
 * demo/live split one import at a time: a client helper that imports
 * `@/lib/server/env` breaks the build at best and drags server code toward the
 * browser at worst, and a mock that reads the JSON store or the service_role
 * client stops being a demo.
 *
 * Each rule lists its known exceptions, exactly, so a new offender fails by name
 * and a fixed one fails until its entry is removed: the lists may only shrink.
 * serviceRoleServerOnly.test.ts holds the service_role key itself.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Every non-test .ts/.tsx file under `dir`, repo-relative with forward slashes. */
function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) sources(rel, out);
    else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)["']([^"'\n]+)["']/gm;
const SERVER_ONLY_FIRST_LINE = /^\s*import\s+["']server-only["']/;

type GraphNode = { file: string; serverOnly: boolean; imports: string[] };

function node(file: string): GraphNode {
  const text = readFileSync(path.join(ROOT, file), "utf8");
  const imports: string[] = [];
  for (const m of text.matchAll(SPECIFIER)) {
    const spec = m[1];
    if (spec.startsWith("@/")) imports.push(`src/${spec.slice(2)}`);
    else if (spec.startsWith(".")) imports.push(path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)));
  }
  return { file, serverOnly: SERVER_ONLY_FIRST_LINE.test(text), imports };
}

const under = (p: string, mod: string) => p === mod || p.startsWith(`${mod}/`) || p.startsWith(`${mod}.`);

const GRAPH = sources("src").map(node);

/** The demo data modules the dashboard runs on (CLAUDE.md "Project"). */
const DEMO_MOCKS = ["src/lib/mockApi", "src/lib/mock-dashboard-data", "src/lib/mockData", "src/lib/mockAuth"];

const RULES: { name: string; from: (n: GraphNode) => boolean; to: string[]; allow: string[] }[] = [
  {
    name: "only API routes, src/lib/server itself and server-only modules import src/lib/server",
    from: (n) => !under(n.file, "src/app/api") && !under(n.file, "src/lib/server") && !n.serverOnly,
    to: ["src/lib/server"],
    allow: [],
  },
  {
    name: "src/lib/server stays off UI, client state, routes and demo data",
    from: (n) => under(n.file, "src/lib/server"),
    to: ["src/app", "src/components", "src/stores", "src/hooks", "src/contexts", ...DEMO_MOCKS],
    allow: [],
  },
  {
    name: "demo mocks do not import server code or API routes",
    from: (n) => DEMO_MOCKS.some((m) => under(n.file, m)),
    to: ["src/lib/server", "src/lib/supabase-admin", "src/app/api"],
    allow: [],
  },
];

describe("server module boundaries", () => {
  it("reads the graph (the walker sees the known edges)", () => {
    const admin = GRAPH.find((n) => n.file === "src/lib/supabase-admin.ts");
    expect(admin?.serverOnly).toBe(true);
    expect(admin?.imports).toContain("src/lib/server/env");
    const waitlist = GRAPH.find((n) => n.file === "src/app/api/waitlist/route.ts");
    expect(waitlist?.imports).toContain("src/lib/server/rate-limit");
    const mockApi = GRAPH.find((n) => n.file === "src/lib/mockApi.ts");
    expect(mockApi?.imports).toContain("src/lib/mock-dashboard-data");
  });

  it.each(RULES.map((r): [string, number] => [r.name, RULES.indexOf(r)]))("%s", (_name, i) => {
    const rule = RULES[i];
    const offenders = GRAPH.filter(rule.from).flatMap((n) =>
      n.imports.filter((t) => rule.to.some((mod) => under(t, mod))).map((t) => `${n.file} -> ${t}`),
    );
    expect([...new Set(offenders)].sort(), "a new edge breaks the boundary, or an allowed one was fixed and must leave the list").toEqual(
      [...rule.allow].sort(),
    );
  });
});
