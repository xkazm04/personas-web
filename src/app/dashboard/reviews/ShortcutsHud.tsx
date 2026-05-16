"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Keyboard } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";

import { ShortcutKeyChips } from "./shortcuts-hud/ShortcutKeyChips";
import { ShortcutsOverlayDialog } from "./shortcuts-hud/ShortcutsOverlayDialog";
import {
  FOOTER_PRIORITY,
  REVIEW_SHORTCUTS,
  type Shortcut,
  type ShortcutCategory,
} from "./shortcuts-hud/shortcutTypes";
import { usePlatformMod } from "./shortcuts-hud/usePlatformMod";

export { REVIEW_SHORTCUTS, type Shortcut, type ShortcutCategory };

export function ShortcutsFooter({ onOpenAll }: { onOpenAll: () => void }) {
  const { t } = useTranslation();
  const mod = usePlatformMod();
  const footerShortcuts = useMemo(
    () =>
      FOOTER_PRIORITY.map((key) =>
        REVIEW_SHORTCUTS.find((shortcut) => shortcut.keys[0] === key),
      ).filter((shortcut): shortcut is Shortcut => shortcut !== undefined),
    [],
  );

  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-dark">
        {footerShortcuts.map((shortcut) => (
          <span key={shortcut.keys.join("+")} className="inline-flex items-center gap-1.5">
            <ShortcutKeyChips keys={shortcut.keys} mod={mod} />
            <span className="text-muted-dark/80">{shortcut.description}</span>
          </span>
        ))}
      </div>
      <button
        onClick={onOpenAll}
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-muted transition-colors hover:border-white/[0.12] hover:text-foreground"
      >
        <Keyboard className="h-3 w-3" />
        {t.dashboardUi.allShortcuts}
      </button>
    </div>
  );
}

export function ShortcutsOverlay({
  open,
  onClose,
  shortcuts = REVIEW_SHORTCUTS,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts?: Shortcut[];
}) {
  const { t } = useTranslation();
  const mod = usePlatformMod();
  const [query, setQuery] = useState("");

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  const grouped = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? shortcuts.filter(
          (shortcut) =>
            shortcut.description.toLowerCase().includes(normalizedQuery) ||
            shortcut.keys.join(" ").toLowerCase().includes(normalizedQuery) ||
            shortcut.category.toLowerCase().includes(normalizedQuery),
        )
      : shortcuts;

    const map = new Map<ShortcutCategory, Shortcut[]>();
    for (const shortcut of filtered) {
      const list = map.get(shortcut.category);
      if (list) list.push(shortcut);
      else map.set(shortcut.category, [shortcut]);
    }
    return Array.from(map.entries());
  }, [shortcuts, query]);

  return (
    <ShortcutsOverlayDialog
      open={open}
      query={query}
      grouped={grouped}
      mod={mod}
      labels={{
        close: t.common.close,
        keyboardShortcuts: t.dashboardUi.keyboardShortcuts,
        searchShortcuts: t.dashboardUi.searchShortcuts,
        noShortcutsMatch: t.dashboardUi.noShortcutsMatch,
      }}
      onClose={handleClose}
      onQueryChange={setQuery}
    />
  );
}
