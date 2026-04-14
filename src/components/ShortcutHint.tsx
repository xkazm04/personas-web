"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "lucide-react";

export interface ShortcutEntry {
  label: string;
  key: string;
}

export default function ShortcutHint({ shortcuts }: { shortcuts: ShortcutEntry[] }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-1 text-sm text-muted-dark hover:text-muted transition-colors"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-3.5 w-3.5" />
        Shortcuts
      </button>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl p-3 shadow-xl"
          >
            <p className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</p>
            <div className="space-y-1.5 text-sm text-muted">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex justify-between">
                  <span>{s.label}</span>
                  <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1.5 py-0.5 font-mono text-sm">{s.key}</kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
