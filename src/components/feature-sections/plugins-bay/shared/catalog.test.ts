import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { connectors } from "@/data/connectors";
import { CONNECTOR_COUNT, REACH_TOOLS, TOOLS, TWIN_CHANNELS, TWIN_MORE_CHANNELS } from "./catalog";

describe("plugins bay catalog slice", () => {
  it("states the catalog's real size", () => {
    expect(CONNECTOR_COUNT).toBe(connectors.length);
  });

  it("every tool is a real connector with the catalog's label, icon and colour", () => {
    for (const tool of Object.values(TOOLS)) {
      const row = connectors.find((c) => c.name === tool.id);
      expect(row, tool.id).toBeDefined();
      expect(row?.label).toBe(tool.label);
      expect(row?.icon ?? row?.name).toBe(tool.icon);
      expect(row?.color).toBe(tool.color);
      expect(existsSync(path.join(process.cwd(), "public", "tools", `${tool.icon}.svg`)), tool.icon).toBe(true);
    }
  });

  it("the plugins the bay stages are real catalog connectors", () => {
    for (const name of ["local_drive", "twin", "obsidian_memory"]) {
      expect(connectors.some((c) => c.name === name), name).toBe(true);
    }
  });

  it("draws no tool twice in one place", () => {
    expect(new Set(REACH_TOOLS).size).toBe(REACH_TOOLS.length);
    const channels = [...TWIN_CHANNELS, ...TWIN_MORE_CHANNELS];
    expect(new Set(channels).size).toBe(channels.length);
  });

  it("every tool in the slice is drawn somewhere", () => {
    const used = new Set<string>([...REACH_TOOLS, ...TWIN_CHANNELS, ...TWIN_MORE_CHANNELS]);
    for (const key of Object.keys(TOOLS)) expect(used.has(key), key).toBe(true);
  });
});
