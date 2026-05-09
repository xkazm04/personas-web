"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useThemeStore, THEMES, type ThemeId } from "@/stores/themeStore";
import { useTranslation } from "@/i18n/useTranslation";
import type { Translations } from "@/i18n/en";

const themeKeyMap: Record<ThemeId, keyof Translations["themes"]> = {
  "dark-midnight": "midnight",
  "dark-cyan": "cyan",
  "dark-bronze": "bronze",
  "dark-frost": "frost",
  "dark-purple": "purple",
  "dark-pink": "pink",
  "dark-red": "red",
  "dark-matrix": "matrix",
  "light": "light",
  "light-ice": "ice",
  "light-news": "news",
};

const SWATCH_PATTERNS: Record<ThemeId, React.ReactNode> = {
  "dark-midnight": (
    <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" />
  ),
  "dark-cyan": (
    <line x1="2" y1="10" x2="10" y2="2" stroke="currentColor" strokeWidth="1.5" />
  ),
  "dark-bronze": (
    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
  ),
  "dark-frost": (
    <>
      <line x1="6" y1="3" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  "dark-purple": (
    <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
  ),
  "dark-pink": (
    <circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
  ),
  "dark-red": (
    <>
      <line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  "dark-matrix": (
    <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" />
  ),
  "light": (
    <rect x="4" y="4" width="4" height="4" fill="currentColor" />
  ),
  "light-ice": (
    <rect x="3" y="3" width="6" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 6 6)" />
  ),
  "light-news": (
    <>
      <line x1="3" y1="4" x2="9" y2="4" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="8" x2="9" y2="8" stroke="currentColor" strokeWidth="1" />
    </>
  ),
};

export default function ThemeSwitcher() {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const { t } = useTranslation();

  const dark = THEMES.filter((t) => !t.isLight);
  const light = THEMES.filter((t) => t.isLight);

  return (
    <div className="flex items-center gap-1.5">
      {dark.map((th) => (
        <Swatch
          key={th.id}
          theme={th}
          active={themeId === th.id}
          onClick={() => setTheme(th.id)}
          label={t.themes[themeKeyMap[th.id]]}
          description={t.themeDescriptions[themeKeyMap[th.id]]}
          selectThemeLabel={t.accessibility.selectTheme}
        />
      ))}

      <div className="mx-0.5 h-3 w-px bg-white/10 [data-theme^=light]:bg-black/10" />

      {light.map((th) => (
        <Swatch
          key={th.id}
          theme={th}
          active={themeId === th.id}
          onClick={() => setTheme(th.id)}
          label={t.themes[themeKeyMap[th.id]]}
          description={t.themeDescriptions[themeKeyMap[th.id]]}
          selectThemeLabel={t.accessibility.selectTheme}
        />
      ))}
    </div>
  );
}

function Swatch({
  theme,
  active,
  onClick,
  label,
  description,
  selectThemeLabel,
}: {
  theme: { id: ThemeId; label: string; primary: string; isLight: boolean };
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  selectThemeLabel: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${selectThemeLabel.replace("{name}", label)} — ${description}`}
        className={`group relative h-3 w-3 rounded-full transition-all duration-200 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background ${
          active ? "ring-1.5 ring-foreground/40 ring-offset-1 ring-offset-background scale-110" : ""
        }`}
        style={{ backgroundColor: theme.primary }}
      >
        {theme.isLight && (
          <span className="absolute inset-0 rounded-full border border-black/20" />
        )}
        <svg
          className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40 transition-opacity duration-200"
          viewBox="0 0 12 12"
          aria-hidden="true"
          style={{ color: theme.isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)" }}
        >
          {SWATCH_PATTERNS[theme.id]}
        </svg>
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50 whitespace-nowrap rounded-md bg-foreground/90 px-2 py-1 text-[10px] leading-tight text-background shadow-lg backdrop-blur-sm"
          >
            <span className="font-semibold">{label}</span>
            <span className="block text-background/70">{description}</span>
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
