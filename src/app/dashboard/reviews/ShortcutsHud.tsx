"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Search } from "lucide-react";

// Platform-aware modifier rendering — shortcuts that use ⌘ on Mac map to
// Ctrl on other platforms. Only set client-side; SSR sees `null` and renders
// the Ctrl variant by default to avoid hydration mismatch.
function usePlatformMod(): "⌘" | "Ctrl" {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);
  return isMac ? "⌘" : "Ctrl";
}

export interface Shortcut {
  /** Keys, in display order. Use special tokens "Mod" for ⌘/Ctrl. */
  keys: string[];
  description: string;
  category: ShortcutCategory;
}

export type ShortcutCategory = "Navigation" | "Actions" | "Selection" | "Filters" | "Help";

// Single source of truth for all reviews-page shortcuts. The footer pulls the
// most-used ones; the overlay groups all of them.
export const REVIEW_SHORTCUTS: Shortcut[] = [
  { keys: ["J"], description: "Next review", category: "Navigation" },
  { keys: ["K"], description: "Previous review", category: "Navigation" },
  { keys: ["A"], description: "Approve current", category: "Actions" },
  { keys: ["R"], description: "Reject current", category: "Actions" },
  { keys: ["?"], description: "Show all shortcuts", category: "Help" },
];

const FOOTER_PRIORITY = ["J", "K", "A", "R", "?"];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-white/[0.1] bg-white/[0.04] px-1.5 font-mono text-[10px] font-medium text-foreground/80 shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
      {children}
    </kbd>
  );
}

function KeyChips({ keys, mod }: { keys: string[]; mod: "⌘" | "Ctrl" }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className="inline-flex items-center gap-1">
          <Kbd>{k === "Mod" ? mod : k}</Kbd>
          {i < keys.length - 1 && (
            <span className="text-[10px] text-muted-dark/60">+</span>
          )}
        </span>
      ))}
    </span>
  );
}

// Persistent thin strip that lives below the split pane so the most-used
// shortcuts are always one glance away — keyboard discoverability without a
// modal, the way Linear / GitHub do it.
export function ShortcutsFooter({ onOpenAll }: { onOpenAll: () => void }) {
  const mod = usePlatformMod();
  const footerShortcuts = useMemo(
    () =>
      FOOTER_PRIORITY.map((key) =>
        REVIEW_SHORTCUTS.find((s) => s.keys[0] === key),
      ).filter((s): s is Shortcut => s !== undefined),
    [],
  );

  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-1.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-dark">
        {footerShortcuts.map((s) => (
          <span key={s.keys.join("+")} className="inline-flex items-center gap-1.5">
            <KeyChips keys={s.keys} mod={mod} />
            <span className="text-muted-dark/80">{s.description}</span>
          </span>
        ))}
      </div>
      <button
        onClick={onOpenAll}
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-muted transition-colors hover:border-white/[0.12] hover:text-foreground"
      >
        <Keyboard className="h-3 w-3" />
        All shortcuts
      </button>
    </div>
  );
}

// Modal HUD listing every shortcut grouped by category, with type-to-filter.
// Triggered by '?' (handled by parent) so first-time users can discover the
// power-user surface without leaving the page.
export function ShortcutsOverlay({
  open,
  onClose,
  shortcuts = REVIEW_SHORTCUTS,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts?: Shortcut[];
}) {
  const mod = usePlatformMod();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // Esc closes; bound only while open.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? shortcuts.filter(
          (s) =>
            s.description.toLowerCase().includes(q) ||
            s.keys.join(" ").toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q),
        )
      : shortcuts;

    const map = new Map<ShortcutCategory, Shortcut[]>();
    for (const s of filtered) {
      const list = map.get(s.category);
      if (list) list.push(s);
      else map.set(s.category, [s]);
    }
    return Array.from(map.entries());
  }, [shortcuts, query]);

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
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Keyboard shortcuts"
            className="fixed left-1/2 top-1/2 z-[81] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-muted-dark" />
                <h3 className="text-sm font-semibold text-foreground">
                  Keyboard shortcuts
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1.5 text-muted-dark transition-colors hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/[0.06] px-5 py-2.5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-dark/60" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shortcuts..."
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-dark/50 focus:border-brand-cyan/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
              {grouped.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-dark">
                  No shortcuts match &ldquo;{query}&rdquo;
                </p>
              ) : (
                grouped.map(([category, items]) => (
                  <section key={category} className="mb-4 last:mb-0">
                    <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-dark">
                      {category}
                    </h4>
                    <ul className="space-y-1.5">
                      {items.map((s) => (
                        <li
                          key={s.keys.join("+")}
                          className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-[11px] hover:bg-white/[0.02]"
                        >
                          <span className="text-muted">{s.description}</span>
                          <KeyChips keys={s.keys} mod={mod} />
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
