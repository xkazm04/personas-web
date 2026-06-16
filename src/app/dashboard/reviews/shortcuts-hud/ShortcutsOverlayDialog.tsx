"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Keyboard, Search, X } from "lucide-react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { ShortcutKeyChips } from "./ShortcutKeyChips";
import type { Shortcut, ShortcutCategory } from "./shortcutTypes";
import type { ShortcutMod } from "./usePlatformMod";

export function ShortcutsOverlayDialog({
  open,
  query,
  grouped,
  mod,
  labels,
  onClose,
  onQueryChange,
}: {
  open: boolean;
  query: string;
  grouped: [ShortcutCategory, Shortcut[]][];
  mod: ShortcutMod;
  labels: {
    close: string;
    keyboardShortcuts: string;
    searchShortcuts: string;
    noShortcutsMatch: string;
  };
  onClose: () => void;
  onQueryChange: (query: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Contain Tab within the dialog and focus the search field on open (Escape
  // is handled by the parent ShortcutsOverlay).
  useFocusTrap({ active: open, containerRef: panelRef, initialFocusRef: inputRef });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={labels.keyboardShortcuts}
            className="fixed left-1/2 top-1/2 z-[81] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-muted-dark" />
                <h3 className="text-sm font-semibold text-foreground">
                  {labels.keyboardShortcuts}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label={labels.close}
                className="rounded-md p-1.5 text-muted-dark transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/[0.06] px-5 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-dark/60" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={labels.searchShortcuts}
                  aria-label={labels.searchShortcuts}
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-dark/60 focus:border-brand-cyan/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
              {grouped.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-dark">
                  {labels.noShortcutsMatch.replace("{query}", query)}
                </p>
              ) : (
                grouped.map(([category, items]) => (
                  <section key={category} className="mb-4 last:mb-0">
                    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-dark">
                      {category}
                    </h4>
                    <ul className="space-y-1.5">
                      {items.map((shortcut) => (
                        <li
                          key={shortcut.keys.join("+")}
                          className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-[11px] hover:bg-white/[0.02]"
                        >
                          <span className="text-muted">{shortcut.description}</span>
                          <ShortcutKeyChips keys={shortcut.keys} mod={mod} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
