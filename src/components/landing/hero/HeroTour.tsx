"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTour } from "@/contexts/TourContext";
import { useTranslation } from "@/i18n/useTranslation";
import { TOUR_SEEN_KEY, TOUR_BRIDGE_HREF } from "./heroLinks";

/**
 * The hero's "take the tour" trigger, wearing the landing skin. Same wiring as
 * `TourLauncher` (home tour, intro card, bridge to /features, `?tour=1`
 * auto-start, seen flag, scripts loaded on demand) but a skin-styled control.
 * It hides while a tour runs; the tour cards restore focus to `data-tour-launcher`.
 */
export default function HeroTour() {
  const { t } = useTranslation();
  const { active, start } = useTour();
  const autostarted = useRef(false);

  const begin = useCallback(
    () =>
      import("@/lib/tour-script").then((m) =>
        start(m.TOURS_BY_ID.home, { bridgeHref: TOUR_BRIDGE_HREF, intro: true }),
      ),
    [start],
  );

  useEffect(() => {
    if (autostarted.current) return;
    if (new URLSearchParams(window.location.search).get("tour") !== "1") return;
    autostarted.current = true;
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      /* localStorage may be blocked; the tour still starts. */
    }
    void begin();
  }, [begin]);

  if (active) return null;

  return (
    <button
      type="button"
      className="ln-link"
      data-tour-launcher
      onClick={() => {
        try {
          window.localStorage.setItem(TOUR_SEEN_KEY, "1");
        } catch {
          /* ignored */
        }
        void begin();
      }}
      onPointerEnter={() => void import("@/lib/tour-script")}
      onFocus={() => void import("@/lib/tour-script")}
    >
      {t.tour.launch}
    </button>
  );
}
