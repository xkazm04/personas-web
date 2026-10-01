import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Landing skins. A skin re-dresses the `/` landing only (it is scoped by
 * `data-landing-skin` on `LandingSkinScope`, never on `<html>`), so it composes
 * with the site's own 11 themes instead of competing with them.
 *
 * - `default`   "Personas": the previous, site-styled landing (`app/page.tsx`
 *               renders it through `LandingBySkin`). What every visitor sees first.
 * - `deck`      the hardware "Agent Deck" identity from the brand contest.
 * - `blueprint` the "Drawing Set" identity from the brand contest.
 *
 * Deck and Blueprint mount the rebuilt landing; they are explorations kept
 * behind the footer switcher.
 */
export type LandingSkinId = "default" | "deck" | "blueprint";

export const LANDING_SKINS: readonly LandingSkinId[] = ["default", "deck", "blueprint"];
export const DEFAULT_LANDING_SKIN: LandingSkinId = "default";
export const LANDING_SKIN_STORAGE_KEY = "personas-landing-skin";

const VALID = new Set<LandingSkinId>(LANDING_SKINS);

interface LandingSkinState {
  skin: LandingSkinId;
  setSkin: (skin: LandingSkinId) => void;
}

export const useLandingSkinStore = create<LandingSkinState>()(
  persist(
    (set) => ({
      skin: DEFAULT_LANDING_SKIN,
      setSkin: (skin) => set({ skin: VALID.has(skin) ? skin : DEFAULT_LANDING_SKIN }),
    }),
    {
      name: LANDING_SKIN_STORAGE_KEY,
      partialize: (s) => ({ skin: s.skin }),
      // A stale or hand-edited value must never leave the page in an unknown skin.
      merge: (persisted, current) => {
        const skin = (persisted as Partial<LandingSkinState> | undefined)?.skin;
        return { ...current, skin: skin && VALID.has(skin) ? skin : DEFAULT_LANDING_SKIN };
      },
    },
  ),
);
