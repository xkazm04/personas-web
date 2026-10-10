import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useI18nStore } from "@/stores/i18nStore";
import { catalog } from "./catalog";

/*
 * A selector over the one catalog store (./catalog.ts). Every caller reads the
 * same memoised catalog object, so a locale switch does one load and one merge
 * for the whole app, and the server snapshot is English so the hydrating render
 * matches the static HTML.
 *
 * While a requested locale is loading the previous catalog stays visible - a
 * brief stale view of the prior locale is strictly less jarring than flickering
 * the whole UI through English.
 */
export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const t = useSyncExternalStore(catalog.subscribe, catalog.getActiveCatalog, catalog.getServerCatalog);

  useEffect(() => {
    catalog.activate(language);
  }, [language]);

  return useMemo(() => ({ t, language }), [t, language]);
}
