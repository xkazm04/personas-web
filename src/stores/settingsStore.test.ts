import { describe, expect, it } from "vitest";

import { MOCK_MODEL_PROVIDERS } from "@/lib/mock-dashboard-data";

import { countAllowedProviders, isProviderAllowed } from "./settingsStore";

/**
 * The BYOM allow-list is edited in Settings as an override map over each
 * provider's default `allowed`. Before this, the home Status Ticker counted
 * `MOCK_MODEL_PROVIDERS.filter((p) => p.allowed)` straight from the fixture,
 * so switching a provider off in Settings never changed the ticker.
 */

const PROVIDERS = [
  { id: "a", allowed: true },
  { id: "b", allowed: true },
  { id: "c", allowed: false },
];

describe("provider allow-list", () => {
  it("no overrides: the fixture defaults decide", () => {
    expect(countAllowedProviders(PROVIDERS, {})).toBe(2);
  });

  it("an override switches a default-allowed provider off", () => {
    expect(isProviderAllowed(PROVIDERS[0], { a: false })).toBe(false);
    expect(countAllowedProviders(PROVIDERS, { a: false })).toBe(1);
  });

  it("an override switches a default-blocked provider on", () => {
    expect(isProviderAllowed(PROVIDERS[2], { c: true })).toBe(true);
    expect(countAllowedProviders(PROVIDERS, { c: true })).toBe(3);
  });

  it("an override for an unknown id changes nothing", () => {
    expect(countAllowedProviders(PROVIDERS, { zz: true, yy: false })).toBe(2);
  });

  it("the demo fixture: turning every allowed provider off reads 0", () => {
    const allOff = Object.fromEntries(MOCK_MODEL_PROVIDERS.map((p) => [p.id, false]));
    expect(countAllowedProviders(MOCK_MODEL_PROVIDERS, {})).toBe(
      MOCK_MODEL_PROVIDERS.filter((p) => p.allowed).length,
    );
    expect(countAllowedProviders(MOCK_MODEL_PROVIDERS, allOff)).toBe(0);
  });
});
