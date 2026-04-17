import { create } from "zustand";

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

function applyThemeToDOM(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const el = document.documentElement;

  // Add transition class for smooth crossfade
  el.classList.add("theme-transitioning");

  // Default (dark-midnight) uses :root — remove data-theme attribute
  if (themeId === "dark-midnight") {
    el.removeAttribute("data-theme");
  } else {
    el.setAttribute("data-theme", themeId);
  }

  // Toggle Tailwind dark class
  const meta = THEMES.find((t) => t.id === themeId);
  if (meta?.isLight) {
    el.classList.remove("dark");
  } else {
    el.classList.add("dark");
  }

  // Remove transition class after animation completes
  setTimeout(() => el.classList.remove("theme-transitioning"), 300);
}

/** Pick a random theme on every fresh page load. */
function pickRandomTheme(): ThemeId {
  const ids = THEMES.map((t) => t.id);
  return ids[Math.floor(Math.random() * ids.length)];
}

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  themeId: "dark-midnight",
  setTheme: (themeId) => {
    applyThemeToDOM(themeId);
    set({ themeId });
  },
}));

/** Initialise once on app mount — random theme each visit. */
export function initRandomTheme() {
  const id = pickRandomTheme();
  applyThemeToDOM(id);
  useThemeStore.setState({ themeId: id });
}
