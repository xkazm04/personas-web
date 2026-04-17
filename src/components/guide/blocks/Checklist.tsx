"use client";

import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";

interface ChecklistProps {
  items: string[];
  id?: string;
}

function stableHash(items: string[]): string {
  let h = 0;
  const str = items.join("\n");
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return `checklist-${(h >>> 0).toString(36)}`;
}

export function Checklist({ items, id }: ChecklistProps) {
  const storageKey = id || stableHash(items);
  const [checked, setChecked] = useState<boolean[]>(() => new Array(items.length).fill(false));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed: boolean[] = JSON.parse(saved);
          setChecked(items.map((_, i) => parsed[i] ?? false));
        }
      } catch {
        // ignore corrupt data
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, [storageKey, items.length]);

  const toggle = useCallback(
    (index: number) => {
      setChecked((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // storage full — still update UI
        }
        return next;
      });
    },
    [storageKey],
  );

  const doneCount = checked.filter(Boolean).length;
  const total = items.length;
  const allDone = doneCount === total;

  return (
    <div className="my-6 space-y-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-sm text-muted-dark/70">
          {allDone ? (
            <span className="text-emerald-400">All done!</span>
          ) : (
            <>{doneCount} of {total} complete</>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                checked[i]
                  ? "w-4 bg-emerald-400"
                  : "w-2.5 bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div role="group" aria-label={`Checklist: ${doneCount} of ${total} complete`}>
        {items.map((item, i) => {
          const isChecked = hydrated && checked[i];
          return (
            <button
              key={i}
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => toggle(i)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-2.5 text-left transition-all duration-200 mb-2 last:mb-0 cursor-pointer ${
                isChecked
                  ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                  : "border-glass bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                  isChecked
                    ? "border-emerald-400/40 bg-emerald-400/[0.15]"
                    : "border-white/15 bg-white/[0.03]"
                }`}
              >
                {isChecked && (
                  <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                )}
              </div>
              <span
                className={`text-base leading-relaxed transition-all duration-200 ${
                  isChecked
                    ? "text-muted-dark/60 line-through decoration-emerald-400/30"
                    : "text-muted-dark"
                }`}
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
