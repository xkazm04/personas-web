import { describe, expect, it } from "vitest";
import { en } from "./en";
import type { CoreTranslations, Translations } from "./en";
import { createCatalogStore, type CatalogSection, type NonEnLanguage } from "./catalog";
import { athenaPageSection } from "./sections/athenaPage";
import { legalSection } from "./sections/legal";
import { LANGUAGES } from "@/stores/i18nStore";

/*
 * The sectioned catalog (docs/features/platform/internationalization.md,
 * "Catalog sections"): a small core (en.ts) that every route ships, plus
 * route-owned sections registered by the module that owns their readers, all
 * resolved through ONE store - one memoised catalog per (language, registry
 * version), one load and one merge per locale, an English server snapshot.
 */

const SECTION_NAMESPACES = ["athenaPage", "privacyPolicy", "cookiePolicy", "legalPage"] as const;
const NON_EN = LANGUAGES.map((l) => l.id).filter((id) => id !== "en") as NonEnLanguage[];

/** A core loader map whose every locale resolves to an empty override. */
function emptyCoreLoaders(): Record<NonEnLanguage, () => Promise<Partial<CoreTranslations>>> {
  return Object.fromEntries(NON_EN.map((id) => [id, async () => ({})])) as Record<
    NonEnLanguage,
    () => Promise<Partial<CoreTranslations>>
  >;
}

describe("core catalog", () => {
  it("en.ts no longer carries the route-only namespaces (the bytes are off the shared chunk)", () => {
    const keys = Object.keys(en);
    for (const ns of SECTION_NAMESPACES) expect(keys).not.toContain(ns);
  });
});

describe("createCatalogStore", () => {
  it("adds a section only once it is registered, leaving the core untouched", () => {
    const store = createCatalogStore({ core: en, loaders: emptyCoreLoaders() });
    expect("athenaPage" in store.getCatalog("en")).toBe(false);
    store.registerSection(athenaPageSection);
    const t = store.getCatalog("en");
    expect(t.athenaPage).toBe(athenaPageSection.en.athenaPage);
    expect(t.nav).toBe(en.nav);
  });

  it("returns the same catalog reference until the registry or locale changes", () => {
    const store = createCatalogStore({ core: en, loaders: emptyCoreLoaders() });
    const a = store.getCatalog("en");
    expect(store.getCatalog("en")).toBe(a);
    store.registerSection(legalSection);
    const b = store.getCatalog("en");
    expect(b).not.toBe(a);
    expect(store.getCatalog("en")).toBe(b);
  });

  it("dedupes concurrent locale loads: one load, one merge, one object", async () => {
    let calls = 0;
    const loaders = emptyCoreLoaders();
    loaders.de = async () => {
      calls += 1;
      await Promise.resolve();
      return { nav: { ...en.nav, blog: "Blog-de" } };
    };
    const store = createCatalogStore({ core: en, loaders });
    const results = await Promise.all([1, 2, 3, 4, 5].map(() => store.loadLocale("de")));
    expect(calls).toBe(1);
    for (const r of results) expect(r).toBe(results[0]);
    expect(store.getCatalog("de")).toBe(results[0]);
    expect(results[0].nav.blog).toBe("Blog-de");
  });

  it("falls back to English per field while and after a section's locale part loads", async () => {
    const store = createCatalogStore({ core: en, loaders: emptyCoreLoaders() });
    await store.loadLocale("de");

    const enHero = athenaPageSection.en.athenaPage.hero;
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const deLoader = async () => {
      await gate;
      // One leaf (hero.headline) omitted on purpose; one translated.
      const { headline: _omitted, ...rest } = enHero;
      void _omitted;
      return { athenaPage: { hero: { ...rest, eyebrow: "DE-eyebrow" } } };
    };
    const fake: CatalogSection<"athenaPage"> = {
      ...athenaPageSection,
      id: "athenaPage-fake",
      loaders: { ...athenaPageSection.loaders, de: deLoader } as CatalogSection<"athenaPage">["loaders"],
    };
    store.registerSection(fake);

    // Immediately: the English section, never a raw key or undefined.
    expect(store.getCatalog("de").athenaPage.hero.headline).toBe(enHero.headline);
    expect(store.getCatalog("de").athenaPage.hero.eyebrow).toBe(enHero.eyebrow);

    release();
    await store.loadLocale("de");
    await new Promise((r) => setTimeout(r, 0));
    const after = store.getCatalog("de").athenaPage.hero;
    expect(after.eyebrow).toBe("DE-eyebrow");
    expect(after.headline).toBe(enHero.headline);
  });

  it("serves English as the server snapshot whatever locale the client holds", async () => {
    const loaders = emptyCoreLoaders();
    loaders.de = async () => ({ nav: { ...en.nav, blog: "Blog-de" } });
    const store = createCatalogStore({ core: en, loaders });
    store.activate("de");
    await store.loadLocale("de");
    expect(store.getActiveCatalog().nav.blog).toBe("Blog-de");
    const server: Translations = store.getServerCatalog();
    expect(server.nav.blog).toBe(en.nav.blog);
    expect(server).toBe(store.getCatalog("en"));
  });
});

describe("registered sections", () => {
  it("each section's loaders cover exactly LANGUAGES minus en", () => {
    for (const section of [athenaPageSection, legalSection] as CatalogSection[]) {
      expect(Object.keys(section.loaders).sort()).toEqual([...NON_EN].sort());
    }
  });
});
