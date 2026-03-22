"use client";

import { useThemeStore, THEMES, type ThemeId } from "@/stores/themeStore";

export default function ThemeSwitcher() {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const dark = THEMES.filter((t) => !t.isLight);
  const light = THEMES.filter((t) => t.isLight);

  return (
    <div className="flex items-center gap-1.5">
      {/* Dark themes */}
      {dark.map((t) => (
        <Swatch key={t.id} theme={t} active={themeId === t.id} onClick={() => setTheme(t.id)} />
      ))}

      {/* Separator */}
      <div className="mx-0.5 h-3 w-px bg-white/10 [data-theme^=light]:bg-black/10" />

      {/* Light themes */}
      {light.map((t) => (
        <Swatch key={t.id} theme={t} active={themeId === t.id} onClick={() => setTheme(t.id)} />
      ))}
    </div>
  );
}

function Swatch({
  theme,
  active,
  onClick,
}: {
  theme: { id: ThemeId; label: string; primary: string; isLight: boolean };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={theme.label}
      className={`group relative h-3 w-3 rounded-full transition-all duration-200 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background ${
        active ? "ring-1.5 ring-foreground/40 ring-offset-1 ring-offset-background scale-110" : ""
      }`}
      style={{ backgroundColor: theme.primary }}
    >
      {theme.isLight && (
        <span className="absolute inset-0 rounded-full border border-black/20" />
      )}
    </button>
  );
}
