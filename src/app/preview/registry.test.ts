import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildPreviewRegistry, previewSlug } from "./derive";

const root = path.resolve(__dirname, "../../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

/** The lazy-section tables the live pages (/, /how, /athena) load. */
const LIVE_TABLES = [
  "src/components/sections/lazy.tsx",
  "src/components/sections/how-lazy.tsx",
  "src/components/sections/athena-lazy.tsx",
];

const lazyExports = (src: string) => [...src.matchAll(/export const (Lazy\w+)\s*=/g)].map((m) => m[1]);
const importPaths = (src: string) => [...src.matchAll(/import\("([^"]+)"\)/g)].map((m) => m[1]);

describe("previewSlug", () => {
  it("kebab-cases the Lazy export name, keeping acronyms whole", () => {
    expect(previewSlug("LazyEventBusShowcase")).toBe("event-bus-showcase");
    expect(previewSlug("LazyDownloadCTA")).toBe("download-cta");
    expect(previewSlug("LazyFAQ")).toBe("faq");
    expect(previewSlug("LazyTeamCanvas")).toBe("team-canvas");
  });

  it("ignores exports that are not Lazy sections", () => {
    expect(previewSlug("SectionSkeleton")).toBeNull();
    expect(previewSlug("Lazy")).toBeNull();
    expect(previewSlug("lazyVision")).toBeNull();
  });
});

describe("buildPreviewRegistry", () => {
  it("previews the live table's own component (same object, so same ssr + skeleton)", () => {
    const table = { LazyCompanion: "companion-component", notASection: "x" };
    const registry = buildPreviewRegistry([table], {});
    expect(registry.get("companion")).toBe("companion-component");
    expect(registry.size).toBe(1);
  });

  it("refuses a preview extra that would shadow a live section", () => {
    expect(() => buildPreviewRegistry([{ LazyFAQ: "live" }], { faq: "re-wrapped" })).toThrow(/duplicate/);
  });

  it("does not resolve prototype members as sections", () => {
    const registry = buildPreviewRegistry([{ LazyVision: "v" }], {});
    expect(registry.get("constructor")).toBeUndefined();
    expect(registry.has("toString")).toBe(false);
  });
});

describe("/preview registry is derived from the live lazy-section tables", () => {
  const registrySrc = read("src/app/preview/registry.ts");

  it("every Lazy export of every live table gets a unique preview slug", () => {
    const tables = LIVE_TABLES.map((file) =>
      Object.fromEntries(lazyExports(read(file)).map((name) => [name, name])),
    );
    const names = tables.flatMap((t) => Object.keys(t));
    // The homepage sections the old hand list missed are part of the scan.
    expect(names).toEqual(expect.arrayContaining(["LazyCompanion", "LazyTeamCanvas", "LazyEventBusShowcase"]));
    const registry = buildPreviewRegistry(tables, {});
    expect(new Set(registry.values())).toEqual(new Set(names));
  });

  it("registry.ts feeds every live table into buildPreviewRegistry", () => {
    for (const file of LIVE_TABLES) {
      const spec = `@/${file.replace(/^src\//, "").replace(/\.tsx$/, "")}`;
      expect(registrySrc, spec).toMatch(new RegExp(`import \\* as \\w+ from "${spec}"`));
    }
    expect(registrySrc).toMatch(/buildPreviewRegistry(<\w+>)?\(/);
  });

  it("preview extras never re-import a module a live table already loads (ssr parity)", () => {
    const live = new Set(LIVE_TABLES.flatMap((file) => importPaths(read(file))));
    const rewrapped = importPaths(registrySrc).filter((p) => live.has(p));
    expect(rewrapped).toEqual([]);
  });

  it("carries no pointer to the removed /preview/athena page", () => {
    expect(registrySrc).not.toMatch(/\/preview\/athena/);
  });
});
