import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * CLAUDE.md convention 6: the Supabase service_role key, which bypasses RLS,
 * may be read only inside a module whose first line is `import "server-only"`,
 * and never under a `NEXT_PUBLIC_` name. Those two properties are what keep it
 * out of the client bundle (Next fails the build when a client component
 * imports a server-only module; an un-prefixed env var is never inlined).
 *
 * The rule was stated but nothing checked it. This spec fails `test:unit`,
 * naming the file, when a module reads the key without the guard or when a
 * `NEXT_PUBLIC_` spelling of it appears anywhere in src/.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const SRC = path.join(REPO_ROOT, "src");

function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sources(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = sources(SRC).map((f) => ({
  rel: path.relative(REPO_ROOT, f).replaceAll("\\", "/"),
  text: readFileSync(f, "utf8"),
}));

/** A read of the key: `process.env.X`, `process.env["X"]`, or the name as a string literal (`getOptionalEnv("X")`). */
const READS_KEY = /process\.env\.SUPABASE_SERVICE_ROLE_KEY\b|(["'`])SUPABASE_SERVICE_ROLE_KEY\1/;

const firstLine = (text: string) =>
  text.replace(/^﻿/, "").split(/\r?\n/).find((l) => l.trim() !== "")?.trim() ?? "";

describe("SUPABASE_SERVICE_ROLE_KEY stays server-only", () => {
  const readers = files.filter((f) => READS_KEY.test(f.text));

  it("finds the modules that read the key", () => {
    expect(readers.length).toBeGreaterThan(0);
  });

  it("is read only by modules whose first line is import \"server-only\"", () => {
    const unguarded = readers
      .filter((f) => !/^import\s+["']server-only["'];?$/.test(firstLine(f.text)))
      .map((f) => f.rel);
    expect(unguarded, "make `import \"server-only\"` the first line, or read the key through src/lib/server/env.ts").toEqual([]);
  });

  it("never appears under a NEXT_PUBLIC_ name", () => {
    const exposed = files.filter((f) => /NEXT_PUBLIC_\w*SERVICE_ROLE/.test(f.text)).map((f) => f.rel);
    expect(exposed).toEqual([]);
  });
});
