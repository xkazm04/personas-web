import type { CatalogSection } from "../catalog";
import { en } from "./en/athenaPage";

/**
 * The /athena page copy (`t.athenaPage`).
 * Registered at module scope by its owner (see src/i18n/sectionOwnership.test.ts
 * for the folders allowed to read it); every other route ships without it.
 * Locale parts are copied verbatim per language under ./<lang>/athenaPage.ts.
 */
export const athenaPageSection: CatalogSection<"athenaPage"> = {
  id: "athenaPage",
  en,
  loaders: {
    zh: () => import("./zh/athenaPage").then((m) => m.zh),
    ar: () => import("./ar/athenaPage").then((m) => m.ar),
    hi: () => import("./hi/athenaPage").then((m) => m.hi),
    ru: () => import("./ru/athenaPage").then((m) => m.ru),
    id: () => import("./id/athenaPage").then((m) => m.id),
    es: () => import("./es/athenaPage").then((m) => m.es),
    fr: () => import("./fr/athenaPage").then((m) => m.fr),
    bn: () => import("./bn/athenaPage").then((m) => m.bn),
    ja: () => import("./ja/athenaPage").then((m) => m.ja),
    vi: () => import("./vi/athenaPage").then((m) => m.vi),
    de: () => import("./de/athenaPage").then((m) => m.de),
    ko: () => import("./ko/athenaPage").then((m) => m.ko),
    cs: () => import("./cs/athenaPage").then((m) => m.cs),
  },
};
