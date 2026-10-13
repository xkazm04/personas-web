import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pins the one-way layering of the demo dashboard's mock modules, so an agent
 * adding fixture data has exactly one right place for it
 * (docs/features/infrastructure/orchestrator-client-mocks.md, "Three demo
 * modules, one direction"):
 *
 *   mockData.ts            fixtures shaped like the ApiClient types
 *   mock-dashboard-data.ts dashboard-only fixtures, derived from mockData.ts
 *   mockApi.ts             behaviour only: ApiClient + async getters over both
 *
 * Data flows down that list into mockApi.ts and never back up.
 */

const LIB = path.dirname(fileURLToPath(import.meta.url));
const read = (file: string) => fs.readFileSync(path.join(LIB, file), "utf8");

const MOCK_DATA = read("mockData.ts");
const DASHBOARD_DATA = read("mock-dashboard-data.ts");
const MOCK_API = read("mockApi.ts");

const importsFrom = (source: string, name: string) =>
  new RegExp(`from "\\./${name.replace(/[-.]/g, "\\$&")}"`).test(source);

describe("demo mock modules", () => {
  it("mockApi.ts holds behaviour, not fixtures", () => {
    expect(MOCK_API).not.toMatch(/^(export )?(const|let) MOCK_/m);
    expect(MOCK_API).toMatch(/^export const mockApi: ApiClient = \{/m);
  });

  it("mockApi.ts reads both fixture modules", () => {
    expect(importsFrom(MOCK_API, "mockData")).toBe(true);
    expect(importsFrom(MOCK_API, "mock-dashboard-data")).toBe(true);
  });

  it("fixture modules never import the API layer", () => {
    for (const source of [MOCK_DATA, DASHBOARD_DATA]) {
      expect(importsFrom(source, "mockApi")).toBe(false);
      expect(importsFrom(source, "api")).toBe(false);
      expect(importsFrom(source, "supabaseApi")).toBe(false);
    }
  });

  it("fixture modules export data, not async calls", () => {
    for (const source of [MOCK_DATA, DASHBOARD_DATA]) {
      expect(source).not.toMatch(/^export async function/m);
      expect(source).not.toMatch(/^export const \w+\s*=\s*async\b/m);
    }
  });

  it("mockData.ts sits at the bottom: it does not read the dashboard fixtures", () => {
    expect(importsFrom(MOCK_DATA, "mock-dashboard-data")).toBe(false);
    expect(importsFrom(DASHBOARD_DATA, "mockData")).toBe(true);
  });
});
