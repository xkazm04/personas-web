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
 * Sync the React store with the theme already applied to the DOM by the
 * pre-paint inline script in `app/layout.tsx`. The DOM is the
 * authoritative source on the first-paint frame; this hook just lifts
 * that value back into Zustand so consumers like ThemeSwitcher render
 * the right "selected" badge from mount. No DOM writes — the script
 * already did them, and re-applying would re-run `theme-transitioning`
 * for no reason.
 */
export function initRandomTheme() {
  if (typeof window === "undefined") return;
  // The script always sets the html `class` (with or without `dark`) and
  // `data-theme` (omitted only for `dark-midnight`). Read both back and
  // figure out which ThemeId we ended up with.
  const el = document.documentElement;
  const dataTheme = el.getAttribute("data-theme");
  const isLight = !el.classList.contains("dark");
  let resolved: ThemeId | null = null;
  if (dataTheme && VALID_THEME_IDS.has(dataTheme as ThemeId)) {
    resolved = dataTheme as ThemeId;
  } else if (!dataTheme) {
    resolved = isLight ? "light" : "dark-midnight";
  }
  if (resolved && useThemeStore.getState().themeId !== resolved) {
    useThemeStore.setState({ themeId: resolved });
  }
}
