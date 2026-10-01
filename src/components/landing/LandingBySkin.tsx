"use client";

import type { ReactNode } from "react";
import PageShell from "@/components/PageShell";
import { useHydrated } from "@/hooks/useHydrated";
import { DEFAULT_LANDING_SKIN, useLandingSkinStore } from "@/stores/landingSkinStore";

interface ScrollMapItem {
  label: string;
  href: string;
}

interface LandingBySkinProps {
  /** Decorative layer that sits outside `<main>` on the legacy page. */
  legacyAmbient: ReactNode;
  /** The previous, site-styled landing. Shown for the default skin (Personas). */
  legacy: ReactNode;
  legacyScrollMap: ScrollMapItem[];
  /** The rebuilt, skin-aware landing. Shown for Deck and Blueprint. */
  modern: ReactNode;
  modernScrollMap: ScrollMapItem[];
}

/**
 * Chooses the home page's body from the footer switcher. The server and the
 * hydrating render both paint the default skin (`useHydrated`), so the legacy
 * landing is what first paint and crawlers see; a visitor who picked Deck or
 * Blueprint gets the rebuilt landing on the next commit.
 */
export default function LandingBySkin({
  legacyAmbient,
  legacy,
  legacyScrollMap,
  modern,
  modernScrollMap,
}: LandingBySkinProps) {
  const hydrated = useHydrated();
  const persisted = useLandingSkinStore((s) => s.skin);
  const isLegacy = (hydrated ? persisted : DEFAULT_LANDING_SKIN) === "default";

  return (
    <>
      {isLegacy && legacyAmbient}
      <PageShell key={isLegacy ? "legacy" : "modern"} scrollMapItems={isLegacy ? legacyScrollMap : modernScrollMap}>
        {isLegacy ? legacy : modern}
      </PageShell>
    </>
  );
}
