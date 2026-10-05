import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { connectors } from "@/data/connectors";
import { BYSTANDERS, CASES, TOOLS } from "./catalog";

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
});
