import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Static backstop for catalog sections (src/i18n/catalog.ts). A section's
 * namespace exists in `t` only once its owning module has registered it, and
 * that registration lives at module scope in the module that loads the
 * section's readers (athena-lazy.tsx for /athena and /preview, LegalContent.tsx
 * for /legal). A read of `t.<section>` from anywhere else would see undefined
 * at runtime while tsc stays green (the Translations type keeps every
 * namespace). This guard fails the unit suite instead.
 *
 * Type-only references (`Translations["cookiePolicy"]`) are not reads and are
 * ignored: they cost nothing at runtime.
 */

type Owners = Record<string, string[]>;
interface SourceFile {
  path: string;
  text: string;
}
interface Leak {
  path: string;
  namespace: string;
  line: number;
}

/** Namespace -> the folders (repo-relative, posix, trailing slash) whose files may read it. */
const SECTION_OWNERS: Owners = {
  athenaPage: ["src/app/athena/", "src/components/athena/", "src/app/preview/"],
  privacyPolicy: ["src/app/legal/"],
  cookiePolicy: ["src/app/legal/"],
  legalPage: ["src/app/legal/"],
};

function findSectionLeaks(files: SourceFile[], owners: Owners): Leak[] {
  const leaks: Leak[] = [];
  for (const file of files) {
    const p = file.path.replace(/\\/g, "/");
    for (const [ns, folders] of Object.entries(owners)) {
      if (folders.some((f) => p.startsWith(f))) continue;
      const read = new RegExp(`(?:\\.${ns}\\b|(?<!Translations)\\[\\s*["'\`]${ns}["'\`]\\s*\\])`);
      file.text.split("\n").forEach((line, i) => {
        if (read.test(line)) leaks.push({ path: p, namespace: ns, line: i + 1 });
      });
    }
  }
  return leaks;
}

const root = path.resolve(__dirname, "../..");

function walk(dir: string, out: string[]): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.ts$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("findSectionLeaks", () => {
  it("flags a read of a section namespace outside its owners", () => {
    const leaks = findSectionLeaks(
      [{ path: "src/components/sections/Hero.tsx", text: "const x = t.athenaPage.nav;" }],
      { athenaPage: ["src/app/athena/", "src/components/athena/"] },
    );
    expect(leaks).toHaveLength(1);
  });

  it("finds no section read outside its owners anywhere in src", () => {
    const files = walk(path.join(root, "src"), [])
      .map((full) => ({ path: path.relative(root, full).replace(/\\/g, "/"), full }))
      .filter((f) => !f.path.startsWith("src/i18n/"))
      .map((f) => ({ path: f.path, text: readFileSync(f.full, "utf8") }));
    expect(files.length).toBeGreaterThan(100);
    expect(findSectionLeaks(files, SECTION_OWNERS)).toEqual([]);
  }, 30_000);
});
