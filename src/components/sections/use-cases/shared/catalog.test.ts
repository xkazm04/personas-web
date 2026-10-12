import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { connectors } from "@/data/connectors";
import { PUBLISHED_TEMPLATES, USE_CASE_CORPUS } from "@/data/use-case-corpus";
import { BYSTANDERS, CASES, NEED_CATEGORY, TOOLS } from "./catalog";

describe("use-cases lab catalog", () => {
  it("every tool is a real connector with the catalog's label, icon and colour", () => {
    for (const tool of Object.values(TOOLS)) {
      const row = connectors.find((c) => c.name === tool.id);
      expect(row, tool.id).toBeDefined();
      expect(row?.label).toBe(tool.label);
      expect(row?.icon).toBe(tool.icon);
      expect(row?.color).toBe(tool.color);
      expect(existsSync(path.join(process.cwd(), "public", "tools", `${tool.icon}.svg`)), tool.icon).toBe(true);
    }
  });

  it("each case picks one of its own candidates, never shown first", () => {
    for (const c of CASES) {
      expect(c.candidates).toContain(c.chosen);
      expect(c.candidates[0]).not.toBe(c.chosen);
      expect(new Set(c.candidates).size).toBe(c.candidates.length);
    }
  });

  it("no tool is both a candidate and a bystander, and none repeats across cases", () => {
    const all = CASES.flatMap((c) => c.candidates);
    expect(new Set(all).size).toBe(all.length);
    for (const b of BYSTANDERS) expect(all).not.toContain(b);
  });

  it("every need's tools sit in a connector category a published desktop template uses", () => {
    for (const c of CASES) {
      const categories = NEED_CATEGORY[c.need];
      for (const id of [...c.candidates, c.chosen]) {
        expect(categories, `${c.need}:${id}`).toContain(connectors.find((x) => x.name === id)?.category);
      }
      const hit = PUBLISHED_TEMPLATES.filter((t) => t.connectorCategories.some((k) => categories.includes(k)));
      expect(hit.length, `no published template works in ${categories.join("/")}`).toBeGreaterThan(0);
    }
  });
});

describe("use-case corpus", () => {
  it("is pinned to a desktop commit and carries only public fields", () => {
    expect(USE_CASE_CORPUS.desktopCommit).toMatch(/^[0-9a-f]{40}$/);
    const allowed = ["id", "name", "description", "category", "published", "connectors", "connectorCategories", "unresolvedConnectors", "useCaseCount"].sort();
    for (const t of USE_CASE_CORPUS.templates) expect(Object.keys(t).sort(), t.id).toEqual(allowed);
  });

  it("resolves every connector to a web catalog row and every category key to a web category", () => {
    const names = new Set(connectors.map((c) => c.name));
    const cats = new Set(connectors.map((c) => c.category));
    for (const t of USE_CASE_CORPUS.templates) {
      for (const n of t.connectors) expect(names.has(n), `${t.id}:${n}`).toBe(true);
      for (const k of t.connectorCategories) expect(cats.has(k), `${t.id}:${k}`).toBe(true);
    }
  });
});
