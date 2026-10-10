import type { Language } from "@/stores/i18nStore";
import { en } from "./en";
import type { CoreTranslations, LocaleTranslations, SectionNamespace, Translations } from "./en";

/*
 * The UI catalog store: one small CORE that every route ships (src/i18n/en.ts)
 * plus route-owned SECTIONS (src/i18n/sections/*.ts) that join the catalog only
 * once the module owning their readers registers them, at module scope.
 *
 *   - One store, not one copy per component: the merged catalog is memoised per
 *     (language, registry version), so every `useTranslation()` caller reads the
 *     SAME object and a re-render happens only when the catalog really changes.
 *   - One load and one merge per locale: loads are cached as promises, so 200
 *     hook instances asking for `de` at once trigger a single import + merge.
 *   - English server snapshot: `getServerCatalog()` is always English, so the
 *     hydrating render matches the static HTML whatever locale the client holds.
 *   - Per-field English fallback: a locale (core or section) is deep-merged over
 *     English, and a section shows its English value until its locale part
 *     arrives - never a raw key or undefined.
 *
 * The section seam is guarded statically by src/i18n/sectionOwnership.test.ts:
 * only a section's owner folders may read `t.<section>`.
 * See docs/features/platform/internationalization.md, "Catalog sections".
 */

export type NonEnLanguage = Exclude<Language, "en">;

type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** A route-owned slice of the catalog: its English value and one loader per non-en locale. */
export interface CatalogSection<K extends SectionNamespace = SectionNamespace> {
  /** Stable id; registering the same id twice is a no-op. */
  id: string;
  en: Pick<Translations, K>;
  loaders: Record<NonEnLanguage, () => Promise<DeepPartial<Pick<Translations, K>>>>;
}

export interface CatalogStoreOptions {
  core: CoreTranslations;
  loaders: Record<NonEnLanguage, () => Promise<DeepPartial<CoreTranslations>>>;
}

export interface CatalogStore {
  registerSection<K extends SectionNamespace>(section: CatalogSection<K>): void;
  /** The merged catalog for `lang` (English where that locale is not loaded). Stable reference. */
  getCatalog(lang: Language): Translations;
  /** Always English: what the server rendered, so what the hydrating render must use. */
  getServerCatalog(): Translations;
  /** Load `lang`'s core and every registered section's part; deduped per locale. */
  loadLocale(lang: Language): Promise<Translations>;
  /** Ask for `lang`; the active catalog switches once it is loaded (no English flash). */
  activate(lang: Language): void;
  getActiveCatalog(): Translations;
  subscribe(listener: () => void): () => void;
}

/**
 * Recursively merge `override` on top of `base`. Plain objects merge key by
 * key; primitives, arrays, and null replace wholesale.
 */
function deepMerge(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (override === null) return override;
  if (Array.isArray(override) || Array.isArray(base)) return override;
  if (typeof base !== "object" || base === null) return override;
  if (typeof override !== "object") return override;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    result[key] = deepMerge(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key],
    );
  }
  return result;
}

export function createCatalogStore({ core, loaders }: CatalogStoreOptions): CatalogStore {
  const sections = new Map<string, CatalogSection<SectionNamespace>>();
  /** Merged core per loaded locale (en is always there). */
  const cores: Partial<Record<Language, CoreTranslations>> = { en: core };
  /** Merged section value per `${id}:${lang}`, once that part has loaded. */
  const sectionParts = new Map<string, Partial<Translations>>();
  const coreLoads = new Map<Language, Promise<void>>();
  const sectionLoads = new Map<string, Promise<void>>();
  const localeLoads = new Map<Language, Promise<Translations>>();
  const listeners = new Set<() => void>();
  const memo = new Map<Language, Translations>();
  let requested: Language = "en";
  let active: Language = "en";

  function changed() {
    memo.clear();
    for (const l of listeners) l();
  }

  function build(lang: Language): Translations {
    const base = cores[lang] ?? core;
    const out: Record<string, unknown> = { ...base };
    for (const section of sections.values()) {
      const part = (lang === "en" ? undefined : sectionParts.get(`${section.id}:${lang}`)) ?? section.en;
      Object.assign(out, part);
    }
    return out as unknown as Translations;
  }

  function getCatalog(lang: Language): Translations {
    let t = memo.get(lang);
    if (!t) {
      t = build(lang);
      memo.set(lang, t);
    }
    return t;
  }

  function loadSectionPart(section: CatalogSection<SectionNamespace>, lang: NonEnLanguage): Promise<void> {
    const key = `${section.id}:${lang}`;
    let p = sectionLoads.get(key);
    if (!p) {
      p = section.loaders[lang]().then(
        (part) => {
          sectionParts.set(key, deepMerge(section.en, part) as Partial<Translations>);
          changed();
        },
        (err: unknown) => {
          sectionLoads.delete(key);
          throw err;
        },
      );
      sectionLoads.set(key, p);
    }
    return p;
  }

  function loadCore(lang: NonEnLanguage): Promise<void> {
    let p = coreLoads.get(lang);
    if (!p) {
      p = loaders[lang]().then(
        (next) => {
          cores[lang] = deepMerge(core, next) as CoreTranslations;
          changed();
        },
        (err: unknown) => {
          coreLoads.delete(lang);
          throw err;
        },
      );
      coreLoads.set(lang, p);
    }
    return p;
  }

  function loadLocale(lang: Language): Promise<Translations> {
    if (lang === "en") return Promise.resolve(getCatalog("en"));
    let p = localeLoads.get(lang);
    if (!p) {
      p = Promise.all([
        loadCore(lang),
        ...[...sections.values()].map((s) => loadSectionPart(s, lang)),
      ]).then(
        () => getCatalog(lang),
        (err: unknown) => {
          localeLoads.delete(lang);
          throw err;
        },
      );
      localeLoads.set(lang, p);
    }
    return p;
  }

  function registerSection<K extends SectionNamespace>(added: CatalogSection<K>) {
    if (sections.has(added.id)) return;
    const section = added as unknown as CatalogSection<SectionNamespace>;
    sections.set(section.id, section);
    changed();
    // A locale already in use fetches this section's part now; until it lands
    // the section reads English, field by field.
    for (const lang of new Set<Language>([requested, ...(Object.keys(cores) as Language[])])) {
      if (lang !== "en") void loadSectionPart(section, lang).catch(() => {});
    }
  }

  function activate(lang: Language) {
    if (lang === requested) return;
    requested = lang;
    if (lang === "en") {
      active = "en";
      changed();
      return;
    }
    // Keep the current catalog visible until the requested locale resolves:
    // a brief stale view of the prior locale beats an English flicker.
    loadLocale(lang).then(
      () => {
        if (requested !== lang) return;
        active = lang;
        changed();
      },
      () => {},
    );
  }

  return {
    registerSection,
    getCatalog,
    getServerCatalog: () => getCatalog("en"),
    loadLocale,
    activate,
    getActiveCatalog: () => getCatalog(active),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const coreLoaders: Record<NonEnLanguage, () => Promise<LocaleTranslations>> = {
  zh: () => import("./zh").then((m) => m.zh),
  ar: () => import("./ar").then((m) => m.ar),
  hi: () => import("./hi").then((m) => m.hi),
  ru: () => import("./ru").then((m) => m.ru),
  id: () => import("./id").then((m) => m.id),
  es: () => import("./es").then((m) => m.es),
  fr: () => import("./fr").then((m) => m.fr),
  bn: () => import("./bn").then((m) => m.bn),
  ja: () => import("./ja").then((m) => m.ja),
  vi: () => import("./vi").then((m) => m.vi),
  de: () => import("./de").then((m) => m.de),
  ko: () => import("./ko").then((m) => m.ko),
  cs: () => import("./cs").then((m) => m.cs),
};

/** The app's one catalog store. */
export const catalog = createCatalogStore({ core: en, loaders: coreLoaders });

/**
 * Join a section to the app catalog. Call it at MODULE SCOPE in the module that
 * loads the section's readers (never in render), so the section is present
 * before any reader renders, on the server and the client alike.
 */
export const registerSection = catalog.registerSection;
