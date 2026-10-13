import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Keeps pointers into the root conventions list from silently repointing.
 *
 * `.claude/CLAUDE.md` holds a numbered "## Conventions" list, and the pointer
 * files and feature docs used to cite it by ordinal ("convention 6"). Inserting
 * a rule shifted every number after it without failing anything: one feature
 * doc already cited "convention 4" (React 19) for a reduced-motion rule that is
 * convention 3. Pointers now cite a convention by its bold name, e.g.
 * "the **Supabase** convention". This spec fails `test:unit` when an ordinal
 * citation comes back, or when a cited name no longer exists in the list.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const read = (rel: string) => readFileSync(path.join(REPO_ROOT, rel), "utf8");

const ROOT_GUIDANCE = ".claude/CLAUDE.md";
const POINTER_FILES = ["scripts/CLAUDE.md", "src/app/api/CLAUDE.md", "src/lib/server/CLAUDE.md"];
const DOC_DIRS = ["docs/features", "docs/decisions"];

function markdownUnder(rel: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(path.join(REPO_ROOT, rel))) {
    const child = `${rel}/${name}`;
    if (statSync(path.join(REPO_ROOT, child)).isDirectory()) out.push(...markdownUnder(child));
    else if (name.endsWith(".md")) out.push(child);
  }
  return out;
}

/** Bold leads of the numbered "## Conventions" list: `1. **i18n**: ...`. */
function conventionNames(text: string): string[] {
  const start = text.indexOf("## Conventions");
  const end = text.indexOf("\n## ", start + 1);
  const section = text.slice(start, end === -1 ? undefined : end);
  return Array.from(section.matchAll(/^\d+\.\s+\*\*([^*]+)\*\*/gm), (m) => m[1]);
}

const SCANNED = [...POINTER_FILES, ...DOC_DIRS.flatMap(markdownUnder)];

describe("convention pointers", () => {
  const names = conventionNames(read(ROOT_GUIDANCE));

  it("reads the named conventions from the root list", () => {
    expect(names).toEqual(expect.arrayContaining(["i18n", "Supabase", "Commits", "Animation gating"]));
  });

  it("never cites a convention by its number", () => {
    const offenders = SCANNED.filter((rel) => /\bconventions?\s*#?\d+/i.test(read(rel)));
    expect(offenders).toEqual([]);
  });

  it("cites only conventions that exist in the root list", () => {
    const missing: string[] = [];
    for (const rel of SCANNED) {
      for (const m of read(rel).matchAll(/\*\*([^*]+)\*\* convention\b/g)) {
        if (!names.includes(m[1])) missing.push(`${rel}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("covers every pointer file", () => {
    const cited = POINTER_FILES.filter((rel) => /\*\*[^*]+\*\* convention\b/.test(read(rel)));
    expect(cited).toEqual(POINTER_FILES);
  });
});
