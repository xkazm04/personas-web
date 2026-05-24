"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

interface TabPanel {
  label: string;
  panel: ReactNode;
}

interface TabBlockProps {
  tabs: TabPanel[];
}

export function TabBlock({ tabs }: TabBlockProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tabs.length === 0) return null;

  const moveTo = (next: number) => {
    const clamped = (next + tabs.length) % tabs.length;
    setActiveIndex(clamped);
    buttonRefs.current[clamped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveTo(activeIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveTo(activeIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveTo(tabs.length - 1);
    }
  };

  return (
    <div className="my-5 rounded-xl border border-glass bg-white/[0.02]">
      <div
        role="tablist"
        aria-label="Variant tabs"
        className="flex flex-wrap gap-1 border-b border-glass px-2 pt-2"
      >
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={tab.label}
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(i)}
              onKeyDown={onKeyDown}
              className={`relative rounded-t-lg px-4 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/60 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                isActive
                  ? "text-brand-cyan after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-cyan"
                  : "text-muted-dark hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${baseId}-panel-${i}`}
          aria-labelledby={`${baseId}-tab-${i}`}
          hidden={i !== activeIndex}
          className="px-4 py-4"
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
