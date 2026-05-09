"use client";

import { Shuffle } from "lucide-react";
import { useThemeStore, THEMES, type ThemeId } from "@/stores/themeStore";

export default function ThemeSwitcher() {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const shuffleTheme = useThemeStore((s) => s.shuffleTheme);

  const dark = THEMES.filter((t) => !t.isLight);
  const light = THEMES.filter((t) => t.isLight);

  return (
    <div className="flex items-end gap-2">
      <SwatchGroup label="Dark" themes={dark} themeId={themeId} setTheme={setTheme} />

      <span
        aria-hidden="true"
        className="mb-3 h-4 w-px bg-white/10 data-[theme^=light]:bg-black/10"
      />

      <SwatchGroup label="Light" themes={light} themeId={themeId} setTheme={setTheme} />

      <button
        type="button"
        onClick={shuffleTheme}
        title="Shuffle theme"
        aria-label="Shuffle theme"
        className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-white/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background data-[theme^=light]:hover:bg-black/[0.05]"
      >
        <Shuffle className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function SwatchGroup({
  label,
  themes,
  themeId,
  setTheme,
}: {
  label: string;
  themes: ThemeMeta[];
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <div className="flex items-center">
        {themes.map((t) => (
          <Swatch key={t.id} theme={t} active={themeId === t.id} onClick={() => setTheme(t.id)} />
        ))}
      </div>
    </div>
  );
}

type ThemeMeta = { id: ThemeId; label: string; primary: string; isLight: boolean };

function Swatch({
  theme,
  active,
  onClick,
}: {
  theme: ThemeMeta;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={theme.label}
      aria-label={theme.label}
      aria-pressed={active}
      className="group relative inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className={`relative block h-3 w-3 rounded-full transition-transform duration-200 group-hover:scale-125 ${
          active ? "scale-110 ring-1.5 ring-foreground/40 ring-offset-1 ring-offset-background" : ""
        }`}
        style={{ backgroundColor: theme.primary }}
      >
        {theme.isLight && (
          <span className="absolute inset-0 rounded-full border border-black/20" />
        )}
      </span>
    </button>
  );
}
