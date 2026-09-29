"use client";

import { usePathname } from "next/navigation";
import { useHydrated } from "@/hooks/useHydrated";
import { useTranslation } from "@/i18n/useTranslation";
import {
  LANDING_SKINS,
  useLandingSkinStore,
  type LandingSkinId,
} from "@/stores/landingSkinStore";

/**
 * Footer control for the landing's skin. Renders only on `/` — the skin has no
 * effect anywhere else, so offering it elsewhere would be a dead control.
 * A radio group: Tab reaches it once, arrow keys move the choice.
 */
export default function LandingSkinSwitcher() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const persisted = useLandingSkinStore((s) => s.skin);
  const setSkin = useLandingSkinStore((s) => s.setSkin);
  const { t } = useTranslation();

  if (pathname !== "/") return null;
  const skin: LandingSkinId = hydrated ? persisted : "default";
  const labels = t.landingNext.skins;

  const move = (delta: number) => {
    const next = LANDING_SKINS[(LANDING_SKINS.indexOf(skin) + delta + LANDING_SKINS.length) % LANDING_SKINS.length];
    setSkin(next);
    document.getElementById(`landing-skin-${next}`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={labels.label}
      className="flex items-center gap-1 rounded-full border border-glass p-0.5 text-sm"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      }}
    >
      {LANDING_SKINS.map((id) => (
        <button
          key={id}
          id={`landing-skin-${id}`}
          type="button"
          role="radio"
          aria-checked={skin === id}
          tabIndex={skin === id ? 0 : -1}
          onClick={() => setSkin(id)}
          className={`rounded-full px-3 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-brand-cyan ${
            skin === id ? "bg-brand-cyan/15 text-foreground" : "text-muted-dark hover:text-foreground"
          }`}
        >
          {labels[id]}
        </button>
      ))}
    </div>
  );
}
