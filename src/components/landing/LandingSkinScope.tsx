"use client";

import { createContext, useContext, type ReactNode } from "react";
import LnSprite from "./shared/LnSprite";
import "./shared/ln-base.css";
import "./shared/ln-responsive.css";
import { useHydrated } from "@/hooks/useHydrated";
import {
  DEFAULT_LANDING_SKIN,
  useLandingSkinStore,
  type LandingSkinId,
} from "@/stores/landingSkinStore";

const SkinContext = createContext<LandingSkinId>(DEFAULT_LANDING_SKIN);

/** The active landing skin, for the few components whose artwork differs per skin. */
export function useLandingSkin(): LandingSkinId {
  return useContext(SkinContext);
}

/**
 * Scopes the landing's skin tokens (`styles/landing-skins.css`) to its subtree.
 *
 * The persisted skin is read only after hydration (`useHydrated`), so the
 * server and the hydrating render both paint `default`; a visitor who picked
 * another skin gets it on the next commit. Markup never depends on the skin at
 * this level, only the attribute does.
 */
export default function LandingSkinScope({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const persisted = useLandingSkinStore((s) => s.skin);
  const skin = hydrated ? persisted : DEFAULT_LANDING_SKIN;

  return (
    <SkinContext.Provider value={skin}>
      <div data-landing-skin={skin} className="ln-root">
        <LnSprite />
        {children}
      </div>
    </SkinContext.Provider>
  );
}
