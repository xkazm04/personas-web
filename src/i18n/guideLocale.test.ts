import { describe, expect, it } from "vitest";
import { guideLocaleCookieString, guideLocaleFromCookie } from "./guideLocale";

const NONE = { released: [] } as const;

describe("guideLocaleFromCookie", () => {
  it("reads English for every non-English value while nothing is released", () => {
    expect(guideLocaleFromCookie("de", NONE)).toBe("en");
    expect(guideLocaleFromCookie(undefined, NONE)).toBe("en");
  });
  it("honours a released locale and the preview override", () => {
    expect(guideLocaleFromCookie("de", { released: ["de"] })).toBe("de");
    expect(guideLocaleFromCookie("ja", { released: ["de"] })).toBe("en");
    expect(guideLocaleFromCookie("ja", { released: [], preview: true })).toBe("ja");
  });
  it("reads an unknown value as English", () => {
    expect(guideLocaleFromCookie("xx", { released: [], preview: true })).toBe("en");
  });
});

describe("guideLocaleCookieString", () => {
  it("scopes the cookie to /guide and persists a non-English locale", () => {
    const c = guideLocaleCookieString("de");
    expect(c).toContain("personas-guide-language=de");
    expect(c).toContain("path=/guide");
    expect(c).toMatch(/max-age=\d+/);
  });
  it("clears the cookie for English", () => {
    expect(guideLocaleCookieString("en")).toContain("max-age=0");
  });
});
