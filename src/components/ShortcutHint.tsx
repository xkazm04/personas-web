"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

export interface ShortcutEntry {
  label: string;
  key: string;
}

export default function ShortcutHint({ shortcuts }: { shortcuts: ShortcutEntry[] }) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!visible) return;

    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setVisible(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-expanded={visible}
        aria-haspopup="dialog"
        aria-controls={panelId}
        className="flex items-center gap-1 text-sm text-muted-dark hover:text-muted transition-colors"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-3.5 w-3.5" />
        Shortcuts
      </button>
      <AnimatePresence>
        {visible && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Keyboard Shortcuts"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-glass-hover bg-surface/95 backdrop-blur-xl p-3 shadow-xl"
          >
            <p className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</p>
            <div className="space-y-1.5 text-sm text-muted">
              {shortcuts.map((s) => (
                <div key={`${s.label}-${s.key}`} className="flex justify-between">
                  <span>{s.label}</span>
                  <kbd className="rounded border border-glass-hover bg-white/[0.05] px-1.5 py-0.5 font-mono text-sm">{s.key}</kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
