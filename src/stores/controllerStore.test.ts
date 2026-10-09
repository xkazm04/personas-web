import { beforeEach, describe, expect, it, vi } from "vitest";

const loadController = vi.fn(() => new Promise<null>((resolve) => setTimeout(() => resolve(null), 5)));

vi.mock("@/lib/commands/controllerPlane", () => ({
  loadController: () => loadController(),
  signingSupported: () => Promise.resolve(true),
  fetchControllerRow: vi.fn(),
}));

import { replaceNeedsConfirm, useControllerStore, type ControllerPhase } from "./controllerStore";

describe("replaceNeedsConfirm", () => {
  const expected: Record<ControllerPhase, boolean> = {
    unknown: true,
    loading: true,
    none: false,
    pairing: true,
    pending: true,
    active: true,
    refused: false,
    revoked: false,
    unsupported: false,
    error: true,
  };
  for (const [phase, needs] of Object.entries(expected)) {
    it(`${phase} -> ${needs}`, () => {
      expect(replaceNeedsConfirm(phase as ControllerPhase)).toBe(needs);
    });
  }
});

describe("load", () => {
  beforeEach(() => {
    useControllerStore.getState().reset();
    loadController.mockClear();
  });

  it("shares one in-flight read between concurrent callers", async () => {
    const { load } = useControllerStore.getState();
    const a = load();
    const b = load();
    expect(a).toBe(b);
    await Promise.all([a, b]);
    expect(loadController).toHaveBeenCalledTimes(1);
    expect(useControllerStore.getState().phase).toBe("none");
  });

  it("reads again once the first load has settled", async () => {
    await useControllerStore.getState().load();
    await useControllerStore.getState().load();
    expect(loadController).toHaveBeenCalledTimes(2);
  });
});
