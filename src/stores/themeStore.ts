import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId =
  | "dark-midnight"
  | "dark-cyan"
  | "dark-bronze"
  | "dark-frost"
  | "dark-purple"
  | "dark-pink"
  | "dark-red"
  | "dark-matrix"
  | "light"
  | "light-ice"
  | "light-news";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  primary: string;
  isLight: boolean;
}

export const THEMES: ThemeMeta[] = [
  { id: "dark-midnight", label: "Midnight",  primary: "#3b82f6", isLight: false },
  { id: "dark-cyan",     label: "Cyan",      primary: "#06b6d4", isLight: false },
  { id: "dark-bronze",   label: "Bronze",    primary: "#d97706", isLight: false },
  { id: "dark-frost",    label: "Frost",     primary: "#e2e8f0", isLight: false },
  { id: "dark-purple",   label: "Purple",    primary: "#a855f7", isLight: false },
  { id: "dark-pink",     label: "Pink",      primary: "#ec4899", isLight: false },
  { id: "dark-red",      label: "Red",       primary: "#cc0000", isLight: false },
  { id: "dark-matrix",   label: "Matrix",    primary: "#00ff41", isLight: false },
  { id: "light",         label: "Light",     primary: "#2554b0", isLight: true  },
  { id: "light-ice",     label: "Ice",       primary: "#2563eb", isLight: true  },
  { id: "light-news",    label: "News",      primary: "#1a1a1a", isLight: true  },
];

export const THEME_STORAGE_KEY = "personas-theme";
const VALID_THEME_IDS = new Set<ThemeId>(THEMES.map((t) => t.id));

let pendingTransitionTimeout: ReturnType<typeof setTimeout> | null = null;

function applyThemeToDOM(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;

  el.classList.add("theme-transitioning");

  if (themeId === "dark-midnight") {
    el.removeAttribute("data-theme");
  } else {
    el.setAttribute("data-theme", themeId);
  }

  const meta = THEMES.find((t) => t.id === themeId);
  if (meta?.isLight) {
    el.classList.remove("dark");
  } else {
    el.classList.add("dark");
  }

  // Cancel any pending removal so rapid theme switches don't cut the
  // currently-running transition short.
  if (pendingTransitionTimeout !== null) {
    clearTimeout(pendingTransitionTimeout);
  }
  pendingTransitionTimeout = setTimeout(() => {
    el.classList.remove("theme-transitioning");
    pendingTransitionTimeout = null;
  }, 300);
}

function pickRandomTheme(): ThemeId {
  const ids = THEMES.map((t) => t.id);
  return ids[Math.floor(Math.random() * ids.length)];
}

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  shuffleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: "dark-midnight",
      setTheme: (themeId) => {
        applyThemeToDOM(themeId);
        set({ themeId });
      },
      shuffleTheme: () => {
        const id = pickRandomTheme();
        applyThemeToDOM(id);
        set({ themeId: id });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({ themeId: state.themeId }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!VALID_THEME_IDS.has(state.themeId)) {
          state.themeId = "dark-midnight";
        }
        applyThemeToDOM(state.themeId);
      },
    }
  )
);

/**
 * Initialise the theme on first-ever visit.
 * If the user has already chosen (or shuffled) a theme it lives in
 * localStorage and persist's rehydration handles applying it; we no-op here.
 */
export function initRandomTheme() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(THEME_STORAGE_KEY) !== null) return;

  const id = pickRandomTheme();
  applyThemeToDOM(id);
  useThemeStore.setState({ themeId: id });
}
