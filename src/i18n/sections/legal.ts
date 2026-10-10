import type { CatalogSection } from "../catalog";
import { en } from "./en/legal";

/**
 * The /legal policies (`t.privacyPolicy`, `t.cookiePolicy`, `t.legalPage`).
 * Registered at module scope by its owner (see src/i18n/sectionOwnership.test.ts
 * for the folders allowed to read it); every other route ships without it.
 * Locale parts are copied verbatim per language under ./<lang>/legal.ts.
 */
export const legalSection: CatalogSection<"legalPage" | "cookiePolicy" | "privacyPolicy"> = {
  id: "legal",
  en,
  loaders: {
    zh: () => import("./zh/legal").then((m) => m.zh),
    ar: () => import("./ar/legal").then((m) => m.ar),
    hi: () => import("./hi/legal").then((m) => m.hi),
    ru: () => import("./ru/legal").then((m) => m.ru),
    id: () => import("./id/legal").then((m) => m.id),
    es: () => import("./es/legal").then((m) => m.es),
    fr: () => import("./fr/legal").then((m) => m.fr),
    bn: () => import("./bn/legal").then((m) => m.bn),
    ja: () => import("./ja/legal").then((m) => m.ja),
    vi: () => import("./vi/legal").then((m) => m.vi),
    de: () => import("./de/legal").then((m) => m.de),
    ko: () => import("./ko/legal").then((m) => m.ko),
    cs: () => import("./cs/legal").then((m) => m.cs),
  },
};
