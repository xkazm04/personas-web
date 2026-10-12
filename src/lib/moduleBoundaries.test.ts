import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The import directions the architecture docs describe, as a rule instead of
 * prose.
 *
 * README and docs/AI_HARNESS.md describe layers: `src/app` is the route leaf
 * that composes everything else, `src/lib` is the shared base that UI builds
 * on, API routes are server code that never reaches into the demo dashboard's
 * UI, stores or mock data, and the shipped locales never pull in the
 * English-only pending copy. Reversing any of those is the move an agent can
 * make in one import without noticing: a lib helper that imports a component
 * drags UI into every route and test that uses the helper.
 *
 * Each rule lists its known exceptions. The list is exact, so a new offender
 * fails by name, and fixing an old one fails until its entry is removed: the
 * lists may only shrink. dashboardDataBoundary.test.ts (demo/live switch) and
 * serviceRoleServerOnly.test.ts (service_role key) hold the two boundaries
 * this spec does not repeat.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Every non-test .ts/.tsx file under src/, repo-relative with forward slashes. */
function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) sources(rel, out);
    else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec)\.tsx?$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)["']([^"'\n]+)["']/gm;

/** The repo-relative module each local import of `file` points at (no extension resolution). */
function importsOf(file: string, text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(SPECIFIER)) {
    const spec = m[1];
    if (spec.startsWith("@/")) out.push(`src/${spec.slice(2)}`);
    else if (spec.startsWith(".")) out.push(path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)));
  }
  return out;
}

const under = (p: string, mod: string) => p === mod || p.startsWith(`${mod}/`) || p.startsWith(`${mod}.`);

const GRAPH = sources("src").map((file) => ({ file, imports: importsOf(file, readFileSync(path.join(ROOT, file), "utf8")) }));

const RULES: { name: string; from: (file: string) => boolean; to: string[]; allow: string[] }[] = [
  {
    name: "src/app is the leaf: nothing outside it imports a route module",
    from: (f) => !under(f, "src/app"),
    to: ["src/app"],
    allow: [],
  },
  {
    name: "src/lib is the base: it does not import UI components",
    from: (f) => under(f, "src/lib"),
    to: ["src/components"],
    allow: [
      // Parsers that live beside the guide renderer; move them into src/lib to clear these.
      "src/lib/guide-body-index.ts -> src/components/guide/guide-markdown/extractHeadings",
      "src/lib/guide-markdown-export.ts -> src/components/guide/guide-markdown/parseGuide",
      "src/lib/templates.ts -> src/components/icons/brand-icons",
    ],
  },
  {
    name: "API routes stay off UI, client state and demo data",
    from: (f) => under(f, "src/app/api"),
    to: ["src/components", "src/stores", "src/hooks", "src/contexts", "src/lib/mockApi", "src/lib/mock-dashboard-data"],
    allow: [
      // Type-only: the roadmap row shape is declared next to its section.
      "src/app/api/roadmap/types.ts -> src/components/sections/roadmap/types",
    ],
  },
  {
    name: "shipped locales do not import English-only pending copy",
    from: (f) => path.posix.dirname(f) === "src/i18n",
    to: ["src/i18n/pending"],
    allow: [],
  },
];

describe("module boundaries", () => {
  it("reads imports at all (the walker is sound)", () => {
    const api = GRAPH.find((n) => n.file === "src/lib/api.ts");
    expect(api?.imports).toContain("src/lib/mockApi");
  });

  it.each(RULES.map((r): [string, number] => [r.name, RULES.indexOf(r)]))("%s", (_name, i) => {
    const rule = RULES[i];
    const offenders = GRAPH.filter((n) => rule.from(n.file)).flatMap((n) =>
      n.imports.filter((t) => rule.to.some((mod) => under(t, mod))).map((t) => `${n.file} -> ${t}`),
    );
    expect([...new Set(offenders)].sort(), "a new edge breaks the boundary, or an allowed one was fixed and must leave the list").toEqual(
      [...rule.allow].sort(),
    );
  });
});
