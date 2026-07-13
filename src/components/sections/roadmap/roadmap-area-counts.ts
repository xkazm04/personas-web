import { templates, type Category } from "@/lib/templates";
import { connectors } from "@/data/connectors";
import { LANGUAGES } from "@/stores/i18nStore";
import type { AreaCounts } from "./areas";

/**
 * Build-time truth source for the roadmap area cards. Imports the real
 * catalog/registry modules and reduces them to plain, serializable counts.
 *
 * This module must only ever be imported by the SERVER component
 * (`index.tsx`) — that keeps the heavy templates/connectors catalogs out of
 * the client bundle while still deriving the card numbers from the shipped
 * product, so they can't drift. The result is passed into `buildAreas()` as
 * a prop.
 */

const countCategory = (cat: Category) => templates.filter((t) => t.category === cat).length;

/** Editorial region → locale-id grouping; the per-region COUNT is derived. */
const LOCALE_REGIONS = {
  europe: ["en", "de", "es", "fr", "cs", "ru"],
  apac: ["vi", "id", "zh", "ja", "ko"],
  southAsia: ["hi", "bn"],
  middleEast: ["ar"],
} as const;
const localeCount = (ids: readonly string[]) => LANGUAGES.filter((l) => ids.includes(l.id)).length;

export const AREA_COUNTS: AreaCounts = {
  templatesByCategory: {
    DevOps: countCategory("DevOps"),
    Communication: countCategory("Communication"),
    Productivity: countCategory("Productivity"),
    Finance: countCategory("Finance"),
    Sales: countCategory("Sales"),
    Support: countCategory("Support"),
    Research: countCategory("Research"),
    Marketing: countCategory("Marketing"),
    Legal: countCategory("Legal"),
    Security: countCategory("Security"),
  },
  templateTotal: templates.length,
  groupedTemplates:
    countCategory("Finance") + countCategory("Sales") + countCategory("Support") + countCategory("Legal"),
  connectors: connectors.length,
  localeTotal: LANGUAGES.length,
  localesByRegion: {
    europe: localeCount(LOCALE_REGIONS.europe),
    apac: localeCount(LOCALE_REGIONS.apac),
    southAsia: localeCount(LOCALE_REGIONS.southAsia),
    middleEast: localeCount(LOCALE_REGIONS.middleEast),
  },
};
