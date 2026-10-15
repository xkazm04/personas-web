import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The scope survives a reload: the store writes the persona, the window and
 * the Compare flag to localStorage on every change and hydrates them when the
 * module loads in the browser. A reload is a fresh module instance, which
 * `vi.resetModules()` + a dynamic import reproduce.
 */

function stubBrowser() {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  };
  vi.stubGlobal("window", { localStorage });
  vi.stubGlobal("localStorage", localStorage);
  return data;
}

async function loadStore() {
  vi.resetModules();
  return (await import("./dashboardFilterStore")).useDashboardFilterStore;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("dashboardFilterStore persistence", () => {
  it("starts at All personas + 7 days, Compare off", async () => {
    stubBrowser();
    const store = await loadStore();
    expect(store.getState()).toMatchObject({ personaId: null, dateRange: "7d", compareEnabled: false });
  });

  it("a reload keeps the chosen persona, window and Compare flag", async () => {
    stubBrowser();
    const first = await loadStore();
    first.getState().setPersonaId("p-0002-mock");
    first.getState().setDateRange("24h");
    first.getState().setCompareEnabled(true);

    const reloaded = await loadStore();
    expect(reloaded.getState()).toMatchObject({ personaId: "p-0002-mock", dateRange: "24h", compareEnabled: true });
  });

  it("choosing All personas + 7 days again is what a reload brings back", async () => {
    stubBrowser();
    const first = await loadStore();
    first.getState().setPersonaId("p-0002-mock");
    first.getState().setDateRange("24h");
    first.getState().setPersonaId(null);
    first.getState().setDateRange("7d");

    const reloaded = await loadStore();
    expect(reloaded.getState()).toMatchObject({ personaId: null, dateRange: "7d" });
  });
});
