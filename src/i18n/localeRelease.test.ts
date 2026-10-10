import { describe, expect, it } from "vitest";
import {
  LANGUAGES,
  LOCALE_RELEASE,
  negotiateLocale,
  normalizePersisted,
  reachableLocales,
  readLangParam,
  shouldOffer,
} from "./localeRelease";

/*
 * Acceptance cases for the per-locale release list (challenge i18n-B): one
 * predicate decides which locales are reachable, and every door (browser offer,
 * switcher, ?lang= link, persisted value) derives from it.
 */

const deOnly = { released: ["de"] as const, preview: false };

describe("negotiateLocale", () => {
  it("matches a regional tag to its released base language", () => {
    expect(negotiateLocale(["de-AT", "en"], deOnly)).toBe("de");
  });

  it("never serves the Simplified zh bundle to Traditional Chinese readers", () => {
    const zh = { released: ["zh"] as const, preview: false };
    expect(negotiateLocale(["zh-TW", "en"], zh)).toBeNull();
    expect(negotiateLocale(["zh-Hant"], zh)).toBeNull();
    expect(negotiateLocale(["zh-HK"], zh)).toBeNull();
    expect(negotiateLocale(["zh-CN"], zh)).toBe("zh");
    expect(negotiateLocale(["zh-Hans-SG"], zh)).toBe("zh");
  });

  it("offers nothing to a visitor who prefers English first", () => {
    expect(negotiateLocale(["en-US", "de"], deOnly)).toBeNull();
  });

  it("never offers a withheld locale", () => {
    expect(negotiateLocale(["fr"], deOnly)).toBeNull();
    // ...but keeps walking the list to a released one
    expect(negotiateLocale(["fr", "de-CH"], deOnly)).toBe("de");
  });
});

describe("normalizePersisted", () => {
  it("scrubs a persisted locale that is not reachable back to English", () => {
    expect(normalizePersisted("ja", deOnly)).toBe("en");
    expect(normalizePersisted("xx", deOnly)).toBe("en");
    expect(normalizePersisted(undefined, deOnly)).toBe("en");
    expect(normalizePersisted("de", deOnly)).toBe("de");
    expect(normalizePersisted("ja", { released: ["de"], preview: true })).toBe("ja");
  });
});

describe("reachableLocales", () => {
  it("is English plus the released locales in LANGUAGES order; preview opens all 14", () => {
    expect(reachableLocales({ released: ["es", "de"], preview: false })).toEqual(["en", "de", "es"]);
    expect(reachableLocales({ released: [], preview: true })).toEqual(LANGUAGES.map((l) => l.id));
    expect(reachableLocales({ released: [], preview: false })).toEqual(["en"]);
  });
});

describe("shouldOffer", () => {
  it("offers once, never after a decline, never when already active", () => {
    expect(shouldOffer({ negotiated: "de", current: "en", declined: ["de"] })).toBe(false);
    expect(shouldOffer({ negotiated: "de", current: "en", declined: [] })).toBe(true);
    expect(shouldOffer({ negotiated: "de", current: "de", declined: [] })).toBe(false);
    expect(shouldOffer({ negotiated: null, current: "en", declined: [] })).toBe(false);
  });
});

describe("readLangParam", () => {
  it("reads a reachable ?lang= deep link, case-insensitively, and ignores a withheld one", () => {
    expect(readLangParam("?lang=de", deOnly)).toBe("de");
    expect(readLangParam("?lang=ja", deOnly)).toBeNull();
    expect(readLangParam("?lang=DE-de", deOnly)).toBe("de");
    expect(readLangParam("?utm=x", deOnly)).toBeNull();
  });
});

describe("release data (guard)", () => {
  it("ships with no locale released, so production stays English-only until the owner releases one", () => {
    expect(LOCALE_RELEASE).toEqual([]);
  });
});
