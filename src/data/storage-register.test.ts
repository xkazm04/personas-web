import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { STORAGE_REGISTER } from "./storage-register";

/**
 * The Cookie Policy renders its storage list from STORAGE_REGISTER, so a key
 * written in src/ but missing from the register is an undisclosed key. This
 * scans every source module that touches browser storage (local, session or
 * IndexedDB) or cookies and checks each key it can see is declared.
 */
const SRC = path.resolve(__dirname, "..");

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const TOUCHES_STORAGE = /localStorage\.|sessionStorage\.|indexedDB\.open\(|document\.cookie\s*=|zustand\/middleware/;

/** Keys a module writes, as far as a static read can see them. */
function keysIn(source: string): string[] {
  const keys = new Set<string>();
  // const FOO_KEY = "literal" / STORAGE_KEY_PREFIX = "literal" / DB_NAME = "literal" (storage-key constants)
  for (const m of source.matchAll(/\b[A-Z_]*(?:KEY|PREFIX|DB_NAME)\s*=\s*["'`]([a-z0-9][a-z0-9-]*)["'`]/g)) keys.add(m[1]);
  // localStorage.getItem("literal") / setItem("literal", ...)
  for (const m of source.matchAll(/(?:local|session)Storage\.(?:get|set|remove)Item\(\s*["'`]([a-z0-9][a-z0-9-]*)["'`]/g)) keys.add(m[1]);
  // indexedDB.open("literal", ...) - an IndexedDB database
  for (const m of source.matchAll(/indexedDB\.open\(\s*["'`]([a-z0-9][a-z0-9-]*)["'`]/g)) keys.add(m[1]);
  // document.cookie = "name=..."
  for (const m of source.matchAll(/document\.cookie\s*=\s*["'`]([a-z0-9-]+)=/g)) keys.add(m[1]);
  // template-literal families such as `checklist-${hash}`
  for (const m of source.matchAll(/return\s+`([a-z0-9-]+-)\$\{/g)) keys.add(`${m[1]}*`);
  return [...keys];
}

function isDeclared(key: string, declared: string[]): boolean {
  return declared.some((name) =>
    name.endsWith("*") ? key.startsWith(name.slice(0, -1)) || key === name : key === name,
  );
}

describe("storage register", () => {
  const declared = STORAGE_REGISTER.flatMap((e) => e.names);

  it("declares every cookie and storage key written in src/", () => {
    const undeclared: string[] = [];
    let scanned = 0;
    for (const file of sourceFiles(SRC)) {
      const source = readFileSync(file, "utf8");
      if (!TOUCHES_STORAGE.test(source)) continue;
      scanned += 1;
      for (const key of keysIn(source)) {
        if (!isDeclared(key, declared)) undeclared.push(`${path.relative(SRC, file)}: ${key}`);
      }
    }
    // A scanner that walks nothing reports clean while blind.
    expect(scanned).toBeGreaterThan(10);
    expect(undeclared).toEqual([]);
  });

  it("lists each name once", () => {
    expect(new Set(declared).size).toBe(declared.length);
  });
});
