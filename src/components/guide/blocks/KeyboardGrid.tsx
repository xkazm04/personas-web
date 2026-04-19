"use client";

import React from "react";
import { CopyButton } from "./CopyButton";

function KeyBadge({ combo }: { combo: string }) {
  const parts = combo.split("+").map((k) => k.trim());
  const spokenCombo = parts.join(" plus ");
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={spokenCombo}>
      {parts.map((key, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="text-muted-dark/60 text-base mx-0.5" aria-hidden="true">+</span>
          )}
          <kbd className="inline-flex items-center justify-center rounded-md border border-glass-strong bg-white/[0.06] px-2 py-0.5 text-base font-mono font-medium text-foreground shadow-[0_1px_0_1px_rgba(255,255,255,0.03)] min-w-[28px] text-center" aria-hidden="true">
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
    <div className="my-6 grid gap-2.5 sm:grid-cols-2" role="list" aria-label="Keyboard shortcuts">
      {shortcuts.map((sc, i) => (
        <div
          key={i}
          role="listitem"
          className="group flex items-center gap-3 rounded-xl border border-glass bg-white/[0.02] px-4 py-2.5 backdrop-blur-sm"
        >
          <KeyBadge combo={sc.combo} />
          <span className="text-base text-muted-dark truncate flex-1">
            {sc.description}
          </span>
          <CopyButton text={sc.combo} />
        </div>
      ))}
    </div>
  );
}
