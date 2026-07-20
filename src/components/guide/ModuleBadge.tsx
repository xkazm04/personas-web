"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, ChevronRight, X } from "lucide-react";
import type { TopicModuleRef } from "@/data/guide/desktop-modules";

interface ModuleBadgeProps {
  moduleRef: TopicModuleRef;
  categoryColor?: string;
  compact?: boolean;
}

export default function ModuleBadge({ moduleRef, categoryColor = "#06b6d4", compact = false }: ModuleBadgeProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Move focus into the disclosure on open, restore to the trigger on close.
    closeRef.current?.focus();

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      // Restore focus to the trigger only if it still lives inside the popover.
      if (popoverRef.current?.contains(document.activeElement)) {
        buttonRef.current?.focus();
      }
    };
  }, [open]);

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-muted-dark">
        <Monitor className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[120px]" aria-hidden="true">
          {moduleRef.label}
        </span>
        <span className="sr-only">Find in app: {moduleRef.path.join(" → ")}</span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium transition-colors border border-glass-hover bg-white/[0.03] hover:bg-white/[0.06] hover:border-glass-strong text-muted-dark hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <Monitor className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>In app</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Desktop app location"
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-glass-hover bg-[#0a0a0f]/95 backdrop-blur-md p-4 shadow-xl shadow-black/40"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-muted-dark font-medium uppercase tracking-wider">
              Find in app
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-0.5 text-muted-dark hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1 flex-wrap">
            {moduleRef.path.map((segment, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className="h-3 w-3 shrink-0 text-muted-dark/60"
                    aria-hidden="true"
                  />
                )}
                <span
                  className="rounded-md px-1.5 py-0.5 text-base font-medium"
                  style={
                    i === moduleRef.path.length - 1
                      ? { backgroundColor: `${categoryColor}15`, color: categoryColor }
                      : undefined
                  }
                >
                  {segment}
                </span>
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-muted-dark leading-relaxed">
            Open the Personas desktop app and navigate to{" "}
            <span className="text-foreground font-medium">{moduleRef.path.join(" → ")}</span>{" "}
            to use this feature.
          </p>
        </div>
      )}
    </span>
  );
}
