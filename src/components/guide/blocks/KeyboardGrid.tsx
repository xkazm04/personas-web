"use client";

import React from "react";

/**
 * Keyboard shortcut grid — :::keys with "Combo — Description" lines.
 */

function KeyBadge({ combo }: { combo: string }) {
  const parts = combo.split("+").map((k) => k.trim());
  return (
    <span className="inline-flex items-center gap-0.5">
      {parts.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="text-muted-dark/60 text-base mx-0.5">+</span>
          )}
          <kbd className="inline-flex items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.06] px-2 py-0.5 text-base font-mono font-medium text-foreground shadow-[0_1px_0_1px_rgba(255,255,255,0.03)] min-w-[28px] text-center">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
}

interface KeyboardGridProps {
  shortcuts: { combo: string; description: string }[];
}

export function KeyboardGrid({ shortcuts }: KeyboardGridProps) {
  return (
    <div className="my-6 grid gap-2.5 sm:grid-cols-2">
      {shortcuts.map((sc, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
        >
          <KeyBadge combo={sc.combo} />
          <span className="text-base text-muted-dark truncate">
            {sc.description}
          </span>
        </div>
      ))}
    </div>
  );
}
